// A stand-in for Firebase in browser tests (the real SDK lives on Google's CDN, and tests
// never touch the network). It has two halves:
// - three small ES modules served in place of https://www.gstatic.com/firebasejs/*, with
//   the same function names the app's adapter (assets/js/lib/cloud.js) imports;
// - a fake auth and database server in this Node process, reached through a routed
//   same-origin URL. One server can back several browser contexts, so a test can sign in
//   on a "second device". Like the real security rules, it only lets you touch your own
//   document. The real rules are tested against the Firestore emulator (tests/rules).

export const FAKE_CONFIG = { apiKey: 'test-key', authDomain: 'demo-datelime.firebaseapp.com', projectId: 'demo-datelime', appId: '1:0:web:0' };

const AUTH = `
const api = async (path, body) => {
  const res = await fetch('/__fake_firebase__/' + path, { method: 'POST', body: JSON.stringify(body) });
  const json = await res.json();
  if (json.error) throw Object.assign(new Error(json.error), { code: json.error });
  return json;
};
const KEY = '__fake_firebase_user__';
const toUser = (u) => u && { uid: u.uid, email: u.email, displayName: u.displayName ?? null, emailVerified: false,
  providerData: [{ providerId: u.provider === 'google' ? 'google.com' : 'password' }], metadata: { lastSignInTime: u.lastSignInTime } };
const auth = { currentUser: null, listeners: new Set() };
try { auth.currentUser = toUser(JSON.parse(localStorage.getItem(KEY))); } catch {}
globalThis.__fakeUid = auth.currentUser?.uid ?? null;
function setUser(u) {
  auth.currentUser = toUser(u);
  globalThis.__fakeUid = u?.uid ?? null;
  if (u) localStorage.setItem(KEY, JSON.stringify(u)); else localStorage.removeItem(KEY);
  auth.listeners.forEach((fn) => fn(auth.currentUser));
}
export const getAuth = () => auth;
export function onAuthStateChanged(a, cb) { a.listeners.add(cb); queueMicrotask(() => cb(a.currentUser)); return () => a.listeners.delete(cb); }
export class GoogleAuthProvider { setCustomParameters() {} }
export async function signInWithPopup() { const { user } = await api('google', {}); setUser(user); return { user: auth.currentUser }; }
export async function signInWithRedirect() { throw Object.assign(new Error('redirect'), { code: 'auth/operation-not-allowed' }); }
export async function getRedirectResult() { return null; }
export async function createUserWithEmailAndPassword(a, email, password) { const { user } = await api('signup', { email, password }); setUser(user); return { user: auth.currentUser }; }
export async function signInWithEmailAndPassword(a, email, password) { const { user } = await api('signin', { email, password }); setUser(user); return { user: auth.currentUser }; }
export async function updateProfile(u, { displayName }) {
  const { user } = await api('profile', { uid: u.uid, displayName });
  auth.currentUser = toUser(user); localStorage.setItem(KEY, JSON.stringify(user));
}
export async function sendEmailVerification() {}
export async function sendPasswordResetEmail(a, email) { await api('reset', { email }); }
export async function signOut() { setUser(null); }
export async function deleteUser(u) { await api('delete-user', { uid: u.uid }); setUser(null); }
`;

const FIRESTORE = `
const call = async (body) => {
  const res = await fetch('/__fake_firebase__/doc', { method: 'POST', body: JSON.stringify({ ...body, uid: globalThis.__fakeUid ?? null }) });
  const json = await res.json();
  if (json.error) throw Object.assign(new Error(json.error), { code: json.error });
  return json;
};
const snap = (json, pending) => ({ exists: () => json.data != null, data: () => json.data, metadata: { hasPendingWrites: pending } });
const watchers = new Map();
export const getFirestore = () => ({});
export const doc = (db, collection, id) => ({ path: collection + '/' + id });
export async function setDoc(ref, data, options) {
  const json = await call({ op: 'set', path: ref.path, data, merge: Boolean(options?.merge) });
  // Like Firestore, your own write echoes once as a pending local change, not again on ack.
  for (const w of watchers.get(ref.path) ?? []) { w.version = json.version; w.next(snap(json, true)); }
}
export async function deleteDoc(ref) { await call({ op: 'delete', path: ref.path }); }
export function onSnapshot(ref, next, error) {
  const w = { version: -1, next };
  if (!watchers.has(ref.path)) watchers.set(ref.path, new Set());
  watchers.get(ref.path).add(w);
  let stopped = false;
  const poll = async () => {
    if (stopped) return;
    try {
      const json = await call({ op: 'get', path: ref.path });
      if (!stopped && json.version !== w.version) { w.version = json.version; next(snap(json, false)); }
      setTimeout(poll, 150);
    } catch (err) { if (!stopped) error?.(err); }
  };
  poll();
  return () => { stopped = true; watchers.get(ref.path).delete(w); };
}
`;

