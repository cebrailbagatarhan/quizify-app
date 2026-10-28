import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { getReviewItems } = createRequire(import.meta.url)('../utils/resultReview.js');

test('incorrect-only review keeps original question indices', () => {
  const answers = [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }, { isCorrect: false }];
  assert.deepEqual(getReviewItems(answers, true).map(item => item.index), [1, 3]);
  assert.deepEqual(getReviewItems(answers).map(item => item.index), [0, 1, 2, 3]);
});

test('all-correct quizzes have a useful empty filtered state', () => {
  assert.deepEqual(getReviewItems([{ isCorrect: true }], true), []);
  assert.deepEqual(getReviewItems([], true), []);
  assert.deepEqual(getReviewItems(null, true), []);
});

test('ignores malformed entries and does not mutate stored answers', () => {
  const wrong = Object.freeze({ isCorrect: false, selectedAnswer: null });
  const answers = Object.freeze([null, wrong, undefined, { isCorrect: true }]);
  assert.deepEqual(getReviewItems(answers, true), [{ answer: wrong, index: 1 }]);
  assert.equal(answers[1], wrong);
});
