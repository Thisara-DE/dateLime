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
    certification: usCertification(raw.release_dates),
    providers: watchProviders(raw['watch/providers'], region),
    trailer: pickTrailer(raw.videos),
  };
}

/**
 * Discover movies.
 * @param {{genreIds?: number[], maxCertification?: string, page?: number, minVotes?: number,
 *          maxRuntime?: number, signal?: AbortSignal}} query
 */
export async function discoverMovies({ genreIds = [], maxCertification, page = 1, minVotes = 150, maxRuntime, signal } = {}) {
  const params = {
    sort_by: 'popularity.desc',
    include_adult: 'false',
    include_video: 'false',
    'vote_count.gte': minVotes,
    with_genres: genreIds.join('|'), // "|" = any of these genres
    page,
    'with_runtime.lte': maxRuntime,
  };
  if (maxCertification) {
    params.certification_country = TMDB.region; // the old app sent certification=US, which TMDB ignores
    params['certification.lte'] = maxCertification;
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
export async function getMovie(id, { signal } = {}) {
  const raw = await getJSON(
    endpoint(`/movie/${encodeURIComponent(id)}`, { append_to_response: 'release_dates,watch/providers,videos' }),
    { signal },
  );
  return normalizeMovieDetails(raw);
}
