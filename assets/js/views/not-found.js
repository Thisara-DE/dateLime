import { html, render, href, slice } from '../ui.js';

export const title = () => 'Not showing';

export function mount(outlet) {
  render(
    outlet,
    html`<div class="page page--narrow"><div class="state">${slice()}<h1>This page isn't showing tonight</h1><p>The link may be old, or it may have a typo.</p><div class="button-row"><a class="button button--primary" href="${href('/')}">Back to the lobby</a><a class="button button--secondary" href="${href('/dates')}">Your dates</a></div></div></div>`,
  );
}
