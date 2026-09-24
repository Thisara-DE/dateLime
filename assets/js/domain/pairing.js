// Vibe Pairing: movie -> TheMealDB cuisines/categories -> recipe picks, with a "why" line.
// Three tiers, strongest first: origin (country/language), keywords (setting, occasion),
// genre (mood). Reasons cite the setting or mood, never people.
// TheMealDB's free API filters on one attribute per request, so diets are applied by
// intersecting id sets on the client, and relaxed in announced stages when too few match.

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
  27: { areas: ['Mexican', 'Indian'], categories: ['Starter'], reason: 'Something fiery, and finger food you can eat without looking.' },
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

// Tier 1: where the film comes from. US is left out on purpose: "American" says little
// about a Hollywood film's mood, so the genre tier decides those. TheMealDB has no Korean
// area, so Korean films fall through to genre instead of being forced into a stereotype.
export const COUNTRY_AREAS = {
  FR: 'French', IT: 'Italian', JP: 'Japanese', IN: 'Indian', MX: 'Mexican', GB: 'British', IE: 'Irish',
  CN: 'Chinese', HK: 'Chinese', TW: 'Chinese', TH: 'Thai', VN: 'Vietnamese', GR: 'Greek', TR: 'Turkish',
  ES: 'Spanish', PT: 'Portuguese', RU: 'Russian', PL: 'Polish', NL: 'Dutch', CA: 'Canadian', JM: 'Jamaican',
  MA: 'Moroccan', EG: 'Egyptian', TN: 'Tunisian', KE: 'Kenyan', MY: 'Malaysian', HR: 'Croatian', PH: 'Filipino',
};
export const LANGUAGE_AREAS = {
  fr: 'French', it: 'Italian', ja: 'Japanese', hi: 'Indian', ta: 'Indian', te: 'Indian', ml: 'Indian', bn: 'Indian',
  zh: 'Chinese', cn: 'Chinese', th: 'Thai', vi: 'Vietnamese', el: 'Greek', tr: 'Turkish', pt: 'Portuguese',
  ru: 'Russian', pl: 'Polish', nl: 'Dutch', hr: 'Croatian', ms: 'Malaysian', tl: 'Filipino', es: 'Spanish',
};
const COUNTRY_NAMES = {
  FR: 'France', IT: 'Italy', JP: 'Japan', IN: 'India', MX: 'Mexico', GB: 'the UK', IE: 'Ireland', CN: 'China',
  HK: 'Hong Kong', TW: 'Taiwan', TH: 'Thailand', VN: 'Vietnam', GR: 'Greece', TR: 'Turkey', ES: 'Spain',
  PT: 'Portugal', RU: 'Russia', PL: 'Poland', NL: 'the Netherlands', CA: 'Canada', JM: 'Jamaica', MA: 'Morocco',
  EG: 'Egypt', TN: 'Tunisia', KE: 'Kenya', MY: 'Malaysia', HR: 'Croatia', PH: 'the Philippines',
};

