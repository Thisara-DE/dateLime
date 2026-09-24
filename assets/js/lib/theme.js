// Theme preference: "auto" (the default), "dark" or "light".
// Auto = dark when the device is in dark mode OR it's evening (18:00-06:00 local), because
// dateLime is mostly used on a sofa at night; otherwise light. index.html's inline boot
// script applies the same rule before first paint, so there's no flash of the wrong theme.
const KEY = 'datelime.theme';
export const THEME_CHOICES = ['auto', 'dark', 'light'];

export function getThemePreference() {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === 'dark' || stored === 'light' ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

export const isEvening = (date = new Date()) => date.getHours() >= 18 || date.getHours() < 6;

const systemPrefersDark = () => globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export function resolveTheme(preference, { now = new Date(), systemDark = systemPrefersDark() } = {}) {
  if (preference === 'dark' || preference === 'light') return preference;
  return systemDark || isEvening(now) ? 'dark' : 'light';
}

export function applyTheme(preference = getThemePreference()) {
  const theme = resolveTheme(preference);
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#140F1A' : '#FBF7F1';
  return theme;
}

export function setThemePreference(preference) {
  if (!THEME_CHOICES.includes(preference)) return getThemePreference();
  try {
    if (preference === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    /* storage blocked: the choice still applies for this visit */
  }
  applyTheme(preference);
  return preference;
}

/** The header button: flips what you see now ("Lights up" / "Lights down"). */
export function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setThemePreference(next);
  return next;
}

/** In auto mode, follow OS changes live. Returns an unsubscribe function. */
export function watchSystemTheme() {
  const query = globalThis.matchMedia?.('(prefers-color-scheme: dark)');
  if (!query) return () => {};
  const listener = () => {
    if (getThemePreference() === 'auto') applyTheme('auto');
  };
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}
