// The movie sheet: the ONE place a TMDB details call happens (certification, runtime,
// providers, trailer and keywords arrive in a single request).
import { html } from '../lib/html.js';
import { getMovie, tmdbImage } from '../api/tmdb.js';
import { pairingFor } from '../domain/pairing.js';
import { formatRuntime } from '../domain/night-plan.js';
import { isAbortError } from '../lib/http.js';
import { openSheet } from './sheet.js';
import { icon } from './icons.js';
import { poster, describeError } from '../ui.js';

export function scoreLabel(rating) {
  if (rating === null || rating === undefined) return '';
  return html`<span aria-hidden="true">★ ${rating.toFixed(1)}</span><span class="visually-hidden">TMDB score ${rating.toFixed(1)} out of 10</span>`;
}

function providerBlock(details, region) {
  const p = details.providers;
  if (!p) return html`<p class="muted">No streaming information for ${region} yet.</p>`;
  const line = (label, list) =>
    list.length
      ? html`<div><p class="meta"><span>${label}</span></p><ul class="providers">${list.slice(0, 8).map((s) => html`<li>${s.logo ? html`<img src="${tmdbImage(s.logo, 'w92')}" alt="${s.name}" width="40" height="40" loading="lazy">` : html`<span class="badge">${s.name}</span>`}</li>`)}</ul></div>`
      : '';
  return html`${line('Stream', p.stream)}${line('Free', p.free)}${line('Rent', p.rent)}
    <p class="attribution">Streaming data by JustWatch.${p.link ? html` <a href="${p.link}" target="_blank" rel="noopener">All options on TMDB${icon('external')}</a>` : ''}</p>`;
}

export function detailsBody(details, region) {
  const pairing = pairingFor(details);
  return html`<div class="sheet-hero">${poster(details, { sizes: '120px' })}<div class="stack">
      <p class="meta">${details.year ? html`<span>${details.year}</span>` : ''}${details.runtime ? html`<span>${formatRuntime(details.runtime)}</span>` : ''}<span><span class="badge">${details.certification || 'Not rated'}</span></span></p>
      ${details.genres?.length ? html`<p class="meta"><span>${details.genres.join(', ')}</span></p>` : ''}
      ${details.rating !== null ? html`<p>${scoreLabel(details.rating)}</p>` : ''}
    </div></div>
    ${details.tagline ? html`<p class="tagline">${details.tagline}</p>` : ''}
    <p>${details.overview || 'No summary on TMDB yet.'}</p>
    <p class="pairs-with"><strong>Pairs with:</strong> ${pairing.reason}</p>
    ${details.trailer ? html`<div data-trailer><button class="button button--secondary" type="button" data-play-trailer="${details.trailer.key}">${icon('play')} Watch the trailer</button></div>` : ''}
    <section class="stack" aria-label="Where to watch"><h3>Where to watch (${region})</h3>${providerBlock(details, region)}</section>`;
}

/**
 * Opens the sheet for a movie from a list; fetches details inside.
 * @param {{movie: object, region: string, trigger?: HTMLElement, pickLabel?: string, onPick?: (details) => void}} options
 *   Without onPick the sheet is informational (no footer).
 */
export function openMovieSheet({ movie, region, trigger, pickLabel = 'Pick this movie', onPick }) {
  const controller = new AbortController();
  let details = null;
  const pickButton = (ready) => (onPick ? html`<button class="button button--primary button--large button--block" type="button" data-pick ${ready ? '' : html`aria-disabled="true"`}>${pickLabel}</button>` : '');
  const footer = pickButton(false);
  const sheet = openSheet({
    title: movie.title,
    trigger,
    body: html`<div class="stack" aria-busy="true"><div class="skeleton skeleton--block"></div><p class="muted">Dimming the lights…</p></div>`,
    footer,
    onClose: () => controller.abort(),
  });

  const load = async () => {
    try {
      details = await getMovie(movie.id, { region, signal: controller.signal });
      sheet.update({ body: detailsBody(details, region), footer: pickButton(true) });
    } catch (err) {
      if (isAbortError(err)) return;
      const d = describeError(err, 'TMDB');
      sheet.update({ body: html`<div class="state" role="alert">${icon(d.icon)}<p><strong>${d.title}.</strong> ${d.body}</p><button class="button button--secondary" type="button" data-retry>${icon('retry')} Try again</button></div>` });
    }
  };

  sheet.dialog.addEventListener('click', (event) => {
    const play = event.target.closest('[data-play-trailer]');
    if (play) {
      const key = play.dataset.playTrailer;
      const slot = play.closest('[data-trailer]');
      slot.innerHTML = String(
        html`<iframe class="video-frame" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}?autoplay=1&rel=0" title="${movie.title} trailer" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`,
      );
      slot.querySelector('iframe').focus();
    }
    if (event.target.closest('[data-retry]')) load();
    const pick = event.target.closest('[data-pick]');
    if (pick && details && onPick) {
      onPick(details);
      sheet.close();
    }
  });

  load();
  return sheet;
}

