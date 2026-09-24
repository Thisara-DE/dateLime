import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveTheme, isEvening } from '../../assets/js/lib/theme.js';

const at = (h) => new Date(2026, 8, 24, h, 30);

test('auto is dark in the evening or when the device is dark', () => {
  assert.equal(resolveTheme('auto', { now: at(21), systemDark: false }), 'dark');
  assert.equal(resolveTheme('auto', { now: at(3), systemDark: false }), 'dark');
  assert.equal(resolveTheme('auto', { now: at(13), systemDark: true }), 'dark');
  assert.equal(resolveTheme('auto', { now: at(13), systemDark: false }), 'light');
});

test('an explicit choice always wins', () => {
  assert.equal(resolveTheme('light', { now: at(22), systemDark: true }), 'light');
  assert.equal(resolveTheme('dark', { now: at(12), systemDark: false }), 'dark');
});

test('the evening window is 18:00-05:59', () => {
  assert.equal(isEvening(new Date(2026, 0, 1, 17, 59)), false);
  assert.equal(isEvening(new Date(2026, 0, 1, 18, 0)), true);
  assert.equal(isEvening(new Date(2026, 0, 1, 5, 59)), true);
  assert.equal(isEvening(new Date(2026, 0, 1, 6, 0)), false);
});

test('the pre-paint boot script in index.html implements the same rule', () => {
  const boot = /<script>([\s\S]*?)<\/script>/.exec(readFileSync(new URL('../../index.html', import.meta.url), 'utf8'))[1];
  const run = (stored, hour, systemDark) => {
    const root = { dataset: {} };
    const fn = new Function('localStorage', 'matchMedia', 'Date', 'document', boot);
    const FakeDate = class extends Date {
      getHours() {
        return hour;
      }
    };
    fn({ getItem: () => stored }, () => ({ matches: systemDark }), FakeDate, { documentElement: root });
    return root.dataset.theme;
  };
  assert.equal(run(null, 21, false), 'dark');
  assert.equal(run(null, 12, false), 'light');
  assert.equal(run(null, 12, true), 'dark');
  assert.equal(run('light', 23, true), 'light');
  assert.equal(run('dark', 12, false), 'dark');
  assert.equal(run('bogus', 12, false), 'light');
});
