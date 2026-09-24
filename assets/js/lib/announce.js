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
  toastStack = document.createElement('section');
  toastStack.className = 'toast-stack';
  toastStack.setAttribute('aria-label', 'Notifications');
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
 * Shows a toast and announces it. Toasts never take focus. A toast with an action (Undo)
 * stays until it's used, dismissed or the next navigation, and the action is always
 * available elsewhere too.
 * @param {string} message
 * @param {{tone?: 'success'|'info'|'danger', duration?: number, action?: {label: string, onClick: () => void}}} [options]
 */
export function toast(message, { tone = 'success', duration = 5000, action } = {}) {
  ensureRegions();
  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  const text = document.createElement('span');
  text.textContent = message;
  el.append(text);
  let timer;
  const remove = () => {
    clearTimeout(timer);
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  };
  if (action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button button--small button--secondary';
    button.textContent = action.label;
    button.addEventListener('click', () => {
      action.onClick();
      remove();
    });
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast__close';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', remove);
    el.append(button, close);
    window.addEventListener('hashchange', remove, { once: true });
  } else {
    timer = setTimeout(remove, duration);
    // Pause while someone is reading or pointing at it.
    el.addEventListener('pointerenter', () => clearTimeout(timer));
    el.addEventListener('pointerleave', () => (timer = setTimeout(remove, 2000)));
  }
  toastStack.append(el);
  announce(action ? `${message} ${action.label} is available.` : message);
  return remove;
}
