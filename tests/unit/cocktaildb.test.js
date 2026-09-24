import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeDrink, zeroProofDrinks, drinksWith, getDrink } from '../../assets/js/api/cocktaildb.js';
import { clearHttpCache } from '../../assets/js/lib/http.js';

beforeEach(() => clearHttpCache());

test('normalizeDrink flags alcohol and collects up to 15 ingredients', () => {
  const d = normalizeDrink({ idDrink: 12162, strDrink: 'Lime Cooler', strAlcoholic: 'Non alcoholic', strGlass: 'Highball glass', strInstructions: 'Fill with ice.\r\nTop with soda.', strIngredient1: 'Lime', strMeasure1: '1 ', strIngredient2: '', strIngredient15: 'Mint', strMeasure15: null });
  assert.equal(d.id, '12162');
  assert.equal(d.alcoholic, false);
  assert.deepEqual(d.ingredients, [{ name: 'Lime', measure: '1' }, { name: 'Mint', measure: '' }]);
  assert.deepEqual(d.steps, ['Fill with ice.', 'Top with soda.']);
  assert.equal(normalizeDrink({ idDrink: 1, strAlcoholic: 'Alcoholic' }).alcoholic, true);
});

test('handles both of TheCocktailDB\'s "no results" shapes', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ drinks: 'None Found' }));
  assert.deepEqual(await drinksWith('Unobtainium'), []);
  clearHttpCache();
  globalThis.fetch = async () => new Response(JSON.stringify({ drinks: null }));
  assert.equal(await getDrink('0'), null);
});

test('zero-proof list hits the Non_Alcoholic filter', async () => {
  let requested;
  globalThis.fetch = async (u) => {
    requested = new URL(u);
    return new Response(JSON.stringify({ drinks: [{ idDrink: '1', strDrink: 'Virgin Mojito', strDrinkThumb: 't' }] }));
  };
  const list = await zeroProofDrinks();
  assert.equal(requested.searchParams.get('a'), 'Non_Alcoholic');
  assert.deepEqual(list, [{ id: '1', name: 'Virgin Mojito', thumb: 't' }]);
});
