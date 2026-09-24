// Step 3 of 3: the ticket ("Admit Two"). The URL is the plan: #/date?m=&r=&d=&at=&note=
// opens the same ticket on your date's phone.
import { html, render, href, icon, slice, steps, on, poster, plate, emptyState, errorState, formatDay, formatTime, withArticle } from '../ui.js';
import { getMovie } from '../api/tmdb.js';
import { getMeal } from '../api/mealdb.js';
import { zeroProofDrinks, drinksWith, getDrink } from '../api/cocktaildb.js';
import { pairingFor, shuffle } from '../domain/pairing.js';
import { createPlan, toShareQuery, fromShareQuery } from '../domain/plan.js';
import { buildNightPlan, nextOccurrence, formatRuntime, COOK_MINUTES, DEFAULT_COOK_MINUTES } from '../domain/night-plan.js';
import { buildICS } from '../domain/ics.js';
import { getDraft, updateDraft, getRules, getSaved, saveDate, removeSaved } from '../state.js';
import { openMovieSheet } from '../components/movie-sheet.js';
import { openRecipeSheet } from '../components/recipe-sheet.js';
import { openSheet } from '../components/sheet.js';
import { shareLink, shareOrDownloadFile, appUrl } from '../lib/share.js';
import { announce, toast } from '../lib/announce.js';
import { isAbortError, HttpError } from '../lib/http.js';
import { navigate } from '../lib/navigate.js';

export const title = ({ query }) => (fromShareQuery(query) ? "You've been sent a date" : 'Your date');

const DRINK_CHOICES = [
  { id: 'zero-proof', label: 'Zero-proof' },
  { id: 'cocktail', label: 'Lime cocktail' },
  { id: 'none', label: 'No drink' },
];

async function drinkOptions(kind, signal) {
  if (kind === 'none') return [];
  return kind === 'cocktail' ? drinksWith('Lime', { signal }) : zeroProofDrinks({ signal });
}

