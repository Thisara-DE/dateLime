// The service worker precaches the app shell for offline use. Without a build step the
// list is maintained by hand, so this test makes sure it's complete and accurate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
const precache = JSON.parse(`[${/const PRECACHE = \[([\s\S]*?)\];/.exec(sw)[1].replace(/'/g, '"').replace(/,\s*$/, '')}]`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

test('every precached file exists', () => {
  for (const entry of precache) {
    if (entry === './') continue;
    assert.ok(existsSync(join(ROOT, entry)), `${entry} is precached but missing`);
  }
});

test('every app module and stylesheet is precached (offline would break otherwise)', () => {
  const files = [...walk(join(ROOT, 'assets/js')), ...walk(join(ROOT, 'assets/css'))]
    .map((f) => `./${relative(ROOT, f).split('\\').join('/')}`)
    .filter((f) => !f.endsWith('legacy-redirect.js')); // only used by the old .html URLs
  const missing = files.filter((f) => !precache.includes(f));
  assert.deepEqual(missing, []);
});

test('the fonts index.html preloads are precached', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  for (const [, href] of html.matchAll(/rel="preload" href="([^"]+)"/g)) {
    assert.ok(precache.includes(`./${href}`), `${href} is preloaded but not precached`);
  }
});
