import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(
  new URL('../services/generativeAIService.js', import.meta.url),
  'utf8',
);
let importId = 0;

async function loadService(endpoint) {
  if (endpoint === undefined) {
    delete process.env.EXPO_PUBLIC_QUIZ_API_URL;
  } else {
    process.env.EXPO_PUBLIC_QUIZ_API_URL = endpoint;
  }
  // Load the production module as ESM without changing Expo's package format.
  // A unique URL reloads its module-level environment configuration per test.
  const moduleUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}#${++importId}`;
  return (await import(moduleUrl)).generativeAIService;
}

const validQuiz = {
  questions: [{
    id: 1,
    question: 'Türkiye’nin başkenti?',
    options: ['İzmir', 'Ankara', 'Bursa', 'Antalya'],
    correctAnswer: 1,
    timeLimit: 15,
  }],
};

test('mobile service never embeds a Gemini key or imports provider SDK', () => {
  assert.doesNotMatch(source, /AIza[0-9A-Za-z_-]{30,}/);
  assert.doesNotMatch(source, /@google\/genai|GoogleGenAI/);
});

test('missing endpoint fails closed without calling the network', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.__DEV__ = false;
  globalThis.fetch = () => { throw new Error('network should not be called'); };
  try {
    const service = await loadService();
    await assert.rejects(service.generateQuiz('Tarih'), /yapılandırılmamış/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('non-HTTPS production endpoint is rejected before fetch', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.__DEV__ = false;
  globalThis.fetch = () => { throw new Error('network should not be called'); };
  try {
    const service = await loadService('http://example.org/quiz');
    await assert.rejects(service.generateQuiz('Tarih'), /HTTPS/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('HTTPS request sends trimmed topic and validates server response', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.__DEV__ = false;
  let called = 0;
  globalThis.fetch = async (url, options) => {
    called++;
    assert.equal(url, 'https://example.org/quiz');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { topic: 'Tarih' });
    return { ok: true, json: async () => validQuiz };
  };
  try {
    const service = await loadService('https://example.org/quiz');
    const questions = await service.generateQuiz('  Tarih  ');
    assert.equal(called, 1);
    assert.equal(questions[0].correctAnswer, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('malformed server response is rejected, never silently replaced with mock quiz', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.__DEV__ = false;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ questions: [{ question: 'Broken', options: [], correctAnswer: 10 }] }),
  });
  try {
    const service = await loadService('https://example.org/quiz');
    await assert.rejects(service.generateQuiz('Tarih'), /geçersiz/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('HTTP 429 reports throttling rather than using mock questions', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.__DEV__ = false;
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  try {
    const service = await loadService('https://example.org/quiz');
    await assert.rejects(service.generateQuiz('Tarih'), /Çok fazla istek/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
