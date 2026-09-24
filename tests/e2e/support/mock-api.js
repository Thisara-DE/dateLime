// Intercepts every third-party request the app makes and answers from deterministic data.
// Usage in a test:
//   const api = await mockApis(page, { fail: { tmdb: 500 } });
//   ...
//   expect(api.calls.tmdb.length).toBe(1);
import { MOVIES, MEALS, DRINKS, PROVIDERS } from './data.js';
import { genreName } from '../../../assets/js/domain/moods.js';

const CERT_ORDER = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const PAGE_SIZE = 20;

const hue = (seed) => [...String(seed)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 360, 7);

function escapeXml(s) {
  return String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
}

function posterSvg(label, seed) {
  const h = hue(seed);
  const words = String(label).split(/\s+/);
  const lines = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + w).length <= 12) lines[lines.length - 1] = `${last} ${w}`;
    else lines.push(w);
  }
  const text = lines
    .slice(0, 4)
    .map((l, i) => `<text x="30" y="${520 + i * 44}" font-family="sans-serif" font-weight="700" font-size="38" fill="#fff">${escapeXml(l)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 60% 42%)"/><stop offset="1" stop-color="hsl(${(h + 60) % 360} 55% 18%)"/></linearGradient></defs><rect width="500" height="750" fill="url(#g)"/><circle cx="380" cy="160" r="90" fill="hsl(${(h + 180) % 360} 70% 70% / .35)"/>${text}</svg>`;
}

function foodSvg(label, seed) {
  const h = (hue(seed) % 50) + 10; // warm hues
  return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700" viewBox="0 0 700 700"><rect width="700" height="700" fill="hsl(${h} 45% 35%)"/><circle cx="350" cy="350" r="250" fill="#f4efe6"/><circle cx="350" cy="350" r="190" fill="hsl(${h + 10} 70% 55%)"/><circle cx="300" cy="300" r="40" fill="hsl(${h + 90} 50% 45%)"/><circle cx="410" cy="390" r="30" fill="hsl(${h - 10} 80% 40%)"/><text x="350" y="670" text-anchor="middle" font-family="sans-serif" font-size="34" fill="#fff">${escapeXml(label)}</text></svg>`;
}

const logoSvg = (label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="92" height="92"><rect width="92" height="92" rx="18" fill="hsl(${hue(label)} 60% 40%)"/><text x="46" y="58" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="34" fill="#fff">${escapeXml(label.slice(0, 2))}</text></svg>`;

// Origin countries and keywords drive the three-tier vibe pairing.
const ORIGINS = { 194: ['FR'], 129: ['JP'], 372058: ['JP'], 11216: ['IT'], 398818: ['IT'], 496243: ['KR'], 4348: ['GB'], 530915: ['GB'] };
const KEYWORDS = { 289: ['casablanca', 'morocco', 'world war ii'], 354912: ['mexico', 'day of the dead', 'music'], 313369: ['los angeles', 'jazz'], 597: ['ocean', 'ship'] };

function movieDetails(m) {
  const providerSet = PROVIDERS.filter((_, i) => (m.id + i) % 3 === 0);
  return {
    ...m,
    origin_country: ORIGINS[m.id] ?? ['US'],
    keywords: { keywords: (KEYWORDS[m.id] ?? []).map((name, i) => ({ id: i + 1, name })) },
    tagline: `${m.title}: a night to remember.`,
    genres: m.genre_ids.map((id) => ({ id, name: genreName(id) })),
    release_dates: {
      results: [
        { iso_3166_1: 'GB', release_dates: [{ certification: '15', type: 3 }] },
        { iso_3166_1: 'US', release_dates: [{ certification: '', type: 1 }, { certification: m.cert, type: 3 }] },
      ],
    },
    'watch/providers': {
      results:
        m.id === 11324 // one title with no streaming data at all
          ? {}
          : { US: { link: `https://www.themoviedb.org/movie/${m.id}/watch?locale=US`, flatrate: providerSet.length ? providerSet : [PROVIDERS[0]], rent: [PROVIDERS[3]] } },
    },
    videos: { results: [{ site: 'YouTube', key: `trailer${m.id}`, type: 'Trailer', official: true, name: 'Official Trailer' }] },
  };
}

function discover(params) {
  const genres = (params.get('with_genres') || '').split(/[|,]/).filter(Boolean).map(Number);
  const matchAll = (params.get('with_genres') || '').includes(',');
  const certMax = params.get('certification.lte');
  const runtimeMax = Number(params.get('with_runtime.lte')) || Infinity;
  const page = Number(params.get('page') || 1);
  let list = MOVIES.filter((m) => {
    if (genres.length && !(matchAll ? genres.every((g) => m.genre_ids.includes(g)) : genres.some((g) => m.genre_ids.includes(g)))) return false;
    if (certMax && CERT_ORDER.indexOf(m.cert) > CERT_ORDER.indexOf(certMax)) return false;
    return m.runtime <= runtimeMax;
  });
  list = list.sort((a, b) => b.popularity - a.popularity);
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const results = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(({ cert: _c, runtime: _r, ...rest }) => rest);
  return { page, results, total_pages: totalPages, total_results: list.length };
}

function mealList(meals) {
  return { meals: meals.length ? meals.map(({ idMeal, strMeal, strMealThumb }) => ({ idMeal, strMeal, strMealThumb })) : null };
}

