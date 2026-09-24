// After one visit, the app opens and moves between screens with no connection at all.
// The outage is real (this test's own server is stopped): devtools' offline emulation
// doesn't reach the service worker's fetches, so it would pass even with a broken worker.
import { test, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const SERVER = fileURLToPath(new URL('../../scripts/serve.mjs', import.meta.url));

test.use({ serviceWorkers: 'allow' });

test('the app shell works offline once it has been visited', async ({ page }, testInfo) => {
  const port = 4400 + (testInfo.workerIndex % 500);
  const origin = `http://localhost:${port}`;
  const server = spawn(process.execPath, [SERVER, String(port)], { stdio: 'ignore' });
  try {
    await expect.poll(() => fetch(origin).then((r) => r.ok, () => false)).toBe(true);
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${origin}/`);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller));

    server.kill();
    await once(server, 'exit');
    expect(await page.evaluate(() => fetch('README.md').then(() => 'reached', () => 'offline'))).toBe('offline');

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dinner and a movie, for two.');
    for (const [hash, heading] of [
      ['#/movies', "What's the mood tonight?"],
      ['#/rules', 'House rules'],
      ['#/dates', 'Your dates'],
    ]) {
      await page.evaluate((h) => (location.hash = h), hash);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
    }
    expect(errors).toEqual([]);
  } finally {
    server.kill();
  }
});
