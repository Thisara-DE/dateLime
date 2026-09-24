import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, upsertSaved, isComplete, toShareQuery, fromShareQuery } from '../../assets/js/domain/plan.js';

const movie = { id: 603, title: 'The Matrix', year: '1999', poster: '/p.jpg', runtime: 136, certification: 'R', rating: 8.2, genreIds: [28], overview: 'long text not needed' };
const meal = { id: 52982, name: 'Carbonara', thumb: 'https://x/c.jpg', area: 'Italian', category: 'Pasta', steps: ['a'] };

test('createPlan stores compact snapshots only', () => {
  const plan = createPlan({ movie, meal, when: '2026-10-02T19:30' });
  assert.equal(plan.movie.title, 'The Matrix');
  assert.equal('overview' in plan.movie, false);
  assert.equal(plan.meal.id, '52982');
  assert.equal('steps' in plan.meal, false);
  assert.equal(plan.drink, null);
  assert.ok(plan.id);
  assert.ok(isComplete(plan));
  assert.equal(isComplete(createPlan({ movie, meal: null })), false);
});

test('upsertSaved de-duplicates the same pairing and puts the newest first', () => {
  const a = createPlan({ movie, meal, id: 'a' });
  const b = createPlan({ movie: { ...movie, id: 1 }, meal, id: 'b' });
  const aAgain = createPlan({ movie, meal, id: 'c' });
  const list = upsertSaved(upsertSaved(upsertSaved([], a), b), aAgain);
  assert.deepEqual(list.map((p) => p.id), ['c', 'b']);
});

test('upsertSaved caps the list', () => {
  let list = [];
  for (let i = 0; i < 60; i += 1) list = upsertSaved(list, createPlan({ movie: { ...movie, id: i + 1 }, meal, id: String(i) }));
  assert.equal(list.length, 50);
  assert.equal(list[0].id, '59');
});

test('share query round-trips and validates input', () => {
  const plan = createPlan({ movie, meal, drink: { id: '11007', name: 'Margarita' }, when: '2026-10-02T19:30' });
  const query = toShareQuery(plan, '  Bring popcorn!  ');
  assert.deepEqual(query, { m: 603, r: '52982', d: '11007', at: '2026-10-02T19:30', note: 'Bring popcorn!' });
  const stringified = Object.fromEntries(Object.entries(query).map(([k, v]) => [k, String(v)]));
  assert.deepEqual(fromShareQuery(stringified), { movieId: 603, mealId: '52982', drinkId: '11007', when: '2026-10-02T19:30', note: 'Bring popcorn!' });
});

test('fromShareQuery rejects junk', () => {
  assert.equal(fromShareQuery({}), null);
  assert.equal(fromShareQuery({ m: 'abc', r: '1' }), null);
  assert.equal(fromShareQuery({ m: '1', r: '<script>' }), null);
  const partial = fromShareQuery({ m: '1', r: '2', d: 'x', at: 'tomorrow', note: 'n'.repeat(500) });
  assert.equal(partial.drinkId, null);
  assert.equal(partial.when, null);
  assert.equal(partial.note.length, 140);
});
