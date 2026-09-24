#!/usr/bin/env node
// Keeps the Content-Security-Policy in index.html in sync with its one inline script
// (the theme boot, which must run before first paint). Run after editing that script:
//   node scripts/csp-hash.mjs          -> rewrites the hash in index.html
//   node scripts/csp-hash.mjs --check  -> exits 1 if the hash is stale (used by the tests)
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const INDEX = fileURLToPath(new URL('../index.html', import.meta.url));

export function inlineScriptHash(html) {
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  if (inline.length !== 1) throw new Error(`Expected exactly one inline <script>, found ${inline.length}`);
  return `sha256-${createHash('sha256').update(inline[0][1]).digest('base64')}`;
}

export function cspHash(html) {
  return /script-src 'self' '(sha256-[^']+)'/.exec(html)?.[1] ?? null;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const html = readFileSync(INDEX, 'utf8');
  const expected = inlineScriptHash(html);
  if (process.argv.includes('--check')) {
    if (cspHash(html) !== expected) {
      console.error(`CSP hash is stale. Expected '${expected}'. Run: node scripts/csp-hash.mjs`);
      process.exit(1);
    }
    console.log('CSP hash OK');
  } else {
    writeFileSync(INDEX, html.replace(/script-src 'self' 'sha256-[^']+'/, `script-src 'self' '${expected}'`));
    console.log(`CSP updated: ${expected}`);
  }
}