// Tier 2: setting and occasion keywords (TMDB keyword names, lower case).
export const KEYWORD_RULES = [
  { match: ['paris', 'france'], areas: ['French'], reason: 'Set in France: French cooking to match.' },
  { match: ['rome', 'italy', 'venice', 'sicily', 'tuscany', 'mafia'], areas: ['Italian'], reason: 'Italy on screen, pasta on the plate.' },
  { match: ['tokyo', 'japan', 'kyoto', 'samurai'], areas: ['Japanese'], reason: 'Set in Japan: Japanese flavors to match.' },
  { match: ['mexico', 'day of the dead'], areas: ['Mexican'], reason: 'Set in Mexico: Mexican food to match.' },
  { match: ['india', 'mumbai', 'bollywood'], areas: ['Indian'], reason: 'Set in India: something from the spice box.' },
  { match: ['london', 'england', 'british', 'scotland'], areas: ['British'], reason: 'Set in Britain: proper comfort food.' },
  { match: ['ireland', 'dublin'], areas: ['Irish'], reason: 'Set in Ireland: hearty Irish cooking.' },
  { match: ['china', 'hong kong', 'shanghai', 'beijing', 'kung fu'], areas: ['Chinese'], reason: 'The story heads to China, and so does dinner.' },
  { match: ['thailand', 'bangkok'], areas: ['Thai'], reason: 'Set in Thailand: bright Thai flavors.' },
  { match: ['vietnam'], areas: ['Vietnamese'], reason: 'Set in Vietnam: fresh Vietnamese cooking.' },
  { match: ['greece', 'athens', 'greek mythology'], areas: ['Greek'], reason: 'Greece on screen, Greek food on the table.' },
  { match: ['spain', 'madrid', 'barcelona'], areas: ['Spanish'], reason: 'Set in Spain: tapas-style sharing.' },
  { match: ['morocco', 'marrakesh', 'casablanca'], areas: ['Moroccan'], reason: 'Set in Morocco: slow, fragrant tagines.' },
  { match: ['jamaica', 'caribbean', 'reggae'], areas: ['Jamaican'], reason: 'Caribbean on screen, jerk on the grill.' },
  { match: ['new york city', 'texas', 'road trip', 'diner'], areas: ['American'], reason: 'An American story: diner classics.' },
  { match: ['christmas', 'holiday', 'birthday', 'wedding'], categories: ['Dessert'], reason: 'A celebration movie deserves something sweet.' },
  { match: ['beach', 'ocean', 'island', 'sailing', 'fisherman', 'shark'], categories: ['Seafood'], reason: 'The sea is on screen, so seafood is on the menu.' },
  { match: ['breakfast', 'morning'], categories: ['Breakfast'], reason: 'It starts with breakfast, and so can dinner.' },
];

/**
 * Builds the pairing plan for a movie.
 * @param {{genreIds?: number[], originCountries?: string[], originalLanguage?: string, keywords?: string[]}} movie
 * @returns {{areas: string[], categories: string[], reason: string, tier: 'origin'|'keyword'|'genre'|'fallback'}}
 */
export function pairingFor({ genreIds = [], originCountries = [], originalLanguage = '', keywords = [] } = {}) {
  const genres = genreIds.filter((id) => GENRE_PAIRINGS[id]);
  const genreAreas = genres.flatMap((id) => GENRE_PAIRINGS[id].areas);
  const genreCategories = genres.flatMap((id) => GENRE_PAIRINGS[id].categories);
  const unique = (list, max) => [...new Set(list)].slice(0, max);

  const country = originCountries.find((c) => COUNTRY_AREAS[c]);
  const originArea = country ? COUNTRY_AREAS[country] : LANGUAGE_AREAS[originalLanguage];
  if (originArea) {
    const where = country ? COUNTRY_NAMES[country] : null;
    // The origin dominates: the why line promises that cuisine, so don't dilute it with
    // genre areas. One genre category (e.g. romance -> dessert) adds variety.
    return {
      areas: [originArea],
      categories: unique(genreCategories, 1),
      reason: where ? `Straight from ${where}: ${originArea} cooking to match.` : `${originArea} cinema calls for ${originArea} cooking.`,
      tier: 'origin',
    };
  }

  const lower = keywords.map((k) => k.toLowerCase());
  const rule = KEYWORD_RULES.find((r) => r.match.some((m) => lower.includes(m)));
  if (rule) {
    // A setting keyword (Paris) names the cuisine outright; an occasion keyword (Christmas)
    // only adds a category, so the genre's areas fill in.
    return rule.areas
      ? { areas: rule.areas, categories: unique(rule.categories ?? [], 1), reason: rule.reason, tier: 'keyword' }
      : { areas: unique(genreAreas, 2), categories: rule.categories, reason: rule.reason, tier: 'keyword' };
  }

  if (genres.length) {
    return { areas: unique(genreAreas, 3), categories: unique(genreCategories, 2), reason: GENRE_PAIRINGS[genres[0]].reason, tier: 'genre' };
  }
  return { ...FALLBACK, tier: 'fallback' };
}

