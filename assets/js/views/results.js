// Step 1 results: movies for the chosen mood, plus the "Decide together" blind shortlist.
import { html, render, href, icon, steps, on, poster, skeletonCards, errorState, emptyState, pluralize } from '../ui.js';
import { discoverMovies } from '../api/tmdb.js';
import { movieQuery, BLEND_MIN_RESULTS } from '../domain/moods.js';
import { getRules, getDraft, updateDraft, startTogether, getTogether, setTogether, endTogether, toggleHeart, revealTogether, MAX_HEARTS } from '../state.js';
import { openMovieSheet, scoreLabel } from '../components/movie-sheet.js';
import { announce } from '../lib/announce.js';
import { isAbortError } from '../lib/http.js';
import { navigate } from '../lib/navigate.js';

const REVEAL_STEP = 10;

export function title({ query }) {
  if (query.together === '1') return 'Decide together';
  const q = movieQuery(query, getRules());
  return q.mood.id === 'any' ? 'Movies for tonight' : `${q.mood.label} movies`;
}

/** Called when a movie is picked, from the sheet or the together reveal. */
export function pickMovie(details, query = {}) {
  const draft = getDraft();
  const returningToTicket = query.change === '1' && draft.meal;
  const movieQueryParams = { ...query };
  delete movieQueryParams.change;
  delete movieQueryParams.together;
  updateDraft({
    movie: details,
    movieQuery: movieQueryParams,
    ...(returningToTicket ? {} : { meal: null, drink: null, savedId: null }),
  });
  navigate(returningToTicket ? '/date' : '/recipes');
}

