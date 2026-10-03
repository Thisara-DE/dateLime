// Form pieces shared by sign-up, sign-in and the account page.
import { html } from '../lib/html.js';
import { REGIONS, regionName } from '../domain/regions.js';
import { DIETS } from '../domain/pairing.js';

/** Google's "G" mark, as its sign-in branding asks for (colors fixed, so not an icon). */
const G = html`<svg class="google-g" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

export const googleButton = (label) => html`<button class="button button--secondary button--google" type="button" data-google>${G}${label}</button>`;

export const divider = () => html`<p class="auth-divider"><span>or</span></p>`;

/** A labelled input with an optional hint; errors are announced by the form's alert. */
export function field({ name, label, type = 'text', value = '', autocomplete, hint = '', required = true, extra = '' }) {
  const hintId = hint ? `${name}-hint` : '';
  return html`<div class="form-field">
    <label for="${name}">${label}</label>
    <input class="input" id="${name}" name="${name}" type="${type}" value="${value}" ${autocomplete ? html`autocomplete="${autocomplete}"` : ''} ${required ? html`required` : ''} ${hintId ? html`aria-describedby="${hintId}"` : ''} ${extra}>
    ${hint ? html`<small class="muted" id="${hintId}">${hint}</small>` : ''}
  </div>`;
}

export function regionField(selected) {
  return html`<div class="form-field">
    <label for="region">Where do you watch?</label>
    <select class="select" id="region" name="region">${[...new Set([selected, ...REGIONS])].map((code) => html`<option value="${code}" ${code === selected ? html`selected` : ''}>${regionName(code)}</option>`)}</select>
    <small class="muted">For what's streaming near you.</small>
  </div>`;
}

export function dietField(selected = '') {
  const chip = (value, label) => html`<label class="chip"><input type="radio" name="diet" value="${value}" ${selected === value ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${label}</label>`;
  return html`<fieldset class="field"><legend>Diet</legend><div class="chips">${chip('', 'Anything')}${Object.entries(DIETS).map(([k, d]) => chip(k, d.label))}</div></fieldset>`;
}

/** Shows a message in the form's alert box and marks the fields at fault. */
export function showFormError(form, message, fields = []) {
  for (const input of form.querySelectorAll('[aria-invalid]')) input.removeAttribute('aria-invalid');
  const box = form.querySelector('[data-form-error]');
  box.textContent = message;
  box.hidden = !message;
  for (const name of fields) form.elements[name]?.setAttribute('aria-invalid', 'true');
  if (fields.length) form.elements[fields[0]]?.focus();
}

/** Marks a button busy (and back), keeping it focusable for screen readers. */
export function setBusy(button, busy, busyLabel) {
  if (busy) {
    button.dataset.label = button.textContent;
    button.setAttribute('aria-disabled', 'true');
    button.lastChild.textContent = busyLabel;
  } else {
    button.removeAttribute('aria-disabled');
    if (button.dataset.label) button.lastChild.textContent = button.dataset.label.trim();
  }
}

export const looksLikeEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const MIN_PASSWORD = 8;
