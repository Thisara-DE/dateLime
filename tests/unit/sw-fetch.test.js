// The service worker's fetch strategies, run in a simulated worker scope: what someone
// gets offline, and on a connection too slow to wait for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync(new URL('../../sw.js', import.meta.url), 'utf8');
const SCOPE = 'https://thisara-de.github.io/dateLime/';

const flush = () => new Promise((resolve) => setImmediate(resolve));

function deferred() {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
}

const response = (body) => ({ body, ok: true, status: 200, type: 'basic', clone: () => response(body) });

function fakeCaches() {
  const stores = new Map();
  const key = (req, ignoreSearch = false) => {
    const url = new URL(typeof req === 'string' ? req : req.url, SCOPE);
    if (ignoreSearch) url.search = '';
    return url.href;
  };
  return {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async match(req, { ignoreSearch = false } = {}) {
          for (const [url, res] of store) if (key(url, ignoreSearch) === key(req, ignoreSearch)) return res;
          return undefined;
        },
        async put(req, res) {
          store.set(key(req), res);
        },
        async addAll() {},
        async keys() {
          return [...store.keys()].map((url) => ({ url }));
        },
        async delete(req) {
          return store.delete(key(req));
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
  };
}

/** Loads sw.js with a network the test controls. Timeouts fire only when the test says. */
function worker() {
  const listeners = {};
  const timers = [];
  const net = { mode: 'online', slow: null, calls: 0 };
  const fetch = async (req) => {
    net.calls += 1;
    if (net.mode === 'offline') throw new TypeError('Failed to fetch');
    if (net.mode === 'slow') return net.slow.promise;
    return response(`fresh ${req.url}`);
  };
  const self = { location: new URL('sw.js', SCOPE), addEventListener: (type, fn) => (listeners[type] = fn), skipWaiting() {}, clients: { claim() {} } };
  vm.runInNewContext(SOURCE, { self, caches: fakeCaches(), fetch, URL, setTimeout: (fn) => timers.push(fn) });

  return {
    net,
    /** Dispatches a fetch event and returns what the worker answered with. */
    get(path, { mode = 'cors', destination = '' } = {}) {
      let answer;
      listeners.fetch({ request: { url: new URL(path, SCOPE).href, method: 'GET', mode, destination }, respondWith: (p) => (answer = p) });
      return answer;
    },
    async timeOut() {
      await flush();
      timers.splice(0).forEach((fn) => fn());
      await flush();
    },
  };
}

test('a slow first visit waits for the network instead of failing at the timeout', async () => {
  const sw = worker();
  sw.net.mode = 'slow';
  sw.net.slow = deferred();
  const answer = sw.get('assets/js/views/cook.js');
  let settled = false;
  answer.then(
    () => (settled = true),
    () => (settled = true),
  );
  await sw.timeOut(); // three seconds pass, and nothing is cached yet
  assert.equal(settled, false, 'the request must still be waiting');
  sw.net.slow.resolve(response('cook.js'));
  assert.equal((await answer).body, 'cook.js');
});

test('offline, files you have loaded before come from the cache', async () => {
  const sw = worker();
  assert.match((await sw.get('assets/js/views/cook.js')).body, /^fresh /);
  sw.net.mode = 'offline';
  assert.match((await sw.get('assets/js/views/cook.js')).body, /cook\.js$/);
});

test('offline, any page opens the app shell, which routes it', async () => {
  const sw = worker();
  await sw.get('index.html');
  sw.net.mode = 'offline';
  const page = await sw.get('our-team.html', { mode: 'navigate' });
  assert.match(page.body, /index\.html$/);
});

test('a slow API with a cached copy answers from the cache, and the late reply refreshes it', async () => {
  const sw = worker();
  const recipe = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i=52772';
  await sw.get(recipe);
  sw.net.mode = 'slow';
  sw.net.slow = deferred();
  const answer = sw.get(recipe);
  await sw.timeOut();
  assert.match((await answer).body, /^fresh /);
  sw.net.slow.resolve(response('updated'));
  await flush();
  sw.net.mode = 'offline';
  assert.equal((await sw.get(recipe)).body, 'updated');
});

test('images are cache-first: a second view never touches the network', async () => {
  const sw = worker();
  const poster = 'https://image.tmdb.org/t/p/w342/poster.jpg';
  await sw.get(poster, { destination: 'image' });
  const before = sw.net.calls;
  await sw.get(poster, { destination: 'image' });
  assert.equal(sw.net.calls, before);
});
