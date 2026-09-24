// Screen-reader announcements plus visual toasts. This replaces the old blocking alert() calls.
let politeRegion;
let toastStack;

function ensureRegions() {
  if (politeRegion?.isConnected) return;
  politeRegion = document.createElement('div');
  politeRegion.className = 'visually-hidden';
  politeRegion.setAttribute('aria-live', 'polite');
  politeRegion.setAttribute('aria-atomic', 'true');
  politeRegion.dataset.testid = 'live-region';
  toastStack = document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.append(politeRegion, toastStack);
}

/** Announces text to assistive technology without showing anything. */
export function announce(message) {
  ensureRegions();
  // Clearing first makes repeated identical messages announce again.
  politeRegion.textContent = '';
  requestAnimationFrame(() => {
    politeRegion.textContent = message;
  });
}

/**
 * Shows a toast and announces it.
 * @param {string} message
 * @param {{tone?: 'success'|'info'|'danger', duration?: number}} [options]
 */
export function toast(message, { tone = 'success', duration = 4000 } = {}) {
  ensureRegions();
  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  el.textContent = message;
  toastStack.append(el);
  announce(message);
  const remove = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  };
  setTimeout(remove, duration);
  return remove;
}