export function mount(outlet, ctx) {
  const { query, signal } = ctx;
  const rules = getRules();
  const ignoreServices = query.allsvc === '1';
  const q = movieQuery(query, ignoreServices ? { ...rules, services: [] } : rules);
  const sort = query.sort === 'acclaimed' ? 'acclaimed' : 'popular';
  const together = query.together === '1';
  if (together) startTogether(JSON.stringify({ ...query, together: undefined }));

  const state = { movies: [], page: 0, totalPages: 1, total: 0, shown: 0, relaxed: false, error: null, loading: true };
  let lastSeen = new Set();

  // ---- Rendering --------------------------------------------------------------------
  const chips = () => {
    const parts = [];
    if (q.mood.id !== 'any') parts.push(`${q.mood.label} · ${q.mood.genreLabel}`);
    if (q.maxCertification) parts.push(`Up to ${q.maxCertification}`);
    if (q.length.maxRuntime) parts.push(q.length.label);
    if (q.providerIds.length) parts.push(`On ${rules.services.map((s) => s.name).join(', ')}`);
    if (!parts.length) parts.push('Anything popular');
    return parts;
  };

  function card(movie) {
    const t = getTogether();
    const phase = together && t ? t.phase : null;
    const hearted = phase ? t[phase].includes(movie.id) : false;
    return html`<li><article class="card movie-card" aria-labelledby="movie-${movie.id}">
      ${poster(movie)}
      <div class="movie-card__body">
        <h3 class="movie-card__title" id="movie-${movie.id}"><button type="button" data-open="${movie.id}" aria-haspopup="dialog">${movie.title}</button></h3>
        <p class="meta">${movie.year ? html`<span>${movie.year}</span>` : ''}${movie.rating !== null ? html`<span>${scoreLabel(movie.rating)}</span>` : ''}</p>
        <p class="movie-card__overview">${movie.overview || 'No summary on TMDB yet.'}</p>
        ${q.providerIds.length ? html`<p><span class="badge badge--brand">On your services</span></p>` : ''}
        ${phase === 'first' || phase === 'second'
          ? html`<button class="heart-button" type="button" data-heart="${movie.id}" aria-pressed="${String(hearted)}">${icon('heart')}<span data-heart-label>${hearted ? 'Hearted' : 'Heart'}</span><span class="visually-hidden"> ${movie.title}</span></button>`
          : ''}
      </div>
    </article></li>`;
  }

  function resultsRegion() {
    if (state.error) return errorState(state.error, { source: 'the movie database' });
    if (state.loading && !state.movies.length) return html`<ul class="movie-grid" aria-hidden="true">${skeletonCards(6, 'movie').map((s) => html`<li>${s}</li>`)}</ul>`;
    if (!state.movies.length) return emptyResults();
    const visible = state.movies.slice(0, state.shown);
    const canShowMore = state.shown < state.movies.length || state.page < state.totalPages;
    return html`${state.relaxed ? html`<p class="banner" role="status">${icon('info')}<span>Only a few movies are both ${q.mood.genreLabel.toLowerCase()}, so we included movies that are either.</span></p>` : ''}
      <ul class="movie-grid" aria-label="Movies">${visible.map(card)}</ul>
      ${canShowMore ? html`<div class="load-more"><button class="button button--secondary" type="button" data-more ${state.loading ? html`aria-busy="true"` : ''}><span class="spinner" aria-hidden="true"></span>Show ${REVEAL_STEP} more</button></div>` : ''}`;
  }

  function emptyResults() {
    const relax = [];
    const base = { ...query };
    if (q.maxCertification) relax.push(html`<a class="button button--secondary" href="${href('/movies/results', { ...base, cert: 'any' })}">Allow any rating</a>`);
    if (q.length.maxRuntime) relax.push(html`<a class="button button--secondary" href="${href('/movies/results', { ...base, len: undefined })}">Any length</a>`);
    if (q.providerIds.length) relax.push(html`<a class="button button--secondary" href="${href('/movies/results', { ...base, allsvc: 1 })}">Include all services</a>`);
    if (q.mood.id !== 'any') relax.push(html`<a class="button button--secondary" href="${href('/movies/results', { ...base, mood: undefined, genre: undefined })}">Any mood</a>`);
    return emptyState({
      title: "Nothing's showing with those picks",
      body: q.maxCertification && q.mood.genres.includes(27) ? `Horror rated ${q.maxCertification} is rare. Loosen one thing and try again.` : 'Loosen one thing and try again.',
      actions: relax,
    });
  }

  function tray() {
    const t = getTogether();
    if (!together || !t || (t.phase !== 'first' && t.phase !== 'second')) return '';
    const n = t[t.phase].length;
    const who = t.phase === 'first' ? 'First pick' : 'Your date’s turn';
    return html`<div class="action-bar"><div class="action-bar__inner together-tray">
      <p><strong>${who}:</strong> <span>${n} of ${MAX_HEARTS} hearted</span></p>
      <button class="button button--primary" type="button" ${t.phase === 'first' ? html`data-handoff` : html`data-reveal`} ${n === 0 ? html`aria-disabled="true" aria-describedby="tray-hint"` : ''}>${t.phase === 'first' ? 'Pass the phone' : 'Reveal matches'} ${icon('arrow-right')}</button>
      ${n === 0 ? html`<p id="tray-hint" class="visually-hidden">Heart at least one movie first.</p>` : ''}
    </div></div>`;
  }

  function renderPage() {
    const t = getTogether();
    if (together && t?.phase === 'handoff') return renderHandoff();
    if (together && t?.phase === 'reveal') return renderReveal();
    const editQuery = { ...query };
    delete editQuery.sort;
    render(
      outlet,
      html`<div class="page">
        ${steps('/movies')}
        <header class="page-head">
          <h1>${together ? (t?.phase === 'second' ? 'Your turn: heart up to three' : 'Heart up to three you’d watch') : 'Pick a movie'}</h1>
          ${together && t?.phase === 'second' ? html`<p>Your date's hearts are hidden. Pick yours, then reveal.</p>` : ''}
          <div class="filter-summary">${chips().map((c) => html`<span class="badge">${c}</span>`)}<a href="${href('/movies', editQuery)}">Change</a></div>
        </header>
        <div class="results-bar">
          <p data-count class="muted" aria-live="polite"></p>
          <label>Sort <select class="select" data-sort><option value="popular" ${sort === 'popular' ? html`selected` : ''}>Popular</option><option value="acclaimed" ${sort === 'acclaimed' ? html`selected` : ''}>Crowd favorites</option></select></label>
        </div>
        <h2 class="visually-hidden">Movies</h2>
        <div class="movies" data-results aria-busy="${String(state.loading)}">${resultsRegion()}</div>
        <div data-tray>${tray()}</div>
      </div>`,
    );
    updateCount();
  }

  function updateCount() {
    const el = outlet.querySelector('[data-count]');
    if (el && !state.loading && !state.error) el.textContent = state.total ? `${state.total.toLocaleString()} ${state.total === 1 ? 'movie' : 'movies'}` : '';
  }

  function refreshResults({ focusFirstNew = false } = {}) {
    const region = outlet.querySelector('[data-results]');
    if (!region) return renderPage();
    region.setAttribute('aria-busy', String(state.loading));
    render(region, resultsRegion());
    render(outlet.querySelector('[data-tray]'), tray());
    updateCount();
    if (focusFirstNew) {
      const firstNew = [...region.querySelectorAll('[data-open]')].find((b) => !lastSeen.has(b.dataset.open));
      firstNew?.focus();
    }
    lastSeen = new Set([...region.querySelectorAll('[data-open]')].map((b) => b.dataset.open));
  }

  function renderHandoff() {
    render(
      outlet,
      html`<div class="page page--narrow"><div class="handoff">
        ${icon('heart')}
        <h1>Pass the phone to your date</h1>
        <p class="muted">Your hearts are hidden. Your date gets up to three of their own, from the same list. No peeking!</p>
        <button class="button button--primary button--large" type="button" data-ready>I'm ready</button>
        <button class="button button--ghost" type="button" data-back-first>Wait, I'm not done</button>
      </div></div>`,
    );
  }

  function renderReveal() {
    const { matched, movies } = revealTogether();
    render(
      outlet,
      html`<div class="page">
        <header class="page-head">
          ${matched
            ? html`<h1 class="its-a-date">It's a date!</h1><p>You both hearted ${movies.length === 1 ? html`<strong>${movies[0].title}</strong>` : `${movies.length} of the same movies. Pick one`}.</p>`
            : html`<h1>No match this time</h1><p>That's fine: the second person picks from everything you both hearted.</p>`}
        </header>
        <h2 class="visually-hidden">${matched ? 'Your matches' : 'Everything you hearted'}</h2>
        <div class="movies"><ul class="movie-grid" aria-label="${matched ? 'Your matches' : 'Everything you hearted'}">${movies.map((m) => html`<li><article class="card movie-card" aria-labelledby="movie-${m.id}">${poster(m)}<div class="movie-card__body"><h3 class="movie-card__title" id="movie-${m.id}"><button type="button" data-open="${m.id}" aria-haspopup="dialog">${m.title}</button></h3><p class="meta">${m.year ? html`<span>${m.year}</span>` : ''}${m.rating !== null ? html`<span>${scoreLabel(m.rating)}</span>` : ''}</p><p class="movie-card__overview">${m.overview}</p></div></article></li>`)}</ul></div>
        <p class="load-more"><button class="button button--ghost" type="button" data-restart>Start over</button></p>
      </div>`,
    );
    announce(matched ? "It's a date! You matched." : 'No match. Pick from everything you both hearted.');
  }

  // ---- Data ---------------------------------------------------------------------------
  async function fetchPage(page) {
    state.loading = true;
    refreshResults();
    try {
      let result = await discoverMovies({ ...q, sort, page, signal, matchAllGenres: q.matchAllGenres && !state.relaxed });
      if (page === 1 && q.matchAllGenres && !state.relaxed && result.totalResults < BLEND_MIN_RESULTS) {
        state.relaxed = true;
        result = await discoverMovies({ ...q, sort, page, signal, matchAllGenres: false });
      }
      const known = new Set(state.movies.map((m) => m.id));
      state.movies.push(...result.movies.filter((m) => !known.has(m.id)));
      state.page = result.page;
      state.totalPages = result.totalPages;
      state.total = result.totalResults;
      state.error = null;
      if (page === 1) {
        state.shown = Math.min(REVEAL_STEP, state.movies.length);
        announce(state.movies.length ? `${pluralize(state.total, 'movie')} found.` : 'No movies found.');
      }
    } catch (err) {
      if (isAbortError(err)) return;
      state.error = err;
    } finally {
      if (!signal.aborted) {
        state.loading = false;
        refreshResults({ focusFirstNew: page > 1 });
      }
    }
  }

  /** Moves focus to the new screen's heading (it must be focusable first). */
  function focusHeading() {
    const h1 = outlet.querySelector('h1');
    if (!h1) return;
    h1.setAttribute('tabindex', '-1');
    h1.focus();
  }

  // ---- Events -----------------------------------------------------------------------
  on(outlet, 'click', '[data-open]', (event, button) => {
    const id = Number(button.dataset.open);
    const t = getTogether();
    const movie = state.movies.find((m) => m.id === id) ?? t?.movies?.[id];
    if (!movie) return;
    openMovieSheet({
      movie,
      region: q.region,
      trigger: button,
      pickLabel: together && t?.phase === 'reveal' ? 'Pick this one' : 'Pick this movie',
      onPick: (details) => {
        if (together) endTogether();
        pickMovie(details, query);
      },
    });
  }, { signal });

  on(outlet, 'click', '[data-more]', () => {
    if (state.loading) return;
    const next = state.shown + REVEAL_STEP;
    if (next <= state.movies.length || state.page >= state.totalPages) {
      state.shown = Math.min(next, state.movies.length);
      refreshResults({ focusFirstNew: true });
    } else {
      state.shown = next;
      fetchPage(state.page + 1);
    }
  }, { signal });

  on(outlet, 'change', '[data-sort]', (event, select) => navigate('/movies/results', { ...query, sort: select.value === 'popular' ? undefined : select.value }), { signal });
  on(outlet, 'click', '[data-action="retry"]', () => fetchPage(state.movies.length ? state.page + 1 : 1), { signal });

  on(outlet, 'click', '[data-heart]', (event, button) => {
    const id = Number(button.dataset.heart);
    const movie = state.movies.find((m) => m.id === id);
    const result = toggleHeart(movie);
    const t = getTogether();
    const n = t[t.phase].length;
    if (result === 'full') {
      announce(`${MAX_HEARTS} of ${MAX_HEARTS} already hearted. Unheart one to swap.`);
      return;
    }
    button.setAttribute('aria-pressed', String(result === 'added'));
    button.querySelector('[data-heart-label]').textContent = result === 'added' ? 'Hearted' : 'Heart';
    render(outlet.querySelector('[data-tray]'), tray());
    announce(`${n} of ${MAX_HEARTS} hearted.`);
  }, { signal });

  on(outlet, 'click', '[data-handoff]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return announce('Heart at least one movie first.');
    setTogether({ phase: 'handoff' });
    renderPage();
    focusHeading();
  }, { signal });
  on(outlet, 'click', '[data-ready]', () => {
    setTogether({ phase: 'second' });
    renderPage();
    if (!state.movies.length && !state.loading) fetchPage(1); // e.g. reloaded mid-handoff
    focusHeading();
  }, { signal });
  on(outlet, 'click', '[data-back-first]', () => {
    setTogether({ phase: 'first' });
    renderPage();
    if (!state.movies.length && !state.loading) fetchPage(1);
    focusHeading();
  }, { signal });
  on(outlet, 'click', '[data-reveal]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return announce('Heart at least one movie first.');
    setTogether({ phase: 'reveal' });
    renderPage();
    focusHeading();
  }, { signal });
  on(outlet, 'click', '[data-restart]', () => {
    endTogether();
    startTogether(JSON.stringify({ ...query, together: undefined }));
    renderPage();
    if (!state.movies.length && !state.loading) fetchPage(1);
    focusHeading();
  }, { signal });

  renderPage();
  const t = getTogether();
  if (!(together && (t?.phase === 'handoff' || t?.phase === 'reveal'))) fetchPage(1);
}

