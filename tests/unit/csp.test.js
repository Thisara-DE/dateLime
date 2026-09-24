import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { INDEX, inlineScriptHash, cspHash } from '../../scripts/csp-hash.mjs';

test('the CSP allows exactly the inline theme-boot script', () => {
  const html = readFileSync(INDEX, 'utf8');
  assert.equal(cspHash(html), inlineScriptHash(html), 'run: node scripts/csp-hash.mjs');
});

test('the CSP forbids plugins, foreign base URIs and inline styles', () => {
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(readFileSync(INDEX, 'utf8'))[1];
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /style-src 'self';/);
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
});
