// Shared view helpers: rendering, events, images and page states.
import { html, render } from './lib/html.js';
import { href } from './lib/router.js';
import { HttpError } from './lib/http.js';
import { tmdbImage, posterSrcset } from './api/tmdb.js';
import { icon, slice } from './components/icons.js';

export { html, render, href, icon, slice };

/**
 * Delegated event listener scoped to a view. It's removed automatically when the view's
 * signal aborts on navigation. It fires only when the event comes from an element matching
 * `selector` inside `root`, never for clicks anywhere on the page (the 2021 bug).
 */
export function on(root, type, selector, handler, { signal }) {
  root.addEventListener(
    type,
    (event) => {
      const target = event.target.closest?.(selector);
      if (target && root.contains(target)) handler(event, target);
    },
    { signal },
  );
}

export const $ = (selector, root = document) => root.querySelector(selector);

// ---- Images -------------------------------------------------------------------------

/** A 2:3 poster, or a typographic stand-in when TMDB has none. Decorative next to the title. */
export function poster(movie, { sizes = '(min-width: 600px) 220px, 112px', eager = false, alt = '' } = {}) {
  if (!movie.poster) {
    return html`<div class="poster poster--missing" role="presentation"><strong>${movie.title}</strong><span class="muted">${movie.year}</span></div>`;
  }
  return html`<div class="poster"><img src="${tmdbImage(movie.poster, 'w342')}" srcset="${posterSrcset(movie.poster)}" sizes="${sizes}" width="342" height="513" alt="${alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" ${eager ? html`fetchpriority="high"` : ''}></div>`;
}

/** Food or drink photo. `round` = the plate shape used for thumbnails of 160px or less. */
export function plate(item, { round = false, size = 'medium', eager = false } = {}) {
  if (!item?.thumb) return html`<div class="plate ${round ? 'plate--round' : ''} plate--missing" role="presentation"></div>`;
  // TheMealDB/TheCocktailDB serve smaller renditions via a path suffix. If one ever 404s,
  // the global image error handler (main.js) falls back to the original via data-fallback.
  const small = `${item.thumb}/${size}`;
  return html`<div class="plate ${round ? 'plate--round' : ''}"><img src="${small}" data-fallback="${item.thumb}" width="350" height="350" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async"></div>`;
}

// ---- Page states --------------------------------------------------------------------

export function skeletonCards(count = 6, kind = 'movie') {
  const one =
    kind === 'movie'
      ? html`<div class="skeleton-card skeleton-card--movie" aria-hidden="true"><div class="skeleton poster-skeleton"></div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text short"></div></div>`
      : html`<div class="skeleton-card skeleton-card--recipe" aria-hidden="true"><div class="skeleton plate-skeleton"></div><div class="skeleton skeleton--text"></div><div class="skeleton skeleton--text short"></div></div>`;
  return Array.from({ length: count }, () => one);
}

/** An error whose message is written for people (shown as-is, unlike bugs or HTTP errors). */
export class NoticeError extends Error {
  constructor(message, title = 'Nothing fits yet') {
    super(message);
    this.name = 'NoticeError';
    this.title = title;
  }
}

/** Maps an error to plain words: what happened and what the person can do. */
export function describeError(err, source = 'the server') {
  if (err instanceof NoticeError) return { icon: 'alert', title: err.title, body: err.message };
  if (!navigator.onLine) return { icon: 'wifi-off', title: "You're offline", body: 'Saved dates still work. We’ll be ready when you reconnect.' };
  if (err instanceof HttpError && err.status === 429) return { icon: 'timer', title: 'A little too fast', body: `${source} asked us to slow down. Try again in a few seconds.` };
  if (err instanceof HttpError && err.status === 401) return { icon: 'alert', title: `${source} turned us away`, body: 'The API key was rejected. If you run this copy of dateLime, check config.js.' };
  if (err instanceof HttpError && err.status === 404) return { icon: 'alert', title: 'We couldn’t find that', body: `${source} doesn’t have it any more. Your other picks are still here.` };
  return { icon: 'alert', title: 'The projector jammed', body: `We couldn’t reach ${source}. Check your connection and try again. Your picks are still here.` };
}

/** `level: 1` when the state replaces a whole page (every page needs an h1). */
const heading = (level, text) => (level === 1 ? html`<h1>${text}</h1>` : html`<h2>${text}</h2>`);

export function errorState(err, { source, retryLabel = 'Try again', extra = '', level = 2 } = {}) {
  const d = describeError(err, source);
  return html`<div class="state" role="alert">${icon(d.icon)}${heading(level, d.title)}<p>${d.body}</p><div class="button-row"><button class="button button--primary" type="button" data-action="retry">${icon('retry')}${retryLabel}</button>${extra}</div></div>`;
}

export function emptyState({ title, body, actions = '', level = 2 }) {
  return html`<div class="state">${slice()}${heading(level, title)}<p>${body}</p><div class="button-row">${actions}</div></div>`;
}

// ---- Step indicator -------------------------------------------------------------------

const STEPS = [
  { path: '/movies', label: 'Movie' },
  { path: '/recipes', label: 'Meal' },
  { path: '/date', label: 'Date' },
];

/** "Step 2 of 3 · Meal". Completed steps are links back for editing. */
export function steps(current, { done = [] } = {}) {
  const index = STEPS.findIndex((s) => s.path === current);
  return html`<nav class="steps-nav" aria-label="Planning steps"><p class="visually-hidden">Step ${index + 1} of ${STEPS.length}: ${STEPS[index].label}</p><ol class="steps">${STEPS.map((s, i) => {
    const isDone = done.includes(s.path) && i !== index;
    const dot = html`<span class="steps__dot" aria-hidden="true">${isDone ? icon('check') : i + 1}</span>`;
    if (i === index) return html`<li><span aria-current="step">${dot}<span class="steps__label">${s.label}</span></span></li>`;
    if (isDone) return html`<li class="is-done"><a href="${href(s.path)}">${dot}<span class="steps__label">${s.label}</span><span class="visually-hidden"> (done)</span></a></li>`;
    return html`<li><span>${dot}<span class="steps__label">${s.label}</span></span></li>`;
  })}</ol></nav>`;
}

// ---- Formatting -------------------------------------------------------------------------

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

export function formatTime(local) {
  const [d, t] = local.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  return timeFormat.format(new Date(y, m - 1, day, h, min));
}

export function formatDay(local) {
  const [y, m, d] = local.split('T')[0].split('-').map(Number);
  return dayFormat.format(new Date(y, m - 1, d));
}

/** "a Margarita", "an Afterglow". */
export const withArticle = (noun) => `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;

export function pluralize(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Sets focus on a region's heading (after async content replaces a skeleton). */
export function focusHeading(root) {
  const heading = root.querySelector('h1, h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

