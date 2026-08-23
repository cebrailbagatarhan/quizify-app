import test from 'node:test'
import assert from 'node:assert/strict'

import {
  isQuizQuestion,
  normalizeQuizResponse,
} from '../utils/quizContract.mjs'

const validQuestion = {
  question: '2 + 2 kaçtır?',
  options: ['3', '4', '5', '6'],
  correctAnswer: 1,
  timeLimit: 15,
}

test('accepts a valid quiz question', () => {
  assert.equal(isQuizQuestion(validQuestion), true)
})

test('rejects an out-of-range answer index', () => {
  assert.equal(
    isQuizQuestion({ ...validQuestion, correctAnswer: validQuestion.options.length }),
    false
  )
})

test('normalizes both array and object proxy payloads', () => {
  assert.deepEqual(normalizeQuizResponse([validQuestion]), [validQuestion])
  assert.deepEqual(normalizeQuizResponse({ questions: [validQuestion] }), [
    validQuestion,
  ])
})

test('rejects empty or partially invalid payloads', () => {
  assert.equal(normalizeQuizResponse([]), null)
  assert.equal(
    normalizeQuizResponse({
      questions: [validQuestion, { ...validQuestion, options: [] }],
    }),
    null
  )
})
