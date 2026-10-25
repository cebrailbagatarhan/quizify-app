import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../screens/QuizScreen.js', import.meta.url),
  'utf8',
);

test('quiz screen initializes current question before reading its time limit', () => {
  // This used to throw ReferenceError during the very first React render:
  // useState(currentQuestion?.timeLimit) ran before the const declaration.
  const questionLine = 'const currentQuestion = questions[currentQuestionIndex];';
  const timerLine = 'const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 10);';
  const questionIndex = source.indexOf(questionLine);
  const timerIndex = source.indexOf(timerLine);
  assert.ok(questionIndex >= 0, 'current question declaration must exist');
  assert.ok(timerIndex > questionIndex, 'current question must be initialized first');

  // Execute the actual initialization lines, without needing a native renderer.
  const declarations = source.slice(questionIndex, timerIndex + timerLine.length);
  const initialize = new Function(
    'questions', 'currentQuestionIndex', 'useState',
    declarations + '\nreturn timeLeft;',
  );
  const fakeUseState = initial => [initial, () => {}];
  assert.equal(initialize([{ timeLimit: 45 }], 0, fakeUseState), 45);
  assert.equal(initialize([{}], 0, fakeUseState), 10);
  assert.equal(initialize([{ timeLimit: 20 }, { timeLimit: 30 }], 1, fakeUseState), 30);
});
