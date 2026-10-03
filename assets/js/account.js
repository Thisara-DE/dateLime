// Optional accounts. Signed out, dateLime works as before and keeps everything on this
// device. Signed in, the store switches to that account's cache, and this module keeps it
// in sync with the account's private document in Firestore (users/{uid}): house rules and
// saved dates. The plan in progress and the shortlist stay on the device.
import * as cloud from './lib/cloud.js';
import { store, accountKey, GUEST_KEY, DEFAULT_RULES, getRules, readGuestData, clearGuestData } from './state.js';
import { mergeGuestIntoAccount, hasGuestDates } from './domain/account-merge.js';
import { html } from './lib/html.js';
import { openSheet } from './components/sheet.js';
import { toast } from './lib/announce.js';

/** Remembers who is signed in on this device, so a reload shows their data at once. */
const SESSION_KEY = 'datelime.account';
/** Set just before a Google redirect, so the page knows to finish it when it comes back. */
const REDIRECT_KEY = 'datelime.redirecting';
const PUSH_DELAY = 600;
const pluralize = (n, one) => `${n} ${n === 1 ? one : `${one}s`}`;

let state = { status: cloud.accountsEnabled() ? 'signed-out' : 'off', user: null, profile: null, syncError: false };
const listeners = new Set();
let applyingRemote = false;
let stopDoc = null;
let stopAuth = null;
let pushTimer = null;
let pending = null; // an interactive sign-in in progress: { profile?, resolve, reject }

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the session just won't survive a reload */
  }
};

function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export const getAccount = () => state;
export const isSignedIn = () => state.status === 'signed-in';
export function subscribeAccount(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Points the store elsewhere without echoing the switch back to Firestore as an edit. */
function switchStore(key) {
  applyingRemote = true;
  try {
    store.switchKey(key);
  } finally {
    applyingRemote = false;
  }
}

// ---- Sync -------------------------------------------------------------------------------

store.subscribe((next, prev) => {
  if (applyingRemote || state.status !== 'signed-in') return;
  if (next.rules !== prev.rules || next.saved !== prev.saved) schedulePush();
});

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, PUSH_DELAY);
}

async function push() {
  clearTimeout(pushTimer);
  pushTimer = null;
  if (state.status !== 'signed-in') return;
  const { rules, saved } = store.get();
  try {
    await cloud.writeUserDoc(state.user.uid, { rules, saved });
    if (state.syncError) setState({ syncError: false });
  } catch {
    setState({ syncError: true }); // kept on this device; retried with the next change
  }
}

function applyRemote(data) {
  applyingRemote = true;
  try {
    store.set({ rules: { ...DEFAULT_RULES, ...data.rules }, saved: data.saved ?? [] });
  } finally {
    applyingRemote = false;
  }
  const profile = data.profile ?? state.profile;
  // The profile's name is the one people chose (or renamed to); it wins over Google's.
  if (profile?.name && state.user && profile.name !== state.user.name) {
    const user = { ...state.user, name: profile.name };
    write(SESSION_KEY, { uid: user.uid, name: user.name, email: user.email });
    setState({ profile, user });
  } else {
    setState({ profile });
  }
}

/** Handles the first look at the account's document after signing in. */
async function firstLoad(user, data) {
  const wanted = pending;
  if (data) {
    applyRemote(data);
  } else {
    // A new account: its profile comes from the sign-up form (or Google), and its house
    // rules start from the defaults plus the region and diet chosen at sign-up.
    const choice = wanted?.profile ?? {};
    const profile = { name: choice.name || user.name || user.email.split('@')[0], email: user.email, createdAt: new Date().toISOString() };
    const rules = { ...DEFAULT_RULES, ...(choice.region ? { region: choice.region } : {}), ...(choice.diet !== undefined ? { diet: choice.diet } : {}) };
    applyRemote({ profile, rules, saved: [] });
    await cloud.writeUserDoc(user.uid, { profile, rules, saved: [] });
  }
  if (wanted) {
    pending = null;
    await offerGuestDates();
    wanted.resolve({ isNew: !data });
  }
}

