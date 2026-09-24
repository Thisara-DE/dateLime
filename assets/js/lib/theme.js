// Theme preference: "system" (follow the OS), "dark" or "light". An inline script in
// index.html applies the stored choice before first paint; this module handles changes.
const KEY = 'datelime.theme';
const CHOICES = ['system', 'dark', 'light'];

export function getThemePreference() {
  try {
    const stored = localStorage.getItem(KEY);
    return CHOICES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function resolvedTheme(preference = getThemePreference()) {
  if (preference !== 'system') return preference;
  return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function applyTheme(preference = getThemePreference()) {
  const root = document.documentElement;
  if (preference === 'system') delete root.dataset.theme;
  else root.dataset.theme = preference;
  // Keep the browser UI (address bar, PWA title bar) in step with the page.
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--color-page').trim() || meta.content;
}

export function setThemePreference(preference) {
  if (!CHOICES.includes(preference)) return;
  try {
    if (preference === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    /* storage blocked: theme still applies for this visit */
  }
  applyTheme(preference);
}

/** Cycles system -> dark -> light -> system... and returns the new preference. */
export function cycleTheme() {
  const next = CHOICES[(CHOICES.indexOf(getThemePreference()) + 1) % CHOICES.length];
  setThemePreference(next);
  return next;
}
