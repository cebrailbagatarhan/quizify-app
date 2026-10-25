import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../screens/QuizScreen.js', import.meta.url), 'utf8');

// Execute the real handlers with React's render-snapshot semantics: setAnswers
// does not change the "answers" variable captured by the delayed callback.
const start = source.indexOf('  const handleTimeUp = () => {');
const end = source.indexOf('  const getOptionStyle =', start);
assert.ok(start >= 0 && end > start, 'quiz handlers must be present');
const handlers = source.slice(start, end);
const createHandlers = new Function('ctx', `
  const {
    isAnswered, currentQuestion, answers, timeLeft, timerRef, questions,
    currentQuestionIndex, questionAnimation, startTime, category, navigation,
    setIsAnswered, setAnswers, setSelectedAnswer, setCurrentQuestionIndex,
    setTimeout, clearInterval, Haptics, Animated,
  } = ctx;
  ${handlers}
  return { handleAnswerSelect, handleTimeUp };
`);

for (const mode of ['answer', 'timeout']) {
  test(`final question is included in results after ${mode}`, () => {
    const question = { id: 1, correctAnswer: 2, timeLimit: 15 };
    let scheduled;
    let stateAnswers;
    let result;
    const ctx = {
      isAnswered: false,
      currentQuestion: question,
      answers: [],
      timeLeft: 10,
      timerRef: { current: null },
      questions: [question],
      currentQuestionIndex: 0,
      questionAnimation: {},
      startTime: Date.now(),
      category: { name: 'Tarih' },
      navigation: { replace: (screen, params) => { result = { screen, params }; } },
      setIsAnswered: () => {},
      setAnswers: value => { stateAnswers = value; },
      setSelectedAnswer: () => {},
      setCurrentQuestionIndex: () => {},
      setTimeout: cb => { scheduled = cb; },
      clearInterval: () => {},
      Haptics: { impactAsync: () => {}, ImpactFeedbackStyle: { Light: 1, Heavy: 2 } },
      Animated: { timing: () => ({ start: cb => cb?.() }) },
    };
    const { handleAnswerSelect, handleTimeUp } = createHandlers(ctx);
    if (mode === 'answer') handleAnswerSelect(2);
    else handleTimeUp();
    assert.equal(stateAnswers.length, 1, 'answer was queued for React state');
    assert.equal(typeof scheduled, 'function');
    scheduled();
    assert.equal(result.screen, 'Results');
    assert.deepEqual(result.params.answers, stateAnswers);
    assert.equal(result.params.answers[0].isCorrect, mode === 'answer');
    assert.equal(result.params.totalQuestions, 1);
  });
}
