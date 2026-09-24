// Every route renders its heading, has a unique title, and logs no errors.
import { test, expect } from './support/fixtures.js';

const ROUTES = [
  ['#/', 'Dinner and a movie, for two.'],
  ['#/movies', "What's the mood tonight?"],
  ['#/movies/results', 'Pick a movie'],
  ['#/recipes', 'Pick a movie first'],
  ['#/date', 'Your ticket is almost ready'],
  ['#/dates', 'Your dates'],
  ['#/rules', 'House rules'],
  ['#/team', 'The crew'],
  ['#/surprise', 'Spin the lime'],
  ['#/nope', "This page isn't showing tonight"],
];

for (const [hash, heading] of ROUTES) {
  test(`renders ${hash}`, async ({ page }) => {
    await page.goto(`/${hash}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    await expect(page).toHaveTitle(/· dateLime$/);
  });
}

test('the landing page makes no API calls', async ({ page, api }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(api.calls.tmdb.length + api.calls.mealdb.length + api.calls.cocktaildb.length).toBe(0);
  expect(api.calls.unexpected).toEqual([]);
});
