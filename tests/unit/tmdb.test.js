import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeMovie,
  normalizeMovieDetails,
  usCertification,
  watchProviders,
  pickTrailer,
  posterSrcset,
  discoverMovies,
} from '../../assets/js/api/tmdb.js';
import { clearHttpCache } from '../../assets/js/lib/http.js';

beforeEach(() => clearHttpCache());

test('normalizeMovie prefers the localized title and handles missing data', () => {
  const m = normalizeMovie({ id: 129, title: 'Spirited Away', original_title: '千と千尋の神隠し', release_date: '2001-07-20', poster_path: null, vote_average: 8.537, vote_count: 16000, genre_ids: [16, 10751] });
  assert.equal(m.title, 'Spirited Away');
  assert.equal(m.year, '2001');
  assert.equal(m.poster, null);
  assert.equal(m.rating, 8.5);
  assert.deepEqual(m.genreIds, [16, 10751]);
  assert.equal(normalizeMovie({ id: 1, vote_average: 0, vote_count: 0 }).rating, null);
  assert.equal(normalizeMovie({ id: 1 }).title, 'Untitled');
});

test('usCertification prefers theatrical releases and skips blanks', () => {
  const payload = {
    results: [
      { iso_3166_1: 'GB', release_dates: [{ certification: '15', type: 3 }] },
      { iso_3166_1: 'US', release_dates: [{ certification: '', type: 1 }, { certification: 'NR', type: 4 }, { certification: 'PG-13', type: 3 }] },
    ],
  };
  assert.equal(usCertification(payload), 'PG-13');
  assert.equal(usCertification({ results: [] }), '');
  assert.equal(usCertification(undefined), '');
});

test('watchProviders sorts by priority and returns null when empty', () => {
  const p = watchProviders({ results: { US: { link: 'https://tmdb/watch', flatrate: [{ provider_id: 9, provider_name: 'B', display_priority: 5 }, { provider_id: 8, provider_name: 'Netflix', display_priority: 1, logo_path: '/n.jpg' }], ads: [{ provider_id: 7, provider_name: 'Tubi', display_priority: 3 }] } } });
  assert.deepEqual(p.stream.map((x) => x.name), ['Netflix', 'B']);
  assert.deepEqual(p.free.map((x) => x.name), ['Tubi']);
  assert.equal(watchProviders({ results: { US: { link: 'x' } } }), null);
  assert.equal(watchProviders({ results: {} }), null);
});

test('pickTrailer prefers an official YouTube trailer', () => {
  const v = { results: [{ site: 'Vimeo', key: 'v', type: 'Trailer', official: true }, { site: 'YouTube', key: 't1', type: 'Teaser', official: true }, { site: 'YouTube', key: 't2', type: 'Trailer', official: false }, { site: 'YouTube', key: 't3', type: 'Trailer', official: true, name: 'Official Trailer' }] };
  assert.deepEqual(pickTrailer(v), { key: 't3', name: 'Official Trailer' });
  assert.equal(pickTrailer({ results: [{ site: 'YouTube', key: 'x', type: 'Featurette' }] }), null);
});

test('normalizeMovieDetails reads appended responses', () => {
  const d = normalizeMovieDetails({
    id: 1, title: 'X', runtime: 118, tagline: 'Hi', genres: [{ id: 35, name: 'Comedy' }],
    release_dates: { results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'R', type: 3 }] }] },
    'watch/providers': { results: { US: { link: 'l', flatrate: [{ provider_id: 1, provider_name: 'Max' }] } } },
    videos: { results: [] },
  });
  assert.equal(d.certification, 'R');
  assert.equal(d.runtime, 118);
  assert.deepEqual(d.genres, ['Comedy']);
  assert.equal(d.providers.stream[0].name, 'Max');
  assert.equal(d.trailer, null);
});

test('posterSrcset builds three widths', () => {
  assert.match(posterSrcset('/a.jpg'), /w185\/a\.jpg 185w, .*w342\/a\.jpg 342w, .*w500\/a\.jpg 500w/);
  assert.equal(posterSrcset(null), '');
});

test('discoverMovies sends the correct certification parameters (the old bug)', async () => {
  let url;
  globalThis.fetch = async (u) => {
    url = new URL(u);
    return new Response(JSON.stringify({ page: 1, total_pages: 900, total_results: 18000, results: [{ id: 1, title: 'A', vote_average: 7, vote_count: 10 }] }));
  };
  const res = await discoverMovies({ genreIds: [35, 10749], maxCertification: 'PG-13' });
  assert.equal(url.searchParams.get('certification_country'), 'US');
  assert.equal(url.searchParams.get('certification.lte'), 'PG-13');
  assert.equal(url.searchParams.get('certification'), null);
  assert.equal(url.searchParams.get('with_genres'), '35|10749');
  assert.equal(url.searchParams.get('include_adult'), 'false');
  assert.equal(res.totalPages, 500);
  assert.equal(res.movies[0].title, 'A');
});

test('detectRegion reads the browser locale and falls back to US', async () => {
  const { detectRegion } = await import('../../assets/js/api/tmdb.js');
  assert.equal(detectRegion('en-GB'), 'GB');
  assert.equal(detectRegion('fr'), 'FR');
  assert.equal(detectRegion('en-US'), 'US');
  assert.equal(detectRegion('not a locale!'), 'US');
  assert.equal(detectRegion(undefined), 'US');
});

test('discoverMovies filters by streaming services in ONE request', async () => {
  const { discoverMovies } = await import('../../assets/js/api/tmdb.js');
  const urls = [];
  globalThis.fetch = async (u) => {
    urls.push(new URL(u));
    return new Response(JSON.stringify({ page: 1, total_pages: 1, total_results: 0, results: [] }));
  };
  await discoverMovies({ genreIds: [35, 10749], matchAllGenres: true, providerIds: [8, 337], region: 'GB', sort: 'acclaimed' });
  assert.equal(urls.length, 1);
  const q = urls[0].searchParams;
  assert.equal(q.get('with_genres'), '35,10749');
  assert.equal(q.get('with_watch_providers'), '8|337');
  assert.equal(q.get('watch_region'), 'GB');
  assert.equal(q.get('with_watch_monetization_types'), 'flatrate|free|ads');
  assert.equal(q.get('sort_by'), 'vote_average.desc');
  assert.equal(q.get('vote_count.gte'), '500');
});

test('watchProviderCatalog sorts by the region priority', async () => {
  const { watchProviderCatalog } = await import('../../assets/js/api/tmdb.js');
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ results: [
      { provider_id: 9, provider_name: 'Prime', display_priorities: { GB: 3 } },
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.jpg', display_priorities: { GB: 1 } },
      { provider_id: 1, provider_name: 'Obscure', display_priority: 50 },
    ] }));
  const list = await watchProviderCatalog('GB');
  assert.deepEqual(list.map((p) => p.name), ['Netflix', 'Prime', 'Obscure']);
});
