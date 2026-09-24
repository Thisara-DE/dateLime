// The core journey: movie -> meal -> ticket -> saved, with request-level checks.
import { test, expect } from './support/fixtures.js';

const NOW = new Date('2026-09-24T14:00:00');

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: NOW });
});

async function pickFirstMovie(page) {
  await page.getByRole('list', { name: 'Movies' }).getByRole('button').first().click();
  const pick = page.getByRole('button', { name: 'Pick this movie' });
  await expect(pick).not.toHaveAttribute('aria-disabled', 'true');
  await pick.click();
}

/** Picks the first recipe and returns its name (the order depends on the pairing shuffle). */
async function pickFirstRecipe(page) {
  const first = page.getByRole('list', { name: 'Recipes' }).getByRole('button').first();
  const name = (await first.textContent()).trim();
  await first.click();
  const cook = page.getByRole('button', { name: 'Cook this' });
  await expect(cook).not.toHaveAttribute('aria-disabled', 'true');
  await cook.click();
  return name;
}

test('plans a whole date night and saves it', async ({ page, api }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Start tonight/ }).click();
  await expect(page).toHaveURL(/#\/movies$/);

  await page.getByText('Swoony').click();
  await page.getByRole('button', { name: /Show movies/ }).click();
  await expect(page).toHaveURL(/#\/movies\/results\?mood=swoony/);
  await expect(page.getByRole('list', { name: 'Movies' }).getByRole('listitem')).toHaveCount(10);

  // One Discover request for the whole page: the 2021 site made 20 to 40 more.
  expect(api.calls.tmdb).toHaveLength(1);
  expect(api.calls.tmdb[0].searchParams.get('with_genres')).toBe('10749');

  await pickFirstMovie(page);
  expect(api.calls.tmdb).toHaveLength(2); // + exactly one details call, when the sheet opened
  await expect(page).toHaveURL(/#\/recipes$/);
  await expect(page.getByText('Straight from France: French cooking to match.')).toBeVisible();

  const recipe = await pickFirstRecipe(page);
  await expect(page).toHaveURL(/#\/date$/);
  const ticket = page.getByRole('article', { name: 'Your date ticket' });
  await expect(ticket.getByRole('heading', { name: 'Amélie' })).toBeVisible();
  await expect(ticket.getByRole('heading', { name: recipe })).toBeVisible();
  await expect(ticket.getByText('2001')).toBeVisible();
  await expect(ticket.getByText('2h 2m')).toBeVisible();
  await expect(ticket.getByText('R', { exact: true })).toBeVisible(); // the real certification
  // Run of show from the real runtime: play at 8:00 PM, 122 minutes -> credits at 10:02 PM.
  await expect(ticket.getByText('10:02 PM')).toBeVisible();
  await expect(ticket.getByText('6:45 PM')).toBeVisible();
  // The zero-proof default drink.
  await expect(ticket.getByText('Zero-proof', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true }).first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-saved-count]')).toHaveText('1');

  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /Your dates/ }).click();
  await expect(page.getByRole('heading', { name: `Amélie + ${recipe}` })).toBeVisible();
  await expect(page.getByText('Thu, Sep 24 · 8:00 PM')).toBeVisible();
});

test('the plan survives a reload (it lives in local storage)', async ({ page }) => {
  await page.goto('/#/movies/results?mood=swoony');
  await pickFirstMovie(page);
  await page.reload();
  await expect(page.getByText(/With Amélie/)).toBeVisible();
});

test('changing the time and cooking estimate updates the run of show', async ({ page }) => {
  await page.goto('/#/movies/results?mood=swoony');
  await pickFirstMovie(page);
  await pickFirstRecipe(page);
  await page.getByLabel('Press play at').fill('21:30');
  await page.getByLabel('Press play at').dispatchEvent('change');
  await page.getByText('90 min', { exact: true }).click();
  const ticket = page.getByRole('article', { name: 'Your date ticket' });
  await expect(ticket.getByText('9:30 PM').first()).toBeVisible();
  await expect(ticket.getByText('7:30 PM')).toBeVisible(); // 21:30 - 30 min dinner - 90 min cooking
  await expect(ticket.getByText('11:32 PM')).toBeVisible(); // + 122 min runtime
});

test('the share link reopens the same ticket for your date', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-specific');
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.addInitScript(() => {
    delete Navigator.prototype.share; // desktop browsers without Web Share use the clipboard
  });
  await page.goto('/#/movies/results?mood=swoony');
  await pickFirstMovie(page);
  const recipe = await pickFirstRecipe(page);
  await page.getByLabel('Note for your date (optional)').fill('Bring blankets');
  await page.getByRole('button', { name: 'Share' }).first().click();
  await expect(page.locator('.toast').getByText('Link copied. Paste it to your date.')).toBeVisible();

  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain(`Date night? Amélie (2001), then ${recipe}`);
  const url = copied.split('\n').pop();
  expect(url).toMatch(/#\/date\?m=194&r=\d+&d=\d+&at=2026-09-24T20%3A00&note=Bring\+blankets$/);

  // Your date opens it on their phone: a fresh browser with no saved state.
  const theirs = await context.browser().newContext({ serviceWorkers: 'block' });
  const theirPage = await theirs.newPage();
  const { mockApis } = await import('./support/mock-api.js');
  await mockApis(theirPage);
  await theirPage.goto(url.replace(/^https?:\/\/[^/]+/, 'http://localhost:4173'));
  await expect(theirPage.getByText("You've been sent a date plan.")).toBeVisible();
  await expect(theirPage.getByRole('heading', { name: 'Amélie' })).toBeVisible();
  await expect(theirPage.getByText('“Bring blankets”')).toBeVisible();
  await theirPage.getByRole('button', { name: 'Save to my dates' }).click();
  await expect(theirPage.getByRole('button', { name: 'Saved' })).toBeVisible();
  await theirs.close();
});

test('the calendar invite is a valid .ics with a reminder', async ({ page }) => {
  await page.goto('/#/movies/results?mood=swoony');
  await pickFirstMovie(page);
  const recipe = await pickFirstRecipe(page);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Add to calendar/ }).click()]);
  expect(download.suggestedFilename()).toBe('datelime-date-night.ics');
  const ics = (await (await download.createReadStream()).toArray()).join('');
  expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
  expect(ics).toContain('DTSTART:20260924T184500');
  expect(ics).toContain('DTEND:20260924T220200');
  expect(ics).toContain('TRIGGER:-PT15M');
  expect(ics.replace(/\r\n /g, '')).toContain(`SUMMARY:Date night: Amélie + ${recipe}`);
});

test('"Change movie" from the ticket keeps the meal and returns to the ticket', async ({ page }) => {
  await page.goto('/#/movies/results?mood=swoony');
  await pickFirstMovie(page);
  const recipe = await pickFirstRecipe(page);
  await page.getByRole('link', { name: 'Change movie' }).click();
  await expect(page).toHaveURL(/change=1/);
  await page.getByRole('list', { name: 'Movies' }).getByRole('button', { name: 'Titanic' }).click();
  await page.getByRole('button', { name: 'Pick this movie' }).and(page.locator(':not([aria-disabled])')).click();
  await expect(page).toHaveURL(/#\/date$/);
  const ticket = page.getByRole('article', { name: 'Your date ticket' });
  await expect(ticket.getByRole('heading', { name: 'Titanic' })).toBeVisible();
  await expect(ticket.getByRole('heading', { name: recipe })).toBeVisible();
});
