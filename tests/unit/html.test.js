import { test } from 'node:test';
import assert from 'node:assert/strict';
import { html, raw, escapeHTML, safeUrl } from '../../assets/js/lib/html.js';

test('escapes interpolated text, including attribute quotes', () => {
  const evil = `<img src=x onerror="alert('x')">`;
  const out = String(html`<p title="${evil}">${evil}</p>`);
  assert.equal(out.includes('<img'), false);
  assert.match(out, /&lt;img src=x onerror=&quot;alert\(&#39;x&#39;\)&quot;&gt;/);
});

test('nested templates and arrays are trusted, primitives are not', () => {
  const items = ['a<b', 'c'];
  const out = String(html`<ul>${items.map((i) => html`<li>${i}</li>`)}</ul>`);
  assert.equal(out, '<ul><li>a&lt;b</li><li>c</li></ul>');
});

test('false, null, undefined and true render nothing; 0 renders', () => {
  assert.equal(String(html`${false}${null}${undefined}${true}|${0}`), '|0');
});

test('raw() opts out of escaping', () => {
  assert.equal(String(html`${raw('<b>ok</b>')}`), '<b>ok</b>');
  assert.equal(escapeHTML(`&"'<>`), '&amp;&quot;&#39;&lt;&gt;');
});

test('safeUrl only allows http(s)', () => {
  assert.equal(safeUrl('https://www.youtube.com/watch?v=abc'), 'https://www.youtube.com/watch?v=abc');
  assert.equal(safeUrl('javascript:alert(1)'), '');
  assert.equal(safeUrl('data:text/html,hi'), '');
  assert.equal(safeUrl(''), '');
  assert.equal(safeUrl(null), '');
  assert.equal(safeUrl('not a url'), '');
});
