import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pairingFor, interleave, shuffle, findPairedMeals, GENRE_PAIRINGS, KEYWORD_RULES } from '../../assets/js/domain/pairing.js';

const meal = (id, area, category) => ({ id: String(id), name: `Meal ${id}`, area, category });
const DB = [
  meal(1, 'Italian', 'Pasta'), meal(2, 'Italian', 'Vegetarian'), meal(3, 'Italian', 'Dessert'),
  meal(4, 'French', 'Dessert'), meal(5, 'French', 'Chicken'), meal(6, 'French', 'Vegetarian'),
  meal(7, 'American', 'Pork'), meal(8, 'American', 'Beef'), meal(9, 'Mexican', 'Vegan'),
  meal(10, 'Italian', 'Vegan'), meal(11, 'French', 'Vegan'), meal(12, 'Italian', 'Pork'),
  meal(13, 'Japanese', 'Seafood'), meal(14, 'Japanese', 'Chicken'),
];
const api = {
  byArea: async (area) => DB.filter((m) => m.area === area).map(({ id, name }) => ({ id, name })),
  byCategory: async (cat) => DB.filter((m) => m.category === cat).map(({ id, name }) => ({ id, name })),
};
const areaOf = (id) => DB.find((m) => m.id === id).area;
const categoryOf = (id) => DB.find((m) => m.id === id).category;

test('every TMDB genre has a pairing with a source and a sentence', () => {
  assert.equal(Object.keys(GENRE_PAIRINGS).length, 19);
  for (const [id, p] of Object.entries(GENRE_PAIRINGS)) {
    assert.ok(p.areas.length + p.categories.length > 0, `genre ${id} has no sources`);
    assert.match(p.reason, /\.$/, `genre ${id} reason should be a sentence`);
  }
  for (const rule of KEYWORD_RULES) assert.match(rule.reason, /\.$/);
});

test('tier 1: origin country beats keywords and genre', () => {
  const p = pairingFor({ genreIds: [35, 10749], originCountries: ['FR'], keywords: ['tokyo'] });
  assert.equal(p.tier, 'origin');
  assert.deepEqual(p.areas, ['French'], 'the promised cuisine is not diluted by genre areas');
  assert.match(p.reason, /France/);
});

test('tier 1 also works from the original language', () => {
  const p = pairingFor({ genreIds: [16], originalLanguage: 'ja' });
  assert.equal(p.tier, 'origin');
  assert.equal(p.areas[0], 'Japanese');
});

test('US films and unmapped origins fall through to keywords, then genre', () => {
  assert.equal(pairingFor({ genreIds: [35], originCountries: ['US'], originalLanguage: 'en', keywords: ['paris'] }).tier, 'keyword');
  const korean = pairingFor({ genreIds: [53], originCountries: ['KR'], originalLanguage: 'ko' });
  assert.equal(korean.tier, 'genre');
  assert.equal(korean.reason, GENRE_PAIRINGS[53].reason);
  assert.equal(pairingFor({ genreIds: [] }).tier, 'fallback');
});

test('keyword rules can add a category (a Christmas movie gets dessert)', () => {
  const p = pairingFor({ genreIds: [35], originCountries: ['US'], keywords: ['Christmas'] });
  assert.equal(p.tier, 'keyword');
  assert.ok(p.categories.includes('Dessert'));
});

test('interleave round-robins and de-duplicates; shuffle is deterministic', () => {
  assert.deepEqual(interleave([[{ id: 1 }, { id: 2 }, { id: 3 }], [{ id: 2 }, { id: 4 }]]).map((x) => x.id), [1, 2, 4, 3]);
  const list = Array.from({ length: 20 }, (_, i) => i);
  assert.deepEqual(shuffle(list, 42), shuffle(list, 42));
  assert.notDeepEqual(shuffle(list, 42), shuffle(list, 43));
});

test('romance pairs Italian/French and dessert, and tags each meal with its source', async () => {
  const res = await findPairedMeals({ movie: { genreIds: [10749] } }, api);
  assert.ok(res.meals.length > 0);
  assert.ok(res.meals.every((m) => ['Italian', 'French'].includes(areaOf(m.id)) || categoryOf(m.id) === 'Dessert'));
  assert.ok(res.meals.every((m) => ['Italian', 'French', 'Dessert'].includes(m.from)));
  assert.equal(res.relaxed, '');
});

test('vegetarian intersects with the pairing when enough match', async () => {
  const res = await findPairedMeals({ movie: { genreIds: [10749] }, diet: 'vegetarian' }, api);
  assert.ok(res.meals.length >= 4);
  assert.ok(res.meals.every((m) => ['Vegetarian', 'Vegan'].includes(categoryOf(m.id))));
  assert.equal(res.relaxed, '');
});

test('too few matches relaxes in stages and says so', async () => {
  const res = await findPairedMeals({ movie: { genreIds: [16], originalLanguage: 'ja' }, diet: 'vegan' }, api);
  assert.match(res.relaxed, /vegan .*from everywhere/);
  assert.ok(res.meals.length > 0);
  assert.ok(res.meals.every((m) => categoryOf(m.id) === 'Vegan'));
});
