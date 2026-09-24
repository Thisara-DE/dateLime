// The pairing engine: movie genre -> TheMealDB cuisines/categories -> recipe picks.
// TheMealDB's free API filters on one attribute per request, so diets are applied by
// intersecting id sets on the client.

/** TMDB genre id -> where to look for food, and the line we show the couple. */
export const GENRE_PAIRINGS = {
  28: { areas: ['American', 'Mexican'], categories: ['Beef'], reason: 'Big, bold flavors to match the explosions.' },
  12: { areas: ['Moroccan', 'Jamaican', 'Thai'], categories: [], reason: 'Travel the world without leaving the couch.' },
  16: { areas: ['Japanese'], categories: ['Dessert'], reason: 'Playful plates for animated worlds.' },
  35: { areas: ['American', 'Mexican'], categories: ['Side'], reason: 'Easy, shareable food you can laugh through.' },
  80: { areas: ['Italian'], categories: ['Pasta'], reason: 'Red sauce and pasta, as every crime classic demands.' },
  99: { areas: ['Indian'], categories: ['Vegetarian'], reason: 'Something wholesome while you learn something new.' },
  18: { areas: ['French', 'British'], categories: [], reason: 'Slow-cooked comfort for a slow-burn story.' },
  10751: { areas: ['American', 'Italian'], categories: ['Pasta'], reason: 'Crowd-pleasers everyone will finish.' },
  14: { areas: ['British', 'Irish'], categories: [], reason: 'A hearty feast fit for a great hall.' },
  36: { areas: ['British', 'Russian', 'Greek'], categories: [], reason: 'Classic dishes with a long story of their own.' },
  27: { areas: ['Mexican', 'Indian'], categories: [], reason: 'Something fiery to match the screams.' },
  10402: { areas: ['Jamaican', 'Mexican'], categories: [], reason: 'Food with rhythm.' },
  9648: { areas: ['Moroccan', 'Turkish'], categories: [], reason: 'Spice-box flavors that keep you guessing.' },
  10749: { areas: ['Italian', 'French'], categories: ['Dessert'], reason: 'Candlelit classics, and something sweet to share.' },
  878: { areas: ['Japanese', 'Vietnamese', 'Thai'], categories: [], reason: 'Precise, bright flavors from the future.' },
  10770: { areas: ['American'], categories: [], reason: 'Cozy comfort food.' },
  53: { areas: ['Thai', 'Indian'], categories: [], reason: 'Heat that keeps you on the edge of your seat.' },
  10752: { areas: ['British', 'Russian'], categories: [], reason: 'Hearty food for a heavy story.' },
  37: { areas: ['American', 'Mexican'], categories: ['Beef'], reason: 'Campfire classics.' },
};

const FALLBACK = { areas: ['Italian', 'American'], categories: ['Dessert'], reason: 'Crowd-pleasing classics for any film.' };

/**
 * Dietary filters. `only` keeps recipes from these categories; `exclude` drops them.
 * TheMealDB labels each recipe with exactly one category, so "vegetarian" means recipes
 * filed under Vegetarian or Vegan; the UI says so.
 */
export const DIETS = {
  vegetarian: { label: 'Vegetarian', only: ['Vegetarian', 'Vegan'] },
  vegan: { label: 'Vegan', only: ['Vegan'] },
  pescatarian: { label: 'Pescatarian', only: ['Seafood', 'Vegetarian', 'Vegan'] },
  'no-pork': { label: 'No pork', exclude: ['Pork'] },
  'no-beef': { label: 'No beef', exclude: ['Beef'] },
};

/** Merges the pairings for a movie's genres; the first (primary) genre leads. */
export function pairingFor(genreIds = []) {
  const known = genreIds.filter((id) => GENRE_PAIRINGS[id]);
  if (!known.length) return { ...FALLBACK, genreId: null };
  const primary = GENRE_PAIRINGS[known[0]];
  const areas = [...new Set(known.flatMap((id) => GENRE_PAIRINGS[id].areas))].slice(0, 3);
  const categories = [...new Set(known.flatMap((id) => GENRE_PAIRINGS[id].categories))].slice(0, 2);
  return { areas, categories, reason: primary.reason, genreId: known[0] };
}

/** Deterministic PRNG so a given shuffle seed always yields the same order. */
export function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, seed) {
  const random = seededRandom(seed);
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Round-robin merge of several lists, de-duplicated by id, so no single source dominates. */
export function interleave(lists) {
  const seen = new Set();
  const out = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i += 1) {
    for (const list of lists) {
      const item = list[i];
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
  }
  return out;
}

/**
 * Finds recipes for a movie.
 * @param {{genreIds: number[], diet?: string, seed?: number, limit?: number, signal?: AbortSignal}} options
 * @param {{byArea: Function, byCategory: Function}} api  injected TheMealDB list functions
 * @returns {Promise<{meals: Array, reason: string, dietRelaxed: boolean, sources: string[]}>}
 */
export async function findPairedMeals({ genreIds, diet, seed = 1, limit = 12, signal }, api) {
  const pairing = pairingFor(genreIds);
  const rule = DIETS[diet];

  const [areaLists, categoryLists] = await Promise.all([
    Promise.all(pairing.areas.map((a) => api.byArea(a, { signal }))),
    Promise.all(pairing.categories.map((c) => api.byCategory(c, { signal }))),
  ]);
  let pool = interleave([...areaLists, ...categoryLists].map((l, i) => shuffle(l, seed + i)));

  let dietRelaxed = false;
  if (rule) {
    const dietCategories = rule.only ?? rule.exclude;
    const dietLists = await Promise.all(dietCategories.map((c) => api.byCategory(c, { signal })));
    const ids = new Set(dietLists.flat().map((m) => m.id));
    if (rule.only) {
      const matched = pool.filter((m) => ids.has(m.id));
      // A cuisine rarely has enough vegan dishes; fall back to the diet's own categories.
      if (matched.length >= 4) pool = matched;
      else {
        pool = interleave(dietLists.map((l, i) => shuffle(l, seed + 10 + i)));
        dietRelaxed = true;
      }
    } else {
      pool = pool.filter((m) => !ids.has(m.id));
    }
  }

  return {
    meals: pool.slice(0, limit),
    reason: pairing.reason,
    dietRelaxed,
    sources: [...pairing.areas, ...pairing.categories],
  };
}
