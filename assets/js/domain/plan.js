// A date plan is a movie + a meal (+ optional drink and time). Plans store compact
// snapshots so the saved-dates list renders instantly without network requests.

const MAX_SAVED = 50;

export function movieSnapshot(m) {
  if (!m) return null;
  return {
    id: m.id,
    title: m.title,
    year: m.year || '',
    poster: m.poster || null,
    runtime: m.runtime || null,
    certification: m.certification || '',
    rating: m.rating ?? null,
    genreIds: m.genreIds ?? [],
  };
}

export function mealSnapshot(m) {
  if (!m) return null;
  return { id: String(m.id), name: m.name, thumb: m.thumb || '', area: m.area || '', category: m.category || '' };
}

export function drinkSnapshot(d) {
  if (!d) return null;
  return { id: String(d.id), name: d.name, thumb: d.thumb || '', alcoholic: Boolean(d.alcoholic) };
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createPlan({ movie, meal, drink = null, when = null, vibe = null, id = newId(), createdAt = new Date().toISOString() }) {
  return {
    id,
    createdAt,
    vibe,
    when,
    movie: movieSnapshot(movie),
    meal: mealSnapshot(meal),
    drink: drinkSnapshot(drink),
  };
}

export const isComplete = (plan) => Boolean(plan?.movie?.id && plan?.meal?.id);

/** Two plans are the same date if they pair the same movie, meal and drink. */
export const samePairing = (a, b) =>
  a?.movie?.id === b?.movie?.id && a?.meal?.id === b?.meal?.id && (a?.drink?.id ?? null) === (b?.drink?.id ?? null);

/** Adds (or refreshes) a plan at the top of the saved list, without duplicates, capped in size. */
export function upsertSaved(saved, plan) {
  const rest = saved.filter((p) => p.id !== plan.id && !samePairing(p, plan));
  return [plan, ...rest].slice(0, MAX_SAVED);
}

// ---- Share links --------------------------------------------------------------------
// Only ids travel in the URL (short, and no personal data beyond an optional note); the
// recipient's browser fetches the details itself.

const WHEN_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function toShareQuery(plan, note = '') {
  const query = { m: plan.movie?.id, r: plan.meal?.id };
  if (plan.drink?.id) query.d = plan.drink.id;
  if (plan.when && WHEN_PATTERN.test(plan.when)) query.at = plan.when;
  const trimmed = note.trim().slice(0, 140);
  if (trimmed) query.note = trimmed;
  return query;
}

/** Validates an incoming share query. Returns null when it isn't a usable plan. */
export function fromShareQuery(query = {}) {
  const movieId = /^\d{1,9}$/.test(query.m ?? '') ? Number(query.m) : null;
  const mealId = /^\d{1,9}$/.test(query.r ?? '') ? query.r : null;
  if (!movieId || !mealId) return null;
  return {
    movieId,
    mealId,
    drinkId: /^\d{1,9}$/.test(query.d ?? '') ? query.d : null,
    when: WHEN_PATTERN.test(query.at ?? '') ? query.at : null,
    note: typeof query.note === 'string' ? query.note.slice(0, 140) : '',
  };
}
