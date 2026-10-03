// Shown on the account screens when this copy of dateLime has no Firebase project set up.
import { html, render, emptyState, href } from '../ui.js';

export function accountsOff(outlet) {
  render(
    outlet,
    html`<div class="page page--narrow">${emptyState({
      level: 1,
      title: 'Accounts aren’t switched on here',
      body: 'This copy of dateLime keeps everything on your device, so there’s nothing to sign in to. Your dates and house rules are already saved in this browser.',
      actions: html`<a class="button button--primary" href="${href('/dates')}">Your dates</a>`,
    })}</div>`,
  );
}
