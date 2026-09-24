/* dateLime service worker: installable app, offline saved dates and Cook-along.
 *
 * Strategy
 * - App files (same origin): network-first with a short timeout, falling back to the cache.
 *   Online users always get the latest deploy; offline users get the last good copy.
 *   (Cache-first app shells are how PWAs end up serving stale JavaScript for days.)
 * - Posters, food and drink photos: cache-first, capped, so saved dates look right offline.
 * - API responses: network-first, cached, so a recipe you've opened works offline.
 * PRECACHE is checked by tests/unit/sw.test.js: every module and stylesheet must be listed.
 */
const VERSION = 'v2.0.0';
const APP_CACHE = `datelime-app-${VERSION}`;
const IMAGE_CACHE = 'datelime-images';
const API_CACHE = 'datelime-api';
const MAX_IMAGES = 200;
const MAX_API = 150;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/components.css',
  './assets/css/views.css',
  './assets/fonts/atkinson-hyperlegible-next-400.woff2',
  './assets/fonts/atkinson-hyperlegible-next-600.woff2',
  './assets/fonts/fraunces-var.woff2',
  './assets/fonts/roboto-condensed-700.woff2',
  './assets/img/icon.svg',
  './assets/img/favicon-32.png',
  './assets/img/icon-192.png',
  './assets/js/main.js',
  './assets/js/config.js',
  './assets/js/state.js',
  './assets/js/ui.js',
  './assets/js/api/tmdb.js',
  './assets/js/api/mealdb.js',
  './assets/js/api/cocktaildb.js',
  './assets/js/components/icons.js',
  './assets/js/components/wordmark.js',
  './assets/js/components/sheet.js',
  './assets/js/components/movie-sheet.js',
  './assets/js/components/recipe-sheet.js',
  './assets/js/domain/avoid.js',
  './assets/js/domain/ics.js',
  './assets/js/domain/moods.js',
  './assets/js/domain/night-plan.js',
  './assets/js/domain/pairing.js',
  './assets/js/domain/plan.js',
  './assets/js/domain/timers.js',
  './assets/js/lib/announce.js',
  './assets/js/lib/html.js',
  './assets/js/lib/http.js',
  './assets/js/lib/navigate.js',
  './assets/js/lib/router.js',
  './assets/js/lib/share.js',
  './assets/js/lib/store.js',
  './assets/js/lib/theme.js',
  './assets/js/views/cook.js',
  './assets/js/views/date.js',
  './assets/js/views/dates.js',
  './assets/js/views/home.js',
  './assets/js/views/movies.js',
  './assets/js/views/not-found.js',
  './assets/js/views/recipes.js',
  './assets/js/views/results.js',
  './assets/js/views/rules.js',
  './assets/js/views/surprise.js',
  './assets/js/views/team.js',
];

const IMAGE_HOSTS = ['image.tmdb.org', 'www.themealdb.com', 'www.thecocktaildb.com'];
const API_HOSTS = ['api.themoviedb.org', 'www.themealdb.com', 'www.thecocktaildb.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('datelime-app-') && k !== APP_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function networkFirst(request, cacheName, { wait = 4000, fallback } = {}) {
  const cache = await caches.open(cacheName);
  // A response that arrives after the timeout still refreshes the cache for next time.
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone()).catch(() => {});
    return response;
  });
  network.catch(() => {}); // failing after the cache has answered isn't an error
  try {
    return await Promise.race([network, timeout(wait)]);
  } catch {
    const cached = (await cache.match(request, { ignoreSearch: request.mode === 'navigate' })) ?? (fallback && (await cache.match(fallback)));
    // Nothing cached yet (a slow connection, not an offline one): keep waiting for the
    // network rather than failing the request at the timeout.
    return cached ?? network;
  }
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  // Cross-origin images come back opaque (status 0); they're still worth keeping.
  if (response.ok || response.type === 'opaque') {
    await cache.put(request, response.clone());
    trim(cacheName, max);
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request, APP_CACHE, { wait: 3000, fallback: request.mode === 'navigate' ? './index.html' : undefined }));
    return;
  }
  const isImage = request.destination === 'image' || /\/images\//.test(url.pathname) || url.hostname === 'image.tmdb.org';
  if (isImage && IMAGE_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
    return;
  }
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      networkFirst(request, API_CACHE, { wait: 8000 }).finally(() => trim(API_CACHE, MAX_API)),
    );
  }
});
