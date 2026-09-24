// Application state: House Rules (preferences), the date being planned, saved dates and
// the shortlist. Everything persists on this device only; share links carry plans elsewhere.
import { createStore } from './lib/store.js';
import { createPlan, upsertSaved, isComplete, samePairing } from './domain/plan.js';
import { DEFAULT_COOK_MINUTES } from './domain/night-plan.js';
import { detectRegion } from './api/tmdb.js';

export const DEFAULT_RULES = {
  region: detectRegion(),
  services: [], // TMDB provider ids; empty = don't filter
  maxCertification: '', // '' = any
  diet: '', // '' | 'vegetarian' | 'vegan' | 'pescatarian'
  drink: 'zero-proof', // 'zero-proof' | 'cocktail' | 'none'
  matchMovie: true, // vibe pairing on the recipe step
};

const initial = {
  rules: DEFAULT_RULES,
  draft: { movie: null, meal: null, drink: null, when: null, cookMinutes: DEFAULT_COOK_MINUTES, note: '' },
  saved: [],
  shortlist: [],
};

export const store = createStore(initial, {
  key: 'datelime.v2',
  version: 1,
  persist: ({ rules, draft, saved, shortlist }) => ({ rules, draft, saved, shortlist }),
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
