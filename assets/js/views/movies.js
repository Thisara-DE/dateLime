// Step 1 of 3: what kind of movie? A real <form> (Enter submits, arrow keys move within
// each radio group); submitting writes the choices into the URL (#/movies/results?...).
import { html, render, href, icon, steps, on } from '../ui.js';
import { MOODS, GENRES, LENGTHS, CERTIFICATIONS } from '../domain/moods.js';
import { getRules } from '../state.js';
import { navigate } from '../lib/navigate.js';

export const title = () => 'Pick a movie';

function radioChip({ name, value, checked, label, sub }) {
  return html`<label class="chip"><input type="radio" name="${name}" value="${value}" ${checked ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span><span class="chip__text">${label}${sub ? html`<small><span class="visually-hidden">, </span>${sub}</small>` : ''}</span></label>`;
}

export function servicesSummary(rules) {
  if (!rules.services.length) return html`All streaming services (${rules.region})`;
  return html`Streaming on ${rules.services.map((s) => s.name).join(', ')} (${rules.region})`;
}

export function mount(outlet, { query, signal }) {
  const rules = getRules();
  const selectedMood = query.genre ? `genre-${query.genre}` : (query.mood ?? 'any');
  const selectedLength = query.len ?? 'any';
  const selectedCert = query.cert ?? rules.maxCertification ?? '';
  const together = query.together === '1';
  const exactGenreChosen = selectedMood.startsWith('genre-');

  render(
    outlet,
    html`<div class="page page--narrow">
      ${steps('/movies')}
      <form class="stack" data-movie-form novalidate>
        <header class="page-head">
          <h1>What's the mood tonight?</h1>
          ${together
            ? html`<div class="banner">${icon('heart')}<p><strong>Decide together.</strong> Pick the kind of movie you'd both consider. Then you'll each heart up to three, and see if you match.</p></div>`
            : html`<p>Leave it on Any if you're easy. Everything below is optional.</p>`}
        </header>

        <fieldset class="field">
          <legend>Mood</legend>
          <div class="mood-grid">
            ${MOODS.map((m) => radioChip({ name: 'mood', value: m.id, checked: m.id === selectedMood, label: html`<strong>${m.label}</strong>`, sub: m.genreLabel }))}
          </div>
          <details class="more" ${exactGenreChosen ? html`open` : ''}>
            <summary>Pick an exact genre instead</summary>
            <div class="chips">
              ${GENRES.map((g) => radioChip({ name: 'mood', value: `genre-${g.id}`, checked: `genre-${g.id}` === selectedMood, label: g.name }))}
            </div>
          </details>
        </fieldset>

        <fieldset class="field">
          <legend>How late are we going?</legend>
          <div class="chips">${LENGTHS.map((l) => radioChip({ name: 'len', value: l.id, checked: l.id === selectedLength, label: l.label }))}</div>
        </fieldset>

        <fieldset class="field">
          <legend>Rated up to (US)</legend>
          <p class="field__hint">Movies at or below this rating.</p>
          <div class="chips">${CERTIFICATIONS.map((c) => radioChip({ name: 'cert', value: c.id, checked: c.id === selectedCert, label: c.label }))}</div>
        </fieldset>

        <p class="rules-summary">${icon('tv')}<span>${servicesSummary(rules)}</span><a href="${href('/rules')}">Edit house rules</a></p>

        <div class="action-bar action-bar--inline-desktop">
          <div class="action-bar__inner">
            <button class="button button--primary button--large" type="submit">Show movies ${icon('arrow-right')}</button>
          </div>
        </div>
      </form>
    </div>`,
  );

  on(
    outlet,
    'submit',
    '[data-movie-form]',
    (event, form) => {
      event.preventDefault();
      const data = new FormData(form);
      const mood = String(data.get('mood') ?? 'any');
      navigate('/movies/results', {
        mood: mood.startsWith('genre-') ? undefined : mood === 'any' ? undefined : mood,
        genre: mood.startsWith('genre-') ? mood.slice(6) : undefined,
        len: data.get('len') === 'any' ? undefined : data.get('len'),
        cert: data.get('cert') || undefined,
        together: together ? 1 : undefined,
      });
    },
    { signal },
  );
}
