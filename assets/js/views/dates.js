// Your dates: the saved-date diary. Lives on this device; export keeps a copy.
import { html, render, href, icon, on, poster, plate, emptyState, formatDay, formatTime, pluralize, withArticle } from '../ui.js';
import { toShareQuery } from '../domain/plan.js';
import { store, getSaved, removeSaved, rateSaved, exportDiary, importDiary } from '../state.js';
import { shareLink, downloadFile, appUrl } from '../lib/share.js';
import { announce, toast } from '../lib/announce.js';

export const title = () => 'Your dates';

function groups(saved, now = Date.now()) {
  const at = (p) => (p.when ? new Date(p.when).getTime() : NaN);
  return {
    upcoming: saved.filter((p) => at(p) >= now).sort((a, b) => at(a) - at(b)),
    anytime: saved.filter((p) => !p.when),
    past: saved.filter((p) => at(p) < now).sort((a, b) => at(b) - at(a)),
  };
}

const planHash = (p) => href('/date', toShareQuery(p));

function miniTicket(p, { past = false } = {}) {
  const label = `${p.movie.title} + ${p.meal.name}`;
  return html`<li><article class="mini-ticket" aria-labelledby="date-${p.id}">
    <div class="mini-ticket__art">${poster(p.movie, { sizes: '56px' })}${plate(p.meal, { round: true, size: 'small' })}</div>
    <div class="mini-ticket__body">
      <p class="mini-ticket__when">${p.when ? `${formatDay(p.when)} · ${formatTime(p.when)}` : 'Anytime'}</p>
      <h3 id="date-${p.id}">${label}</h3>
      ${p.drink ? html`<p class="meta"><span>with ${withArticle(p.drink.name)}</span></p>` : ''}
      <div class="button-row">
        <a class="button button--small button--primary" href="${planHash(p)}">Open<span class="visually-hidden"> ${label}</span></a>
        <button class="button button--small button--secondary" type="button" data-share="${p.id}">${icon('share')} Share<span class="visually-hidden"> ${label}</span></button>
        <button class="button button--small button--danger" type="button" data-delete="${p.id}">${icon('trash')} Delete<span class="visually-hidden"> ${label}</span></button>
      </div>
      ${past
        ? html`<fieldset class="rating"><legend>How was it?</legend>${[1, 2, 3, 4, 5].map((n) => html`<label class="chip"><input type="radio" name="rating-${p.id}" value="${n}" data-rate="${p.id}" ${p.rating === n ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${n}<span class="visually-hidden"> ${n === 1 ? 'lime' : 'limes'} out of 5</span></label>`)}</fieldset>`
        : ''}
    </div>
  </article></li>`;
}

export function mount(outlet, { signal }) {
  function renderAll() {
    const saved = getSaved();
    const g = groups(saved);
    render(
      outlet,
      html`<div class="page">
        <header class="page-head">
          <h1>Your dates</h1>
          <p>Saved on this device only. Export your diary to keep a copy, or to move it to another phone.</p>
        </header>
        ${saved.length
          ? html`${g.upcoming.length ? html`<section class="section" aria-labelledby="up-title"><h2 id="up-title">Coming up</h2><ul class="date-list">${g.upcoming.map((p) => miniTicket(p))}</ul></section>` : ''}
            ${g.anytime.length ? html`<section class="section" aria-labelledby="any-title"><h2 id="any-title">Anytime</h2><ul class="date-list">${g.anytime.map((p) => miniTicket(p))}</ul></section>` : ''}
            ${g.past.length ? html`<section class="section" aria-labelledby="past-title"><h2 id="past-title">Past dates</h2><ul class="date-list">${g.past.map((p) => miniTicket(p, { past: true }))}</ul></section>` : ''}`
          : emptyState({ title: 'No saved dates yet', body: 'Plan one and tap Save on the ticket. It will wait for you here.', actions: html`<a class="button button--primary" href="${href('/movies')}">Plan a date</a>` })}
        <section class="section" aria-labelledby="diary-title">
          <h2 id="diary-title">Diary</h2>
          <div class="button-row">
            <button class="button button--secondary" type="button" data-export ${saved.length ? '' : html`aria-disabled="true"`}>${icon('download')} Export diary</button>
            <label class="button button--secondary">${icon('upload')} Import diary<input class="visually-hidden" type="file" accept="application/json,.json" data-import></label>
          </div>
        </section>
      </div>`,
    );
  }

  // Undo (or another tab) changes the list: re-render in place.
  const unsubscribe = store.subscribe((next, prev) => {
    if (next.saved !== prev.saved) renderAll();
  });

  on(outlet, 'click', '[data-delete]', (event, button) => {
    const plan = getSaved().find((p) => p.id === button.dataset.delete);
    const undo = removeSaved(button.dataset.delete);
    if (!undo) return;
    outlet.querySelector('h1')?.focus();
    toast(`Deleted ${plan.movie.title} + ${plan.meal.name}.`, { tone: 'info', action: { label: 'Undo', onClick: undo } });
  }, { signal });

  on(outlet, 'click', '[data-share]', async (event, button) => {
    const p = getSaved().find((x) => x.id === button.dataset.share);
    const when = p.when ? ` ${formatDay(p.when)}, press play at ${formatTime(p.when)}.` : '';
    const result = await shareLink({ title: 'Our date night', text: `Date night? ${p.movie.title}, then ${p.meal.name}.${when}`, url: appUrl(planHash(p)) });
    if (result === 'copied') toast('Link copied. Paste it to your date.');
    else if (result === 'shared') toast('Ticket sent. Admit two!');
    else if (result === 'manual') toast(`Copy this link: ${appUrl(planHash(p))}`, { tone: 'info', duration: 12_000 });
  }, { signal });

  on(outlet, 'change', '[data-rate]', (event, input) => {
    rateSaved(input.dataset.rate, Number(input.value));
    announce(`Rated ${input.value} out of 5.`);
    // The re-render replaced the input; put focus back on the new one.
    outlet.querySelector(`[data-rate="${CSS.escape(input.dataset.rate)}"][value="${input.value}"]`)?.focus();
  }, { signal });

  on(outlet, 'click', '[data-export]', (event, button) => {
    if (button.getAttribute('aria-disabled') === 'true') return announce('Nothing to export yet.');
    downloadFile(`datelime-diary-${new Date().toISOString().slice(0, 10)}.json`, exportDiary(), 'application/json');
    toast('Diary exported.');
  }, { signal });

  on(outlet, 'change', '[data-import]', async (event, input) => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const added = importDiary(await file.text());
      toast(added ? `Imported ${pluralize(added, 'date')}.` : 'Those dates were already here.');
    } catch (err) {
      toast(err instanceof SyntaxError ? 'That file isn’t valid JSON.' : err.message, { tone: 'danger', duration: 8000 });
    }
  }, { signal });

  renderAll();
  return unsubscribe;
}
