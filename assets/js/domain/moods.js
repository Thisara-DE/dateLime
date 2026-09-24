// The movie step: one radio group of moods, each labelled with its genres so the
// choice stays literal (WCAG 2.4.6). Two curated blends require BOTH genres (AND).

export const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const genreName = (id) => GENRES.find((g) => g.id === Number(id))?.name ?? '';

export const MOODS = [
  { id: 'any', label: 'Any', genreLabel: 'Popular right now', genres: [] },
  { id: 'swoony', label: 'Swoony', genreLabel: 'Romance', genres: [10749] },
  { id: 'belly-laughs', label: 'Belly laughs', genreLabel: 'Comedy', genres: [35] },
  { id: 'rom-com', label: 'Rom-com', genreLabel: 'Romance and Comedy', genres: [35, 10749], all: true },
  { id: 'edge-of-seat', label: 'Edge of your seat', genreLabel: 'Thriller', genres: [53] },
  { id: 'scream', label: 'Scream together', genreLabel: 'Horror', genres: [27] },
  { id: 'scary-funny', label: 'Scary-funny', genreLabel: 'Horror and Comedy', genres: [27, 35], all: true },
  { id: 'tearjerker', label: 'Tearjerker', genreLabel: 'Drama', genres: [18] },
  { id: 'mind-bender', label: 'Mind-bender', genreLabel: 'Sci-fi, Mystery', genres: [878, 9648] },
];

export const LENGTHS = [
  { id: 'any', label: 'Any length', maxRuntime: undefined },
  { id: 'short', label: 'Under 1h 45m', maxRuntime: 105 },
  { id: 'standard', label: 'Under 2h 15m', maxRuntime: 135 },
];

export const CERTIFICATIONS = [
  { id: '', label: 'Any' },
  { id: 'G', label: 'G' },
  { id: 'PG', label: 'PG' },
  { id: 'PG-13', label: 'PG-13' },
  { id: 'R', label: 'R' },
];

/** A blend with fewer results than this relaxes from AND to OR (and says so). */
export const BLEND_MIN_RESULTS = 8;

/**
 * Turns the movie-step query (URL params) into a Discover query.
 * Accepts `mood` (a MOODS id) or `genre` (a TMDB genre id, e.g. from the 2022 URLs).
 */
export function movieQuery({ mood, genre, len, cert } = {}, rules = {}) {
  const byGenre = GENRES.find((g) => g.id === Number(genre));
  const chosen = byGenre
    ? { id: `genre-${byGenre.id}`, label: byGenre.name, genreLabel: byGenre.name, genres: [byGenre.id] }
    : (MOODS.find((m) => m.id === mood) ?? MOODS[0]);
  const length = LENGTHS.find((l) => l.id === len) ?? LENGTHS[0];
  // "any" explicitly lifts the House Rules cap for this search (used by "Allow any rating").
  const certification = cert === 'any' ? '' : CERTIFICATIONS.some((c) => c.id === cert && c.id) ? cert : (rules.maxCertification ?? '');
  return {
    mood: chosen,
    length,
    maxCertification: certification,
    genreIds: chosen.genres,
    matchAllGenres: Boolean(chosen.all),
    maxRuntime: length.maxRuntime,
    providerIds: (rules.services ?? []).map((service) => (typeof service === 'object' ? service.id : service)),
    region: rules.region,
  };
}
