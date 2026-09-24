import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocation, href } from '../../assets/js/lib/router.js';

test('parseLocation normalizes paths and reads the query', () => {
  assert.deepEqual(parseLocation(''), { path: '/', query: {} });
  assert.deepEqual(parseLocation('#/'), { path: '/', query: {} });
  assert.deepEqual(parseLocation('#/movies/?mood=cozy&cert=PG-13'), { path: '/movies', query: { mood: 'cozy', cert: 'PG-13' } });
  assert.deepEqual(parseLocation('#dates'), { path: '/dates', query: {} });
});

test('href drops empty values and encodes the rest', () => {
  assert.equal(href('/movies', { mood: 'cozy', cert: '', page: undefined }), '#/movies?mood=cozy');
  assert.equal(href('/share', { note: 'see you at 7 & bring snacks' }), '#/share?note=see+you+at+7+%26+bring+snacks');
  assert.equal(href('/'), '#/');
});
