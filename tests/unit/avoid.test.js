import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avoidMatches } from '../../assets/js/domain/avoid.js';
import { movieQuery, MOODS } from '../../assets/js/domain/moods.js';

const names = (...list) => list.map((name) => ({ name }));

test('flags pork hidden under other names', () => {
  assert.deepEqual(avoidMatches(names('Spaghetti', 'Pancetta', 'Egg Yolks'), ['pork']), [{ key: 'pork', label: 'Pork', ingredient: 'Pancetta' }]);
  assert.equal(avoidMatches(names('Smoked Bacon'), ['pork']).length, 1);
});

test('word boundaries: nutmeg is not a nut, butternut is not butter, graham is not ham', () => {
  assert.deepEqual(avoidMatches(names('Nutmeg', 'Coconut'), ['nuts']), []);
  assert.deepEqual(avoidMatches(names('Butternut Squash'), ['dairy']), []);
  assert.deepEqual(avoidMatches(names('Graham crackers', 'Hamburger buns'), ['pork']), []);
  assert.equal(avoidMatches(names('Pine Nuts'), ['nuts']).length, 1);
});

test('dairy look-alikes are excluded, real dairy is caught', () => {
  assert.deepEqual(avoidMatches(names('Cream of Tartar', 'Coconut Milk', 'Peanut Butter'), ['dairy']), []);
  assert.equal(avoidMatches(names('Double Cream'), ['dairy'])[0].ingredient, 'Double Cream');
  assert.equal(avoidMatches(names('Crème fraîche'), ['dairy']).length, 1);
});

test('multiple rules report each match once; unknown keys are ignored', () => {
  const found = avoidMatches(names('Prawns', 'Butter', 'Mushrooms'), ['shellfish', 'dairy', 'mushrooms', 'bogus']);
  assert.deepEqual(found.map((f) => f.key), ['shellfish', 'dairy', 'mushrooms']);
});

test('movieQuery maps moods, legacy genre ids, lengths and the rating cap', () => {
  const romCom = movieQuery({ mood: 'rom-com', len: 'short', cert: 'PG-13' }, { services: [8], region: 'GB' });
  assert.deepEqual(romCom.genreIds, [35, 10749]);
  assert.equal(romCom.matchAllGenres, true);
  assert.equal(romCom.maxRuntime, 105);
  assert.equal(romCom.maxCertification, 'PG-13');
  assert.deepEqual(romCom.providerIds, [8]);

  const legacy = movieQuery({ genre: '28', cert: 'PG' });
  assert.deepEqual(legacy.genreIds, [28]);
  assert.equal(legacy.mood.label, 'Action');

  const fallback = movieQuery({ mood: 'nonsense', cert: 'X' }, { maxCertification: 'R' });
  assert.equal(fallback.mood.id, 'any');
  assert.equal(fallback.maxCertification, 'R');
  assert.equal(MOODS.filter((m) => m.all).length, 2);
  assert.equal(movieQuery({ cert: 'any' }, { maxCertification: 'PG' }).maxCertification, '');
});
