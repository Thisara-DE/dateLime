import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairingFor, interleave, shuffle, findPairedMeals, GENRE_PAIRINGS } from '../../assets/js/domain/pairing.js';

const meal = (id, area, category) => ({ id: String(id), name: `Meal ${id}`, area, category });
const DB = [
  meal(1, 'Italian', 'Pasta'), meal(2, 'Italian', 'Vegetarian'), meal(3, 'Italian', 'Dessert'),
  meal(4, 'French', 'Dessert'), meal(5, 'French', 'Chicken'), meal(6, 'French', 'Vegetarian'),
  meal(7, 'American', 'Pork'), meal(8, 'American', 'Beef'), meal(9, 'Mexican', 'Vegan'),
  meal(10, 'Italian', 'Vegan'), meal(11, 'French', 'Vegan'), meal(12, 'Italian', 'Pork'),
];
const api = {
  calls: [],
  byArea(area) { this.calls.push(`a:${area}`); return Promise.resolve(DB.filter((m) => m.area === area)); },
  byCategory(cat) { this.calls.push(`c:${cat}`); return Promise.resolve(DB.filter((m) => m.category === cat)); },
};

test('every TMDB genre has a pairing with at least one source and a reason', () => {
  for (const [id, p] of Object.entries(GENRE_PAIRINGS)) {
    assert.ok(p.areas.length + p.categories.length > 0, `genre ${id} has no sources`);
    assert.ok(p.reason.endsWith('.'), `genre ${id} reason should be a sentence`);
  }
  assert.equal(Object.keys(GENRE_PAIRINGS).length, 19);
});

test('pairingFor leads with the primary genre and caps sources', () => {
  const p = pairingFor([10749, 35]);
  assert.equal(p.genreId, 10749);
  assert.equal(p.reason, GENRE_PAIRINGS[10749].reason);
  assert.deepEqual(p.areas, ['Italian', 'French', 'American']);
  assert.ok(p.categories.length <= 2);
  assert.equal(pairingFor([999999]).genreId, null);
  assert.equal(pairingFor([]).genreId, null);
});

test('interleave round-robins and de-duplicates', () => {
  const a = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const b = [{ id: 2 }, { id: 4 }];
  assert.deepEqual(interleave([a, b]).map((x) => x.id), [1, 2, 4, 3]);
});

test('shuffle is deterministic per seed and keeps all items', () => {
  const list = Array.from({ length: 20 }, (_, i) => i);
  assert.deepEqual(shuffle(list, 42), shuffle(list, 42));
  assert.notDeepEqual(shuffle(list, 42), shuffle(list, 43));
  assert.deepEqual([...shuffle(list, 7)].sort((x, y) => x - y), list);
});

test('romance pairs Italian/French and dessert', async () => {
  const res = await findPairedMeals({ genreIds: [10749] }, api);
  assert.ok(res.meals.length > 0);
  assert.ok(res.meals.every((m) => ['Italian', 'French'].includes(m.area) || m.category === 'Dessert'));
  assert.equal(res.dietRelaxed, false);
});

test('vegetarian keeps only Vegetarian/Vegan recipes from the pairing', async () => {
  const res = await findPairedMeals({ genreIds: [10749], diet: 'vegetarian' }, api);
  assert.ok(res.meals.length >= 4);
  assert.ok(res.meals.every((m) => ['Vegetarian', 'Vegan'].includes(m.category)));
});

test('a diet with too few matches falls back to the diet categories and says so', async () => {
  const res = await findPairedMeals({ genreIds: [28], diet: 'vegan' }, api); // American/Mexican + Beef
  assert.equal(res.dietRelaxed, true);
  assert.ok(res.meals.every((m) => m.category === 'Vegan'));
});

test('exclusion diets remove the category', async () => {
  const res = await findPairedMeals({ genreIds: [28], diet: 'no-pork' }, api);
  assert.ok(res.meals.every((m) => m.category !== 'Pork'));
  assert.ok(res.meals.some((m) => m.area === 'American'));
});
