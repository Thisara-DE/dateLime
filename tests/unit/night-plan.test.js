import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNightPlan, nextOccurrence, parseLocal, formatLocal, formatRuntime } from '../../assets/js/domain/night-plan.js';

test('counts back from press play and forward to the credits', () => {
  assert.deepEqual(buildNightPlan({ playAt: '2026-10-02T20:00', runtime: 104, cookMinutes: 45, eatMinutes: 30 }), {
    startCooking: '2026-10-02T18:45',
    eat: '2026-10-02T19:30',
    play: '2026-10-02T20:00',
    credits: '2026-10-02T21:44',
  });
});

test('crosses midnight and handles a missing runtime', () => {
  const plan = buildNightPlan({ playAt: '2026-10-02T23:30', runtime: 169, cookMinutes: 90 });
  assert.equal(plan.credits, '2026-10-03T02:19');
  assert.equal(plan.startCooking, '2026-10-02T21:30');
  assert.equal(buildNightPlan({ playAt: '2026-10-02T20:00' }).credits, null);
  assert.equal(buildNightPlan({ playAt: 'nope' }), null);
});

test('nextOccurrence picks today if still ahead, otherwise tomorrow', () => {
  const afternoon = new Date(2026, 8, 24, 15, 0);
  const lateNight = new Date(2026, 8, 24, 21, 0);
  assert.equal(nextOccurrence('20:00', afternoon), '2026-09-24T20:00');
  assert.equal(nextOccurrence('20:00', lateNight), '2026-09-25T20:00');
});

test('local round-trip and runtime formatting', () => {
  assert.equal(formatLocal(parseLocal('2026-12-31T23:59')), '2026-12-31T23:59');
  assert.equal(formatRuntime(104), '1h 44m');
  assert.equal(formatRuntime(120), '2h');
  assert.equal(formatRuntime(45), '45m');
  assert.equal(formatRuntime(null), '');
});
