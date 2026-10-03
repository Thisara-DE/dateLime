// Optional accounts: sign-up and sign-in (email or Google), private data that follows the
// person across devices, the choice about dates already on the device, and account deletion.
// Firebase is faked (tests/e2e/support/fake-firebase.js); the real security rules are
// tested against the Firestore emulator in tests/rules.
import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, seedState } from './support/fixtures.js';
import { createFakeFirebase } from './support/fake-firebase.js';
import { mockApis } from './support/mock-api.js';

const test = base.extend({
  firebase: async ({ page }, use) => {
    const firebase = createFakeFirebase();
    await firebase.install(page);
    await use(firebase);
  },
});

const DATE = {
  id: 'p1',
  createdAt: '2026-09-20T10:00:00.000Z',
  when: '2026-09-01T20:00',
  movie: { id: 194, title: 'Amélie', year: '2001', poster: '/poster-194.jpg', runtime: 122, genreIds: [35, 10749] },
  meal: { id: '52852', name: 'Tuna Niçoise', thumb: 'https://www.themealdb.com/images/media/meals/mock-52852.jpg', area: 'French', category: 'Seafood' },
  drink: null,
};
const ANA = { name: 'Ana Lima', email: 'ana@example.com', password: 'correct-horse' };

async function signUp(page, { name, email, password } = ANA, { region, diet } = {}) {
  await page.goto('/#/signup');
  await page.getByLabel('Your name').fill(name);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  if (region) await page.getByLabel('Where do you watch?').selectOption(region);
  if (diet) await page.getByRole('group', { name: 'Diet' }).getByText(diet, { exact: true }).click();
  await page.getByRole('button', { name: 'Create account' }).click();
}

async function signIn(page, { email, password } = ANA) {
  await page.goto('/#/signin');
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
}

/** An existing account on the fake server, with a saved date. */
function existingAccount(firebase, saved = [DATE]) {
  firebase.accounts.set(ANA.email, { uid: 'user-ana', email: ANA.email, password: ANA.password, displayName: ANA.name, provider: 'password' });
  firebase.docs.set('users/user-ana', { profile: { name: ANA.name, email: ANA.email, createdAt: '2026-09-01T00:00:00.000Z' }, rules: { region: 'US', diet: '' }, saved });
  firebase.versions.set('users/user-ana', 1);
}

const accountLink = (page) => page.getByRole('navigation', { name: 'Main' }).locator('[data-account-link]');
const guestData = (page) => page.evaluate(() => localStorage.getItem('datelime.v2'));

test.describe('without a Firebase project', () => {
  test('there is no sign-in, and nothing loads from Google', async ({ page, api }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(accountLink(page)).toBeHidden();
    await page.goto('/#/signin');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accounts aren’t switched on here');
    expect(api.calls.unexpected).toEqual([]);
  });
});

test.describe('signed out', () => {
  test('the app never loads Firebase until someone signs in', async ({ page, firebase }) => {
    const google = [];
    page.on('request', (r) => r.url().includes('gstatic.com') && google.push(r.url()));
    await page.goto('/#/movies/results?mood=swoony');
    await expect(page.getByRole('list', { name: 'Movies' })).toBeVisible();
    await expect(accountLink(page)).toHaveAccessibleName('Sign in');
    await accountLink(page).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back');
    expect(google).toEqual([]);
    expect(firebase.requests).toBe(0);
  });
});

