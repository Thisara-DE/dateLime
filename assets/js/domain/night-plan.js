// "Tonight's plan": count back from press-play time. TheMealDB has no cook times, so the
// cooking time is the couple's own estimate, and the UI labels it that way.

export const COOK_MINUTES = [30, 45, 60, 90];
export const DEFAULT_COOK_MINUTES = 45;
export const DEFAULT_EAT_MINUTES = 30;
export const DEFAULT_PLAY_TIME = '20:00';

const pad = (n) => String(n).padStart(2, '0');

/** Parses "YYYY-MM-DDTHH:MM" as a local time. */
export function parseLocal(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value ?? '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5])) : null;
}

export function formatLocal(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000);

/** The next occurrence of a clock time (today if it's still ahead, otherwise tomorrow). */
export function nextOccurrence(time = DEFAULT_PLAY_TIME, now = new Date()) {
  const [h, m] = time.split(':').map(Number);
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
  return formatLocal(candidate);
}

/**
 * @param {{playAt: string, runtime?: number|null, cookMinutes?: number, eatMinutes?: number}} input
 * @returns {{startCooking: string, eat: string, play: string, credits: string|null} | null}
 */
export function buildNightPlan({ playAt, runtime = null, cookMinutes = DEFAULT_COOK_MINUTES, eatMinutes = DEFAULT_EAT_MINUTES }) {
  const play = parseLocal(playAt);
  if (!play) return null;
  const eat = addMinutes(play, -eatMinutes);
  const startCooking = addMinutes(eat, -cookMinutes);
  return {
    startCooking: formatLocal(startCooking),
    eat: formatLocal(eat),
    play: formatLocal(play),
    credits: runtime ? formatLocal(addMinutes(play, runtime)) : null,
  };
}

export function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}
