// Hash router (#/path?query). GitHub Pages serves only static files, so hash URLs are the
// robust choice: deep links and refreshes always load index.html.
//
// A view module exports:
//   title(ctx) -> string                          document title for the route
//   mount(outlet, ctx) -> cleanup | void          renders into the outlet
// ctx = { path, query, signal }. `signal` aborts when the user navigates away, so views
// can pass it to fetches and to addEventListener and nothing leaks between pages.

export function parseLocation(hash = globalThis.location?.hash ?? '') {
  const value = hash.replace(/^#/, '') || '/';
  const [rawPath, queryString = ''] = value.split('?');
  const path = `/${rawPath.replace(/^\/+|\/+$/g, '')}`;
  return { path, query: Object.fromEntries(new URLSearchParams(queryString)) };
}

/** Builds "#/path?x=1", dropping empty query values. */
export function href(path, query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return `#${path}${qs ? `?${qs}` : ''}`;
}

const prefersReducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function createRouter({ routes, outlet, onRoute }) {
  let current = null;
  let generation = 0;

  async function resolve() {
    const location = parseLocation();
    const route = routes.find((r) => r.path === location.path) ?? routes.find((r) => r.path === '*');
    const token = ++generation;
    const isFirst = token === 1;

    current?.controller.abort();
    try {
      current?.cleanup?.();
    } catch (err) {
      console.error(err);
    }
    const controller = new AbortController();
    current = { controller, cleanup: null };

    let view;
    try {
      view = await route.load();
    } catch (err) {
      console.error('Failed to load view', err);
      view = route.fallback ?? (await routes.find((r) => r.path === '*').load());
    }
    if (token !== generation) return; // a newer navigation already started

    const ctx = { ...location, signal: controller.signal };
    const swap = () => {
      outlet.replaceChildren();
      current.cleanup = view.mount(outlet, ctx) ?? null;
    };

    if (!isFirst && document.startViewTransition && !prefersReducedMotion()) {
      await document.startViewTransition(swap).updateCallbackDone.catch(() => {});
    } else {
      swap();
    }

    document.title = `${view.title?.(ctx) ?? 'Date night'} · dateLime`;
    if (!isFirst) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const heading = outlet.querySelector('h1');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
    onRoute?.({ ...location, route, isFirst });
  }

  return {
    start() {
      window.addEventListener('hashchange', resolve);
      return resolve();
    },
    /** Navigates programmatically. `replace` avoids a history entry (e.g. for redirects). */
    go(path, query, { replace = false } = {}) {
      const target = href(path, query);
      if (target === (location.hash || '#/')) return resolve();
      if (replace) {
        history.replaceState(history.state, '', target);
        return resolve();
      }
      location.hash = target.slice(1);
      return undefined;
    },
  };
}