/** A fresh fake backend. Tests can read and change it directly. */
export function createFakeFirebase() {
  const server = {
    accounts: new Map(), // email -> { uid, email, password, displayName, provider }
    docs: new Map(), // 'users/uid' -> data
    versions: new Map(),
    google: { email: 'sam@example.com', displayName: 'Sam Rivera' },
    resets: [],
    requests: 0,
    nextUid: 1,
  };
  const now = () => new Date().toUTCString();
  const pub = (a) => ({ uid: a.uid, email: a.email, displayName: a.displayName ?? null, provider: a.provider, lastSignInTime: now() });
  // Rejections travel in a 200 response, so the browser doesn't log a network error for each.
  const fail = (code) => ({ body: { error: code } });

  function handle(path, body) {
    server.requests += 1;
    if (path === 'signup') {
      if (server.accounts.has(body.email)) return fail('auth/email-already-in-use');
      if (body.password.length < 6) return fail('auth/weak-password');
      const account = { uid: `user-${server.nextUid++}`, email: body.email, password: body.password, displayName: null, provider: 'password' };
      server.accounts.set(body.email, account);
      return { body: { user: pub(account) } };
    }
    if (path === 'signin') {
      const account = server.accounts.get(body.email);
      if (!account || account.provider !== 'password' || account.password !== body.password) return fail('auth/invalid-credential');
      return { body: { user: pub(account) } };
    }
    if (path === 'google') {
      if (server.google === 'closed') return fail('auth/popup-closed-by-user');
      let account = server.accounts.get(server.google.email);
      if (!account) {
        account = { uid: `google-${server.nextUid++}`, email: server.google.email, displayName: server.google.displayName, provider: 'google' };
        server.accounts.set(account.email, account);
      }
      return { body: { user: pub(account) } };
    }
    if (path === 'profile') {
      const account = [...server.accounts.values()].find((a) => a.uid === body.uid);
      account.displayName = body.displayName;
      return { body: { user: pub(account) } };
    }
    if (path === 'reset') {
      server.resets.push(body.email);
      return { body: {} };
    }
    if (path === 'delete-user') {
      for (const [email, a] of server.accounts) if (a.uid === body.uid) server.accounts.delete(email);
      return { body: {} };
    }
    if (path === 'doc') {
      const owner = body.path.match(/^users\/([^/]+)$/)?.[1];
      if (!body.uid || owner !== body.uid) return fail('permission-denied'); // as firestore.rules
      const bump = () => server.versions.set(body.path, (server.versions.get(body.path) ?? 0) + 1);
      if (body.op === 'set') {
        server.docs.set(body.path, body.merge ? { ...server.docs.get(body.path), ...body.data } : body.data);
        bump();
      } else if (body.op === 'delete') {
        server.docs.delete(body.path);
        bump();
      }
      return { body: { data: server.docs.get(body.path) ?? null, version: server.versions.get(body.path) ?? 0 } };
    }
    return fail('not-found');
  }

  /** Routes a page (or a whole browser context) to this fake, with accounts switched on. */
  server.install = async (target) => {
    await target.route('https://www.gstatic.com/firebasejs/**', (route) => {
      const file = new URL(route.request().url()).pathname.split('/').pop();
      const body = { 'firebase-app.js': 'export const initializeApp = (options) => ({ options });', 'firebase-auth.js': AUTH, 'firebase-firestore.js': FIRESTORE }[file];
      return route.fulfill({ contentType: 'text/javascript', body: body ?? '' });
    });
    await target.route('**/assets/js/config.js', async (route) => {
      const original = await (await route.fetch()).text();
      return route.fulfill({ contentType: 'text/javascript', body: original.replace('export const FIREBASE = null;', `export const FIREBASE = ${JSON.stringify(FAKE_CONFIG)};`) });
    });
    await target.route('**/__fake_firebase__/**', (route) => {
      const path = new URL(route.request().url()).pathname.split('/__fake_firebase__/')[1];
      const { body } = handle(path, JSON.parse(route.request().postData() || '{}'));
      return route.fulfill({ json: body });
    });
  };

  /** The stored document for an account, by email. */
  server.docFor = (email) => server.docs.get(`users/${server.accounts.get(email)?.uid}`) ?? null;
  return server;
}
