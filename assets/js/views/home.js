// Landing. No API calls: everything here is local, so it paints instantly.
import { html, render, href, icon, slice, poster, formatDay, formatTime } from '../ui.js';
import { wordmark } from '../components/wordmark.js';
import { getDraft, getSaved } from '../state.js';

export const title = () => 'Dinner and a movie, for two';

function nextSavedDate(saved, now = new Date()) {
  const stamp = (p) => (p.when ? new Date(p.when).getTime() : NaN);
  return saved.filter((p) => stamp(p) >= now.getTime()).sort((a, b) => stamp(a) - stamp(b))[0] ?? null;
}

function continueCard(draft) {
  if (!draft.movie) return '';
  const target = draft.meal ? '/date' : '/recipes';
  const label = draft.meal ? `${draft.movie.title} + ${draft.meal.name}` : draft.movie.title;
  return html`<a class="continue-card" href="${href(target)}">${poster(draft.movie, { sizes: '48px' })}<span><span class="eyebrow">Pick up where you left off</span><br><strong>${label}</strong></span>${icon('arrow-right')}</a>`;
}

function upcomingCard(plan) {
  if (!plan) return '';
  const q = { m: plan.movie.id, r: plan.meal.id, d: plan.drink?.id, at: plan.when };
  return html`<a class="continue-card" href="${href('/date', q)}">${poster(plan.movie, { sizes: '48px' })}<span><span class="eyebrow">Your next date · ${formatDay(plan.when)}, ${formatTime(plan.when)}</span><br><strong>${plan.movie.title} + ${plan.meal.name}</strong></span>${icon('arrow-right')}</a>`;
}

export function mount(outlet) {
  const draft = getDraft();
  const upcoming = nextSavedDate(getSaved());
  let moonRisen = false;
  try {
    moonRisen = sessionStorage.getItem('datelime.moon') === '1';
    sessionStorage.setItem('datelime.moon', '1');
  } catch {
    /* ignore */
  }

  render(
    outlet,
    html`<section class="stage" aria-labelledby="hero-title">
        <div class="stage__moon ${moonRisen ? '' : 'is-rising'}">${slice()}</div>
        <div class="stage__inner">
          ${wordmark({ title: 'dateLime' })}
          <p class="stage__eyebrow">Date night, in</p>
          <h1 id="hero-title">Dinner and a movie, for two.</h1>
          <p class="stage__lead">Pick tonight's film. We'll pair a dish and a drink with its mood, then hand you a ticket for two.</p>
          <div class="button-row">
            <a class="button button--primary button--large" href="${href('/movies')}">Start tonight's date ${icon('arrow-right')}</a>
            <a class="button button--secondary button--large" href="${href('/surprise')}">${icon('shuffle')} Surprise us</a>
          </div>
        </div>
      </section>
      <div class="page">
        <div class="landing-grid">
          <div class="stack">
            ${continueCard(draft)} ${upcomingCard(upcoming)}
            <section class="section" aria-labelledby="how-title">
              <h2 id="how-title">How it works</h2>
              <ol class="how-it-works">
                <li>${icon('film')}<h3>1. Pick a movie</h3><p>Choose a mood, or leave it on Any. We only show what you can stream, if you tell us your services.</p></li>
                <li>${icon('utensils')}<h3>2. Get the matching meal</h3><p>A recipe paired with the film, and a one-line reason why. Vegetarian and vegan welcome.</p></li>
                <li>${icon('ticket')}<h3>3. Admit two</h3><p>Your date on a ticket: a timeline, a calendar invite, and a link to send your date.</p></li>
              </ol>
            </section>
          </div>
          <aside class="stack">
            <div class="feature-card feature-card--together">
              ${icon('heart')}
              <h2>Can't agree? Decide together.</h2>
              <p class="muted">You each heart up to three movies and pass the phone. If you pick the same one, it's a date.</p>
              <a class="button button--secondary" href="${href('/movies', { together: 1 })}">Decide together</a>
            </div>
            <div class="feature-card">
              ${icon('sliders')}
              <h2>House rules</h2>
              <p class="muted">Tell us your streaming services, diet and rating limit once. Every date follows them.</p>
              <a class="button button--secondary" href="${href('/rules')}">Set house rules</a>
            </div>
          </aside>
        </div>
      </div>`,
  );
}
