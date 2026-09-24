import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../../assets/js/lib/store.js';

function memoryStorage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    dump: () => Object.fromEntries(data),
  };
}

test('set merges, notifies and persists with a version', () => {
  const storage = memoryStorage();
  const store = createStore({ a: 1, b: 2 }, { key: 'k', version: 3, storage });
  const seen = [];
  store.subscribe((s, prev) => seen.push([s.a, prev.a]));
  store.set({ a: 5 });
  store.set((s) => ({ b: s.b + 1 }));
  assert.deepEqual(store.get(), { a: 5, b: 3 });
  assert.deepEqual(seen, [[5, 1], [5, 5]]);
  assert.deepEqual(JSON.parse(storage.dump().k), { v: 3, data: { a: 5, b: 3 } });
});

test('restores persisted state for the same version', () => {
  const storage = memoryStorage({ k: JSON.stringify({ v: 1, data: { a: 9 } }) });
  assert.equal(createStore({ a: 1 }, { key: 'k', storage }).get().a, 9);
});

test('migrates older versions and survives corrupt JSON', () => {
  const old = memoryStorage({ k: JSON.stringify({ v: 1, data: { legacy: 7 } }) });
  const migrated = createStore({ a: 0 }, { key: 'k', version: 2, storage: old, migrate: (d) => ({ a: d.legacy }) });
  assert.equal(migrated.get().a, 7);

  const corrupt = memoryStorage({ k: '{not json' });
  assert.deepEqual(createStore({ a: 1 }, { key: 'k', storage: corrupt }).get(), { a: 1 });
});

test('persist() controls what is written', () => {
  const storage = memoryStorage();
  const store = createStore({ keep: 1, temp: 2 }, { key: 'k', storage, persist: ({ keep }) => ({ keep }) });
  store.set({ temp: 3 });
  assert.deepEqual(JSON.parse(storage.dump().k).data, { keep: 1 });
});

test('works with no storage at all', () => {
  const store = createStore({ a: 1 }, { key: 'k', storage: null });
  store.set({ a: 2 });
  assert.equal(store.get().a, 2);
  assert.equal(store.persistent, false);
});

test('reload() picks up changes another tab wrote', () => {
  const storage = memoryStorage();
  const store = createStore({ n: 0 }, { key: 'k', storage });
  let notified = 0;
  store.subscribe(() => (notified += 1));
  storage.setItem('k', JSON.stringify({ v: 1, data: { n: 5 } }));
  store.reload();
  assert.equal(store.get().n, 5);
  assert.equal(notified, 1);
});
