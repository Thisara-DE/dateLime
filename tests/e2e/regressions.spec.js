// One test per runtime defect in docs/AUDIT.md, proving each stays fixed.
import { test, expect, seedState } from './support/fixtures.js';

test.describe('2022 audit regressions', () => {
  test('#1: the movie step can be completed with the keyboard alone', async ({ page }) => {
    await page.goto('/#/movies');
    await page.locator('input[name="mood"][value="any"]').focus();
    await page.keyboard.press('ArrowRight'); // native radio group: arrows move the choice
    await expect(page.locator('input[name="mood"][value="swoony"]')).toBeChecked();
    await page.keyboard.press('Enter'); // Enter submits a real form
    await expect(page).toHaveURL(/#\/movies\/results\?mood=swoony/);
  });

  test('#2: submitting without choosing anything works (Any is preselected)', async ({ page }) => {
    await page.goto('/#/movies');
    await page.getByRole('button', { name: /Show movies/ }).click();
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
  });

  test('#3: results contain only the chosen genre (no injected Fantasy movies)', async ({ page, api }) => {
    await page.goto('/#/movies/results?genre=28');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    const genres = api.calls.tmdb.filter((u) => u.pathname === '/3/discover/movie').map((u) => u.searchParams.get('with_genres'));
    expect(genres).toEqual(['28']);
  });

  test('#4: clicking the page (not a control) never navigates', async ({ page }) => {
    await page.goto('/#/movies/results');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    await page.getByRole('heading', { level: 1 }).click();
    await page.locator('[data-count]').click();
    await page.locator('main').click({ position: { x: 5, y: 5 } });
    await expect(page).toHaveURL(/#\/movies\/results$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // A card is one control by design (its title button stretches over it): tapping anywhere
    // on it opens the movie's sheet, which never navigates either.
    await page.locator('.movie-card').first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL(/#\/movies\/results$/);
  });

  test('#5: "Save" really saves, and the saved date opens again', async ({ page }) => {
    await seedState(page, { draft: { movie: { id: 603, title: 'The Matrix', year: '1999', poster: '/poster-603.jpg', runtime: 136, certification: 'R', genreIds: [28] }, meal: { id: '52982', name: 'Spaghetti alla Carbonara', thumb: '', area: 'Italian', category: 'Pasta', ingredients: [], steps: ['Cook.'] }, cookMinutes: 45 } });
    await page.goto('/#/date');
    await page.getByRole('button', { name: 'Save', exact: true }).first().click();
    await page.goto('/#/dates');
    await page.getByRole('link', { name: /Open/ }).first().click();
    await expect(page.getByRole('heading', { name: 'The Matrix' })).toBeVisible();
  });

  test('#7: opening the ticket with no plan explains the next step instead of crashing', async ({ page }) => {
    await page.goto('/#/date');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your ticket is almost ready');
    await expect(page.getByRole('link', { name: 'Pick a movie' })).toBeVisible();
  });

  test('#8: the rating filter sends the parameters TMDB actually understands', async ({ page, api }) => {
    await page.goto('/#/movies/results?cert=PG-13');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    const q = api.calls.tmdb[0].searchParams;
    expect(q.get('certification_country')).toBe('US');
    expect(q.get('certification.lte')).toBe('PG-13');
    expect(q.get('certification')).toBeNull();
  });

  test('#10: titles use the localized title, not original_title', async ({ page }) => {
    await page.goto('/#/movies/results?genre=16');
    await expect(page.getByRole('button', { name: 'Spirited Away' })).toBeVisible();
    await expect(page.getByText('千と千尋の神隠し')).toHaveCount(0);
  });

  test('#13: recipe titles are shown as text, never wrapped in quotes', async ({ page }) => {
    await seedState(page, { draft: { movie: { id: 603, title: 'The Matrix', year: '1999', runtime: 136, genreIds: [28] }, meal: { id: '52982', name: 'Spaghetti alla Carbonara', thumb: '', area: 'Italian', ingredients: [], steps: ['Cook.'] } } });
    await page.goto('/#/date');
    await expect(page.getByRole('heading', { name: 'Spaghetti alla Carbonara', exact: true })).toBeVisible();
    await expect(page.getByText('"Spaghetti alla Carbonara"')).toHaveCount(0);
  });

  test('#16: a missing poster becomes a typographic poster, not a broken image', async ({ page }) => {
    await page.goto('/#/movies/results?genre=35');
    const card = page.getByRole('article', { name: 'The Nice Guys' });
    await expect(card.locator('.poster--missing')).toBeVisible();
    await expect(card.locator('img[src$="null"]')).toHaveCount(0);
  });

  test('#18: the landing page makes no third-party calls (no leaked RapidAPI key)', async ({ page, api }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(api.calls.tmdb.length + api.calls.mealdb.length + api.calls.cocktaildb.length + api.calls.unexpected.length).toBe(0);
  });

  test('#19: third-party text is rendered as text (no HTML injection)', async ({ page }) => {
    await page.route('**/3/discover/movie**', (route) =>
      route.fulfill({ json: { page: 1, total_pages: 1, total_results: 1, results: [{ id: 1, title: '<img src=x onerror="window.pwned=1">Evil', overview: '<b>bold</b>', vote_average: 5, vote_count: 10 }] } }),
    );
    await page.goto('/#/movies/results');
    await expect(page.getByRole('button', { name: /Evil/ })).toBeVisible();
    expect(await page.evaluate(() => window.pwned)).toBeUndefined();
    await expect(page.locator('.movie-card b')).toHaveCount(0);
  });

  test('#22: one results page costs one TMDB request (no N+1 provider calls)', async ({ page, api }) => {
    await page.goto('/#/movies/results');
    await expect(page.getByRole('list', { name: 'Movies' }).getByRole('listitem')).toHaveCount(10);
    expect(api.calls.tmdb).toHaveLength(1);
  });

  test('#27: every image has alt text (empty when decorative)', async ({ page }) => {
    await page.goto('/#/movies/results');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    expect(await page.locator('img:not([alt])').count()).toBe(0);
  });

  test('#29: each screen has a unique, descriptive title', async ({ page }) => {
    const expected = {
      '#/': 'Dinner and a movie, for two · dateLime',
      '#/movies': 'Pick a movie · dateLime',
      '#/dates': 'Your dates · dateLime',
      '#/rules': 'House rules · dateLime',
      '#/team': 'The team · dateLime',
    };
    for (const [hash, title] of Object.entries(expected)) {
      await page.goto(`/${hash}`);
      await expect(page).toHaveTitle(title);
    }
    expect(new Set(Object.values(expected)).size).toBe(5);
  });

  test('old URLs still work: movielist.html?info=2,28 opens Action movies up to PG', async ({ page, api }) => {
    await page.goto('/movielist.html?info=2,28');
    await expect(page).toHaveURL(/#\/movies\/results\?genre=28&cert=PG$/);
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    const q = api.calls.tmdb.at(-1).searchParams;
    expect(q.get('with_genres')).toBe('28');
    expect(q.get('certification.lte')).toBe('PG');
  });

  test('old URLs still work: our-team.html opens the team page', async ({ page }) => {
    await page.goto('/our-team.html');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The crew');
    await expect(page.getByRole('link', { name: /Thisara-DE/ })).toHaveAttribute('href', 'https://github.com/Thisara-DE');
  });
});
