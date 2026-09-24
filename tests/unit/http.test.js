import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getJSON, HttpError, clearHttpCache, redact } from '../../assets/js/lib/http.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => clearHttpCache());

test('returns parsed JSON and caches it', async () => {
  let calls = 0;
  globalThis.fetch = async () => (calls++, json({ ok: 1 }));
  assert.deepEqual(await getJSON('https://api.test/a'), { ok: 1 });
  assert.deepEqual(await getJSON('https://api.test/a'), { ok: 1 });
  assert.equal(calls, 1);
});

test('de-duplicates concurrent identical requests', async () => {
  let calls = 0;
  globalThis.fetch = async () => (calls++, json({ n: 1 }));
  await Promise.all([getJSON('https://api.test/b', { cacheFor: 0 }), getJSON('https://api.test/b', { cacheFor: 0 })]);
  assert.equal(calls, 1);
});

test('retries once on a 5xx, then succeeds', async () => {
  let calls = 0;
  globalThis.fetch = async () => (++calls === 1 ? json({}, 503) : json({ second: true }));
  assert.deepEqual(await getJSON('https://api.test/c', { cacheFor: 0 }), { second: true });
  assert.equal(calls, 2);
});

test('does not retry a 404 and throws a typed HttpError', async () => {
  let calls = 0;
  globalThis.fetch = async () => (calls++, json({ status_message: 'nope' }, 404));
  await assert.rejects(getJSON('https://api.test/d', { cacheFor: 0 }), (err) => err instanceof HttpError && err.status === 404 && !err.transient);
  assert.equal(calls, 1);
});

test('network failure becomes a transient HttpError', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch');
  };
  await assert.rejects(getJSON('https://api.test/e', { cacheFor: 0, retries: 0 }), (err) => err instanceof HttpError && err.transient);
});

test('a caller abort rejects with AbortError without killing the shared request', async () => {
  let resolveFetch;
  globalThis.fetch = () => new Promise((r) => (resolveFetch = () => r(json({ late: true }))));
  const controller = new AbortController();
  const aborted = getJSON('https://api.test/f', { signal: controller.signal, cacheFor: 0 });
  const other = getJSON('https://api.test/f', { cacheFor: 0 });
  controller.abort();
  await assert.rejects(aborted, { name: 'AbortError' });
  resolveFetch();
  assert.deepEqual(await other, { late: true });
});

test('redact hides the TMDB api key', () => {
  assert.equal(redact('https://x/y?api_key=SECRET&page=2'), 'https://x/y?api_key=***&page=2');
});
