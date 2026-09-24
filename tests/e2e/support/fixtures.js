// Shared Playwright fixtures:
// - every test gets the mock API automatically (no real network in CI or sandboxes)
// - any console error or uncaught exception fails the test, unless a test opts out
import { test as base, expect } from '@playwright/test';
import { mockApis } from './mock-api.js';

export const test = base.extend({
  mockOptions: [{}, { option: true }],
  allowConsoleErrors: [false, { option: true }],
  theme: [null, { option: true }],

  api: [
    async ({ page, mockOptions }, use) => {
      await use(await mockApis(page, mockOptions));
    },
    { auto: true },
  ],

  errors: [
    async ({ page, allowConsoleErrors, theme }, use, testInfo) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
      if (theme) await page.addInitScript((t) => localStorage.setItem('datelime.theme', t), theme);
      await use(errors);
      if (!allowConsoleErrors && testInfo.status === testInfo.expectedStatus) {
        expect(errors, 'the page logged errors').toEqual([]);
      }
    },
    { auto: true },
  ],
});

export { expect };

/** Seeds localStorage before the app boots (house rules, a draft, saved dates...). */
export async function seedState(page, state) {
  await page.addInitScript((s) => localStorage.setItem('datelime.v2', JSON.stringify({ v: 1, data: s })), state);
}
