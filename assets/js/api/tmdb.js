// The Movie Database (TMDB) v3 client. Returns small, normalized objects so views never
// touch raw API shapes. Attribution: "This product uses the TMDB API but is not endorsed
// or certified by TMDB." Watch-provider data is supplied by JustWatch.
import { TMDB } from '../config.js';
import { getJSON } from '../lib/http.js';

/** US certifications in ascending order, as TMDB's `certification.lte` filter expects. */
export const US_CERTIFICATIONS = ['G', 'PG', 'PG-13', 'R'];

function endpoint(path, params = {}) {
  const url = new URL(TMDB.baseUrl + path);
  url.searchParams.set('api_key', TMDB.apiKey);
  url.searchParams.set('language', TMDB.language);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }
  return url.href;
}

export function tmdbImage(path, size = 'w342') {
  return path ? `${TMDB.imageBase}/${size}${path}` : '';
}

/** A responsive srcset for posters (2:3). */
export function posterSrcset(path) {
  if (!path) return '';
  return ['w185', 'w342', 'w500'].map((size) => `${tmdbImage(path, size)} ${size.slice(1)}w`).join(', ');
}

export function normalizeMovie(raw) {
  return {
    id: raw.id,
    title: raw.title || raw.original_title || 'Untitled',
    year: raw.release_date ? raw.release_date.slice(0, 4) : '',
    overview: raw.overview || '',
    poster: raw.poster_path || null,
    backdrop: raw.backdrop_path || null,
    rating: typeof raw.vote_average === 'number' && raw.vote_count > 0 ? Math.round(raw.vote_average * 10) / 10 : null,
    genreIds: raw.genre_ids ?? (raw.genres ?? []).map((g) => g.id),
    originalLanguage: raw.original_language || '',
  };
}

// TMDB release types, most authoritative first: theatrical, limited, digital, physical, TV, premiere.
const RELEASE_TYPE_PRIORITY = [3, 2, 4, 5, 6, 1];
const releaseRank = (type) => RELEASE_TYPE_PRIORITY.indexOf(type) + 1 || 99;

/** Picks the US certification from a release_dates payload (theatrical release first). */
export function usCertification(releaseDates) {
  const us = releaseDates?.results?.find((r) => r.iso_3166_1 === 'US');
  if (!us) return '';
  const byType = [...(us.release_dates ?? [])].sort((a, b) => releaseRank(a.type) - releaseRank(b.type));
  return byType.find((d) => d.certification?.trim())?.certification.trim() ?? '';
}

function providerList(list = []) {
  return [...list]
    .sort((a, b) => (a.display_priority ?? 99) - (b.display_priority ?? 99))
    .map((p) => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path || null }));
}

/** Streaming availability for one region, or null when TMDB has none. */
export function watchProviders(payload, region = TMDB.region) {
  const entry = payload?.results?.[region];
  if (!entry) return null;
  const providers = {
    link: entry.link || '',
    stream: providerList(entry.flatrate),
    free: providerList([...(entry.free ?? []), ...(entry.ads ?? [])]),
    rent: providerList(entry.rent),
    buy: providerList(entry.buy),
  };
  const any = providers.stream.length || providers.free.length || providers.rent.length || providers.buy.length;
  return any ? providers : null;
}

/** Prefers an official YouTube trailer, then any trailer, then a teaser. */
export function pickTrailer(videos) {
  const youtube = (videos?.results ?? []).filter((v) => v.site === 'YouTube' && v.key);
  const score = (v) => (v.type === 'Trailer' ? 0 : v.type === 'Teaser' ? 2 : 4) + (v.official ? 0 : 1);
  const best = youtube.filter((v) => v.type === 'Trailer' || v.type === 'Teaser').sort((a, b) => score(a) - score(b))[0];
  return best ? { key: best.key, name: best.name || 'Trailer' } : null;
}

export function normalizeMovieDetails(raw, region = TMDB.region) {
  return {
    ...normalizeMovie(raw),
    tagline: raw.tagline || '',
    runtime: raw.runtime || null,
    genres: (raw.genres ?? []).map((g) => g.name),
    originCountries: raw.origin_country ?? (raw.production_countries ?? []).map((c) => c.iso_3166_1),
    certification: usCertification(raw.release_dates),
    providers: watchProviders(raw['watch/providers'], region),
    trailer: pickTrailer(raw.videos),
  };
}

/** Region for watch providers, from the browser locale ("en-GB" -> "GB"), defaulting to US. */
export function detectRegion(locale = globalThis.navigator?.language) {
  try {
    const region = new Intl.Locale(locale).maximize().region;
    return /^[A-Z]{2}$/.test(region ?? '') ? region : TMDB.region;
  } catch {
    return TMDB.region;
  }
}

/** Streaming services available in a region, most popular first. */
export async function watchProviderCatalog(region = TMDB.region, { signal } = {}) {
  const data = await getJSON(endpoint('/watch/providers/movie', { watch_region: region }), { signal, cacheFor: 24 * 60 * 60_000 });
  return (data.results ?? [])
    .map((p) => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path || null, priority: p.display_priorities?.[region] ?? p.display_priority ?? 999 }))
    .sort((a, b) => a.priority - b.priority);
}

export const SORTS = {
  popular: { sort_by: 'popularity.desc' },
  acclaimed: { sort_by: 'vote_average.desc', 'vote_count.gte': 500 },
  newest: { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': new Date().toISOString().slice(0, 10) },
};

/**
 * Discover movies.
 * @param {{genreIds?: number[], matchAllGenres?: boolean, maxCertification?: string, page?: number,
 *          minVotes?: number, minRating?: number, maxRuntime?: number, providerIds?: number[],
 *          region?: string, sort?: keyof SORTS, signal?: AbortSignal}} query
 */
export async function discoverMovies({
  genreIds = [],
  matchAllGenres = false,
  maxCertification,
  page = 1,
  minVotes = 150,
  minRating,
  maxRuntime,
  providerIds = [],
  region = TMDB.region,
  sort = 'popular',
  signal,
} = {}) {
  const params = {
    include_adult: 'false',
    include_video: 'false',
    'vote_count.gte': minVotes,
    'vote_average.gte': minRating,
    with_genres: genreIds.join(matchAllGenres ? ',' : '|'), // "," = all of, "|" = any of
    page,
    'with_runtime.lte': maxRuntime,
    ...(SORTS[sort] ?? SORTS.popular),
  };
  if (maxCertification) {
    params.certification_country = 'US'; // the old app sent certification=US, which TMDB ignores
    params['certification.lte'] = maxCertification;
  }
  if (providerIds.length) {
    // One request filters by service. The old app made 20 to 40 provider calls per page instead.
    params.with_watch_providers = providerIds.join('|');
    params.watch_region = region;
    params.with_watch_monetization_types = 'flatrate|free|ads';
  }
  const data = await getJSON(endpoint('/discover/movie', params), { signal });
  return {
    page: data.page ?? page,
    totalPages: Math.min(data.total_pages ?? 1, 500), // TMDB serves at most 500 pages
    totalResults: data.total_results ?? 0,
    movies: (data.results ?? []).map(normalizeMovie),
  };
}

/** Full details for one movie: runtime, real US certification, providers and trailer in one request. */
export async function getMovie(id, { region = TMDB.region, signal } = {}) {
  const raw = await getJSON(
    endpoint(`/movie/${encodeURIComponent(id)}`, { append_to_response: 'release_dates,watch/providers,videos' }),
    { signal },
  );
  return normalizeMovieDetails(raw, region);
}
