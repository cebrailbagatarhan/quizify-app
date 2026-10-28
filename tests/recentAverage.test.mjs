import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { getRecentAverageScore } = require('../utils/recentQuizzes.js');
const record = (score, date) => ({ category: 'Bilim', score, completedAt: date });

test('averages the five newest valid quizzes rather than insertion order', () => {
  const history = [
    record(10, '2026-10-20T00:00:00Z'),
    record(100, '2026-10-26T00:00:00Z'),
    record(80, '2026-10-25T00:00:00Z'),
    record(60, '2026-10-24T00:00:00Z'),
    record(40, '2026-10-23T00:00:00Z'),
    record(20, '2026-10-22T00:00:00Z'),
  ];
  assert.equal(getRecentAverageScore(history), 60);
  assert.equal(getRecentAverageScore(history, 2), 90);
});

test('distinguishes missing results from a genuine zero score', () => {
  assert.equal(getRecentAverageScore([]), null);
  assert.equal(getRecentAverageScore(null), null);
  assert.equal(getRecentAverageScore([record(120, 'invalid')]), null);
  assert.equal(getRecentAverageScore([record(0, '2026-10-25T00:00:00Z')]), 0);
});

test('ignores malformed entries without mutating saved quiz history', () => {
  const history = Object.freeze([
    Object.freeze(record(89, '2026-10-25T00:00:00Z')),
    Object.freeze(record(90, '2026-10-24T00:00:00Z')),
    Object.freeze(record('100', '2026-10-23T00:00:00Z')),
  ]);
  assert.equal(getRecentAverageScore(history), 90);
  assert.equal(history[0].score, 89);
});

test('profile displays the average only when recent results exist', async () => {
  const source = await readFile(new URL('../screens/ProfileScreen.js', import.meta.url), 'utf8');
  assert.match(source, /getRecentAverageScore\(recentQuizzes\)/);
  assert.match(source, /recentAverageScore !== null/);
  assert.match(source, /Son \{recentQuizzes.length\} quiz ortalaması: %\{recentAverageScore\}/);
});
