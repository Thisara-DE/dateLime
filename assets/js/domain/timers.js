// Finds durations in recipe steps ("simmer for 20 minutes", "bake 30-35 mins", "an hour")
// so Cook mode can offer tap-to-start timers. It's a heuristic: timers stay optional,
// and the full text is always shown.

const WORDS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, forty: 40, 'forty-five': 45, sixty: 60, half: 0.5 };
const NUMBER = String.raw`(\d+(?:[.,]\d+)?|${Object.keys(WORDS).sort((a, b) => b.length - a.length).join('|')})`;
const UNIT = String.raw`(hours?|hrs?|h\b|minutes?|mins?|m\b)`;
const PATTERN = new RegExp(String.raw`\b(?:(half\s+an?)\s+hour|${NUMBER}(?:\s*(?:-|–|to)\s*${NUMBER})?\s*${UNIT})`, 'gi');

const toNumber = (token) => {
  const lower = token.toLowerCase();
  return lower in WORDS ? WORDS[lower] : Number(lower.replace(',', '.'));
};

/**
 * @param {string} text
 * @returns {Array<{minutes: number, label: string}>} unique durations, in order of appearance
 */
export function findDurations(text = '') {
  const found = [];
  for (const match of text.matchAll(PATTERN)) {
    let minutes;
    let label;
    if (match[1]) {
      minutes = 30;
      label = '30 min';
    } else {
      const low = toNumber(match[2]);
      const high = match[3] ? toNumber(match[3]) : null;
      const isHours = /^h/i.test(match[4]);
      const factor = isHours ? 60 : 1;
      if (!Number.isFinite(low) || low <= 0) continue;
      minutes = Math.round(low * factor);
      if (high) label = `${low}–${high} ${isHours ? 'hr' : 'min'}`;
      else label = isHours && Number.isInteger(low) ? `${low} hr` : `${minutes} min`;
    }
    if (minutes < 1 || minutes > 12 * 60) continue; // "300 minutes" is probably a typo, not a timer
    if (!found.some((f) => f.minutes === minutes)) found.push({ minutes, label });
  }
  return found;
}

/** "07:42" style countdown text. */
export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return h ? `${h}:${mmss}` : mmss;
}
