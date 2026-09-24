import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findDurations, formatCountdown } from '../../assets/js/domain/timers.js';

test('finds minutes, hours, ranges and words', () => {
  assert.deepEqual(findDurations('Simmer for 20 minutes, stirring.'), [{ minutes: 20, label: '20 min' }]);
  assert.deepEqual(findDurations('Bake 30-35 mins until golden'), [{ minutes: 30, label: '30–35 min' }]);
  assert.deepEqual(findDurations('Roast for 1 hour'), [{ minutes: 60, label: '1 hr' }]);
  assert.deepEqual(findDurations('Rest for 1.5 hours'), [{ minutes: 90, label: '90 min' }]);
  assert.deepEqual(findDurations('Leave for half an hour.'), [{ minutes: 30, label: '30 min' }]);
  assert.deepEqual(findDurations('Cook for five mins then ten minutes more'), [{ minutes: 5, label: '5 min' }, { minutes: 10, label: '10 min' }]);
  assert.deepEqual(findDurations('Fry for 10m'), [{ minutes: 10, label: '10 min' }]);
  assert.deepEqual(findDurations('Marinate for 8 hours'), [{ minutes: 480, label: '8 hr' }]);
});

test('ignores things that are not durations', () => {
  assert.deepEqual(findDurations('Add 1 medium onion and 2 mm slices'), []);
  assert.deepEqual(findDurations('Preheat to 180C'), []);
  assert.deepEqual(findDurations('Cook 2000 minutes'), []); // beyond the 12-hour cap: almost certainly a typo
  assert.deepEqual(findDurations(''), []);
});

test('de-duplicates repeated durations', () => {
  assert.equal(findDurations('Boil 10 minutes. Drain. Boil again 10 minutes.').length, 1);
});

test('formats a countdown', () => {
  assert.equal(formatCountdown(462_000), '07:42');
  assert.equal(formatCountdown(3_723_000), '1:02:03');
  assert.equal(formatCountdown(-5), '00:00');
  assert.equal(formatCountdown(1), '00:01');
});
