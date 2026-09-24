import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { splitSteps, extractIngredients, normalizeMeal, mealsByArea, getMeal } from '../../assets/js/api/mealdb.js';
import { clearHttpCache } from '../../assets/js/lib/http.js';

beforeEach(() => clearHttpCache());

test('splitSteps handles CRLF paragraphs', () => {
  const steps = splitSteps('Preheat oven to 350° F.\r\nCombine soy sauce and water.\r\n\r\nBake for 30 minutes.');
  assert.deepEqual(steps, ['Preheat oven to 350° F.', 'Combine soy sauce and water.', 'Bake for 30 minutes.']);
});

test('splitSteps drops "STEP n" headings and numbering', () => {
  const steps = splitSteps('STEP 1\r\nBoil the pasta.\r\n\r\nSTEP 2\r\nFry the pancetta.\r\nstep 3: Toss together.\r\n4. Serve.');
  assert.deepEqual(steps, ['Boil the pasta.', 'Fry the pancetta.', 'Toss together.', 'Serve.']);
});

test('splitSteps splits inline numbering on one line', () => {
  assert.deepEqual(splitSteps('1. Chop onions. 2. Fry them. 3. Add rice.'), ['Chop onions.', 'Fry them.', 'Add rice.']);
});

test('splitSteps chunks one long paragraph into readable steps', () => {
  const sentence = 'Stir the sauce slowly over a low heat until it thickens nicely. ';
  const steps = splitSteps(sentence.repeat(12).trim());
  assert.ok(steps.length >= 3, `expected several chunks, got ${steps.length}`);
  assert.ok(steps.every((s) => s.length <= 260));
  assert.equal(steps.join(' '), sentence.repeat(12).trim());
});

test('splitSteps is safe on empty input', () => {
  assert.deepEqual(splitSteps(''), []);
  assert.deepEqual(splitSteps(null), []);
});

test('extractIngredients skips empty and null slots', () => {
  const raw = { strIngredient1: 'Spaghetti', strMeasure1: '320g', strIngredient2: ' ', strMeasure2: ' ', strIngredient3: 'Egg Yolks', strMeasure3: null, strIngredient4: null };
  assert.deepEqual(extractIngredients(raw), [
    { name: 'Spaghetti', measure: '320g' },
    { name: 'Egg Yolks', measure: '' },
  ]);
});

test('normalizeMeal sanitizes links and tags', () => {
  const meal = normalizeMeal({ idMeal: 52982, strMeal: 'Spaghetti alla Carbonara ', strCategory: 'Pasta', strArea: 'Italian', strTags: 'Pasta, Speciality,', strInstructions: 'Cook.', strYoutube: 'javascript:alert(1)', strSource: 'https://example.com/r', strMealThumb: 'https://img/x.jpg' });
  assert.equal(meal.id, '52982');
  assert.equal(meal.name, 'Spaghetti alla Carbonara');
  assert.deepEqual(meal.tags, ['Pasta', 'Speciality']);
  assert.equal(meal.youtube, '');
  assert.equal(meal.source, 'https://example.com/r');
  assert.equal(normalizeMeal({ idMeal: 1, strArea: 'Unknown' }).area, '');
});

test('list endpoints turn {meals:null} into an empty list', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ meals: null }));
  assert.deepEqual(await mealsByArea('Atlantis'), []);
  assert.equal(await getMeal('0'), null);
});
