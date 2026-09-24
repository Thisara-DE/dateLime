// dateLime bootstrap: routes, the header, theme controls and a few global behaviors.
import { createRouter } from './lib/router.js';
import { html, render } from './lib/html.js';
import { applyTheme, toggleTheme, watchSystemTheme, getThemePreference, setThemePreference, THEME_CHOICES } from './lib/theme.js';
import { store, getSaved } from './state.js';
import { wordmark } from './components/wordmark.js';
import { icon, slice } from './components/icons.js';

const routes = [
  { path: '/', load: () => import('./views/home.js') },
  { path: '/movies', load: () => import('./views/movies.js') },
  { path: '/movies/results', load: () => import('./views/results.js') },
  { path: '/recipes', load: () => import('./views/recipes.js') },
  { path: '/date', load: () => import('./views/date.js') },
  { path: '/cook', load: () => import('./views/cook.js') },
  { path: '/surprise', load: () => import('./views/surprise.js') },
  { path: '/dates', load: () => import('./views/dates.js') },
  { path: '/rules', load: () => import('./views/rules.js') },
  { path: '/team', load: () => import('./views/team.js') },
  { path: '*', load: () => import('./views/not-found.js') },
];

// Shown when a screen's code can't be downloaded. It must not need a download of its own,
// so it uses only what main.js has already loaded. A reload is the reliable retry: browsers
// may remember a failed module import for the life of the page.
const loadError = {
  title: () => 'Connection trouble',
  mount(outlet, { signal }) {
    render(
      outlet,
      html`<div class="page page--narrow"><div class="state" role="alert">${icon('wifi-off')}<h1>This screen didn't load</h1><p>The connection may have dropped. Your plan and saved dates are safe on this device.</p><div class="button-row"><button class="button button--primary" type="button" data-reload>${icon('retry')}Try again</button></div></div></div>`,
    );
    outlet.querySelector('[data-reload]').addEventListener('click', () => location.reload(), { signal });
  },
};

const main = document.getElementById('main');

// ---- Header ---------------------------------------------------------------------------
render(document.querySelector('[data-home-link]'), html`${slice()}${wordmark()}`);

const savedCount = document.querySelector('[data-saved-count]');
function updateSavedCount() {
  const n = getSaved().length;
  savedCount.hidden = n === 0;
  savedCount.textContent = String(n);
  savedCount.setAttribute('aria-label', `${n} saved`);
}
store.subscribe(updateSavedCount);
updateSavedCount();

// Another tab saved or deleted a date: pick up the change.
window.addEventListener('storage', (event) => {
  if (event.key === 'datelime.v2') store.reload();
  if (event.key === 'datelime.theme') applyTheme();
});

// ---- Theme ----------------------------------------------------------------------------
const themeButton = document.querySelector('[data-theme-toggle]');
const themeChoice = document.querySelector('[data-theme-choice]');
const CHOICE_LABELS = { auto: 'Auto', dark: 'Dark', light: 'Light' };

function renderThemeControls() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', 'Dark theme');
  themeButton.title = dark ? 'Lights up' : 'Lights down';
  render(themeButton, icon(dark ? 'moon' : 'sun'));
  const preference = getThemePreference();
  render(
    themeChoice,
    html`<fieldset class="theme-choice"><legend>Theme</legend>${THEME_CHOICES.map(
      (choice) =>
        html`<label><input type="radio" name="theme" value="${choice}" ${choice === preference ? html`checked` : ''}> ${CHOICE_LABELS[choice]}</label>`,
    )}</fieldset>`,
  );
}

themeButton.addEventListener('click', () => {
  toggleTheme();
  renderThemeControls();
});
themeChoice.addEventListener('change', (event) => {
  if (event.target.name === 'theme') {
    setThemePreference(event.target.value);
    renderThemeControls();
  }
});
applyTheme();
watchSystemTheme();
renderThemeControls();
document.addEventListener('datelime:theme', renderThemeControls); // changed on the House Rules page

// ---- Global behaviors ------------------------------------------------------------------

// The skip link can't use its #main href: in a hash-routed app that would navigate.
document.querySelector('[data-skip-link]').addEventListener('click', (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});

// Image fallbacks: try the full-size original once, then show the placeholder art.
document.addEventListener(
  'error',
  (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.fallback && !img.dataset.fellBack) {
      img.dataset.fellBack = 'true';
      img.src = img.dataset.fallback;
    } else {
      img.closest('.poster, .plate')?.classList.add('is-broken');
      img.remove();
    }
  },
  true,
);

// ---- Routing ---------------------------------------------------------------------------
const router = createRouter({
  routes,
  outlet: main,
  loadError,
  onRoute({ path }) {
    for (const link of document.querySelectorAll('[data-nav]')) {
      const active = path === link.dataset.nav || (link.dataset.nav === '/movies' && ['/movies/results', '/recipes', '/date'].includes(path));
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  },
});
router.start();

// Installable and offline-capable (saved dates and Cook-along work without a network).
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
