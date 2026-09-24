// TheCocktailDB client (free, keyless). Zero-proof drinks are first-class citizens.
import { COCKTAILDB } from '../config.js';
import { getJSON } from '../lib/http.js';
import { splitSteps } from './mealdb.js';

const endpoint = (path, params = {}) => {
  const url = new URL(`${COCKTAILDB.baseUrl}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
};

// TheCocktailDB answers "no results" with either {drinks:null} or {drinks:"None Found"}.
const drinksOf = (data) => (Array.isArray(data?.drinks) ? data.drinks : []);

export const normalizeDrinkSummary = (d) => ({ id: String(d.idDrink), name: d.strDrink?.trim() || 'Untitled drink', thumb: d.strDrinkThumb || '' });

export function normalizeDrink(raw) {
  const ingredients = [];
  for (let i = 1; i <= 15; i += 1) {
    const name = raw[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: raw[`strMeasure${i}`]?.trim() || '' });
  }
  return {
    ...normalizeDrinkSummary(raw),
    alcoholic: raw.strAlcoholic === 'Alcoholic',
    category: raw.strCategory || '',
    glass: raw.strGlass || '',
    ingredients,
    steps: splitSteps(raw.strInstructions),
  };
}

async function list(params, signal) {
  return drinksOf(await getJSON(endpoint('filter.php', params), { signal })).map(normalizeDrinkSummary);
}

export const zeroProofDrinks = ({ signal } = {}) => list({ a: 'Non_Alcoholic' }, signal);
export const drinksWith = (ingredient, { signal } = {}) => list({ i: ingredient }, signal);

export async function getDrink(id, { signal } = {}) {
  const raw = drinksOf(await getJSON(endpoint('lookup.php', { i: id }), { signal }))[0];
  return raw ? normalizeDrink(raw) : null;
}
