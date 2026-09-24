// The decided features: Decide together, House Rules, Vibe Pairing fallbacks, Cook-along,
// Spin the Lime, errors and recovery.
import { test, expect, seedState } from './support/fixtures.js';

test.describe('Decide together (blind shortlist)', () => {
  test('a shared heart is "It\'s a date"', async ({ page }) => {
    await page.goto('/#/movies/results?mood=swoony&together=1');
    const list = page.getByRole('list', { name: 'Movies' });
    await list.getByRole('button', { name: 'Heart Titanic' }).click();
    await list.getByRole('button', { name: 'Heart Amélie' }).click();
    await expect(page.locator('[data-tray]').getByText('2 of 3 hearted')).toBeVisible();
    await page.getByRole('button', { name: /Pass the phone/ }).click();

    await expect(page.getByRole('heading', { name: 'Pass the phone to your date' })).toBeFocused();
    await page.getByRole('button', { name: "I'm ready" }).click();
    // The first person's hearts are hidden from the second.
    await expect(list.getByRole('button', { name: 'Heart Titanic' })).toHaveAttribute('aria-pressed', 'false');
    await list.getByRole('button', { name: 'Heart Titanic' }).click();
    await page.getByRole('button', { name: /Reveal matches/ }).click();

    await expect(page.getByRole('heading', { name: "It's a date!" })).toBeVisible();
    await page.getByRole('list', { name: 'Your matches' }).getByRole('button', { name: 'Titanic' }).click();
    await page.getByRole('button', { name: 'Pick this one' }).and(page.locator(':not([aria-disabled])')).click();
    await expect(page).toHaveURL(/#\/recipes$/);
  });

  test('no overlap: the second person picks from everything hearted', async ({ page }) => {
    await page.goto('/#/movies/results?mood=swoony&together=1');
    const list = page.getByRole('list', { name: 'Movies' });
    await list.getByRole('button', { name: 'Heart Titanic' }).click();
    await page.getByRole('button', { name: /Pass the phone/ }).click();
    await page.getByRole('button', { name: "I'm ready" }).click();
    await list.getByRole('button', { name: 'Heart Amélie' }).click();
    await page.getByRole('button', { name: /Reveal matches/ }).click();
    await expect(page.getByRole('heading', { name: 'No match this time' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Everything you hearted' }).getByRole('listitem')).toHaveCount(2);
  });

  test('a fourth heart is refused politely, not silently', async ({ page }) => {
    await page.goto('/#/movies/results?mood=swoony&together=1');
    const hearts = page.getByRole('list', { name: 'Movies' }).getByRole('button', { name: /^Heart / });
    for (let i = 0; i < 4; i += 1) await hearts.nth(i).click();
    await expect(page.locator('[data-tray]').getByText('3 of 3 hearted')).toBeVisible();
    await expect(page.getByTestId('live-region')).toHaveText(/3 of 3 already hearted/);
  });
});

test.describe('House Rules', () => {
  test('streaming services filter Discover in one request', async ({ page, api }) => {
    await page.goto('/#/rules');
    await page.getByText('Netflix').click();
    await page.getByText('Max', { exact: true }).click();
    await page.goto('/#/movies/results');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    const q = api.calls.tmdb.filter((u) => u.pathname === '/3/discover/movie').at(-1).searchParams;
    expect(q.get('with_watch_providers')).toBe('8|1899');
    expect(q.get('watch_region')).toBe('US');
    await expect(page.getByText('On Netflix, Max')).toBeVisible();
    await expect(page.getByText('On your services').first()).toBeVisible();
  });

  test('a rating cap from house rules applies, and "Allow any rating" lifts it', async ({ page, api }) => {
    await seedState(page, { rules: { maxCertification: 'G' } });
    await page.goto('/#/movies/results?genre=27');
    await expect(page.getByRole('heading', { name: "Nothing's showing with those picks" })).toBeVisible();
    await page.getByRole('link', { name: 'Allow any rating' }).click();
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    expect(api.calls.tmdb.at(-1).searchParams.get('certification.lte')).toBeNull();
  });

  test('vegetarian keeps only vegetarian and vegan recipes', async ({ page }) => {
    await seedState(page, { rules: { diet: 'vegetarian' }, draft: { movie: { id: 313369, title: 'La La Land', genreIds: [10749], originCountries: ['US'], keywords: [] } } });
    await page.goto('/#/recipes');
    await expect(page.getByRole('list', { name: 'Recipes' })).toBeVisible();
    const names = await page.getByRole('list', { name: 'Recipes' }).getByRole('button').allTextContents();
    expect(names.length).toBeGreaterThan(0);
    const vegetarian = ['Spicy Arrabiata Penne', 'Vegan Lasagna', 'Baingan Bharta', 'Dal Fry', 'Black Bean Quesadillas', 'Flamiche', 'Tofu Pad Thai', 'Egg Drop Soup', 'Vegan Chocolate Cake', 'Gigantes Plaki', 'Shakshuka', 'Roast Fennel and Aubergine Paella', 'Vegetable Pho'];
    for (const n of names) expect(vegetarian).toContain(n.trim());
  });

  test('avoiding pork hides recipes that list pancetta, and says so', async ({ page }) => {
    await seedState(page, { rules: { avoid: ['pork'] }, draft: { movie: { id: 11216, title: 'Cinema Paradiso', genreIds: [18, 10749], originCountries: ['IT'], keywords: [] } } });
    await page.goto('/#/recipes');
    await expect(page.getByText(/hidden because (it lists|they list) something you avoid/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spaghetti alla Carbonara' })).toHaveCount(0);
  });

  test('the theme choice persists across reloads', async ({ page }) => {
    await page.goto('/#/rules');
    await page.getByText('Light (Matinee)').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: 'Dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Vibe pairing', () => {
  test('a French film gets French food and says why', async ({ page, api }) => {
    await seedState(page, { draft: { movie: { id: 194, title: 'Amélie', genreIds: [35, 10749], originCountries: ['FR'], keywords: [] } } });
    await page.goto('/#/recipes');
    await expect(page.getByText('Straight from France: French cooking to match.')).toBeVisible();
    const areas = api.calls.mealdb.filter((u) => u.searchParams.has('a')).map((u) => u.searchParams.get('a'));
    expect(areas).toEqual(['French']);
  });

  test('turning off "Match the movie" switches to browsing by category', async ({ page }) => {
    await seedState(page, { draft: { movie: { id: 603, title: 'The Matrix', genreIds: [28, 878] } } });
    await page.goto('/#/recipes');
    await page.getByLabel('Match the movie').uncheck();
    await expect(page.getByText('Browsing freely.')).toBeVisible();
    await page.getByText('Dessert', { exact: true }).click();
    await expect(page.getByRole('list', { name: 'Recipes' }).getByRole('button', { name: 'Churros' })).toBeVisible();
  });
});

test.describe('Cook-along', () => {
  const meal = { id: '52772', name: 'Teriyaki Chicken Casserole', thumb: '', ingredients: [{ name: 'Chicken Thighs', measure: '6' }], steps: ['Heat the oil.', 'Cook until soft, about 5 minutes.', 'Serve.'] };

  test('steps move with buttons and arrow keys, and a timer rings', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-24T18:00:00') });
    await seedState(page, { draft: { movie: { id: 1, title: 'X', runtime: 100 }, meal, when: '2026-09-24T20:00', cookMinutes: 45 } });
    await page.goto('/#/cook');
    await expect(page.getByRole('heading', { name: 'Step 1 of 3' })).toBeVisible();
    await page.getByRole('button', { name: /Next/ }).click();
    await expect(page.getByRole('heading', { name: 'Step 2 of 3' })).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('heading', { name: 'Step 1 of 3' })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await page.getByRole('button', { name: 'Start 5 min timer' }).click();
    await expect(page.getByText('05:00')).toBeVisible();
    await page.clock.fastForward('05:01');
    await expect(page.locator('[data-timer-alert]')).toHaveText('Timer done: 5 min, step 2.');
    await expect(page.getByText('Press play in 2h 0m.').or(page.getByText(/Press play in 1h 5\dm\./))).toBeVisible();
  });

  test('"Show all steps" lists every step', async ({ page }) => {
    await seedState(page, { draft: { movie: { id: 1, title: 'X' }, meal } });
    await page.goto('/#/cook');
    await page.getByRole('button', { name: /Show all steps/ }).click();
    await expect(page.locator('.all-steps li')).toHaveCount(3);
  });
});

test.describe('Spin the lime', () => {
  test('deals a movie, a dinner and a drink, and holds survive a re-spin', async ({ page }) => {
    await page.goto('/#/surprise');
    const reels = page.getByRole('list', { name: 'Your surprise date' });
    await expect(reels.getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Use this date/ })).not.toHaveAttribute('aria-disabled', 'true');
    const movie = await reels.getByRole('heading').first().textContent();
    await page.getByRole('button', { name: 'Hold the movie' }).click();
    await expect(page.getByRole('button', { name: 'Held the movie' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: /Spin again/ }).click();
    await expect(page.getByRole('button', { name: /Use this date/ })).not.toHaveAttribute('aria-disabled', 'true');
    await expect(reels.getByRole('heading').first()).toHaveText(movie);
    await page.getByRole('button', { name: /Use this date/ }).click();
    await expect(page).toHaveURL(/#\/date$/);
    await expect(page.getByRole('article', { name: 'Your date ticket' }).getByRole('heading', { name: movie })).toBeVisible();
  });
});

test.describe('Errors and recovery', () => {
  test.use({ allowConsoleErrors: true });

  test('a TMDB outage shows a plain error, and "Try again" recovers', async ({ page }) => {
    let fail = true;
    await page.route('**/3/discover/movie**', (route) => (fail ? route.fulfill({ status: 503, body: '' }) : route.fallback()));
    await page.goto('/#/movies/results');
    await expect(page.getByRole('alert')).toContainText('The projector jammed');
    fail = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
  });

  test('a recipe outage keeps the rest of the page usable', async ({ page }) => {
    await page.route('**/api/json/v1/1/filter.php**', (route) => route.abort('internetdisconnected'));
    await seedState(page, { draft: { movie: { id: 603, title: 'The Matrix', genreIds: [28] } } });
    await page.goto('/#/recipes');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByLabel('Match the movie')).toBeEnabled();
  });

  test('a screen whose code fails to download says so, and "Try again" recovers', async ({ page }) => {
    await page.goto('/#/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.route('**/assets/js/views/rules.js', (route) => route.abort('internetdisconnected'));
    await page.evaluate(() => (location.hash = '#/rules'));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("This screen didn't load");
    await expect(page).toHaveTitle('Connection trouble · dateLime');
    await page.unroute('**/assets/js/views/rules.js');
    await page.getByRole('button', { name: 'Try again' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('House rules');
  });

  test('a shared link to a recipe that no longer exists says so', async ({ page }) => {
    await page.goto('/#/date?m=603&r=99999');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We couldn’t find that');
  });
});

test.describe('Moods and blends', () => {
  test('a blend with too few matches includes either genre, and says so', async ({ page, api }) => {
    await page.goto('/#/movies/results?mood=scary-funny');
    await expect(page.getByText('Only a few movies are both horror and comedy, so we included movies that are either.')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Movies' }).getByRole('listitem').first()).toBeVisible();
    const genres = api.calls.tmdb.filter((u) => u.pathname === '/3/discover/movie').map((u) => u.searchParams.get('with_genres'));
    expect(genres).toEqual(['27,35', '27|35']); // "all of" first, then "any of"
  });
});

test.describe('Sharing without a share sheet or clipboard', () => {
  test('the ticket shows its link in a field to copy by hand', async ({ page }) => {
    await page.addInitScript(() => {
      delete Navigator.prototype.share;
      Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => ({ writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) }) });
    });
    await seedState(page, { draft: { movie: { id: 194, title: 'Amélie', year: '2001', runtime: 122, genreIds: [35, 10749] }, meal: { id: '52852', name: 'Tuna Niçoise', thumb: '', ingredients: [], steps: ['Serve.'] }, when: '2026-09-24T20:00' } });
    await page.goto('/#/date');
    await page.getByRole('button', { name: 'Share' }).first().click();
    const field = page.getByLabel('Copy this link and send it to your date');
    await expect(field).toBeFocused();
    await expect(field).toHaveValue(/#\/date\?m=194&r=52852&.*at=2026-09-24T20%3A00/);
  });
});

test.describe('Your dates', () => {
  const past = {
    id: 'p1',
    createdAt: '2026-08-30T10:00:00.000Z',
    when: '2026-09-01T20:00',
    movie: { id: 194, title: 'Amélie', year: '2001', poster: '/poster-194.jpg', runtime: 122, certification: 'R', genreIds: [35, 10749] },
    meal: { id: '52852', name: 'Tuna Niçoise', thumb: 'https://www.themealdb.com/images/media/meals/mock-52852.jpg', area: 'French', category: 'Seafood' },
    drink: null,
  };

  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-24T12:00:00') });
    await seedState(page, { saved: [past] });
  });

  test('deleting a date can be undone, and focus stays on the page', async ({ page }) => {
    await page.goto('/#/dates');
    await page.getByRole('button', { name: 'Delete Amélie + Tuna Niçoise' }).click();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await page.locator('.toast').getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
  });

  test('a past date can be rated, and the rating sticks', async ({ page }) => {
    await page.goto('/#/dates');
    // Tap the chip (its label), as a person would; the radio inside is visually hidden.
    await page.locator('label', { has: page.getByRole('radio', { name: '4 limes out of 5' }) }).click();
    await expect(page.getByTestId('live-region')).toHaveText('Rated 4 out of 5.');
    await page.reload();
    await expect(page.getByRole('radio', { name: '4 limes out of 5' })).toBeChecked();
  });

  test('the diary exports to JSON and imports back', async ({ page }) => {
    await page.goto('/#/dates');
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Export diary/ }).click()]);
    expect(download.suggestedFilename()).toBe('datelime-diary-2026-09-24.json');
    const file = (await (await download.createReadStream()).toArray()).join('');
    expect(JSON.parse(file)).toMatchObject({ app: 'dateLime', dates: [{ id: 'p1' }] });

    await page.getByRole('button', { name: 'Delete Amélie + Tuna Niçoise' }).click();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0);
    await page.locator('[data-import]').setInputFiles({ name: 'diary.json', mimeType: 'application/json', buffer: Buffer.from(file) });
    await expect(page.locator('.toast').getByText('Imported 1 date.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();

    await page.locator('[data-import]').setInputFiles({ name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
    await expect(page.locator('.toast').getByText('This file is not a dateLime diary export.')).toBeVisible();
  });
});

test.describe('Cook-along keeps the screen awake', () => {
  const draft = { movie: { id: 1, title: 'X' }, meal: { id: '52772', name: 'Teriyaki Chicken Casserole', thumb: '', ingredients: [], steps: ['Heat the oil.', 'Serve.'] } };

  test('with a visible switch to let it sleep', async ({ page }) => {
    await page.addInitScript(() => {
      const request = async () => {
        const sentinel = new EventTarget();
        sentinel.release = async () => sentinel.dispatchEvent(new Event('release'));
        return sentinel;
      };
      Object.defineProperty(Navigator.prototype, 'wakeLock', { get: () => ({ request }) });
    });
    await seedState(page, { draft });
    await page.goto('/#/cook');
    await expect(page.getByText('Screen stays on while you cook.')).toBeVisible();
    await page.getByRole('button', { name: 'Let it sleep' }).click();
    await expect(page.getByText('The screen may sleep.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Keep it on' })).toBeFocused();
    await page.getByRole('button', { name: 'Keep it on' }).click();
    await expect(page.getByText('Screen stays on while you cook.')).toBeVisible();
  });

  test('and says so when the browser can’t', async ({ page }) => {
    await page.addInitScript(() => delete Navigator.prototype.wakeLock);
    await seedState(page, { draft });
    await page.goto('/#/cook');
    await expect(page.getByText("Your browser can't keep the screen awake. Give it a tap now and then.")).toBeVisible();
  });
});