/**
 * Dietary filters. `only` keeps recipes from these categories. TheMealDB files each recipe
 * under exactly one category, so "vegetarian" means recipes filed as Vegetarian or Vegan
 * (conservative), and the UI says so. Meat avoidance needs an ingredient scan (see avoid.js).
 */
export const DIETS = {
  vegetarian: { label: 'Vegetarian', only: ['Vegetarian', 'Vegan'] },
  vegan: { label: 'Vegan', only: ['Vegan'] },
  pescatarian: { label: 'Pescatarian', only: ['Seafood', 'Vegetarian', 'Vegan'] },
};

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

const MIN_RESULTS = 4;

/**
 * Finds recipes from a set of TheMealDB lists (areas and categories), applying a diet by
 * intersection and relaxing in announced stages when too few match. Each meal is tagged
 * with the list it came from (`from`), so cards can say "French" or "Dessert" without a
 * lookup per card.
 * @param {{areas?: string[], categories?: string[]}} plan
 * @param {{diet?: string, seed?: number, signal?: AbortSignal}} options
 * @param {{byArea: Function, byCategory: Function}} api  injected TheMealDB list functions
 * @returns {Promise<{meals: Array, relaxed: string}>}
 */
export async function findMeals({ areas = [], categories = [] }, { diet, seed = 1, signal } = {}, api) {
  const rule = DIETS[diet];
  const tag = (list, from) => list.map((m) => ({ ...m, from }));

  const [areaLists, categoryLists] = await Promise.all([
    Promise.all(areas.map(async (a) => tag(await api.byArea(a, { signal }), a))),
    Promise.all(categories.map(async (c) => tag(await api.byCategory(c, { signal }), c))),
  ]);
  let meals = interleave([...areaLists, ...categoryLists].map((l, i) => shuffle(l, seed + i)));
  let relaxed = '';

  if (rule) {
    const dietLists = await Promise.all(rule.only.map(async (c) => tag(await api.byCategory(c, { signal }), c)));
    const allowed = new Set(dietLists.flat().map((m) => m.id));
    const matched = meals.filter((m) => allowed.has(m.id));
    if (matched.length < MIN_RESULTS) {
      // Stage 2: keep the diet, drop the pairing, and say so rather than show an empty list.
      const diet = rule.label.toLowerCase();
      const place = areas[0] ?? categories[0] ?? '';
      const count = matched.length;
      relaxed = count
        ? `Only ${count} ${diet} ${place} ${count === 1 ? 'dish' : 'dishes'}, so we added ${diet} dishes from everywhere.`
        : `No ${diet} ${place} dishes, so here are ${diet} dishes from everywhere.`;
      meals = interleave([matched, interleave(dietLists.map((l, i) => shuffle(l, seed + 10 + i)))]);
    } else {
      meals = matched;
    }
  }
  return { meals, relaxed };
}

/**
 * Finds recipes paired with a movie (three tiers), with the "why" line.
 * @param {{movie: object, diet?: string, seed?: number, signal?: AbortSignal}} options
 */
export async function findPairedMeals({ movie = {}, diet, seed = 1, signal }, api) {
  const pairing = pairingFor(movie);
  const { meals, relaxed } = await findMeals(pairing, { diet, seed, signal }, api);
  return { meals, reason: pairing.reason, tier: pairing.tier, relaxed, sources: [...pairing.areas, ...pairing.categories] };
}

/** Categories offered when "Match the movie" is off (limited to what a diet allows). */
export const BROWSE_CATEGORIES = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Vegan', 'Dessert', 'Breakfast', 'Starter'];
export function browseCategories(diet) {
  return DIETS[diet]?.only ?? BROWSE_CATEGORIES;
}
