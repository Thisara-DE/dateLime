// Tiny, dependency-free HTML templating with escaping on by default.
//
//   html`<h2>${movie.title}</h2>`           -> title is escaped
//   html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`  -> nested templates are trusted
//   ${cond && html`...`}                      -> false/null/undefined render nothing
//
// Anything that isn't a template produced by `html` (or wrapped in `raw`) is escaped, so
// third-party API text can never inject markup. That fixes the old innerHTML XSS.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

export class SafeHTML {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

/** Marks a string as trusted markup. Only use with strings you wrote yourself. */
export const raw = (value) => new SafeHTML(String(value));

function renderValue(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (value instanceof SafeHTML) return value.value;
  if (Array.isArray(value)) return value.map(renderValue).join('');
  return escapeHTML(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i += 1) out += renderValue(values[i]) + strings[i + 1];
  return new SafeHTML(out);
}

/** Returns the URL only if it is http(s); blocks javascript:, data: and other schemes. */
export function safeUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return '';
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch {
    return '';
  }
}

/** Replaces the children of `el` with the rendered template. */
export function render(el, template) {
  el.innerHTML = renderValue(template);
  return el;
}
