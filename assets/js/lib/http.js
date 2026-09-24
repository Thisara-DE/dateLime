// fetch wrapper used by every API client: timeouts, abort, one retry for transient
// failures, request de-duplication and a small session cache.

export class HttpError extends Error {
  constructor(message, { status = 0, url = '', cause } = {}) {
    super(message, { cause });
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
  /** True when retrying later has a chance of succeeding. */
  get transient() {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

const memoryCache = new Map();
const inFlight = new Map();
const CACHE_PREFIX = 'datelime.http.';

function sessionStore() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; // storage can be blocked (privacy mode, sandboxed iframes)
  }
}

function readCache(key, maxAge) {
  const now = Date.now();
  const hit = memoryCache.get(key);
  if (hit && now - hit.at < maxAge) return hit.data;
  const store = sessionStore();
  if (!store) return undefined;
  try {
    const stored = JSON.parse(store.getItem(CACHE_PREFIX + key));
    if (stored && now - stored.at < maxAge) {
      memoryCache.set(key, stored);
      return stored.data;
    }
  } catch {
    /* corrupt entry: ignore */
  }
  return undefined;
}

function writeCache(key, data) {
  const entry = { at: Date.now(), data };
  memoryCache.set(key, entry);
  try {
    sessionStore()?.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    /* quota exceeded: memory cache is enough */
  }
}

/** Removes API keys from URLs before they are used as cache keys or shown in errors. */
export function redact(url) {
  return String(url).replace(/([?&]api_key=)[^&]+/i, '$1***');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The network request itself is only bounded by a timeout. Callers cancel their own wait
// (see getJSON) so one view navigating away never cancels a request another view shares.
async function attempt(url, timeout) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeout), headers: { accept: 'application/json' } });
  } catch (cause) {
    const timedOut = cause?.name === 'TimeoutError';
    throw new HttpError(timedOut ? 'The request timed out' : 'Network request failed', { url: redact(url), cause });
  }
  if (!response.ok) {
    throw new HttpError(`Request failed with status ${response.status}`, { status: response.status, url: redact(url) });
  }
  try {
    return await response.json();
  } catch (cause) {
    throw new HttpError('The server sent an unreadable response', { status: response.status, url: redact(url), cause });
  }
}

/**
 * GET a JSON document.
 * @param {string} url
 * @param {{signal?: AbortSignal, timeout?: number, retries?: number, cacheFor?: number}} [options]
 *   cacheFor: milliseconds to reuse a successful response (0 disables caching).
 */
export async function getJSON(url, { signal, timeout = 10_000, retries = 1, cacheFor = 30 * 60_000 } = {}) {
  const key = redact(url);
  if (cacheFor > 0) {
    const cached = readCache(key, cacheFor);
    if (cached !== undefined) return cached;
  }

  // Identical concurrent requests share one network call. Each caller can still abort its
  // own wait without cancelling the others.
  let shared = inFlight.get(key);
  if (!shared) {
    shared = (async () => {
      for (let tryNo = 0; ; tryNo += 1) {
        try {
          const data = await attempt(url, timeout);
          if (cacheFor > 0) writeCache(key, data);
          return data;
        } catch (err) {
          if (!(err instanceof HttpError) || !err.transient || tryNo >= retries) throw err;
          await sleep(400 * 2 ** tryNo);
        }
      }
    })().finally(() => inFlight.delete(key));
    inFlight.set(key, shared);
  }

  if (!signal) return shared;
  if (signal.aborted) throw signal.reason;
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    shared.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export function isAbortError(err) {
  return err?.name === 'AbortError';
}

/** Test hook: clears the in-memory and session caches. */
export function clearHttpCache() {
  memoryCache.clear();
  const store = sessionStore();
  if (!store) return;
  try {
    for (let i = store.length - 1; i >= 0; i -= 1) {
      const k = store.key(i);
      if (k?.startsWith(CACHE_PREFIX)) store.removeItem(k);
    }
  } catch {
    /* ignore */
  }
}
