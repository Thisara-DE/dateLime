// Design-system regression test: every text and UI color pairing in tokens.css must meet
// WCAG 2.2 AA in BOTH themes. It parses the real stylesheet, so a token change that breaks
// contrast fails CI instead of shipping.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../assets/css/tokens.css', import.meta.url), 'utf8');

function block(selectorPattern) {
  const match = new RegExp(`${selectorPattern}\\s*\\{([^}]*)\\}`).exec(css);
  if (!match) throw new Error(`No block for ${selectorPattern}`);
  return Object.fromEntries([...match[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

const base = block(':root');
const themes = {
  dark: { ...base, ...block(":root,\\s*:root\\[data-theme='dark'\\]") },
  light: { ...base, ...block(":root\\[data-theme='light'\\]") },
};

function resolve(vars, value, depth = 0) {
  if (depth > 10) throw new Error(`var() cycle at ${value}`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  return ref ? resolve(vars, vars[ref[1]], depth + 1) : value;
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
export function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = 4.5;
const UI = 3;
const surfaces = ['--color-page', '--color-raised', '--color-overlay'];
const PAIRS = [
  ...['--color-text', '--color-text-secondary', '--color-text-muted', '--color-link', '--color-brand-text', '--color-blush'].flatMap((fg) =>
    surfaces.map((bg) => [fg, bg, TEXT]),
  ),
  ['--color-text', '--color-chip', TEXT],
  ['--color-text-muted', '--color-sunken', TEXT],
  ['--color-on-brand', '--color-brand', TEXT],
  ['--color-on-brand', '--color-brand-hover', TEXT],
  ['--color-on-brand', '--color-brand-active', TEXT],
  ...['success', 'warning', 'danger', 'info'].flatMap((s) => [
    [`--color-${s}`, '--color-page', TEXT],
    [`--color-${s}`, '--color-raised', TEXT],
    [`--color-${s}`, `--color-${s}-bg`, TEXT],
    ['--color-text', `--color-${s}-bg`, TEXT],
  ]),
  ['--color-brand-text', '--color-brand-tint', TEXT],
  ['--color-text', '--color-selection', TEXT],
  ['--color-toast-text', '--color-toast-bg', TEXT],
  ['--ticket-text', '--ticket-bg', TEXT],
  ['--ticket-muted', '--ticket-bg', TEXT],
  ['--ticket-link', '--ticket-bg', TEXT],
  ['--ticket-stub-text', '--ticket-stub-bg', TEXT],
  ['--wordmark-date', '--color-page', TEXT],
  ['--wordmark-lime', '--color-page', TEXT],
  // Non-text UI (SC 1.4.11): control edges, focus ring, current-step indicator.
  ...surfaces.map((bg) => ['--color-border', bg, UI]),
  ...surfaces.map((bg) => ['--color-focus', bg, UI]),
  ['--color-focus', '--ticket-bg', UI],
  ['--color-indicator', '--color-page', UI],
  ['--color-danger', '--color-page', UI],
];

for (const [name, vars] of Object.entries(themes)) {
  test(`${name} theme: every pairing meets WCAG AA`, () => {
    const failures = [];
    for (const [fg, bg, min] of PAIRS) {
      const a = resolve(vars, vars[fg]);
      const b = resolve(vars, vars[bg]);
      assert.match(a ?? '', /^#[0-9a-f]{6}$/i, `${fg} must resolve to a hex color in ${name}`);
      assert.match(b ?? '', /^#[0-9a-f]{6}$/i, `${bg} must resolve to a hex color in ${name}`);
      const r = ratio(a, b);
      if (r < min) failures.push(`${fg} ${a} on ${bg} ${b} = ${r.toFixed(2)} (needs ${min})`);
    }
    assert.deepEqual(failures, []);
  });

  test(`${name} theme: the primary button has a 3:1 boundary against the page`, () => {
    const page = resolve(vars, vars['--color-page']);
    const fill = resolve(vars, vars['--color-brand']);
    const edge = resolve(vars, vars['--color-brand-edge']);
    const best = Math.max(ratio(fill, page), edge === 'transparent' ? 0 : ratio(edge, page));
    assert.ok(best >= UI, `fill ${fill} / edge ${edge} vs page ${page}: ${best.toFixed(2)}`);
  });
}

test('the heritage #23D160 survives in the logo', () => {
  assert.equal(resolve(themes.dark, themes.dark['--slice-rind']).toLowerCase(), '#23d160');
});