function watchDoc(user) {
  stopDoc?.();
  let first = true;
  cloud
    .watchUserDoc(
      user.uid,
      (data) => {
        if (first) {
          first = false;
          firstLoad(user, data).catch((err) => failPending(err));
        } else if (data) {
          applyRemote(data);
        }
      },
      () => {
        setState({ syncError: true });
        failPending(Object.assign(new Error('sync'), { code: 'auth/network-request-failed' }));
      },
    )
    .then((stop) => (stopDoc = stop))
    .catch(() => setState({ syncError: true }));
}

function failPending(err) {
  if (!pending) return;
  const { reject } = pending;
  pending = null;
  reject(err);
}

// ---- Sign-in state ----------------------------------------------------------------------

function onSignedIn(user) {
  const sameUser = state.user?.uid === user.uid && state.status === 'signed-in';
  write(SESSION_KEY, { uid: user.uid, name: user.name, email: user.email });
  if (!sameUser || store.key !== accountKey(user.uid)) switchStore(accountKey(user.uid));
  setState({ status: 'signed-in', user });
  watchDoc(user);
}

/** Forgets the account on this device: its cache, the session hint and the live sync. */
function forgetAccount() {
  const uid = state.user?.uid;
  stopDoc?.();
  stopDoc = null;
  clearTimeout(pushTimer);
  pushTimer = null;
  write(SESSION_KEY, null);
  if (uid) write(accountKey(uid), null);
  switchStore(GUEST_KEY);
  setState({ status: 'signed-out', user: null, profile: null, syncError: false });
}

async function ensureWatching() {
  if (stopAuth) return;
  stopAuth = await cloud.watchAuth((user) => {
    if (user) onSignedIn(user);
    else if (state.status === 'signed-in') forgetAccount(); // signed out elsewhere, or deleted
  });
}

/**
 * Called once at startup. With a session on this device, the account's cached data shows
 * at once and Firebase loads in the background to confirm it. Without one, nothing loads.
 */
export function startAccounts() {
  if (state.status === 'off') return;
  const session = read(SESSION_KEY);
  const redirecting = sessionStorage.getItem(REDIRECT_KEY);
  if (session?.uid) {
    switchStore(accountKey(session.uid));
    setState({ status: 'signed-in', user: { uid: session.uid, name: session.name ?? '', email: session.email ?? '' } });
  }
  if (session?.uid || redirecting) {
    sessionStorage.removeItem(REDIRECT_KEY);
    ensureWatching().catch(() => setState({ syncError: true })); // offline: keep the cached copy
    if (redirecting) {
      const done = new Promise((resolve, reject) => (pending = { resolve, reject, profile: null }));
      cloud.completeRedirect().then((user) => !user && failPending(null), failPending);
      done.then(({ isNew }) => location.replace(isNew ? '#/account?welcome=1' : '#/dates'), () => {});
    }
  }
}

/** Runs an interactive sign-in and resolves once the account's data is in place. */
async function interactive(signIn, profile = null) {
  await ensureWatching();
  const done = new Promise((resolve, reject) => (pending = { resolve, reject, profile }));
  try {
    const user = await signIn();
    if (!user) return new Promise(() => {}); // redirecting to Google; this page is leaving
  } catch (err) {
    pending = null;
    throw err;
  }
  return done;
}

export const signUp = ({ name, email, password, region, diet }) =>
  interactive(() => cloud.signUpWithEmail({ email, password, name }), { name, region, diet });

export const signIn = ({ email, password }) => interactive(() => cloud.signInWithEmail({ email, password }));

export function signInWithGoogle() {
  sessionStorage.setItem(REDIRECT_KEY, '1'); // only used if the pop-up falls back to a redirect
  return interactive(() => cloud.signInWithGoogle()).finally(() => sessionStorage.removeItem(REDIRECT_KEY));
}

