// "Surprise us" / Spin the Lime: deal a whole date in one tap; hold what you like, re-spin the rest.
import { html, render, href, icon, on, poster, plate, errorState, NoticeError, withArticle } from '../ui.js';
import { discoverMovies, getMovie } from '../api/tmdb.js';
import { mealsByArea, mealsByCategory, getMeal } from '../api/mealdb.js';
import { zeroProofDrinks, drinksWith } from '../api/cocktaildb.js';
import { findPairedMeals } from '../domain/pairing.js';
import { avoidMatches } from '../domain/avoid.js';
import { formatRuntime } from '../domain/night-plan.js';
import { getRules, updateDraft } from '../state.js';
import { announce } from '../lib/announce.js';
import { isAbortError } from '../lib/http.js';
import { navigate } from '../lib/navigate.js';

export const title = () => 'Surprise us';

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
const mealApi = { byArea: mealsByArea, byCategory: mealsByCategory };

export function mount(outlet, { signal }) {
  const rules = getRules();
  const held = { movie: false, meal: false, drink: false };
  const deal = { movie: null, meal: null, drink: null };
  let dealing = false;
  let error = null;
  let firstDeal = true;

  async function dealMovie() {
    const base = {
      minVotes: 500,
      minRating: 6.8,
      maxCertification: rules.maxCertification || undefined,
      providerIds: rules.services.map((s) => s.id),
      region: rules.region,
      signal,
    };
    let result = await discoverMovies({ ...base, page: 1 + Math.floor(Math.random() * 5) });
    if (!result.movies.length) result = await discoverMovies({ ...base, page: 1 });
    if (!result.movies.length) throw new NoticeError('No movies match your house rules. Try loosening them.');
    const choice = pickRandom(result.movies.filter((m) => m.id !== deal.movie?.id)) ?? result.movies[0];
    return getMovie(choice.id, { region: rules.region, signal });
  }

  async function dealMeal(movie) {
    const { meals } = await findPairedMeals({ movie, diet: rules.diet, seed: Math.floor(Math.random() * 10_000), signal }, mealApi);
    const candidates = meals.slice(0, 12).filter((m) => m.id !== deal.meal?.id);
    for (let i = 0; i < 5 && candidates.length; i += 1) {
      const pick = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];
      const full = await getMeal(pick.id, { signal });
      if (full && !avoidMatches(full.ingredients, rules.avoid).length) return full;
    }
    throw new NoticeError('We couldn’t find a recipe that fits your house rules.');
  }

  async function dealDrink() {
    if (rules.drink === 'none') return null;
    const list = rules.drink === 'cocktail' ? await drinksWith('Lime', { signal }) : await zeroProofDrinks({ signal });
    const pick = pickRandom(list.filter((d) => d.id !== deal.drink?.id)) ?? list[0];
    return pick ? { ...pick, alcoholic: rules.drink === 'cocktail' } : null;
  }

  async function spin() {
    dealing = true;
    error = null;
    renderAll();
    try {
      if (!held.movie || !deal.movie) deal.movie = await dealMovie();
      const [meal, drink] = await Promise.all([
        !held.meal || !deal.meal ? dealMeal(deal.movie) : deal.meal,
        !held.drink ? dealDrink() : deal.drink,
      ]);
      deal.meal = meal;
      deal.drink = drink;
      announce(`Dealt: ${deal.movie.title}, ${deal.meal.name}${deal.drink ? `, and ${withArticle(deal.drink.name)}` : ''}.`);
    } catch (err) {
      if (isAbortError(err)) return;
      error = err;
    }
    dealing = false;
    renderAll();
    firstDeal = false;
  }

  function reel(kind, content) {
    return html`<li class="reel ${dealing ? '' : firstDeal ? 'is-dealing' : ''}" aria-busy="${String(dealing && !held[kind])}">${content}</li>`;
  }

  function holdButton(kind, label) {
    return html`<button class="button button--small button--secondary hold" type="button" data-hold="${kind}" aria-pressed="${String(held[kind])}">${held[kind] ? 'Held' : 'Hold'}<span class="visually-hidden"> the ${label}</span></button>`;
  }

  function renderAll() {
    if (error && !deal.movie) {
      render(outlet, html`<div class="page page--narrow"><h1>Spin the lime</h1>${errorState(error, { source: 'the movie database', extra: html`<a class="button button--secondary" href="${href('/rules')}">Edit house rules</a>` })}</div>`);
      return;
    }
    const { movie, meal, drink } = deal;
    const skeleton = html`<div class="skeleton" aria-hidden="true"></div><div class="reel__body"><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text short"></div></div>`;
    render(
      outlet,
      html`<div class="page page--narrow">
        <header class="page-head"><h1>Spin the lime</h1><p>One tap, one whole date. Hold what you like and spin again for the rest.</p></header>
        ${error ? html`<p class="banner banner--warning" role="alert">${icon('alert')}<span>${error instanceof NoticeError ? error.message : 'We lost the connection mid-spin.'} Try spinning again.</span></p>` : ''}
        <ul class="reels" aria-label="Your surprise date">
          ${reel('movie', movie && !(dealing && !held.movie) ? html`${poster(movie, { sizes: '72px' })}<div class="reel__body"><p class="reel__kind">Movie</p><h2>${movie.title}</h2><p class="meta">${movie.year ? html`<span>${movie.year}</span>` : ''}${movie.runtime ? html`<span>${formatRuntime(movie.runtime)}</span>` : ''}${movie.certification ? html`<span>${movie.certification}</span>` : ''}</p>${holdButton('movie', 'movie')}</div>` : skeleton)}
          ${reel('meal', meal && !(dealing && !held.meal) ? html`${plate(meal, { round: true })}<div class="reel__body"><p class="reel__kind">Dinner</p><h2>${meal.name}</h2><p class="meta">${meal.area ? html`<span>${meal.area}</span>` : ''}${meal.category ? html`<span>${meal.category}</span>` : ''}</p>${holdButton('meal', 'dinner')}</div>` : skeleton)}
          ${rules.drink === 'none' ? '' : reel('drink', drink && !(dealing && !held.drink) ? html`${plate(drink, { round: true, size: 'small' })}<div class="reel__body"><p class="reel__kind">Drink</p><h2>${drink.name}</h2><p class="meta"><span>${drink.alcoholic ? 'Lime cocktail' : 'Zero-proof'}</span></p>${holdButton('drink', 'drink')}</div>` : skeleton)}
        </ul>
        <div class="action-bar action-bar--inline-desktop"><div class="action-bar__inner">
          <button class="button button--secondary" type="button" data-spin ${dealing ? html`aria-disabled="true" aria-busy="true"` : ''}><span class="spinner" aria-hidden="true"></span>${icon('shuffle')} Spin again</button>
          <button class="button button--primary" type="button" data-use ${!movie || !meal || dealing ? html`aria-disabled="true"` : ''}>Use this date ${icon('arrow-right')}</button>
        </div></div>
        <p class="muted">Follows your <a href="${href('/rules')}">house rules</a>: services, rating limit, diet and drink.</p>
      </div>`,
    );
  }

  on(outlet, 'click', '[data-hold]', (event, button) => {
    const kind = button.dataset.hold;
    held[kind] = !held[kind];
    button.setAttribute('aria-pressed', String(held[kind]));
    button.firstChild.textContent = held[kind] ? 'Held' : 'Hold';
  }, { signal });
  on(outlet, 'click', '[data-spin]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    spin().then(() => outlet.querySelector('[data-spin]')?.focus());
  }, { signal });
  on(outlet, 'click', '[data-use]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return;
    updateDraft({ movie: deal.movie, meal: deal.meal, drink: deal.drink, drinkKind: rules.drink, drinkIndex: 0, movieQuery: {}, savedId: null });
    navigate('/date');
  }, { signal });
  on(outlet, 'click', '[data-action="retry"]', () => spin(), { signal });

  spin();
}
