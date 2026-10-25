import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../screens/HomeScreen.js', import.meta.url), 'utf8');

// Exercise the real async event handler without needing a native renderer.
// The handler contains plain JS; only the surrounding component contains JSX.
function createHarness(generateQuiz) {
  const start = source.indexOf('  const handleCategoryPress = async (category) => {');
  const end = source.indexOf('\n  };\n\n  const CategoryCard', start);
  assert.ok(start >= 0 && end > start, 'quiz handler must be present');
  const declaration = source.slice(start, end + '\n  };'.length);
  const alerts = [];
  const navigation = [];
  const loading = [];
  const requestRef = { current: false };
  const handleCategoryPress = new Function(
    'generativeAIService', 'navigation', 'Alert',
    'setLoadingText', 'setLoading', 'quizRequestInFlight',
    declaration + '\nreturn handleCategoryPress;',
  )(
    { generateQuiz },
    { navigate: (...args) => navigation.push(args) },
    { alert: (...args) => alerts.push(args) },
    () => {},
    value => loading.push(value),
    requestRef,
  );
  return { handleCategoryPress, alerts, navigation, loading, requestRef };
}

const category = { name: 'Tarih' };

test('rapid double tap starts only one paid quiz request and one navigation', async () => {
  let resolveRequest;
  let calls = 0;
  const response = new Promise(resolve => { resolveRequest = resolve; });
  const harness = createHarness(async () => { calls++; return response; });

  const first = harness.handleCategoryPress(category);
  await harness.handleCategoryPress(category);
  assert.equal(calls, 1);
  assert.equal(harness.requestRef.current, true);

  resolveRequest([{ id: 1, question: 'Soru?', options: ['A','B','C','D'], correctAnswer: 0 }]);
  await first;
  assert.equal(harness.navigation.length, 1);
  assert.equal(harness.navigation[0][0], 'Quiz');
  assert.deepEqual(harness.loading, [true, false]);
  assert.equal(harness.requestRef.current, false);
});

test('unexpected backend errors do not leak raw error text to users', async () => {
  const harness = createHarness(async () => { throw new Error('SECRET internal endpoint detail'); });
  await harness.handleCategoryPress(category);
  assert.equal(harness.alerts.length, 1);
  assert.doesNotMatch(harness.alerts[0][1], /SECRET|API anahtar/i);
  assert.equal(harness.requestRef.current, false);
});

test('known safe configuration errors are shown and failed requests can retry', async () => {
  let calls = 0;
  const harness = createHarness(async () => {
    calls++;
    if (calls === 1) throw new Error('Quiz sunucusu yapılandırılmamış (EXPO_PUBLIC_QUIZ_API_URL).');
    return [{ id: 1 }];
  });
  await harness.handleCategoryPress(category);
  assert.match(harness.alerts[0][1], /yapılandırılmamış/);
  await harness.handleCategoryPress(category);
  assert.equal(calls, 2);
  assert.equal(harness.navigation.length, 1);
  assert.equal(harness.requestRef.current, false);
});
