// Step 2 of 3: the meal. Vibe Pairing picks TheMealDB lists for the chosen movie and says why.
import { html, render, href, icon, steps, on, plate, skeletonCards, errorState, emptyState, pluralize } from '../ui.js';
import { mealsByArea, mealsByCategory, getMeal } from '../api/mealdb.js';
import { findPairedMeals, findMeals, DIETS, browseCategories } from '../domain/pairing.js';
import { AVOID, avoidMatches } from '../domain/avoid.js';
import { getDraft, updateDraft, getRules, updateRules } from '../state.js';
import { openRecipeSheet } from '../components/recipe-sheet.js';
import { announce } from '../lib/announce.js';
import { isAbortError } from '../lib/http.js';
import { navigate } from '../lib/navigate.js';

export const title = () => 'Pick a meal';

const PAGE = 12;
const api = { byArea: mealsByArea, byCategory: mealsByCategory };

function chip({ name, value, checked, label, type = 'radio' }) {
  return html`<label class="chip"><input type="${type}" name="${name}" value="${value}" ${checked ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${label}</label>`;
}

export function mount(outlet, { signal }) {
  const draft = getDraft();
  if (!draft.movie) {
    render(
      outlet,
      html`<div class="page page--narrow">${steps('/recipes')}${emptyState({ title: 'Pick a movie first', body: 'The meal is matched to the movie, so we start there.', actions: html`<a class="button button--primary" href="${href('/movies')}">Pick a movie</a>`, level: 1 })}</div>`,
    );
    return;
  }

  const movie = draft.movie;
  const state = { meals: [], reason: '', relaxed: '', shown: PAGE, seed: movie.id % 997, loading: true, error: null, category: '' };
  const scan = new Map(); // meal id -> 'pending' | [] (no flags) | [flags]
  let generation = 0;

  const visibleMeals = () => {
    const rules = getRules();
    if (!rules.avoid.length) return state.meals.slice(0, state.shown);
    const out = [];
    for (const m of state.meals) {
      const flags = scan.get(m.id);
      if (Array.isArray(flags) && flags.length) continue; // hidden: lists an avoided food
      out.push(m);
      if (out.length >= state.shown) break;
    }
    return out;
  };
  const hiddenCount = () => [...scan.values()].filter((f) => Array.isArray(f) && f.length).length;

  function card(meal) {
    return html`<li><article class="card recipe-card" aria-labelledby="meal-${meal.id}">
      ${plate(meal, { round: true })}
      <h3 class="recipe-card__title" id="meal-${meal.id}"><button type="button" data-open="${meal.id}" aria-haspopup="dialog">${meal.name}</button></h3>
      ${meal.from ? html`<p class="meta"><span>${meal.from}</span></p>` : ''}
    </article></li>`;
  }

  function controls() {
    const rules = getRules();
    const cats = browseCategories(rules.diet);
    return html`<div class="stack">
      <label class="switch"><input type="checkbox" data-match ${rules.matchMovie ? html`checked` : ''}> Match the movie</label>
      ${rules.matchMovie
        ? ''
        : html`<fieldset class="field"><legend>What sounds good?</legend><div class="chips" data-category-group>${chip({ name: 'category', value: '', checked: !state.category, label: 'A bit of everything' })}${cats.map((c) => chip({ name: 'category', value: c, checked: state.category === c, label: c }))}</div></fieldset>`}
      <fieldset class="field"><legend>Diet</legend><p class="field__hint">Saved to your house rules. Vegetarian means recipes TheMealDB files as vegetarian or vegan.</p><div class="chips">${chip({ name: 'diet', value: '', checked: !rules.diet, label: 'Anything' })}${Object.entries(DIETS).map(([key, d]) => chip({ name: 'diet', value: key, checked: rules.diet === key, label: d.label }))}</div></fieldset>
      <details class="more" ${rules.avoid.length ? html`open` : ''}><summary>Foods to avoid${rules.avoid.length ? ` (${rules.avoid.length})` : ''}</summary>
        <p class="field__hint">Best effort: we check ingredient lists only, so always double-check for allergies.</p>
        <div class="chips">${Object.entries(AVOID).map(([key, a]) => chip({ name: 'avoid', value: key, checked: rules.avoid.includes(key), label: a.label, type: 'checkbox' }))}</div>
      </details>
    </div>`;
  }

  function resultsRegion() {
    if (state.error) return errorState(state.error, { source: 'TheMealDB' });
    if (state.loading) return html`<ul class="recipe-grid" aria-hidden="true">${skeletonCards(6, 'recipe').map((s) => html`<li>${s}</li>`)}</ul>`;
    const list = visibleMeals();
    if (!list.length) {
      return emptyState({
        title: 'The kitchen came up empty',
        body: getRules().avoid.length ? 'Everything we found lists something on your avoid list.' : 'Try another diet or turn off "Match the movie".',
        actions: html`<button class="button button--secondary" type="button" data-reshuffle>${icon('shuffle')} Shuffle</button>`,
      });
    }
    const hidden = hiddenCount();
    const more = state.meals.length - list.length - hidden > 0;
    return html`${state.relaxed ? html`<p class="banner" role="status">${icon('info')}<span>${state.relaxed}</span></p>` : ''}
      ${hidden ? html`<p class="banner banner--warning" role="status">${icon('alert')}<span>${pluralize(hidden, 'recipe')} hidden because ${hidden === 1 ? 'it lists' : 'they list'} something you avoid. We check ingredient lists only.</span></p>` : ''}
      <ul class="recipe-grid" aria-label="Recipes">${list.map(card)}</ul>
      <div class="load-more button-row">${more ? html`<button class="button button--secondary" type="button" data-more>Show ${PAGE} more</button>` : ''}<button class="button button--ghost" type="button" data-reshuffle>${icon('shuffle')} Shuffle</button></div>`;
  }

  function pairingCard() {
    const rules = getRules();
    if (!rules.matchMovie) return html`<div class="pairing-card"><p class="why">Browsing freely. Turn on "Match the movie" for a pairing.</p></div>`;
    return html`<div class="pairing-card"><p class="eyebrow">Why this pairs</p><p class="why" data-reason>${state.reason || 'Finding the perfect match…'}</p></div>`;
  }

  function renderAll() {
    const editQuery = draft.movieQuery ?? {};
    render(
      outlet,
      html`<div class="page">
        ${steps('/recipes', { done: ['/movies'] })}
        <header class="page-head">
          <p class="context-line">${icon('film')}<span>With <strong>${movie.title}</strong>${movie.year ? ` (${movie.year})` : ''}</span><a href="${href('/movies/results', { ...editQuery, change: 1 })}">Change</a></p>
          <h1>What are we eating?</h1>
        </header>
        <div class="landing-grid">
          <div class="stack">
            <div data-pairing>${pairingCard()}</div>
            <h2 class="visually-hidden">Recipes</h2>
            <div data-results aria-busy="${String(state.loading)}">${resultsRegion()}</div>
          </div>
          <aside data-controls>${controls()}</aside>
        </div>
      </div>`,
    );
  }

  function refresh({ focusFirstNew = false, before = [] } = {}) {
    const region = outlet.querySelector('[data-results]');
    const active = document.activeElement?.dataset?.open;
    region.setAttribute('aria-busy', String(state.loading));
    render(region, resultsRegion());
    render(outlet.querySelector('[data-pairing]'), pairingCard());
    if (focusFirstNew) {
      [...region.querySelectorAll('[data-open]')].find((b) => !before.includes(b.dataset.open))?.focus();
    } else if (active) {
      region.querySelector(`[data-open="${CSS.escape(active)}"]`)?.focus();
    }
  }

  async function load() {
    const my = ++generation;
    state.loading = true;
    state.error = null;
    scan.clear();
    refresh();
    const rules = getRules();
    try {
      if (rules.matchMovie) {
        const result = await findPairedMeals({ movie, diet: rules.diet, seed: state.seed, signal }, api);
        if (my !== generation) return;
        Object.assign(state, { meals: result.meals, reason: result.reason, relaxed: result.relaxed });
      } else {
        const categories = state.category ? [state.category] : browseCategories(rules.diet).slice(0, 5);
        const result = await findMeals({ categories }, { diet: rules.diet, seed: state.seed, signal }, api);
        if (my !== generation) return;
        Object.assign(state, { meals: result.meals, reason: '', relaxed: result.relaxed });
      }
      state.shown = PAGE;
      announce(`${pluralize(state.meals.length, 'recipe')} found.${state.relaxed ? ` ${state.relaxed}` : ''}`);
    } catch (err) {
      if (isAbortError(err) || my !== generation) return;
      state.error = err;
    }
    state.loading = false;
    refresh();
    scanVisible();
  }

  // Best-effort avoid scan: look up visible recipes (4 at a time, cached) and hide matches.
  async function scanVisible() {
    const rules = getRules();
    if (!rules.avoid.length || state.loading) return;
    const my = generation;
    const queue = visibleMeals().filter((m) => !scan.has(m.id));
    if (!queue.length) return;
    queue.forEach((m) => scan.set(m.id, 'pending'));
    let changed = false;
    const worker = async () => {
      while (queue.length) {
        const meal = queue.shift();
        try {
          const full = await getMeal(meal.id, { signal });
          if (my !== generation) return;
          const flags = full ? avoidMatches(full.ingredients, rules.avoid) : [];
          scan.set(meal.id, flags);
          if (flags.length) changed = true;
        } catch (err) {
          if (isAbortError(err)) return;
          scan.set(meal.id, []); // unknown: keep it visible
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    if (my !== generation || signal.aborted) return;
    if (changed) {
      refresh();
      scanVisible(); // newly revealed cards need checking too
    }
  }

  // ---- Events -------------------------------------------------------------------------
  on(outlet, 'click', '[data-open]', (event, button) => {
    const meal = state.meals.find((m) => m.id === button.dataset.open);
    if (!meal) return;
    openRecipeSheet({
      meal,
      trigger: button,
      avoid: getRules().avoid,
      onPick: (full) => {
        updateDraft({ meal: full, savedId: null });
        navigate('/date');
      },
    });
  }, { signal });

  on(outlet, 'click', '[data-more]', () => {
    const before = [...outlet.querySelectorAll('[data-results] [data-open]')].map((b) => b.dataset.open);
    state.shown += PAGE;
    refresh({ focusFirstNew: true, before });
    scanVisible();
  }, { signal });

  on(outlet, 'click', '[data-reshuffle]', () => {
    state.seed += 1;
    load();
  }, { signal });
  on(outlet, 'click', '[data-action="retry"]', () => load(), { signal });

  on(outlet, 'change', '[data-controls] input', (event, input) => {
    if (input.matches('[data-match]')) {
      updateRules({ matchMovie: input.checked });
      state.category = '';
      render(outlet.querySelector('[data-controls]'), controls());
      outlet.querySelector('[data-match]')?.focus();
      load();
    } else if (input.name === 'diet') {
      updateRules({ diet: input.value });
      if (state.category && !browseCategories(input.value).includes(state.category)) state.category = '';
      if (!getRules().matchMovie) {
        // The category chips depend on the diet; re-render them and keep focus on this chip.
        render(outlet.querySelector('[data-controls]'), controls());
        outlet.querySelector(`input[name="diet"][value="${CSS.escape(input.value)}"]`)?.focus();
      }
      load();
    } else if (input.name === 'category') {
      state.category = input.value;
      load();
    } else if (input.name === 'avoid') {
      const avoid = [...outlet.querySelectorAll('input[name="avoid"]:checked')].map((i) => i.value);
      updateRules({ avoid });
      scan.clear();
      refresh();
      scanVisible();
      announce(avoid.length ? `Avoiding ${avoid.map((k) => AVOID[k].label.toLowerCase()).join(', ')}.` : 'Avoid list cleared.');
    }
  }, { signal });

  renderAll();
  load();
}