test.describe('sign-up', () => {
  test('a name, email and password create the account; region and diet start its house rules', async ({ page, firebase }) => {
    await signUp(page, ANA, { region: 'GB', diet: 'Vegan' });
    await expect(page).toHaveURL(/#\/dates$/);
    await expect(page.locator('.toast').getByText('Welcome, Ana Lima! Your account is ready.')).toBeVisible();
    await expect(accountLink(page)).toHaveAccessibleName('Your account (Ana Lima)');
    await expect(page.getByText('Saved to your account')).toBeVisible();
    expect(firebase.docFor(ANA.email)).toMatchObject({ profile: { name: 'Ana Lima', email: ANA.email }, rules: { region: 'GB', diet: 'vegan' }, saved: [] });
    await page.goto('/#/rules');
    await expect(page.getByText(/Changes save as you go, to your account/)).toBeVisible();
    await expect(page.getByLabel('Vegan')).toBeChecked();
  });

  test('the form explains what to fix', async ({ page, firebase }) => {
    await page.goto('/#/signup');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toHaveText('Tell us your name.');
    await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Your name')).toBeFocused();

    await page.getByLabel('Your name').fill('Ana Lima');
    await page.getByLabel('Email', { exact: true }).fill('ana@example.com');
    await page.getByLabel('Password', { exact: true }).fill('short');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toHaveText('Choose a password of at least 8 characters.');

    existingAccount(firebase);
    await page.getByLabel('Password', { exact: true }).fill('another-password');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('alert')).toHaveText('There’s already an account with that email.');
    await expect(page.getByLabel('Email', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  });
});

test.describe('sign-in', () => {
  test('a wrong password says so; a reset link is offered without revealing who has an account', async ({ page, firebase }) => {
    existingAccount(firebase);
    await signIn(page, { email: ANA.email, password: 'wrong-password' });
    await expect(page.getByRole('alert')).toHaveText("That email and password don't match an account.");
    await page.getByRole('button', { name: 'Forgot your password?' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'reset' })).toHaveText(`If there's an account for ${ANA.email}, we've sent it a link to reset the password.`);
    expect(firebase.resets).toEqual([ANA.email]);
  });

  test('your saved dates arrive, and the session survives a reload', async ({ page, firebase }) => {
    existingAccount(firebase);
    await signIn(page);
    await expect(page).toHaveURL(/#\/dates$/);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    await page.reload();
    await expect(accountLink(page)).toHaveAccessibleName('Your account (Ana Lima)');
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
  });

  test('Google: a new account confirms its profile, and a closed pop-up is not an error', async ({ page, firebase }) => {
    firebase.google = 'closed';
    await page.goto('/#/signin');
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).not.toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('[data-form-error]')).toBeHidden();

    firebase.google = { email: 'sam@example.com', displayName: 'Sam Rivera' };
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    await expect(page).toHaveURL(/#\/account\?welcome=1$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome to dateLime, Sam Rivera');
    await expect(page.getByLabel('Your name')).toHaveValue('Sam Rivera');
    await page.getByRole('group', { name: 'Diet' }).getByText('Vegetarian', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/#\/$/);
    expect(firebase.docFor('sam@example.com')).toMatchObject({ profile: { name: 'Sam Rivera' }, rules: { diet: 'vegetarian' } });
  });
});

test.describe('dates already on this device', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-09-24T12:00:00') });
    await seedState(page, { saved: [DATE] });
  });

  test('"Add to my account" moves them into the account and off the device', async ({ page, firebase }) => {
    await signUp(page);
    await expect(page.getByRole('dialog', { name: 'Add your dates to your account?' })).toContainText('This device has 1 saved date');
    await page.getByRole('button', { name: 'Add to my account' }).click();
    await expect(page.locator('.toast').getByText('Added 1 date to your account.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    await expect.poll(() => firebase.docFor(ANA.email)?.saved?.length).toBe(1);
    expect(await guestData(page)).toBeNull();
  });

  test('"Not now" asks whether to delete them, and deleting clears the device', async ({ page, firebase }) => {
    await signUp(page);
    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(page.getByRole('dialog', { name: 'Delete them from this device?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete from this device' }).click();
    await expect(page.locator('.toast').getByText('Deleted 1 date from this device.')).toBeVisible();
    expect(await guestData(page)).toBeNull();
    expect(firebase.docFor(ANA.email).saved).toEqual([]);
  });

  test('keeping them leaves them on the device, where they return after signing out', async ({ page, firebase }) => {
    expect(firebase.requests).toBe(0);
    await signUp(page);
    await page.getByRole('button', { name: 'Not now' }).click();
    await page.getByRole('button', { name: 'Keep on this device' }).click();
    await expect(page).toHaveURL(/#\/dates$/);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0); // not in the account
    await page.goto('/#/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.goto('/#/dates');
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
  });
});

test.describe('privacy', () => {
  test('your dates follow you to another device, and changes sync back', async ({ page, firebase, browser }) => {
    existingAccount(firebase);
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();

    const phone = await browser.newContext({ serviceWorkers: 'block' });
    const other = await phone.newPage();
    await mockApis(other);
    await firebase.install(other);
    await signIn(other);
    await expect(other.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    await other.getByRole('button', { name: 'Delete Amélie + Tuna Niçoise' }).click();
    await expect.poll(() => firebase.docFor(ANA.email).saved.length).toBe(0);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0); // the first device catches up
    await phone.close();
  });

  test('signing out removes the account from the device; the next person sees nothing of it', async ({ page, firebase }) => {
    existingAccount(firebase);
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    await page.goto('/#/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.locator('.toast').getByText('Signed out. Your dates are safe in your account.')).toBeVisible();
    await expect(accountLink(page)).toHaveAccessibleName('Sign in');
    const stored = await page.evaluate(() => Object.entries(localStorage).map(([k, v]) => `${k}=${v}`).join('\n'));
    expect(stored).not.toContain('Amélie');
    expect(stored).not.toContain(ANA.email);

    await signUp(page, { name: 'Ben Okafor', email: 'ben@example.com', password: 'another-horse' });
    await expect(page).toHaveURL(/#\/dates$/);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0);
  });

  test('deleting your account deletes its data and signs you out', async ({ page, firebase }) => {
    await signUp(page);
    await expect(accountLink(page)).toHaveAccessibleName('Your account (Ana Lima)');
    await page.goto('/#/account');
    await page.getByRole('button', { name: 'Delete account' }).click();
    await expect(page.getByRole('dialog', { name: 'Delete your account?' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete my account' }).click();
    await expect(page.locator('.toast').getByText('Your account is deleted.')).toBeVisible();
    await expect(page).toHaveURL(/#\/$/);
    expect(firebase.docFor(ANA.email)).toBeNull();
    expect(firebase.accounts.has(ANA.email)).toBe(false);
    await expect(accountLink(page)).toHaveAccessibleName('Sign in');
  });
});

test.describe('offline', () => {
  test('an edit made offline survives a reload, then reaches the account', async ({ page, firebase }) => {
    existingAccount(firebase);
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    firebase.offline = true;
    await page.getByRole('button', { name: 'Delete Amélie + Tuna Niçoise' }).click();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0);
    await page.waitForTimeout(1200); // the upload is tried and fails
    expect(firebase.docFor(ANA.email).saved).toHaveLength(1);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0); // not overwritten
    firebase.offline = false;
    await expect.poll(() => firebase.docFor(ANA.email).saved.length).toBe(0);
    await page.waitForTimeout(500);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toHaveCount(0);
  });

  test('signing out with unsent changes warns first', async ({ page, firebase }) => {
    existingAccount(firebase);
    await signIn(page);
    await expect(page.getByRole('heading', { name: 'Amélie + Tuna Niçoise' })).toBeVisible();
    firebase.offline = true;
    await page.getByRole('button', { name: 'Delete Amélie + Tuna Niçoise' }).click();
    await page.goto('/#/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    const warning = page.getByRole('dialog', { name: 'Some changes aren’t saved to your account yet' });
    await expect(warning).toBeVisible();
    await warning.getByRole('button', { name: 'Stay signed in' }).click();
    await expect(accountLink(page)).toHaveAccessibleName('Your account (Ana Lima)');
    firebase.offline = false;
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.locator('.toast').getByText('Signed out. Your dates are safe in your account.')).toBeVisible();
    expect(firebase.docFor(ANA.email).saved).toEqual([]); // the edit was sent before signing out
  });
});

test('the header fits on one line on small phones, with the account button', async ({ page, firebase }) => {
  expect(firebase.requests).toBe(0);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    await page.goto('/#/');
    await expect(accountLink(page)).toBeVisible();
    const dates = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /Your dates/ });
    const lineHeight = await dates.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) || 24);
    expect((await dates.boundingBox()).height, `one line at ${width}px`).toBeLessThanOrEqual(Math.max(48, lineHeight * 1.5));
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), `no overflow at ${width}px`).toBeLessThanOrEqual(0);
  }
});

test.describe('accessibility', () => {
  const audit = async (page, label) => {
    await page.waitForTimeout(400);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes[0].target.join(' ')}`), label).toEqual([]);
  };

  for (const theme of ['dark', 'light']) {
    test(`sign-in, sign-up, the account page and the dates prompt (${theme})`, async ({ page, firebase }) => {
      await page.addInitScript((t) => localStorage.setItem('datelime.theme', t), theme);
      await seedState(page, { saved: [DATE] });
      await page.goto('/#/signin');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Welcome back');
      await audit(page, 'sign-in');
      await page.goto('/#/signup');
      await page.getByRole('button', { name: 'Create account' }).click(); // with its error showing
      await audit(page, 'sign-up');
      await signUp(page);
      await expect(page.getByRole('dialog', { name: 'Add your dates to your account?' })).toBeVisible();
      await audit(page, 'dates prompt');
      await page.getByRole('button', { name: 'Add to my account' }).click();
      await page.goto('/#/account');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your account');
      expect(firebase.requests).toBeGreaterThan(0);
      await audit(page, 'account');
    });
  }
});
