// The recipe sheet: full recipe (one lookup.php call), shown before committing to it.
import { html } from '../lib/html.js';
import { getMeal } from '../api/mealdb.js';
import { avoidMatches } from '../domain/avoid.js';
import { isAbortError, HttpError } from '../lib/http.js';
import { openSheet } from './sheet.js';
import { icon } from './icons.js';
import { plate, describeError, pluralize } from '../ui.js';

export function avoidBanner(meal, avoidKeys) {
  const found = avoidMatches(meal.ingredients, avoidKeys);
  if (!found.length) return '';
  return html`<div class="banner banner--warning" role="note">${icon('alert')}<p><strong>Heads up:</strong> ${found.map((f) => `${f.label.toLowerCase()} (${f.ingredient})`).join(', ')}. We check ingredient lists only, so always double-check for allergies.</p></div>`;
}

export function recipeBody(meal, { avoid = [] } = {}) {
  return html`${plate(meal, { size: 'large', eager: true })}
    <p class="meta">${meal.area ? html`<span>${meal.area}</span>` : ''}${meal.category ? html`<span>${meal.category}</span>` : ''}<span>${pluralize(meal.ingredients.length, 'ingredient')}</span><span>${pluralize(meal.steps.length, 'step')}</span></p>
    ${avoidBanner(meal, avoid)}
    <section class="stack" aria-label="Ingredients"><h3>Ingredients</h3>
      <ul class="checklist">${meal.ingredients.map((i) => html`<li>${i.measure ? html`<span class="measure">${i.measure}</span> ` : ''}${i.name}</li>`)}</ul>
    </section>
    <section class="stack" aria-label="Method"><h3>Method</h3>
      <ol class="stack">${meal.steps.map((s) => html`<li>${s}</li>`)}</ol>
    </section>
    <p class="button-row">
      ${meal.youtube ? html`<a class="button button--secondary button--small" href="${meal.youtube}" target="_blank" rel="noopener">${icon('play')} Video</a>` : ''}
      ${meal.source ? html`<a class="button button--secondary button--small" href="${meal.source}" target="_blank" rel="noopener">${icon('external')} Original recipe</a>` : ''}
    </p>
    <p class="attribution">Recipe from TheMealDB.</p>`;
}

/**
 * @param {{meal: {id: string, name: string}, trigger?: HTMLElement, avoid?: string[], pickLabel?: string, onPick: (meal) => void}} options
 */
export function openRecipeSheet({ meal, trigger, avoid = [], pickLabel = 'Cook this', onPick }) {
  const controller = new AbortController();
  let full = null;
  const sheet = openSheet({
    title: meal.name,
    trigger,
    body: html`<div class="stack" aria-busy="true"><div class="skeleton skeleton--block"></div><p class="muted">Setting the table…</p></div>`,
    footer: html`<button class="button button--primary button--large button--block" type="button" data-pick aria-disabled="true">${pickLabel}</button>`,
    onClose: () => controller.abort(),
  });

  const load = async () => {
    try {
      full = await getMeal(meal.id, { signal: controller.signal });
      if (!full) throw new HttpError('Recipe not found', { status: 404 });
      sheet.update({ body: recipeBody(full, { avoid }), footer: html`<button class="button button--primary button--large button--block" type="button" data-pick>${pickLabel}</button>` });
    } catch (err) {
      if (isAbortError(err)) return;
      const d = describeError(err, 'TheMealDB');
      sheet.update({ body: html`<div class="state" role="alert">${icon(d.icon)}<p><strong>${d.title}.</strong> ${d.body}</p><button class="button button--secondary" type="button" data-retry>${icon('retry')} Try again</button></div>` });
    }
  };

  sheet.dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-retry]')) load();
    if (event.target.closest('[data-pick]') && full) {
      onPick(full);
      sheet.close();
    }
  });
  load();
  return sheet;
}
