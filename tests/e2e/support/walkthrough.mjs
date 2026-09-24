// Screenshot walkthrough of the whole flow (used for visual review, not an assertion suite).
// Usage: node tests/e2e/support/walkthrough.mjs <outDir> [dark|light] [mobile|desktop]
import { chromium, devices } from '@playwright/test';
import { mockApis } from './mock-api.js';

const [outDir = 'test-results/walkthrough', theme = 'dark', form = 'mobile'] = process.argv.slice(2);
const BASE = process.env.BASE_URL ?? 'http://localhost:4173';

const browser = await chromium.launch();
// Service workers make their own requests, which page.route() can't mock: block them here.
const context = await browser.newContext({
  ...(form === 'mobile' ? devices['Pixel 7'] : { viewport: { width: 1280, height: 800 } }),
  serviceWorkers: 'block',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.addInitScript((t) => localStorage.setItem('datelime.theme', t), theme);
await mockApis(page);

const shot = async (name, opts = {}) => {
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${outDir}/${form}-${theme}-${name}.png`, fullPage: opts.full ?? false });
};

await page.goto(`${BASE}/#/`);
await shot('01-landing');
await page.getByRole('link', { name: /Start tonight/ }).click();
await page.getByRole('heading', { name: "What's the mood tonight?" }).waitFor();
await shot('02-mood');
await page.getByText('Swoony').click();
await page.getByRole('button', { name: /Show movies/ }).click();
await page.getByRole('list', { name: 'Movies' }).waitFor();
await shot('03-results');
await page.getByRole('list', { name: 'Movies' }).getByRole('button').first().click();
await page.getByRole('button', { name: 'Pick this movie' }).and(page.locator(':not([aria-disabled])')).waitFor();
await shot('04-movie-sheet');
await page.getByRole('button', { name: 'Pick this movie' }).click();
await page.getByRole('heading', { name: 'What are we eating?' }).waitFor();
await page.getByRole('list', { name: 'Recipes' }).waitFor();
await shot('05-recipes');
await page.getByRole('list', { name: 'Recipes' }).getByRole('button').first().click();
await page.getByRole('button', { name: 'Cook this' }).and(page.locator(':not([aria-disabled])')).waitFor();
await shot('06-recipe-sheet');
await page.getByRole('button', { name: 'Cook this' }).click();
await page.getByRole('heading', { name: 'Your date is set.' }).waitFor();
await page.waitForTimeout(900);
await shot('07-ticket');
await shot('07b-ticket-full', { full: true });
await page.getByRole('button', { name: /Save/ }).first().click();
await page.goto(`${BASE}/#/dates`);
await page.getByRole('heading', { name: 'Your dates' }).waitFor();
await shot('08-dates');
await page.goto(`${BASE}/#/cook`);
await page.getByText(/Step 1 of/).waitFor();
await shot('09-cook');
await page.goto(`${BASE}/#/surprise`);
await page.getByRole('button', { name: /Use this date/ }).and(page.locator(':not([aria-disabled])')).waitFor();
await shot('10-surprise');
await page.goto(`${BASE}/#/rules`);
await page.getByRole('heading', { name: 'House rules' }).waitFor();
await shot('11-rules');
await page.goto(`${BASE}/#/team`);
await shot('12-team');

console.log(JSON.stringify({ form, theme, errors }));
await browser.close();
