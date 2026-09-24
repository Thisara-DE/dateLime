// Layout invariants from visual review: each assertion here was a real defect once.
import { test, expect, seedState } from './support/fixtures.js';

const draft = {
  movie: { id: 194, title: 'Amélie', year: '2001', poster: '/poster-194.jpg', runtime: 122, certification: 'R', genreIds: [35, 10749], originCountries: ['FR'], keywords: [] },
  meal: { id: '52852', name: 'Tuna Niçoise', thumb: 'https://www.themealdb.com/images/media/meals/mock-52852.jpg', area: 'French', category: 'Seafood', ingredients: [{ name: 'Salmon', measure: '2 fillets' }], steps: ['Serve.'] },
  cookMinutes: 45,
  when: '2026-09-24T20:00',
};

test('ticket art stays in its column, clear of the text beside it', async ({ page }) => {
  await seedState(page, { draft });
  await page.goto('/#/date');
  const ticket = page.getByRole('article', { name: 'Your date ticket' });
  await expect(ticket.locator('.coaster .plate img')).toBeVisible(); // the drink has loaded
  const rows = await ticket.locator('.ticket__row').evaluateAll((els) =>
    els.map((row) => {
      const art = row.firstElementChild;
      const right = Math.max(...[art, ...art.querySelectorAll('*')].map((el) => el.getBoundingClientRect().right));
      return { art: art.className, gap: row.querySelector('.ticket__row-body').getBoundingClientRect().left - right };
    }),
  );
  expect(rows).toHaveLength(3); // movie, meal, drink
  for (const row of rows) expect(row.gap, `gap after ${row.art}`).toBeGreaterThanOrEqual(8);
});

test('the header is opaque unless it can blur what scrolls beneath it', async ({ page }) => {
  await page.goto('/#/');
  const header = await page.locator('.site-header').evaluate((el) => {
    const style = getComputedStyle(el);
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = style.backgroundColor; // canvas parses any CSS color syntax
    ctx.fillRect(0, 0, 1, 1);
    return { alpha: ctx.getImageData(0, 0, 1, 1).data[3], blur: style.backdropFilter };
  });
  if (header.blur === 'none') expect(header.alpha).toBe(255);
  else expect(header.blur).toContain('blur(');
});

test('the four cooking times sit in even rows (4, or 2 + 2)', async ({ page }) => {
  await seedState(page, { draft });
  await page.goto('/#/date');
  const chips = page.locator('label.chip:has(input[name="cook"])');
  await expect(chips).toHaveCount(4);
  const boxes = await chips.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
  const perRow = Object.values(Object.groupBy(boxes, (b) => Math.round(b.top))).map((row) => row.length);
  expect([[4], [2, 2]]).toContainEqual(perRow);
  expect(new Set(boxes.map((b) => Math.round(b.width))).size).toBe(1);
});

test.describe('focus after navigation', () => {
  test('keyboard users see where focus went', async ({ page }) => {
    await page.goto('/#/');
    await page.getByRole('link', { name: /Start tonight/ }).focus();
    await page.keyboard.press('Enter');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeFocused();
    await expect(h1).toHaveCSS('outline-style', 'solid');
  });

  test('a tap moves focus to the heading without drawing a ring', async ({ page }) => {
    await page.goto('/#/');
    await page.getByRole('link', { name: /Start tonight/ }).click();
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeFocused();
    await expect(h1).toHaveCSS('outline-style', 'none');
  });
});
