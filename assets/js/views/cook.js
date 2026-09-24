// Cook-along: one big step at a time, timers found in the text, and a screen that stays awake.
import { html, render, href, icon, on, plate, errorState, emptyState, pluralize } from '../ui.js';
import { getMeal } from '../api/mealdb.js';
import { findDurations, formatCountdown } from '../domain/timers.js';
import { buildNightPlan, parseLocal } from '../domain/night-plan.js';
import { getDraft } from '../state.js';
import { announce } from '../lib/announce.js';
import { isAbortError, HttpError } from '../lib/http.js';

export const title = () => 'Cook-along';

let audio = null;
function chime() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime;
    for (const [offset, freq] of [[0, 880], [0.35, 1175]]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, t + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.9);
      osc.connect(gain).connect(audio.destination);
      osc.start(t + offset);
      osc.stop(t + offset + 1);
    }
  } catch {
    /* audio is a bonus; the visual and announced alerts still happen */
  }
}

export function mount(outlet, { query, signal }) {
  const draft = getDraft();
  const mealId = query.r ?? draft.meal?.id;
  if (!mealId) {
    render(outlet, html`<div class="page page--narrow">${emptyState({ title: 'Nothing on the stove yet', body: 'Pick a meal first, then come back to cook along.', actions: html`<a class="button button--primary" href="${href('/movies')}">Plan a date</a>`, level: 1 })}</div>`);
    return;
  }

  let meal = draft.meal?.id === String(mealId) && draft.meal.steps?.length ? draft.meal : null;
  let index = 0;
  let showAll = false;
  let error = null;
  const timers = [];
  let tick = null;
  let nextTimerId = 1;

  // ---- Wake Lock ----------------------------------------------------------------------
  const wakeSupported = 'wakeLock' in navigator;
  let wakeWanted = true;
  let sentinel = null;
  async function requestWake() {
    if (!wakeSupported || !wakeWanted || document.visibilityState !== 'visible') return renderWake();
    try {
      sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        sentinel = null;
        renderWake();
      });
    } catch {
      sentinel = null;
    }
    renderWake();
  }
  function releaseWake() {
    sentinel?.release().catch(() => {});
    sentinel = null;
  }
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && requestWake(), { signal });

  // ---- Rendering --------------------------------------------------------------------
  const playAt = draft.meal?.id === String(mealId) && draft.when ? draft.when : null;

  function wakeLine() {
    if (!wakeSupported) return html`<div class="wake">${icon('info')}<span>Your browser can't keep the screen awake. Give it a tap now and then.</span></div>`;
    return sentinel
      ? html`<div class="wake">${icon('sun')}<span>Screen stays on while you cook.</span><button class="button button--small button--secondary" type="button" data-wake="off">Let it sleep</button></div>`
      : html`<div class="wake">${icon('moon')}<span>The screen may sleep.</span><button class="button button--small button--secondary" type="button" data-wake="on">Keep it on</button></div>`;
  }
  const renderWake = () => {
    const el = outlet.querySelector('[data-wake-line]');
    if (el) render(el, wakeLine());
  };

  function countdownText() {
    if (!playAt) return '';
    const plan = buildNightPlan({ playAt, runtime: draft.movie?.runtime, cookMinutes: draft.cookMinutes });
    const ms = parseLocal(plan.play) - Date.now();
    if (ms <= 0) return 'Showtime: press play!';
    const mins = Math.round(ms / 60_000);
    return mins > 24 * 60 ? '' : `Press play in ${mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins} min`}.`;
  }

  function stepCard() {
    const text = meal.steps[index];
    const durations = findDurations(text);
    return html`<section class="step-card" aria-labelledby="step-heading">
      <h2 id="step-heading" class="cook__progress">Step ${index + 1} of ${meal.steps.length}</h2>
      <p class="step-card__text">${text}</p>
      ${durations.length ? html`<div class="button-row">${durations.map((d) => html`<button class="button button--secondary" type="button" data-start-timer="${d.minutes}" data-label="${d.label}">${icon('timer')} Start ${d.label} timer</button>`)}</div>` : ''}
    </section>`;
  }

  function timersList() {
    if (!timers.length) return '';
    return html`<ul class="timers" aria-label="Timers">${timers.map((t) => html`<li class="timer ${t.done ? 'is-done' : ''}">
        <span><span class="timer__time" aria-hidden="true">${t.done ? 'Done' : formatCountdown(t.endsAt - Date.now())}</span><br><span class="muted">${t.label} · step ${t.step}</span></span>
        <button class="button button--small button--secondary" type="button" data-cancel-timer="${t.id}">${t.done ? 'Dismiss' : 'Cancel'}<span class="visually-hidden"> ${t.label} timer</span></button>
      </li>`)}</ul>`;
  }

  function renderAll() {
    if (error) {
      render(outlet, html`<div class="page page--narrow">${errorState(error, { source: 'TheMealDB', level: 1 })}</div>`);
      return;
    }
    if (!meal) {
      render(outlet, html`<div class="page page--narrow" aria-busy="true"><h1>Setting up the kitchen…</h1><div class="skeleton skeleton--block"></div></div>`);
      return;
    }
    render(
      outlet,
      html`<div class="page page--narrow cook">
        <div class="cook__top">
          <a class="button button--ghost" href="${href(draft.meal?.id === String(meal.id) ? '/date' : '/')}">${icon('chevron-left')} Exit</a>
          <p class="countdown" data-countdown aria-live="off">${countdownText()}</p>
        </div>
        <header class="page-head"><h1>${meal.name}</h1></header>
        <div data-wake-line>${wakeLine()}</div>
        <div role="alert" class="visually-hidden" data-timer-alert></div>
        <div data-timers>${timersList()}</div>
        <div data-step>${showAll ? '' : stepCard()}</div>
        ${showAll ? html`<ol class="all-steps">${meal.steps.map((s, i) => html`<li ${i === index ? html`aria-current="step"` : ''}>${s}</li>`)}</ol>` : ''}
        <p><button class="button button--ghost" type="button" data-toggle-all aria-pressed="${String(showAll)}">${icon('list')} ${showAll ? 'One step at a time' : 'Show all steps'}</button></p>
        <details class="more"><summary>Ingredients (${meal.ingredients.length})</summary>
          ${plate(meal, { size: 'medium' })}
          <ul class="checklist">${meal.ingredients.map((i, n) => html`<li><label><input type="checkbox" name="ing-${n}"><span>${i.measure ? html`<span class="measure">${i.measure}</span> ` : ''}${i.name}</span></label></li>`)}</ul>
        </details>
        ${showAll
          ? ''
          : html`<div class="action-bar cook-nav"><div class="action-bar__inner">
              <button class="button button--secondary" type="button" data-prev ${index === 0 ? html`aria-disabled="true"` : ''}>${icon('chevron-left')} Back</button>
              <button class="button button--primary" type="button" data-next>${index === meal.steps.length - 1 ? html`Done ${icon('check')}` : html`Next ${icon('chevron-right')}`}</button>
            </div></div>`}
      </div>`,
    );
  }

  function go(delta) {
    const next = Math.min(Math.max(index + delta, 0), meal.steps.length - 1);
    if (next === index) {
      if (delta > 0) announce('That was the last step. Enjoy your meal!');
      return;
    }
    index = next;
    render(outlet.querySelector('[data-step]'), stepCard());
    const prev = outlet.querySelector('[data-prev]');
    if (prev) index === 0 ? prev.setAttribute('aria-disabled', 'true') : prev.removeAttribute('aria-disabled');
    const nextBtn = outlet.querySelector('[data-next]');
    if (nextBtn) render(nextBtn, index === meal.steps.length - 1 ? html`Done ${icon('check')}` : html`Next ${icon('chevron-right')}`);
    announce(`Step ${index + 1} of ${meal.steps.length}.`);
  }

  // ---- Timers (timestamp-based, so background throttling can't make them drift) -----------
  function ensureTicking() {
    if (tick) return;
    tick = setInterval(() => {
      const now = Date.now();
      for (const t of timers) {
        if (!t.done && t.endsAt <= now) {
          t.done = true;
          const alertEl = outlet.querySelector('[data-timer-alert]');
          if (alertEl) alertEl.textContent = `Timer done: ${t.label}, step ${t.step}.`;
          chime();
          navigator.vibrate?.([200, 100, 200]);
        }
      }
      const list = outlet.querySelector('[data-timers]');
      if (list) render(list, timersList());
      const cd = outlet.querySelector('[data-countdown]');
      if (cd) cd.textContent = countdownText();
      if (!timers.some((t) => !t.done) && !playAt) {
        clearInterval(tick);
        tick = null;
      }
    }, 1000);
  }

  // ---- Events -----------------------------------------------------------------------
  on(outlet, 'click', '[data-next]', () => go(1), { signal });
  on(outlet, 'click', '[data-prev]', () => go(-1), { signal });
  on(outlet, 'click', '[data-toggle-all]', () => {
    showAll = !showAll;
    renderAll();
    outlet.querySelector('[data-toggle-all]')?.focus();
  }, { signal });
  on(outlet, 'click', '[data-wake]', (event, button) => {
    wakeWanted = button.dataset.wake === 'on';
    if (wakeWanted) requestWake();
    else {
      releaseWake();
      renderWake();
    }
    outlet.querySelector('[data-wake]')?.focus();
  }, { signal });
  on(outlet, 'click', '[data-start-timer]', (event, button) => {
    const minutes = Number(button.dataset.startTimer);
    timers.push({ id: nextTimerId++, label: button.dataset.label, step: index + 1, endsAt: Date.now() + minutes * 60_000, done: false });
    try {
      audio ??= new (window.AudioContext || window.webkitAudioContext)(); // unlocked by this tap
    } catch {
      /* ignore */
    }
    render(outlet.querySelector('[data-timers]'), timersList());
    ensureTicking();
    announce(`${button.dataset.label} timer started.`);
  }, { signal });
  on(outlet, 'click', '[data-cancel-timer]', (event, button) => {
    const i = timers.findIndex((t) => t.id === Number(button.dataset.cancelTimer));
    if (i >= 0) timers.splice(i, 1);
    render(outlet.querySelector('[data-timers]'), timersList());
    announce(pluralize(timers.length, 'timer') + ' running.');
  }, { signal });
  on(outlet, 'click', '[data-action="retry"]', () => load(), { signal });

  document.addEventListener(
    'keydown',
    (event) => {
      if (!meal || showAll || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target.closest?.('input, textarea, select, dialog')) return;
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    },
    { signal },
  );

  async function load() {
    error = null;
    renderAll();
    try {
      meal = await getMeal(mealId, { signal });
      if (!meal) throw new HttpError('Recipe not found', { status: 404 });
    } catch (err) {
      if (isAbortError(err)) return;
      error = err;
    }
    renderAll();
  }

  if (meal) renderAll();
  else load();
  requestWake();
  if (playAt) ensureTicking();

  return () => {
    releaseWake();
    clearInterval(tick);
  };
}
