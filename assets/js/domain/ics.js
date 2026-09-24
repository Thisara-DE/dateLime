// Builds an RFC 5545 calendar file in the browser. Times are "floating" (no time zone):
// 8 pm means 8 pm wherever each of you opens it, which is what a date invite wants.

const pad = (n) => String(n).padStart(2, '0');

/** "2026-10-02T20:00" -> "20261002T200000" (floating local time). */
export function toICSDateTime(local) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local ?? '');
  if (!m) throw new RangeError(`Expected YYYY-MM-DDTHH:MM, got "${local}"`);
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}00`;
}

/** UTC timestamp for DTSTAMP, e.g. "20260924T123000Z". */
export function toICSStamp(date = new Date()) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/** Escapes TEXT values: backslash, semicolon, comma and newlines. */
export function escapeText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

const encoder = new TextEncoder();

/** Folds a content line at 75 octets (RFC 5545 §3.1) without splitting a UTF-8 character. */
export function foldLine(line) {
  const parts = [];
  let current = '';
  let bytes = 0;
  let limit = 75;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74; // continuation lines start with a space, which counts as one octet
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/**
 * @param {{uid: string, title: string, start: string, end?: string, description?: string,
 *          url?: string, alarmMinutesBefore?: number, now?: Date}} event
 *   start/end are local "YYYY-MM-DDTHH:MM" strings.
 */
export function buildICS({ uid, title, start, end, description = '', url = '', alarmMinutesBefore = 15, now = new Date() }) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//dateLime//Date Night Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}@datelime`,
    `DTSTAMP:${toICSStamp(now)}`,
    `DTSTART:${toICSDateTime(start)}`,
  ];
  if (end) lines.push(`DTEND:${toICSDateTime(end)}`);
  lines.push(`SUMMARY:${escapeText(title)}`);
  if (description) lines.push(`DESCRIPTION:${escapeText(description)}`);
  if (url) lines.push(`URL:${url}`);
  if (alarmMinutesBefore > 0) {
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(title)}`, `TRIGGER:-PT${Math.round(alarmMinutesBefore)}M`, 'END:VALARM');
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
