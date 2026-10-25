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
    committedQuestionIndexRef,
    setIsAnswered, setAnswers, setSelectedAnswer, setCurrentQuestionIndex, setTimeLeft,
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
      committedQuestionIndexRef: { current: -1 },
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

for (const sequence of [
  ['answer', 'answer'],
  ['answer', 'timeout'],
  ['timeout', 'answer'],
]) {
  test(`only one answer is recorded for a rapid ${sequence.join(' then ')} race`, () => {
    const question = { id: 1, correctAnswer: 2, timeLimit: 15 };
    const queuedAnswers = [];
    const scheduled = [];
    const navigations = [];
    const committedQuestionIndexRef = { current: -1 };
    const ctx = {
      isAnswered: false, // React has not re-rendered between calls.
      currentQuestion: question,
      answers: [],
      timeLeft: 10,
      timerRef: { current: null },
      committedQuestionIndexRef,
      questions: [question],
      currentQuestionIndex: 0,
      questionAnimation: {},
      startTime: Date.now(),
      category: { name: 'Tarih' },
      navigation: { replace: (...args) => navigations.push(args) },
      setIsAnswered: () => {},
      setAnswers: value => queuedAnswers.push(value),
      setSelectedAnswer: () => {},
      setCurrentQuestionIndex: () => {},
      setTimeout: cb => { scheduled.push(cb); },
      clearInterval: () => {},
      Haptics: { impactAsync: () => {}, ImpactFeedbackStyle: { Light: 1, Heavy: 2 } },
      Animated: { timing: () => ({ start: cb => cb?.() }) },
    };
    const handlers = createHandlers(ctx);
    for (const action of sequence) {
      if (action === 'answer') handlers.handleAnswerSelect(2);
      else handlers.handleTimeUp();
    }
    assert.equal(queuedAnswers.length, 1, 'only one state update is queued');
    assert.equal(scheduled.length, 1, 'only one transition is scheduled');
    assert.equal(committedQuestionIndexRef.current, 0);
    assert.equal(queuedAnswers[0][0].selectedAnswer, sequence[0] === 'timeout' ? null : 2);
    scheduled[0]();
    assert.equal(navigations.length, 1, 'results navigation happens once');
    assert.deepEqual(navigations[0][1].answers, queuedAnswers[0]);
  });
}

test('expired question resets next countdown before unlocking the next question', () => {
  const questions = [
    { id: 1, correctAnswer: 0, timeLimit: 5 },
    { id: 2, correctAnswer: 1, timeLimit: 30 },
  ];
  const events = [];
  let transition;
  const ctx = {
    isAnswered: false,
    currentQuestion: questions[0],
    answers: [],
    timeLeft: 0,
    timerRef: { current: null },
    committedQuestionIndexRef: { current: -1 },
    questions,
    currentQuestionIndex: 0,
    questionAnimation: {},
    startTime: Date.now(),
    category: { name: 'Tarih' },
    navigation: { replace: () => { throw new Error('not the final question'); } },
    setIsAnswered: value => events.push(['answered', value]),
    setAnswers: () => {},
    setSelectedAnswer: () => {},
    setCurrentQuestionIndex: value => events.push(['index', value]),
    setTimeLeft: value => events.push(['time', value]),
    setTimeout: callback => { transition = callback; },
    clearInterval: () => {},
    Haptics: { impactAsync: () => {}, ImpactFeedbackStyle: { Light: 1, Heavy: 2 } },
    Animated: { timing: () => ({ start: callback => callback?.() }) },
  };
  createHandlers(ctx).handleTimeUp();
  assert.equal(typeof transition, 'function');
  transition();
  const resetIndex = events.findIndex(([kind, value]) => kind === 'time' && value === 30);
  const unlockIndex = events.findIndex(([kind, value]) => kind === 'answered' && value === false);
  assert.ok(resetIndex >= 0, 'the next question must not inherit a zero-second countdown');
  assert.ok(unlockIndex > resetIndex, 'reset countdown before unlocking the next question');
  assert.ok(events.some(([kind, value]) => kind === 'index' && value === 1));
});
