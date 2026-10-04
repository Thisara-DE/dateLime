// The privacy guarantee, tested against the real Firestore emulator: each person's
// document is theirs alone. Run with `npm run test:rules` (needs Java for the emulator).
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

let env;
const plan = (i) => ({ id: `p${i}`, movie: { id: i, title: 'Amélie' }, meal: { id: '52852', name: 'Tuna Niçoise' }, drink: null });
const valid = { profile: { name: 'Ana', email: 'ana@example.com', createdAt: '2026-10-03T10:00:00.000Z' }, rules: { diet: 'vegan' }, saved: [plan(1)], updatedAt: '2026-10-03T10:00:00.000Z' };

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-datelime',
    firestore: { rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'), host: '127.0.0.1', port: 8085 },
  });
});
after(() => env?.cleanup());
beforeEach(() => env.clearFirestore());

const as = (uid) => env.authenticatedContext(uid).firestore();
const seed = (uid, data = valid) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'users', uid), data));

test('you can create, read, update and delete your own document', async () => {
  const db = as('ana');
  await assertSucceeds(setDoc(doc(db, 'users', 'ana'), valid));
  await assertSucceeds(getDoc(doc(db, 'users', 'ana')));
  await assertSucceeds(setDoc(doc(db, 'users', 'ana'), { saved: [] }, { merge: true }));
  await assertSucceeds(deleteDoc(doc(db, 'users', 'ana')));
});

test("someone else can't read, change or delete your document", async () => {
  await seed('ana');
  const ben = as('ben');
  await assertFails(getDoc(doc(ben, 'users', 'ana')));
  await assertFails(setDoc(doc(ben, 'users', 'ana'), { saved: [] }, { merge: true }));
  await assertFails(deleteDoc(doc(ben, 'users', 'ana')));
  await assertFails(setDoc(doc(ben, 'users', 'carla'), valid)); // nor create one for another person
});

test('signed-out visitors can read and write nothing', async () => {
  await seed('ana');
  const guest = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(guest, 'users', 'ana')));
  await assertFails(setDoc(doc(guest, 'users', 'ana'), valid));
});

test('nobody can list the users collection', async () => {
  await seed('ana');
  await assertFails(getDocs(collection(as('ana'), 'users')));
});

test('documents keep their shape: no extra fields, no oversized lists or names', async () => {
  const db = as('ana');
  await assertFails(setDoc(doc(db, 'users', 'ana'), { ...valid, isAdmin: true }));
  await assertFails(setDoc(doc(db, 'users', 'ana'), { ...valid, saved: Array.from({ length: 51 }, (_, i) => plan(i)) }));
  await assertSucceeds(setDoc(doc(db, 'users', 'ana'), { ...valid, saved: Array.from({ length: 50 }, (_, i) => plan(i)) }));
  await assertFails(setDoc(doc(db, 'users', 'ana'), { ...valid, profile: { ...valid.profile, name: 'x'.repeat(81) } }));
  await assertFails(setDoc(doc(db, 'users', 'ana'), { ...valid, profile: { ...valid.profile, role: 'admin' } }));
  await assertFails(setDoc(doc(db, 'users', 'ana'), { ...valid, saved: 'everything' }));
});

test('nothing outside users/{uid} is reachable', async () => {
  const db = as('ana');
  await assertFails(setDoc(doc(db, 'shared', 'x'), { a: 1 }));
  await assertFails(getDoc(doc(db, 'shared', 'x')));
});
