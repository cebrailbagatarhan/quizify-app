import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const quiz = await readFile(new URL('../screens/QuizScreen.js', import.meta.url), 'utf8');
const results = await readFile(new URL('../screens/ResultsScreen.js', import.meta.url), 'utf8');

test('the exact generated question set travels from Quiz to Results', () => {
  assert.match(quiz, /navigation\.replace\('Results',\s*\{\s*category,\s*questions,\s*answers:/);
  assert.match(results, /const \{ category, questions = \[\], answers,/);
});

test('Results renders original questions and retains them on retry', () => {
  assert.match(results, /const question = questions\[questionIndex\];/);
  assert.doesNotMatch(results, /require\(['"]\.\.\/data\/newQuizData['"]\)\.quizQuestions/);
  assert.match(results, /navigation\.replace\('Quiz', \{ category, questions \}\)/);
});

test('missing question data cannot crash results rendering', () => {
  assert.match(results, /if \(!question\)/);
});
