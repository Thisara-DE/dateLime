// The only module that talks to Firebase. The SDK (about 150 KB) is fetched from Google's
// CDN the first time it's needed: when someone opens sign-in, or when this device already
// has a signed-in account. Visitors who never sign in never contact Google.
import { FIREBASE, FIREBASE_SDK } from '../config.js';

export const accountsEnabled = () => Boolean(FIREBASE?.apiKey && FIREBASE?.projectId);

let loading = null;

/** Loads and initializes the SDK once. */
export function loadCloud() {
  if (!accountsEnabled()) return Promise.reject(new Error('Accounts are not set up for this copy of dateLime.'));
  loading ??= Promise.all([
    import(`${FIREBASE_SDK}/firebase-app.js`),
    import(`${FIREBASE_SDK}/firebase-auth.js`),
    import(`${FIREBASE_SDK}/firebase-firestore.js`),
  ]).then(([appSdk, A, F]) => {
    const app = appSdk.initializeApp(FIREBASE);
    return { auth: A.getAuth(app), db: F.getFirestore(app), A, F };
  });
  // A failed download (offline) can be retried later.
  loading.catch(() => (loading = null));
  return loading;
}

/** A plain-object view of a Firebase user. */
export function toUser(u) {
  if (!u) return null;
  const google = u.providerData?.some((p) => p.providerId === 'google.com');
  return { uid: u.uid, email: u.email ?? '', name: u.displayName ?? '', provider: google ? 'google' : 'password', verified: Boolean(u.emailVerified) };
}

export async function watchAuth(callback) {
  const { auth, A } = await loadCloud();
  return A.onAuthStateChanged(auth, (u) => callback(toUser(u)));
}

export async function signInWithGoogle() {
  const { auth, A } = await loadCloud();
  const provider = new A.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    return toUser((await A.signInWithPopup(auth, provider)).user);
  } catch (err) {
    // Some phones block pop-ups; a full-page redirect works everywhere.
    if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
      await A.signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

/** Finishes a redirect sign-in after the page comes back from Google (no-op otherwise). */
export async function completeRedirect() {
  const { auth, A } = await loadCloud();
  const result = await A.getRedirectResult(auth);
  return toUser(result?.user);
}

export async function signUpWithEmail({ email, password, name }) {
  const { auth, A } = await loadCloud();
  const { user } = await A.createUserWithEmailAndPassword(auth, email, password);
  await A.updateProfile(user, { displayName: name });
  A.sendEmailVerification(user).catch(() => {}); // nice to have; never blocks sign-up
  return { ...toUser(user), name };
}

export async function signInWithEmail({ email, password }) {
  const { auth, A } = await loadCloud();
  return toUser((await A.signInWithEmailAndPassword(auth, email, password)).user);
}

export async function sendPasswordReset(email) {
  const { auth, A } = await loadCloud();
  await A.sendPasswordResetEmail(auth, email);
}

export async function renameUser(name) {
  const { auth, A } = await loadCloud();
  if (auth.currentUser) await A.updateProfile(auth.currentUser, { displayName: name });
}

export async function signOutUser() {
  const { auth, A } = await loadCloud();
  await A.signOut(auth);
}

/**
 * Deletes the user's data, then the sign-in itself. Firebase only deletes a sign-in made in
 * the last few minutes, so check that first: otherwise the data would go but the sign-in stay.
 */
export async function deleteAccount(uid) {
  const { auth, db, A, F } = await loadCloud();
  const user = auth.currentUser;
  const signedInAt = Date.parse(user?.metadata?.lastSignInTime ?? '');
  if (!user || !(Date.now() - signedInAt < 4 * 60 * 1000)) {
    throw Object.assign(new Error('Sign in again first.'), { code: 'auth/requires-recent-login' });
  }
  await F.deleteDoc(F.doc(db, 'users', uid));
  await A.deleteUser(user);
}

// ---- The user's document: users/{uid} = { profile, rules, saved, updatedAt } ---------------

/** Calls back with the document's data (or null when it doesn't exist yet). */
export async function watchUserDoc(uid, onData, onError) {
  const { db, F } = await loadCloud();
  return F.onSnapshot(
    F.doc(db, 'users', uid),
    (snap) => {
      if (snap.metadata?.hasPendingWrites) return; // our own write echoing back
      onData(snap.exists() ? snap.data() : null);
    },
    onError,
  );
}

/** Merges fields into the user's document. Values are made JSON-clean (Firestore rejects undefined). */
export async function writeUserDoc(uid, fields) {
  const { db, F } = await loadCloud();
  const clean = JSON.parse(JSON.stringify({ ...fields, updatedAt: new Date().toISOString() }));
  await F.setDoc(F.doc(db, 'users', uid), clean, { merge: true });
}

/** Turns a Firebase error into a sentence for people. */
export function describeAuthError(err) {
  const messages = {
    'auth/invalid-credential': "That email and password don't match an account.",
    'auth/wrong-password': "That email and password don't match an account.",
    'auth/user-not-found': "That email and password don't match an account.",
    'auth/invalid-email': "That doesn't look like an email address.",
    'auth/email-already-in-use': 'There’s already an account with that email.',
    'auth/weak-password': 'Choose a longer password: at least 8 characters.',
    'auth/missing-password': 'Enter your password.',
    'auth/too-many-requests': 'Too many tries. Wait a few minutes, or reset your password.',
    'auth/network-request-failed': 'We couldn’t reach the sign-in service. Check your connection and try again.',
    'auth/user-disabled': 'This account has been switched off.',
    'auth/requires-recent-login': 'For your safety, sign out, sign in again, then delete your account within a few minutes.',
    'auth/account-exists-with-different-credential': 'That email already has an account. Sign in with your email and password.',
    'auth/unauthorized-domain': 'Google sign-in isn’t allowed on this web address yet (see the README’s setup steps).',
  };
  return messages[err?.code] ?? 'Something went wrong with sign-in. Please try again.';
}

/** Errors that mean the person simply closed or cancelled the Google window. */
export const isCancelled = (err) => ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(err?.code);
