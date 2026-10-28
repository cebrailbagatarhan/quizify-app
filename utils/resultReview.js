'use strict';

// Keep the original question index so filtering never mismatches an answer
// with its question in the result details.
function getReviewItems(answers, incorrectOnly = false) {
  if (!Array.isArray(answers)) return [];
  return answers.flatMap((answer, index) => {
    if (!answer || typeof answer !== 'object') return [];
    if (incorrectOnly && answer.isCorrect !== false) return [];
    return [{ answer, index }];
  });
}

module.exports = { getReviewItems };