export const sendPasswordReset = (email) => cloud.sendPasswordReset(email);

export async function signOut() {
  if (pushTimer) await push(); // don't lose an edit made in the last moment
  await cloud.signOutUser();
  forgetAccount();
}

/** Saves the name (and region and diet, which live in house rules). */
export async function updateProfile({ name, region, diet }) {
  const profile = { ...state.profile, name };
  await Promise.all([cloud.renameUser(name), cloud.writeUserDoc(state.user.uid, { profile })]);
  setState({ profile, user: { ...state.user, name } });
  write(SESSION_KEY, { uid: state.user.uid, name, email: state.user.email });
  applyingRemote = true; // saved just below in one write, not twice
  try {
    store.set((s) => ({ rules: { ...s.rules, region, diet } }));
  } finally {
    applyingRemote = false;
  }
  await push();
}

export async function deleteAccount() {
  await cloud.deleteAccount(state.user.uid);
  forgetAccount();
}

// ---- Dates already on this device -------------------------------------------------------

/**
 * Asks what to do with dates saved on this device before signing in: add them to the
 * account (then remove them from the device), or else whether to delete them from it.
 */
function offerGuestDates() {
  const guest = readGuestData();
  if (!hasGuestDates(guest)) return Promise.resolve();
  const count = guest.saved.length;
  return new Promise((resolve) => {
    let answered = false;
    const sheet = openSheet({
      title: 'Add your dates to your account?',
      className: 'sheet--prompt',
      body: html`<p>This device has ${pluralize(count, 'saved date')} from before you signed in. Add ${count === 1 ? 'it' : 'them'} to your account to see ${count === 1 ? 'it' : 'them'} on any device you sign in on.</p><p class="muted">Once added, ${count === 1 ? 'it’s' : 'they’re'} removed from this device’s signed-out storage.</p>`,
      footer: html`<div class="button-row"><button class="button button--primary" type="button" data-guest="add">Add to my account</button><button class="button button--secondary" type="button" data-guest="skip">Not now</button></div>`,
      onClose: () => {
        if (!answered) askToDelete(count).then(resolve);
      },
    });
    sheet.dialog.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-guest]')?.dataset.guest;
      if (!choice) return;
      if (choice === 'add') {
        answered = true;
        const { rules, saved, added } = mergeGuestIntoAccount({ rules: getRules(), saved: store.get().saved ?? [] }, guest);
        store.set({ rules, saved }); // syncs to the account
        clearGuestData();
        toast(added ? `Added ${pluralize(added, 'date')} to your account.` : 'Those dates were already in your account.');
        sheet.close();
        resolve();
      } else {
        sheet.close(); // onClose asks about deleting
      }
    });
  });
}

function askToDelete(count) {
  return new Promise((resolve) => {
    const sheet = openSheet({
      title: 'Delete them from this device?',
      className: 'sheet--prompt',
      body: html`<p>${count === 1 ? 'That date isn’t' : 'Those dates aren’t'} in your account. If you keep ${count === 1 ? 'it' : 'them'}, ${count === 1 ? 'it' : 'they'} stay on this device and come back when you sign out.</p>`,
      footer: html`<div class="button-row"><button class="button button--danger" type="button" data-guest-delete>Delete from this device</button><button class="button button--secondary" type="button" data-sheet-close>Keep on this device</button></div>`,
      onClose: resolve,
    });
    sheet.dialog.querySelector('[data-guest-delete]').addEventListener('click', () => {
      clearGuestData();
      toast(`Deleted ${pluralize(count, 'date')} from this device.`, { tone: 'info' });
      sheet.close();
    });
  });
}

/** Display initials for the header, from the name or the email. */
export function initials(user) {
  const source = (user?.name || user?.email || '?').trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 && user?.name ? parts.at(-1)[0] : '')).toUpperCase();
}
