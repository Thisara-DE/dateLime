// A small observable store with versioned, crash-safe persistence to localStorage.

function safeStorage() {
  try {
    const s = globalThis.localStorage;
    const probe = '__datelime_probe__';
    s.setItem(probe, probe);
    s.removeItem(probe);
    return s;
  } catch {
    return null; // private mode, disabled storage, or Node (unit tests)
  }
}

/**
 * @template T
 * @param {T} initial
 * @param {{key?: string, version?: number, persist?: (state: T) => Partial<T>, migrate?: (old: any, fromVersion: number) => Partial<T>, storage?: Storage|null}} [options]
 */
export function createStore(initial, { key, version = 1, persist = (s) => s, migrate, storage = safeStorage() } = {}) {
  let state = structuredClone(initial);
  const listeners = new Set();

  if (key && storage) {
    try {
      const saved = JSON.parse(storage.getItem(key));
      if (saved && typeof saved === 'object') {
        if (saved.v === version) state = { ...state, ...saved.data };
        else if (migrate) state = { ...state, ...migrate(saved.data, saved.v) };
      }
    } catch {
      /* corrupt JSON: start fresh rather than crash (the old app threw here) */
    }
  }

  function save() {
    if (!key || !storage) return;
    try {
      storage.setItem(key, JSON.stringify({ v: version, data: persist(state) }));
    } catch {
      /* quota exceeded or storage revoked: keep working in memory */
    }
  }

  return {
    get: () => state,
    /** Shallow-merges a patch, or applies an updater function, then notifies subscribers. */
    set(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      if (next === state || next === undefined) return;
      const prev = state;
      state = { ...state, ...next };
      save();
      listeners.forEach((fn) => fn(state, prev));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** True when changes survive a reload. */
    get persistent() {
      return Boolean(key && storage);
    },
  };
}
