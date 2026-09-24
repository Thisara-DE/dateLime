// TheMealDB client (free, keyless). It replaced the paid Tasty/RapidAPI integration, whose key had
// been committed to the repository.
import { MEALDB } from '../config.js';
import { getJSON } from '../lib/http.js';
import { safeUrl } from '../lib/html.js';

const endpoint = (path, params = {}) => {
  const url = new URL(`${MEALDB.baseUrl}/${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.href;
};

export const normalizeMealSummary = (m) => ({ id: String(m.idMeal), name: m.strMeal?.trim() || 'Untitled recipe', thumb: m.strMealThumb || '' });

/** Collects strIngredient1..20 / strMeasure1..20 into a clean list. */
export function extractIngredients(raw, max = 20) {
  const list = [];
  for (let i = 1; i <= max; i += 1) {
    const name = raw[`strIngredient${i}`]?.trim();
    if (name) list.push({ name, measure: raw[`strMeasure${i}`]?.trim() || '' });
  }
  return list;
}

const STEP_LABEL_ONLY = /^(?:step\s*\d+|\d+)\s*[:.)\-–]?\s*$/i;
const STEP_PREFIX = /^(?:step\s*\d+\s*[:.)\-–]?\s*|\d+\s*[.)]\s+|[•*-]\s+)/i;

function chunkSentences(text, target = 240) {
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z0-9(])/);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && (current + ' ' + sentence).length > target) {
      chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Turns TheMealDB's free-text instructions into discrete steps. The source formats vary:
 * CRLF paragraphs, "STEP 1" headings, inline "1. ... 2. ..." numbering, or one long paragraph.
 */
export function splitSteps(text) {
  if (!text?.trim()) return [];
  let lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !STEP_LABEL_ONLY.test(l));

  // Inline numbering on a single line: "1. Do this. 2. Do that."
  lines = lines.flatMap((line) => {
    const parts = line.split(/\s+(?=\d{1,2}[.)]\s+[A-Za-z])/);
    return parts.length > 1 ? parts : [line];
  });

  lines = lines.map((l) => l.replace(STEP_PREFIX, '').trim()).filter(Boolean);

  // One unbroken paragraph reads badly as a single step: break it into sentence groups.
  if (lines.length === 1 && lines[0].length > 320) return chunkSentences(lines[0]);
  return lines;
}

export function normalizeMeal(raw) {
  return {
    ...normalizeMealSummary(raw),
    category: raw.strCategory || '',
    area: raw.strArea && raw.strArea !== 'Unknown' ? raw.strArea : '',
    tags: (raw.strTags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    ingredients: extractIngredients(raw),
    steps: splitSteps(raw.strInstructions),
    youtube: safeUrl(raw.strYoutube),
    source: safeUrl(raw.strSource),
  };
}

async function list(path, params, signal) {
  const data = await getJSON(endpoint(path, params), { signal });
  return (data?.meals ?? []).map(normalizeMealSummary); // TheMealDB returns {meals:null} for no match
}

export const mealsByArea = (area, { signal } = {}) => list('filter.php', { a: area }, signal);
export const mealsByCategory = (category, { signal } = {}) => list('filter.php', { c: category }, signal);
export const mealsByIngredient = (ingredient, { signal } = {}) => list('filter.php', { i: ingredient }, signal);
export const searchMeals = async (query, { signal } = {}) => {
  const data = await getJSON(endpoint('search.php', { s: query }), { signal });
  return (data?.meals ?? []).map(normalizeMeal);
};

export async function getMeal(id, { signal } = {}) {
  const data = await getJSON(endpoint('lookup.php', { i: id }), { signal });
  const raw = data?.meals?.[0];
  return raw ? normalizeMeal(raw) : null;
}

export async function randomMeal({ signal } = {}) {
  const data = await getJSON(endpoint('random.php'), { signal, cacheFor: 0 });
  const raw = data?.meals?.[0];
  return raw ? normalizeMeal(raw) : null;
}
