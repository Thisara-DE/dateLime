import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildICS, foldLine, escapeText, toICSDateTime, toICSStamp } from '../../assets/js/domain/ics.js';

const encoder = new TextEncoder();

test('dates are floating local times; DTSTAMP is UTC', () => {
  assert.equal(toICSDateTime('2026-10-02T20:00'), '20261002T200000');
  assert.throws(() => toICSDateTime('tomorrow'), RangeError);
  assert.equal(toICSStamp(new Date(Date.UTC(2026, 8, 24, 12, 30, 5))), '20260924T123005Z');
});

test('text escaping per RFC 5545', () => {
  assert.equal(escapeText('Dinner; movie, then\ndessert \\o/'), 'Dinner\\; movie\\, then\\ndessert \\\\o/');
});

test('long lines fold at 75 octets without splitting UTF-8 characters', () => {
  const line = `DESCRIPTION:${'Crème brûlée à deux 🍋 '.repeat(8)}`;
  const folded = foldLine(line);
  const physical = folded.split('\r\n');
  assert.ok(physical.length > 1);
  for (const [i, l] of physical.entries()) {
    assert.ok(encoder.encode(l).length <= 75, `line ${i} is ${encoder.encode(l).length} octets`);
    if (i > 0) assert.equal(l[0], ' ');
  }
  // Unfolding restores the original exactly.
  assert.equal(folded.replace(/\r\n /g, ''), line);
});

test('buildICS produces a valid single-event calendar with an alarm', () => {
  const ics = buildICS({
    uid: 'abc',
    title: 'Date night: Amélie + Ratatouille',
    start: '2026-10-02T18:45',
    end: '2026-10-02T22:02',
    description: 'Start cooking 6:45, eat 7:30, press play 8:00',
    url: 'https://thisara-de.github.io/dateLime/#/date?m=194&r=52982',
    alarmMinutesBefore: 15,
    now: new Date(Date.UTC(2026, 8, 24)),
  });
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));
  assert.ok(ics.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n'));
  assert.match(ics, /\r\nUID:abc@datelime\r\n/);
  assert.match(ics, /\r\nDTSTART:20261002T184500\r\n/);
  assert.match(ics, /\r\nDTEND:20261002T220200\r\n/);
  assert.match(ics, /\r\nTRIGGER:-PT15M\r\n/);
  assert.match(ics, /SUMMARY:Date night: Amélie \+ Ratatouille/);
  assert.equal((ics.match(/BEGIN:/g) || []).length, 3);
  assert.equal(ics.includes('\n\n'), false);
  assert.ok(ics.split('\r\n').every((l) => encoder.encode(l).length <= 75));
});
