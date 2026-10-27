const test = require('node:test');
const assert = require('node:assert/strict');
const { getRecentQuizzes } = require('../utils/recentQuizzes');

const record = (category, score, completedAt) => ({ category, score, completedAt });

test('shows the newest valid quizzes first', () => {
  const history = [
    record('Tarih', 80, '2026-10-20T12:00:00Z'),
    record('Bilim', 70, '2026-10-22T12:00:00Z'),
    record('Spor', 90, '2026-10-21T12:00:00Z'),
  ];
  assert.deepEqual(getRecentQuizzes(history).map(x => x.category), ['Bilim', 'Spor', 'Tarih']);
  assert.equal(history[0].category, 'Tarih');
});

test('limits the list and supports an empty state', () => {
  const items = Array.from({ length: 7 }, (_, i) =>
    record('Konu' + i, i * 10, '2026-10-20T12:00:00Z'));
  assert.equal(getRecentQuizzes(items).length, 5);
  assert.equal(getRecentQuizzes(items, 2).length, 2);
  assert.deepEqual(getRecentQuizzes(items, 0), []);
  assert.deepEqual(getRecentQuizzes(null), []);
});

test('ignores malformed entries and invalid dates', () => {
  const items = [null, {}, record(' ', 10, '2026-10-20'), record('Tarih', '90', '2026-10-20'),
    record('Tarih', 80, 'invalid'), record('Bilim', 101, '2026-10-20'),
    record('Sanat', 60, '2026-10-20T12:00:00Z')];
  assert.deepEqual(getRecentQuizzes(items).map(x => x.category), ['Sanat']);
});

test('preserves same-time order and rounds a valid score', () => {
  const items = [record('A', 85.7, '2026-10-20T12:00:00Z'),
    record('B', 50, '2026-10-20T12:00:00Z')];
  assert.deepEqual(getRecentQuizzes(items).map(x => x.score), [86, 50]);
});

test('does not modify the saved history objects', () => {
  const history = Object.freeze([Object.freeze(record('A', 99, '2026-10-20T12:00:00Z'))]);
  assert.doesNotThrow(() => getRecentQuizzes(history));
  assert.equal(history[0].score, 99);
});