function drinkList(drinks) {
  return { drinks: drinks.length ? drinks.map(({ idDrink, strDrink, strDrinkThumb }) => ({ idDrink, strDrink, strDrinkThumb })) : null };
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{fail?: {tmdb?: number|'network', mealdb?: number|'network', cocktaildb?: number|'network'}, delay?: number}} [options]
 */
export async function mockApis(page, { fail = {}, delay = 0 } = {}) {
  const calls = { tmdb: [], mealdb: [], cocktaildb: [], images: [], unexpected: [] };
  let randomIndex = 0;

  await page.route(
    (url) => url.hostname !== 'localhost',
    async (route) => {
      const url = new URL(route.request().url());
      const host = url.hostname;
      const failWith = async (mode) => (mode === 'network' ? route.abort('internetdisconnected') : route.fulfill({ status: mode, json: { status_message: 'mock failure' } }));
      if (delay) await new Promise((r) => setTimeout(r, delay));

      if (host === 'api.themoviedb.org') {
        calls.tmdb.push(url);
        if (fail.tmdb) return failWith(fail.tmdb);
        if (url.pathname === '/3/discover/movie') return route.fulfill({ json: discover(url.searchParams) });
        if (url.pathname === '/3/watch/providers/movie') {
          const region = url.searchParams.get('watch_region');
          return route.fulfill({ json: { results: PROVIDERS.map((p) => ({ ...p, display_priorities: { [region]: p.display_priority } })) } });
        }
        const detail = url.pathname.match(/^\/3\/movie\/(\d+)$/);
        if (detail) {
          const movie = MOVIES.find((m) => m.id === Number(detail[1]));
          return movie ? route.fulfill({ json: movieDetails(movie) }) : route.fulfill({ status: 404, json: { status_code: 34, status_message: 'The resource you requested could not be found.' } });
        }
        return route.fulfill({ status: 404, json: {} });
      }

      if (host === 'image.tmdb.org') {
        calls.images.push(url);
        const id = url.pathname.match(/(?:poster|backdrop)-(\d+)/)?.[1];
        const logo = url.pathname.match(/logo-(\w+)/)?.[1];
        const title = MOVIES.find((m) => String(m.id) === id)?.title ?? logo ?? 'Movie';
        return route.fulfill({ contentType: 'image/svg+xml', body: logo ? logoSvg(logo) : posterSvg(title, id) });
      }

      if (host === 'www.themealdb.com') {
        if (url.pathname.startsWith('/images/')) {
          calls.images.push(url);
          const id = url.pathname.match(/mock-(\d+)/)?.[1];
          return route.fulfill({ contentType: 'image/svg+xml', body: foodSvg(MEALS.find((m) => m.idMeal === id)?.strMeal ?? 'Dish', id) });
        }
        calls.mealdb.push(url);
        if (fail.mealdb) return failWith(fail.mealdb);
        const q = url.searchParams;
        const endpoint = url.pathname.split('/').pop();
        if (endpoint === 'filter.php') {
          if (q.has('a')) return route.fulfill({ json: mealList(MEALS.filter((m) => m.strArea === q.get('a'))) });
          if (q.has('c')) return route.fulfill({ json: mealList(MEALS.filter((m) => m.strCategory === q.get('c'))) });
          if (q.has('i')) return route.fulfill({ json: mealList(MEALS.filter((m) => Object.keys(m).some((k) => k.startsWith('strIngredient') && m[k]?.toLowerCase() === q.get('i').replace(/_/g, ' ').toLowerCase()))) });
        }
        if (endpoint === 'lookup.php') {
          const found = MEALS.filter((m) => m.idMeal === q.get('i'));
          return route.fulfill({ json: { meals: found.length ? found : null } });
        }
        if (endpoint === 'random.php') return route.fulfill({ json: { meals: [MEALS[randomIndex++ % MEALS.length]] } });
        if (endpoint === 'search.php') {
          const found = MEALS.filter((m) => m.strMeal.toLowerCase().includes((q.get('s') || '').toLowerCase()));
          return route.fulfill({ json: { meals: found.length ? found : null } });
        }
        return route.fulfill({ json: { meals: null } });
      }

      if (host === 'www.thecocktaildb.com') {
        if (url.pathname.startsWith('/images/')) {
          calls.images.push(url);
          return route.fulfill({ contentType: 'image/svg+xml', body: foodSvg('Drink', url.pathname) });
        }
        calls.cocktaildb.push(url);
        if (fail.cocktaildb) return failWith(fail.cocktaildb);
        const q = url.searchParams;
        const endpoint = url.pathname.split('/').pop();
        if (endpoint === 'filter.php') {
          if (q.get('a') === 'Non_Alcoholic') return route.fulfill({ json: drinkList(DRINKS.filter((d) => d.strAlcoholic === 'Non alcoholic')) });
          if (q.get('a') === 'Alcoholic') return route.fulfill({ json: drinkList(DRINKS.filter((d) => d.strAlcoholic === 'Alcoholic')) });
          if (q.has('i')) return route.fulfill({ json: drinkList(DRINKS) });
        }
        if (endpoint === 'lookup.php') {
          const found = DRINKS.filter((d) => d.idDrink === q.get('i'));
          return route.fulfill({ json: { drinks: found.length ? found : null } });
        }
        if (endpoint === 'random.php') return route.fulfill({ json: { drinks: [DRINKS[randomIndex++ % DRINKS.length]] } });
        return route.fulfill({ json: { drinks: null } });
      }

      calls.unexpected.push(url.href);
      return route.fulfill({ status: 404, body: '' });
    },
  );

  return { calls };
}
