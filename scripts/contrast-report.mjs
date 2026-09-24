#!/usr/bin/env node
// Prints the measured WCAG contrast of the key token pairings in both themes as a
// Markdown table (used in docs/design/06-decision.md). The same pairings are enforced
// by tests/unit/contrast.test.js.
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../assets/css/tokens.css', import.meta.url), 'utf8');
const block = (pattern) =>
  Object.fromEntries([...new RegExp(`${pattern}\\s*\\{([^}]*)\\}`).exec(css)[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const base = block(':root');
const themes = { 'Late Show (dark)': { ...base, ...block(":root,\\s*:root\\[data-theme='dark'\\]") }, 'Matinee (light)': { ...base, ...block(":root\\[data-theme='light'\\]") } };
const resolve = (v, x) => (/^var\((--[\w-]+)\)$/.test(x) ? resolve(v, v[/^var\((--[\w-]+)\)$/.exec(x)[1]]) : x);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16) / 255).reduce((acc, c, i) => acc + [0.2126, 0.7152, 0.0722][i] * lin(c), 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const rows = [
  ['Body text on page', '--color-text', '--color-page', 4.5],
  ['Body text on raised card', '--color-text', '--color-raised', 4.5],
  ['Secondary text on page', '--color-text-secondary', '--color-page', 4.5],
  ['Muted text on overlay (worst case)', '--color-text-muted', '--color-overlay', 4.5],
  ['Link on page', '--color-link', '--color-page', 4.5],
  ['Brand text on page', '--color-brand-text', '--color-page', 4.5],
  ['Label on primary button', '--color-on-brand', '--color-brand', 4.5],
  ['Label on pressed button', '--color-on-brand', '--color-brand-active', 4.5],
  ['Primary button edge vs page', '--color-brand-edge', '--color-page', 3],
  ['Primary fill vs page', '--color-brand', '--color-page', 3],
  ['Control border vs page', '--color-border', '--color-page', 3],
  ['Focus ring vs page', '--color-focus', '--color-page', 3],
  ['Ticket text on ticket', '--ticket-text', '--ticket-bg', 4.5],
  ['Ticket stub label', '--ticket-stub-text', '--ticket-stub-bg', 4.5],
  ['Danger text on page', '--color-danger', '--color-page', 4.5],
  ['Wordmark "Lime" on page', '--wordmark-lime', '--color-page', 4.5],
];
const names = Object.keys(themes);
console.log(`| Pairing | ${names.join(' | ')} | Needs |`);
console.log(`|---|${names.map(() => '---').join('|')}|---|`);
for (const [label, fg, bg, min] of rows) {
  const cells = names.map((n) => {
    const a = resolve(themes[n], themes[n][fg]);
    const b = resolve(themes[n], themes[n][bg]);
    if (!/^#[0-9a-f]{6}$/i.test(a ?? '') || !/^#[0-9a-f]{6}$/i.test(b ?? '')) return 'n/a';
    const r = ratio(a, b);
    return `${r.toFixed(2)}:1${r >= min ? '' : ' (edge carries it)'}`;
  });
  console.log(`| ${label} | ${cells.join(' | ')} | ${min}:1 |`);
}
