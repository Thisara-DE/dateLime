import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeGuestIntoAccount, hasGuestDates } from '../../assets/js/domain/account-merge.js';
import { MAX_SAVED } from '../../assets/js/domain/plan.js';

const plan = (id, movie, meal) => ({ id, movie: { id: movie, title: `M${movie}` }, meal: { id: String(meal), name: `R${meal}` }, drink: null });

test('guest dates join the account, newest on top, without duplicates', () => {
  const account = { rules: { diet: 'vegan', services: [], avoid: [] }, saved: [plan('a1', 1, 10)] };
  const guest = { saved: [plan('g2', 2, 20), plan('g1', 1, 10), plan('g3', 3, 30)] };
  const { saved, added } = mergeGuestIntoAccount(account, guest);
  assert.equal(added, 2); // g1 pairs the same movie and meal as a1
  assert.deepEqual(saved.map((p) => p.movie.id), [2, 1, 3]);
});

test("the account's house rules win; empty lists borrow the guest's", () => {
  const account = { rules: { diet: 'vegan', region: 'GB', services: [], avoid: ['nuts'] }, saved: [] };
  const guest = { rules: { diet: '', region: 'US', services: [{ id: 8, name: 'Netflix' }], avoid: ['pork'] } };
  const { rules } = mergeGuestIntoAccount(account, guest);
  assert.equal(rules.diet, 'vegan');
  assert.equal(rules.region, 'GB');
  assert.deepEqual(rules.services, [{ id: 8, name: 'Netflix' }]);
  assert.deepEqual(rules.avoid, ['nuts']);
});

test('the merged list stays within the saved-dates cap, and incomplete plans are skipped', () => {
  const account = { rules: {}, saved: Array.from({ length: MAX_SAVED }, (_, i) => plan(`a${i}`, i, i)) };
  const guest = { saved: [plan('g', 999, 999), { id: 'broken', movie: null, meal: null }] };
  const { saved, added } = mergeGuestIntoAccount(account, guest);
  assert.equal(saved.length, MAX_SAVED);
  assert.equal(added, 1);
  assert.equal(saved[0].id, 'g');
});

test('hasGuestDates is true only for complete dates', () => {
  assert.equal(hasGuestDates({ saved: [] }), false);
  assert.equal(hasGuestDates(null), false);
  assert.equal(hasGuestDates({ saved: [{ id: 'x', movie: null, meal: null }] }), false);
  assert.equal(hasGuestDates({ saved: [plan('g', 1, 1)] }), true);
});