export function mount(outlet, { query, signal }) {
  const shared = fromShareQuery(query);
  const rules = getRules();
  const plan = {
    movie: null,
    meal: null,
    drink: null,
    drinkKind: rules.drink,
    drinkIndex: 0,
    when: null,
    cookMinutes: DEFAULT_COOK_MINUTES,
    note: '',
  };
  let drinks = [];
  let loading = Boolean(shared);
  let error = null;

  if (!shared) {
    const draft = getDraft();
    if (!draft.movie || !draft.meal) return renderIncomplete(outlet, draft);
    Object.assign(plan, {
      movie: draft.movie,
      meal: draft.meal,
      drink: draft.drink,
      drinkKind: draft.drinkKind ?? rules.drink,
      drinkIndex: draft.drinkIndex ?? 0,
      when: draft.when || nextOccurrence('20:00'),
      cookMinutes: draft.cookMinutes ?? DEFAULT_COOK_MINUTES,
      note: draft.note ?? '',
    });
  } else {
    plan.when = shared.when;
    plan.note = shared.note;
    plan.drinkKind = shared.drinkId ? 'shared' : 'none';
  }

  const persist = () => {
    if (!shared) {
      updateDraft({ drink: plan.drink, drinkKind: plan.drinkKind, drinkIndex: plan.drinkIndex, when: plan.when, cookMinutes: plan.cookMinutes, note: plan.note });
    }
  };
  const currentPlan = () => createPlan({ movie: plan.movie, meal: plan.meal, drink: plan.drink, when: plan.when, id: getDraft().savedId || undefined });
  const shareHash = () => href('/date', toShareQuery(currentPlan(), plan.note));
  const isSaved = () => getSaved().some((p) => p.movie?.id === plan.movie?.id && p.meal?.id === plan.meal?.id && (p.drink?.id ?? null) === (plan.drink?.id ?? null));

  // ---- Rendering --------------------------------------------------------------------
  // The ticket's sections are stable elements; updates re-render their contents only, so
  // the one-time "print" animation on the <article> is never interrupted.
  function movieSection() {
    const { movie } = plan;
    const stream = movie.providers?.stream?.[0]?.name;
    const changeMovie = href('/movies/results', { ...(getDraft().movieQuery ?? {}), change: 1 });
    return html`<p class="ticket__eyebrow">dateLime presents</p>
      <div class="ticket__row">${poster(movie, { sizes: '88px', eager: true })}<div class="ticket__row-body">
        <h2>${movie.title}</h2>
        <p class="meta">${movie.year ? html`<span>${movie.year}</span>` : ''}${movie.runtime ? html`<span>${formatRuntime(movie.runtime)}</span>` : ''}<span>${movie.certification || 'Not rated'}</span></p>
        ${stream ? html`<p class="meta"><span>Streaming on ${stream}</span></p>` : ''}
        <div class="ticket__row-actions"><button type="button" data-about-movie aria-haspopup="dialog">About the movie</button>${shared ? '' : html`<a href="${changeMovie}">Change movie</a>`}</div>
      </div></div>`;
  }

  function mealRow() {
    const { meal } = plan;
    return html`<div class="ticket__row">${plate(meal, { round: true, eager: true })}<div class="ticket__row-body">
        <h2>${meal.name}</h2>
        <p class="meta">${meal.area ? html`<span>${meal.area}</span>` : ''}${meal.category ? html`<span>${meal.category}</span>` : ''}</p>
        <p class="meta"><span>${pairingFor(plan.movie).reason}</span></p>
        <div class="ticket__row-actions"><button type="button" data-recipe aria-haspopup="dialog">Recipe</button><a href="${href('/cook', { r: meal.id })}">Cook-along</a>${shared ? '' : html`<a href="${href('/recipes')}">Change meal</a>`}</div>
      </div></div>`;
  }

  function drinkRow() {
    const { drink } = plan;
    const none = plan.drinkKind === 'none' || !drink;
    return html`<div class="ticket__row">${none ? html`<div class="coaster plate plate--round plate--missing"></div>` : html`<div class="coaster">${plate(drink, { round: true, size: 'small' })}</div>`}<div class="ticket__row-body">
        <h2>${plan.drinkKind === 'none' ? 'No drink tonight' : (drink?.name ?? 'Choosing a drink…')}</h2>
        ${drink && plan.drinkKind !== 'none' ? html`<p class="meta"><span>${drink.alcoholic ? 'Cocktail' : 'Zero-proof'}</span></p>` : ''}
        ${shared
          ? ''
          : html`<fieldset class="chips"><legend class="visually-hidden">Drink</legend>${DRINK_CHOICES.map((c) => html`<label class="chip"><input type="radio" name="drink-kind" value="${c.id}" ${plan.drinkKind === c.id ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${c.label}</label>`)}</fieldset>`}
        <div class="ticket__row-actions">${drink && plan.drinkKind !== 'none' ? html`<button type="button" data-drink-recipe aria-haspopup="dialog">How to make it</button>` : ''}${!shared && plan.drinkKind !== 'none' && drinks.length > 1 ? html`<button type="button" data-another-drink>Another drink</button>` : ''}</div>
      </div></div>`;
  }

  function planSection() {
    const night = plan.when ? buildNightPlan({ playAt: plan.when, runtime: plan.movie.runtime, cookMinutes: plan.cookMinutes }) : null;
    return html`<h2 class="ticket__eyebrow">Tonight's plan</h2>
      ${night
        ? html`<ol class="run-of-show">
            <li><time datetime="${night.startCooking}">${formatTime(night.startCooking)}</time><span>Start cooking (your estimate: ${plan.cookMinutes} min)</span></li>
            <li><time datetime="${night.eat}">${formatTime(night.eat)}</time><span>Dinner</span></li>
            <li><time datetime="${night.play}">${formatTime(night.play)}</time><strong>Press play</strong></li>
            ${night.credits ? html`<li><time datetime="${night.credits}">${formatTime(night.credits)}</time><span>Credits roll</span></li>` : ''}
          </ol>`
        : html`<p class="muted">Pick a time to see the run of show.</p>`}
      ${plan.note ? html`<p class="note">“${plan.note}”</p>` : ''}`;
  }

  const stubContent = () =>
    html`<span class="ticket__stub-text"><span>Admit two</span>${plan.when ? html`<span>${formatDay(plan.when)}</span><span>${formatTime(plan.when)}</span>` : ''}</span>${slice()}`;

  function ticket() {
    let printed = true;
    try {
      const key = `datelime.printed.${plan.movie.id}-${plan.meal.id}`;
      printed = sessionStorage.getItem(key) === '1';
      sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
    return html`<article class="ticket ${printed ? '' : 'is-printing'}" aria-label="Your date ticket">
      <div class="ticket__section stack" data-part="movie">${movieSection()}</div>
      <div class="ticket__section stack"><div data-part="meal">${mealRow()}</div><div data-part="drink">${drinkRow()}</div></div>
      <div class="ticket__section stack" data-part="plan">${planSection()}</div>
      <div class="ticket__stub" data-part="stub">${stubContent()}</div>
    </article>`;
  }

  const primaryActions = (saved) =>
    html`<button class="button button--primary" type="button" data-share>${icon('share')} Share</button>
      <button class="button button--secondary" type="button" data-save aria-pressed="${String(saved)}">${icon('heart')} ${saved ? 'Saved' : 'Save'}</button>`;

  function controls() {
    const [day, time] = (plan.when ?? nextOccurrence('20:00')).split('T');
    const saved = isSaved();
    return html`<form class="plan-controls" data-plan-form>
        <h2 class="visually-hidden">Plan details</h2>
        <div class="row">
          <label>Day <input class="input" type="date" name="day" value="${day}" required></label>
          <label>Press play at <input class="input" type="time" name="time" value="${time}" required></label>
        </div>
        <fieldset class="field"><legend>Cooking time</legend><p class="field__hint">Your estimate: recipes don't list cook times.</p>
          <div class="chips">${COOK_MINUTES.map((m) => html`<label class="chip"><input type="radio" name="cook" value="${m}" ${plan.cookMinutes === m ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${m} min</label>`)}</div>
        </fieldset>
        <label>Note for your date (optional)
          <input class="input" type="text" name="note" maxlength="80" value="${plan.note}" autocomplete="off">
          <small class="muted">Anyone with the link can read it.</small>
        </label>
      </form>
      <div class="button-row only-desktop">${primaryActions(saved)}</div>
      <div class="button-row">
        <button class="button button--secondary" type="button" data-calendar>${icon('calendar')} Add to calendar</button>
        <a class="button button--secondary" href="${href('/cook', { r: plan.meal.id })}">${icon('utensils')} Cook-along</a>
      </div>
      <div class="share-fallback" data-share-fallback hidden>
        <label for="share-url">Copy this link and send it to your date</label>
        <input class="input" id="share-url" type="text" readonly>
      </div>`;
  }

  function renderPage() {
    if (error) {
      render(outlet, html`<div class="page page--narrow">${errorState(error, { source: 'the movie and recipe databases', level: 1 })}</div>`);
      return;
    }
    if (loading) {
      render(outlet, html`<div class="page page--narrow"><div class="stack" aria-busy="true"><h1>Unfolding your ticket…</h1><div class="skeleton skeleton--block"></div><div class="skeleton skeleton--block"></div></div></div>`);
      return;
    }
    render(
      outlet,
      html`<div class="page">
        ${shared ? '' : steps('/date', { done: ['/movies', '/recipes'] })}
        ${shared
          ? html`<div class="banner shared-banner">${icon('ticket')}<div class="stack"><p><strong>You've been sent a date plan.</strong> Save it to your dates, add it to your calendar, or plan your own.</p>
              <div class="button-row"><button class="button button--primary button--small" type="button" data-save aria-pressed="${String(isSaved())}">${isSaved() ? 'Saved' : 'Save to my dates'}</button><button class="button button--secondary button--small" type="button" data-adopt>Make changes</button></div></div></div>`
          : ''}
        <header class="page-head"><h1>${shared ? 'A date, for two' : 'Your date is set.'}</h1></header>
        <div class="date-layout">
          <div data-ticket>${ticket()}</div>
          <aside class="date-layout__aside stack" data-aside>${shared ? sharedAside() : controls()}</aside>
        </div>
        ${shared ? '' : html`<div class="action-bar only-mobile"><div class="action-bar__inner">${primaryActions(isSaved())}</div></div>`}
      </div>`,
    );
  }

  function sharedAside() {
    return html`<div class="button-row">
      <button class="button button--secondary" type="button" data-calendar>${icon('calendar')} Add to calendar</button>
      <a class="button button--secondary" href="${href('/cook', { r: plan.meal.id })}">${icon('utensils')} Cook-along</a>
      <a class="button button--ghost" href="${href('/')}">Plan our own date</a>
    </div>`;
  }

  const PARTS = { movie: movieSection, meal: mealRow, drink: drinkRow, plan: planSection, stub: stubContent };
  function refreshTicket(parts = Object.keys(PARTS)) {
    for (const part of parts) {
      const el = outlet.querySelector(`[data-part="${part}"]`);
      if (el) render(el, PARTS[part]());
    }
  }
  const refreshSaveButtons = () => {
    for (const button of outlet.querySelectorAll('[data-save]')) {
      const saved = isSaved();
      button.setAttribute('aria-pressed', String(saved));
      render(button, shared ? (saved ? 'Saved' : 'Save to my dates') : html`${icon('heart')} ${saved ? 'Saved' : 'Save'}`);
    }
  };

  // ---- Data -------------------------------------------------------------------------
  async function chooseDrink({ advance = false } = {}) {
    if (plan.drinkKind === 'none' || plan.drinkKind === 'shared') {
      if (plan.drinkKind === 'none') plan.drink = null;
      return;
    }
    try {
      drinks = shuffle(await drinkOptions(plan.drinkKind, signal), (plan.movie.id + Number(plan.meal.id)) % 1000);
      if (!drinks.length) {
        plan.drink = null;
        return;
      }
      if (advance) plan.drinkIndex = (plan.drinkIndex + 1) % drinks.length;
      const summary = drinks[plan.drinkIndex % drinks.length];
      const alcoholic = plan.drinkKind === 'cocktail';
      plan.drink = { ...summary, alcoholic };
    } catch (err) {
      if (!isAbortError(err)) plan.drink = null; // the ticket still works without a drink
    }
  }

  async function loadShared() {
    try {
      const [movie, meal, drink] = await Promise.all([
        getMovie(shared.movieId, { region: rules.region, signal }),
        getMeal(shared.mealId, { signal }),
        shared.drinkId ? getDrink(shared.drinkId, { signal }).catch(() => null) : null,
      ]);
      if (!meal) throw new HttpError('That recipe left TheMealDB.', { status: 404 });
      Object.assign(plan, { movie, meal, drink, drinkKind: drink ? 'shared' : 'none' });
      loading = false;
    } catch (err) {
      if (isAbortError(err)) return;
      error = err;
      loading = false;
    }
    renderPage();
  }

  // ---- Events -----------------------------------------------------------------------
  on(outlet, 'change', '[data-plan-form] input, input[name="drink-kind"]', async (event, input) => {
    if (input.name === 'drink-kind') {
      plan.drinkKind = input.value;
      plan.drinkIndex = 0;
      await chooseDrink();
      persist();
      refreshTicket(['drink']);
      outlet.querySelector(`input[name="drink-kind"][value="${input.value}"]`)?.focus();
      announce(plan.drink ? `Drink: ${plan.drink.name}.` : 'No drink tonight.');
      return;
    }
    const form = input.form;
    const day = form.elements.day.value;
    const time = form.elements.time.value;
    if (day && time) plan.when = `${day}T${time}`;
    plan.cookMinutes = Number(form.elements.cook.value) || plan.cookMinutes;
    persist();
    refreshTicket(['plan', 'stub']);
    refreshSaveButtons();
  }, { signal });

  on(outlet, 'input', '[data-plan-form] input[name="note"]', (event, input) => {
    plan.note = input.value.slice(0, 80);
    persist();
    refreshTicket(['plan']);
  }, { signal });
  on(outlet, 'submit', '[data-plan-form]', (event) => event.preventDefault(), { signal });

  on(outlet, 'click', '[data-another-drink]', async () => {
    await chooseDrink({ advance: true });
    persist();
    refreshTicket(['drink']);
    outlet.querySelector('[data-another-drink]')?.focus();
    announce(`Drink: ${plan.drink?.name ?? 'none'}.`);
  }, { signal });

  on(outlet, 'click', '[data-about-movie]', (event, button) => openMovieSheet({ movie: plan.movie, region: rules.region, trigger: button }), { signal });
  on(outlet, 'click', '[data-recipe]', (event, button) => openRecipeSheet({ meal: plan.meal, trigger: button, avoid: rules.avoid, pickLabel: 'Start the cook-along', onPick: () => navigate('/cook', { r: plan.meal.id }) }), { signal });
  on(outlet, 'click', '[data-drink-recipe]', async (event, button) => {
    const sheet = openSheet({ title: plan.drink.name, trigger: button, body: html`<p class="muted" aria-busy="true">Muddling the lime…</p>` });
    try {
      const d = await getDrink(plan.drink.id, { signal });
      sheet.update({
        body: d
          ? html`${plate(d, { size: 'medium' })}<p class="meta"><span>${d.alcoholic ? 'Contains alcohol' : 'Zero-proof'}</span>${d.glass ? html`<span>${d.glass}</span>` : ''}</p>
            <h3>Ingredients</h3><ul class="checklist">${d.ingredients.map((i) => html`<li>${i.measure ? html`<span class="measure">${i.measure}</span> ` : ''}${i.name}</li>`)}</ul>
            <h3>Method</h3><ol class="stack">${d.steps.map((s) => html`<li>${s}</li>`)}</ol><p class="attribution">Drink from TheCocktailDB.</p>`
          : html`<p>We couldn't find that drink any more.</p>`,
      });
    } catch (err) {
      if (!isAbortError(err)) sheet.update({ body: html`<p role="alert">We couldn't reach TheCocktailDB. Try again in a moment.</p>` });
    }
  }, { signal });

  on(outlet, 'click', '[data-share]', async () => {
    const url = appUrl(shareHash());
    const { movie, meal, drink } = plan;
    const when = plan.when ? ` ${formatDay(plan.when)}, press play at ${formatTime(plan.when)}.` : '';
    const text = `Date night? ${movie.title}${movie.year ? ` (${movie.year})` : ''}, then ${meal.name}${drink ? `, with ${withArticle(drink.name)}` : ''}.${when}${plan.note ? ` “${plan.note}”` : ''}`;
    const result = await shareLink({ title: 'Our date night', text, url });
    if (result === 'shared') toast('Ticket sent. Admit two!');
    else if (result === 'copied') toast('Link copied. Paste it to your date.');
    else if (result === 'manual') {
      const box = outlet.querySelector('[data-share-fallback]');
      box.hidden = false;
      const input = box.querySelector('input');
      input.value = url;
      input.focus();
      input.select();
      announce('Copy the selected link and send it to your date.');
    }
  }, { signal });

  on(outlet, 'click', '[data-save]', () => {
    if (isSaved()) {
      const existing = getSaved().find((p) => p.movie?.id === plan.movie.id && p.meal?.id === plan.meal.id);
      const undo = removeSaved(existing.id);
      refreshSaveButtons();
      toast('Removed from your dates.', { tone: 'info', action: { label: 'Undo', onClick: () => (undo(), refreshSaveButtons()) } });
      return;
    }
    const savedPlan = shared ? saveDate(createPlan({ movie: plan.movie, meal: plan.meal, drink: plan.drink, when: plan.when })) : (persist(), saveDate());
    if (savedPlan) {
      navigator.storage?.persist?.().catch(() => {});
      refreshSaveButtons();
      toast('Saved to your dates.');
    }
  }, { signal });

  on(outlet, 'click', '[data-calendar]', async () => {
    const night = buildNightPlan({ playAt: plan.when ?? nextOccurrence('20:00'), runtime: plan.movie.runtime, cookMinutes: plan.cookMinutes });
    const url = appUrl(shareHash());
    const ics = buildICS({
      uid: `${plan.movie.id}-${plan.meal.id}-${night.play}`,
      title: `Date night: ${plan.movie.title} + ${plan.meal.name}`,
      start: night.startCooking,
      end: night.credits ?? night.play,
      description: [
        `Start cooking ${formatTime(night.startCooking)} (${plan.meal.name})`,
        `Dinner ${formatTime(night.eat)}`,
        `Press play ${formatTime(night.play)} (${plan.movie.title})`,
        plan.drink ? `Drink: ${plan.drink.name}` : '',
        plan.note ? `Note: ${plan.note}` : '',
        '',
        `Shopping list: ${plan.meal.ingredients?.map((i) => `${i.measure} ${i.name}`.trim()).join(', ') ?? ''}`,
        '',
        `Your ticket: ${url}`,
      ]
        .filter((line, i, all) => line || all[i - 1])
        .join('\n'),
      url,
      alarmMinutesBefore: 15,
    });
    const result = await shareOrDownloadFile({ name: 'datelime-date-night.ics', content: ics, type: 'text/calendar', title: 'Date night' });
    if (result !== 'cancelled') toast(result === 'shared' ? 'Calendar invite shared.' : 'Calendar invite downloaded. Open it to add the date.');
  }, { signal });

  on(outlet, 'click', '[data-adopt]', () => {
    updateDraft({ movie: plan.movie, meal: plan.meal, drink: plan.drink, drinkKind: plan.drink ? (plan.drink.alcoholic ? 'cocktail' : 'zero-proof') : 'none', when: plan.when, note: '', savedId: null });
    navigate('/date', {}, { replace: true });
  }, { signal });
  on(outlet, 'click', '[data-action="retry"]', () => {
    error = null;
    loading = true;
    renderPage();
    loadShared();
  }, { signal });

  // ---- Start ------------------------------------------------------------------------
  if (shared) {
    renderPage();
    loadShared();
  } else {
    renderPage();
    if (!plan.drink && plan.drinkKind !== 'none') {
      chooseDrink().then(() => {
        if (signal.aborted) return;
        persist();
        refreshTicket(['drink']);
      });
    } else if (plan.drinkKind !== 'none') {
      // Load the list so "Another drink" is available.
      drinkOptions(plan.drinkKind, signal)
        .then((list) => {
          drinks = shuffle(list, (plan.movie.id + Number(plan.meal.id)) % 1000);
          if (!signal.aborted) refreshTicket(['drink']);
        })
        .catch(() => {});
    }
    persist();
  }
}

function renderIncomplete(outlet, draft) {
  const next = draft.movie ? { path: '/recipes', label: 'Pick a meal' } : { path: '/movies', label: 'Pick a movie' };
  render(
    outlet,
    html`<div class="page page--narrow">${steps('/date', { done: draft.movie ? ['/movies'] : [] })}${emptyState({
      title: 'Your ticket is almost ready',
      body: draft.movie ? `You've picked ${draft.movie.title}. Now the food.` : 'Start with the movie. The meal and the plan follow.',
      actions: html`<a class="button button--primary" href="${href(next.path)}">${next.label}</a>`,
      level: 1,
    })}</div>`,
  );
}

