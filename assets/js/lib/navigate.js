// Programmatic navigation for views (the router listens for hashchange).
import { href } from './router.js';

export function navigate(path, query = {}, { replace = false } = {}) {
  const target = href(path, query);
  if (replace) {
    history.replaceState(history.state, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (location.hash === target) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = target.slice(1);
  }
}
