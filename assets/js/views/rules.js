// House Rules: set once, every date obeys them. Changes save immediately (on this device).
import { html, render, icon, on } from '../ui.js';
import { watchProviderCatalog, tmdbImage } from '../api/tmdb.js';
import { CERTIFICATIONS } from '../domain/moods.js';
import { DIETS } from '../domain/pairing.js';
import { AVOID } from '../domain/avoid.js';
import { getRules, updateRules } from '../state.js';
import { getThemePreference, setThemePreference, THEME_CHOICES } from '../lib/theme.js';
import { announce } from '../lib/announce.js';
import { isAbortError } from '../lib/http.js';

export const title = () => 'House rules';

// Regions where JustWatch (and so TMDB) has streaming data; names come from the browser.
const REGIONS = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'IN', 'LK', 'SG', 'PH', 'ZA', 'DE', 'AT', 'CH', 'FR', 'BE', 'NL', 'IT', 'ES', 'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'GR', 'TR', 'BR', 'MX', 'AR', 'CL', 'CO', 'JP', 'KR', 'TW', 'HK', 'MY', 'ID', 'TH'];
const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(undefined, { type: 'region' });
    return (code) => names.of(code) ?? code;
  } catch {
    return (code) => code;
  }
})();

function chip({ name, value, checked, label, type = 'radio', extra = '' }) {
  return html`<label class="chip ${extra}"><input type="${type}" name="${name}" value="${value}" ${checked ? html`checked` : ''}><span class="chip__glyph" aria-hidden="true"></span>${label}</label>`;
}

export function mount(outlet, { signal }) {
  let catalog = [];
  let catalogError = null;
  let catalogLoading = true;

  function servicesField() {
    const rules = getRules();
    const selected = new Set(rules.services.map((s) => s.id));
    if (catalogLoading) return html`<p class="muted" aria-busy="true">Loading services for ${regionName(rules.region)}…</p>`;
    if (catalogError) return html`<p class="banner banner--warning" role="alert">${icon('alert')}<span>We couldn't load the services list. <button class="button button--ghost" type="button" data-reload-services>Try again</button></span></p>`;
    const top = catalog.slice(0, 12);
    const rest = catalog.slice(12, 60);
    const providerChip = (p) => chip({ name: 'service', value: p.id, checked: selected.has(p.id), type: 'checkbox', extra: 'provider-chip', label: html`${p.logo ? html`<img src="${tmdbImage(p.logo, 'w92')}" alt="" width="24" height="24" loading="lazy">` : ''}${p.name}` });
    return html`<div class="chips">${top.map(providerChip)}</div>
      ${rest.length ? html`<details class="more" ${rest.some((p) => selected.has(p.id)) ? html`open` : ''}><summary>More services</summary><div class="chips">${rest.map(providerChip)}</div></details>` : ''}
      <p class="attribution">Streaming data by JustWatch. Leave all unticked to see everything.</p>`;
  }

  function renderAll() {
    const rules = getRules();
    const theme = getThemePreference();
    render(
      outlet,
      html`<div class="page page--narrow">
        <header class="page-head">
          <h1>House rules</h1>
          <p>Set these once. Every date, including "Surprise us", follows them. Changes save as you go, on this device only.</p>
        </header>
        <form class="rules-form" data-rules-form>
          <fieldset class="field">
            <legend>Where are you watching?</legend>
            <label class="field__label" for="region">Country or region</label>
            <select class="select" id="region" name="region">${[...new Set([rules.region, ...REGIONS])].map((code) => html`<option value="${code}" ${code === rules.region ? html`selected` : ''}>${regionName(code)}</option>`)}</select>
          </fieldset>
          <fieldset class="field"><legend>Your streaming services</legend><div data-services>${servicesField()}</div></fieldset>
          <fieldset class="field"><legend>Rated up to (US)</legend><div class="chips">${CERTIFICATIONS.map((c) => chip({ name: 'maxCertification', value: c.id, checked: rules.maxCertification === c.id, label: c.label }))}</div></fieldset>
          <fieldset class="field"><legend>Diet</legend><p class="field__hint">Vegetarian means recipes TheMealDB files as vegetarian or vegan.</p><div class="chips">${chip({ name: 'diet', value: '', checked: !rules.diet, label: 'Anything' })}${Object.entries(DIETS).map(([k, d]) => chip({ name: 'diet', value: k, checked: rules.diet === k, label: d.label }))}</div></fieldset>
          <fieldset class="field"><legend>Foods to avoid</legend><p class="field__hint">Best effort: we check ingredient lists only, so always double-check for allergies.</p><div class="chips">${Object.entries(AVOID).map(([k, a]) => chip({ name: 'avoid', value: k, checked: rules.avoid.includes(k), label: a.label, type: 'checkbox' }))}</div></fieldset>
          <fieldset class="field"><legend>Drink with dinner</legend><div class="chips">${[['zero-proof', 'Zero-proof'], ['cocktail', 'Lime cocktail'], ['none', 'No drink']].map(([v, l]) => chip({ name: 'drink', value: v, checked: rules.drink === v, label: l }))}</div></fieldset>
          <fieldset class="field"><legend>Recipes</legend><label class="switch"><input type="checkbox" name="matchMovie" ${rules.matchMovie ? html`checked` : ''}> Match the recipe to the movie</label></fieldset>
          <fieldset class="field"><legend>Theme</legend><p class="field__hint">Auto is dark in the evening or when your device is dark.</p><div class="chips">${THEME_CHOICES.map((t) => chip({ name: 'theme', value: t, checked: theme === t, label: { auto: 'Auto', dark: 'Dark (Late Show)', light: 'Light (Matinee)' }[t] }))}</div></fieldset>
        </form>
      </div>`,
    );
  }

  async function loadCatalog() {
    catalogLoading = true;
    catalogError = null;
    const target = outlet.querySelector('[data-services]');
    if (target) render(target, servicesField());
    try {
      catalog = await watchProviderCatalog(getRules().region, { signal });
    } catch (err) {
      if (isAbortError(err)) return;
      catalogError = err;
    }
    catalogLoading = false;
    const el = outlet.querySelector('[data-services]');
    if (el) render(el, servicesField());
  }

  on(outlet, 'change', '[data-rules-form]', (event) => {
    const input = event.target;
    switch (input.name) {
      case 'region': {
        updateRules({ region: input.value });
        loadCatalog().then(() => {
          // Keep only services that exist in the new region.
          const ids = new Set(catalog.map((p) => p.id));
          updateRules({ services: getRules().services.filter((s) => ids.has(s.id)) });
          render(outlet.querySelector('[data-services]'), servicesField());
        });
        break;
      }
      case 'service': {
        const services = [...outlet.querySelectorAll('input[name="service"]:checked')].map((i) => catalog.find((p) => p.id === Number(i.value))).filter(Boolean).map(({ id, name, logo }) => ({ id, name, logo }));
        updateRules({ services });
        break;
      }
      case 'avoid':
        updateRules({ avoid: [...outlet.querySelectorAll('input[name="avoid"]:checked')].map((i) => i.value) });
        break;
      case 'matchMovie':
        updateRules({ matchMovie: input.checked });
        break;
      case 'theme':
        setThemePreference(input.value);
        document.dispatchEvent(new CustomEvent('datelime:theme'));
        break;
      default:
        if (['maxCertification', 'diet', 'drink'].includes(input.name)) updateRules({ [input.name]: input.value });
    }
    announce('Saved.');
  }, { signal });
  on(outlet, 'click', '[data-reload-services]', () => loadCatalog(), { signal });

  renderAll();
  loadCatalog();
}
