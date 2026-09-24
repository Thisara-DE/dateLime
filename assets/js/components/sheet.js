// Modal sheet on the native <dialog>: a bottom sheet on phones and a centered panel on
// wider screens. Native showModal() gives focus trapping, Esc and inert background.
// Focus goes to the heading on open and back to the trigger on close.
import { html, render } from '../lib/html.js';
import { icon } from './icons.js';

let counter = 0;

/**
 * @param {{title: string, body?: any, footer?: any, trigger?: HTMLElement, className?: string,
 *          onClose?: () => void}} options
 */
export function openSheet({ title, body = '', footer = '', trigger = document.activeElement, className = '', onClose } = {}) {
  const id = `sheet-title-${(counter += 1)}`;
  const dialog = document.createElement('dialog');
  dialog.className = `sheet ${className}`;
  dialog.setAttribute('aria-labelledby', id);

  const paint = (t, b, f) =>
    render(
      dialog,
      html`<div class="sheet__header"><h2 id="${id}" tabindex="-1">${t}</h2><button class="icon-button" type="button" data-sheet-close aria-label="Close">${icon('x')}</button></div><div class="sheet__body">${b}</div>${f ? html`<div class="sheet__footer">${f}</div>` : ''}`,
    );
  let state = { title, body, footer };
  paint(title, body, footer);
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('h2').focus();

  const close = () => {
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-sheet-close]')) close();
    // A click on the backdrop lands on the <dialog> itself.
    else if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    dialog.remove();
    if (trigger?.isConnected) trigger.focus();
    onClose?.();
  });

  return {
    dialog,
    close,
    /** Replaces parts of the sheet (e.g. when details arrive) and keeps focus sensible. */
    update(patch) {
      const hadFocusInside = dialog.contains(document.activeElement);
      state = { ...state, ...patch };
      paint(state.title, state.body, state.footer);
      if (hadFocusInside || !dialog.contains(document.activeElement)) dialog.querySelector('h2').focus();
    },
  };
}
