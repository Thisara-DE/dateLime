// Automated WCAG 2.2 AA checks (axe-core) on every screen, in both themes, including
// open dialogs and in-flow states. Automated checks catch roughly a third of issues;
// keyboard and screen-reader behavior is covered by the other specs.
import AxeBuilder from '@axe-core/playwright';
import { test, expect, seedState } from './support/fixtures.js';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function audit(page, label) {
  // Let transitions and the 300ms skeleton delay settle so axe sees the final colors.
  await page.waitForTimeout(400);
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}× e.g. ${v.nodes[0].target.join(' ')} [${label}]`);
  expect(summary, `axe violations on ${label}`).toEqual([]);
}

const draft = {
  movie: { id: 194, title: 'Amélie', year: '2001', poster: '/poster-194.jpg', runtime: 122, certification: 'R', genreIds: [35, 10749], originCountries: ['FR'], keywords: [], providers: { stream: [{ id: 8, name: 'Netflix' }] } },
  meal: { id: '52852', name: 'Tuna Niçoise', thumb: 'https://www.themealdb.com/images/media/meals/mock-52852.jpg', area: 'French', category: 'Seafood', ingredients: [{ name: 'Salmon', measure: '2 fillets' }], steps: ['Simmer for 20 minutes.', 'Serve.'] },
  cookMinutes: 45,
  when: '2026-09-24T20:00',
};

for (const theme of ['dark', 'light']) {
  test.describe(`${theme} theme`, () => {
    test.use({ theme });

    for (const [hash, heading] of [
      ['#/', 'Dinner and a movie, for two.'],
      ['#/movies', "What's the mood tonight?"],
      ['#/movies/results?mood=swoony', 'Pick a movie'],
      ['#/dates', 'Your dates'],
      ['#/rules', 'House rules'],
      ['#/team', 'The crew'],
      ['#/surprise', 'Spin the lime'],
      ['#/nope', "This page isn't showing tonight"],
    ]) {
      test(`${hash} has no axe violations`, async ({ page }) => {
        await page.goto(`/${hash}`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
        if (hash.startsWith('#/movies/results')) await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
        if (hash === '#/rules') await expect(page.getByText('Netflix')).toBeVisible();
        if (hash === '#/surprise') await expect(page.getByRole('button', { name: /Use this date/ })).not.toHaveAttribute('aria-disabled', 'true');
        await audit(page, `${theme} ${hash}`);
      });
    }

    test('recipes, the ticket and cook-along have no axe violations', async ({ page }) => {
      await seedState(page, { draft, saved: [] });
      await page.goto('/#/recipes');
      await expect(page.getByRole('list', { name: 'Recipes' })).toBeVisible();
      await audit(page, `${theme} recipes`);
      await page.goto('/#/date');
      await expect(page.getByRole('article', { name: 'Your date ticket' })).toBeVisible();
      await audit(page, `${theme} ticket`);
      await page.goto('/#/cook');
      await expect(page.getByRole('heading', { name: 'Step 1 of 2' })).toBeVisible();
      await audit(page, `${theme} cook-along`);
    });

    test('open sheets (movie and recipe) have no axe violations', async ({ page }) => {
      await page.goto('/#/movies/results?mood=swoony');
      await page.getByRole('list', { name: 'Movies' }).getByRole('button').first().click();
      await expect(page.getByRole('button', { name: 'Pick this movie' })).not.toHaveAttribute('aria-disabled', 'true');
      await audit(page, `${theme} movie sheet`);
      await page.getByRole('button', { name: 'Pick this movie' }).click();
      await page.getByRole('list', { name: 'Recipes' }).getByRole('button').first().click();
      await expect(page.getByRole('button', { name: 'Cook this' })).not.toHaveAttribute('aria-disabled', 'true');
      await audit(page, `${theme} recipe sheet`);
    });

    test('a shared ticket and the saved-dates list have no axe violations', async ({ page }) => {
      await page.goto('/#/date?m=194&r=52852&at=2026-09-24T20%3A00&note=Bring%20blankets');
      await expect(page.getByText("You've been sent a date plan.")).toBeVisible();
      await audit(page, `${theme} shared ticket`);
      await page.getByRole('button', { name: 'Save to my dates' }).click();
      await page.goto('/#/dates');
      await expect(page.getByRole('heading', { name: /Amélie \+/ })).toBeVisible();
      await audit(page, `${theme} saved dates`);
    });
  });
}

test('the page reflows at 320px without horizontal scrolling (WCAG 1.4.10)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await seedState(page, { draft });
  for (const hash of ['#/', '#/movies', '#/movies/results?mood=swoony', '#/date', '#/rules']) {
    await page.goto(`/${hash}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${hash}`).toBeLessThanOrEqual(0);
  }
});

test('reduced motion turns off the ticket print and the lime moon', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seedState(page, { draft });
  await page.goto('/#/date');
  const animation = await page.locator('.ticket').evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe('none');
  await page.goto('/#/');
  const moon = await page.locator('.stage__moon').evaluate((el) => getComputedStyle(el).animationName);
  expect(moon).toBe('none');
});
