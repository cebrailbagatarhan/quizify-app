import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// The pure helpers are exercised as real JavaScript without React Native mocks.
const helperSource = await readFile(new URL('../utils/homeStats.js', import.meta.url), 'utf8');
const { displayUserName, countTodaysQuizzes } = await import(
  'data:text/javascript;base64,' + Buffer.from(helperSource).toString('base64')
);
const homeSource = await readFile(new URL('../screens/HomeScreen.js', import.meta.url), 'utf8');

test('home shows saved user name and trims whitespace', () => {
  assert.equal(displayUserName({ userName: '  Ayşe  ' }), 'Ayşe');
  assert.equal(displayUserName({ userName: '   ' }), 'Kullanıcı');
  assert.equal(displayUserName(null), 'Kullanıcı');
});

test('today count uses local calendar date and ignores older quizzes', () => {
  const today = new Date(2026, 9, 26, 14, 0);
  const history = [
    { completedAt: new Date(2026, 9, 26, 1, 0).toISOString() },
    { completedAt: new Date(2026, 9, 26, 23, 30).toISOString() },
    { completedAt: new Date(2026, 9, 25, 23, 59).toISOString() },
    { completedAt: new Date(2026, 9, 27, 0, 0).toISOString() },
  ];
  assert.equal(countTodaysQuizzes(history, today), 2);
});

test('malformed history and invalid dates cannot inflate count', () => {
  const today = new Date(2026, 9, 26);
  assert.equal(countTodaysQuizzes(null, today), 0);
  assert.equal(countTodaysQuizzes('bad data', today), 0);
  assert.equal(countTodaysQuizzes([{ completedAt: 'not a date' }, null, {}], today), 0);
});

test('Home reloads stored profile and history when navigation returns to it', () => {
  assert.match(homeSource, /useFocusEffect\(useCallback/);
  assert.match(homeSource, /StatsManager\.getProfile\(\)/);
  assert.match(homeSource, /StatsManager\.getQuizHistory\(\)/);
  assert.match(homeSource, /setUserName\(displayUserName\(profile\)\)/);
  assert.match(homeSource, /setDailyQuizzes\(countTodaysQuizzes\(history\)\)/);
  assert.doesNotMatch(homeSource, /\[dailyQuizzes\]\s*=\s*useState\(2\)/);
});
