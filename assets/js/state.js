// Application state: House Rules (preferences), the date being planned, saved dates and
// the shortlist. Everything persists on this device only; share links carry plans elsewhere.
import { createStore } from './lib/store.js';
import { createPlan, upsertSaved, isComplete, samePairing } from './domain/plan.js';
import { DEFAULT_COOK_MINUTES } from './domain/night-plan.js';
import { detectRegion } from './api/tmdb.js';

export const DEFAULT_RULES = {
  region: detectRegion(),
  services: [], // [{id, name, logo}] TMDB providers; empty = don't filter
  maxCertification: '', // '' = any
  diet: '', // '' | 'vegetarian' | 'vegan' | 'pescatarian'
  drink: 'zero-proof', // 'zero-proof' | 'cocktail' | 'none'
  matchMovie: true, // vibe pairing on the recipe step
  avoid: [], // keys of AVOID (best-effort ingredient scan)
};

const initial = {
  rules: DEFAULT_RULES,
  draft: { movie: null, meal: null, drink: null, when: null, cookMinutes: DEFAULT_COOK_MINUTES, note: '' },
  saved: [],
  together: null, // blind shortlist: { key, phase, first: [], second: [], movies: {} }
};

export const store = createStore(initial, {
  key: 'datelime.v2',
  version: 1,
  persist: ({ rules, draft, saved, together }) => ({ rules, draft, saved, together }),
});

// ---- Rules ---------------------------------------------------------------------------
export const getRules = () => ({ ...DEFAULT_RULES, ...store.get().rules });
export const updateRules = (patch) => store.set((s) => ({ rules: { ...s.rules, ...patch } }));

// ---- Draft plan ----------------------------------------------------------------------
export const getDraft = () => store.get().draft;
export const updateDraft = (patch) => store.set((s) => ({ draft: { ...s.draft, ...patch } }));
export function resetDraft() {
  store.set({ draft: { ...initial.draft, cookMinutes: getDraft().cookMinutes ?? DEFAULT_COOK_MINUTES } });
}

// ---- Decide together (blind shortlist) -------------------------------------------------
export const MAX_HEARTS = 3;
export const getTogether = () => store.get().together;

/** Starts (or resumes) a session for a given results query. */
export function startTogether(key) {
  const current = getTogether();
  if (current?.key === key) return current;
  const fresh = { key, phase: 'first', first: [], second: [], movies: {} };
  store.set({ together: fresh });
  return fresh;
}

export function setTogether(patch) {
  store.set((s) => ({ together: s.together ? { ...s.together, ...patch } : null }));
}

export const endTogether = () => store.set({ together: null });

/**
 * Hearts or un-hearts a movie for whoever holds the phone.
 * @returns {'added'|'removed'|'full'}
 */
export function toggleHeart(movie) {
  const t = getTogether();
  if (!t || (t.phase !== 'first' && t.phase !== 'second')) return 'full';
  const list = t[t.phase];
  if (list.includes(movie.id)) {
    setTogether({ [t.phase]: list.filter((id) => id !== movie.id) });
    return 'removed';
  }
  if (list.length >= MAX_HEARTS) return 'full';
  setTogether({ [t.phase]: [...list, movie.id], movies: { ...t.movies, [movie.id]: movie } });
  return 'added';
}

/** Overlaps win; with none, the second person picks from everything hearted (at most 6). */
export function revealTogether(t = getTogether()) {
  const matches = t.first.filter((id) => t.second.includes(id));
  const pool = matches.length ? matches : [...new Set([...t.first, ...t.second])];
  return { matched: matches.length > 0, movies: pool.map((id) => t.movies[id]).filter(Boolean) };
}

// ---- Saved dates ---------------------------------------------------------------------
export const getSaved = () => store.get().saved ?? [];

/** Saves the draft (or a given plan). Returns the saved plan, or null if it isn't complete. */
export function saveDate(plan = null) {
  const draft = getDraft();
  const toSave =
    plan ??
    createPlan({ movie: draft.movie, meal: draft.meal, drink: draft.drink, when: draft.when, id: draft.savedId || undefined });
  if (!isComplete(toSave)) return null;
  store.set((s) => ({ saved: upsertSaved(s.saved ?? [], toSave) }));
  if (!plan) updateDraft({ savedId: toSave.id });
  return toSave;
}

export function isDraftSaved() {
  const draft = getDraft();
  return getSaved().some((p) => p.id === draft.savedId || samePairing(p, createPlan({ movie: draft.movie, meal: draft.meal, drink: draft.drink })));
}

export function removeSaved(id) {
  const before = getSaved();
  const index = before.findIndex((p) => p.id === id);
  if (index < 0) return null;
  const removed = before[index];
  store.set({ saved: before.filter((p) => p.id !== id) });
  // Undo puts it back where it was.
  return () => store.set((s) => ({ saved: [...s.saved.slice(0, index), removed, ...s.saved.slice(index)] }));
}

/** Afterglow: rate a past date (1-5 limes), or pass null to clear the rating. */
export function rateSaved(id, rating) {
  store.set((s) => ({ saved: s.saved.map((p) => (p.id === id ? { ...p, rating } : p)) }));
}

// ---- Diary export / import (Safari may evict storage after 7 idle days) ---------------
export function exportDiary() {
  return JSON.stringify({ app: 'dateLime', version: 1, exportedAt: new Date().toISOString(), dates: getSaved() }, null, 2);
}

/** Merges dates from an export file. Returns how many were added. Throws on invalid files. */
export function importDiary(text) {
  const data = JSON.parse(text);
  if (data?.app !== 'dateLime' || !Array.isArray(data.dates)) throw new Error('This file is not a dateLime diary export.');
  const valid = data.dates.filter((p) => isComplete(p) && typeof p.id === 'string');
  let saved = getSaved();
  let added = 0;
  for (const plan of valid.reverse()) {
    if (!saved.some((p) => p.id === plan.id || samePairing(p, plan))) added += 1;
    saved = upsertSaved(saved, plan);
  }
  store.set({ saved });
  return added;
}
