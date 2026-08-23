import { normalizeQuizResponse } from '../utils/quizContract.mjs';

const rawProxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL?.trim();

const RATE_LIMIT = {
  requestsPerMinute: 30,
  requestsPerHour: 300,
  retryAttempts: 3,
  retryDelay: 2000,
  maxRetryDelay: 10000,
};

let lastRequestTime = 0;
let hourlyRequestCount = 0;
let hourlyStartTime = Date.now();

const getProxyUrl = () => {
  if (!rawProxyUrl) return null;

  const normalized = rawProxyUrl.replace(/\/+$/, '');
  const parsed = new URL(normalized);
  const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

  if (parsed.protocol !== 'https:' && !isLocal) {
    throw new Error('AI proxy must use HTTPS outside local development.');
  }

  return normalized;
};

const requestQuizFromProxy = async topic => {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) throw new Error('AI proxy is not configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${proxyUrl}/v1/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`AI proxy request failed with status ${response.status}.`);
      error.status = response.status;
      throw error;
    }

    const payload = await response.json();
    const questions = normalizeQuizResponse(payload);
    if (!questions) {
      throw new Error('AI proxy returned an invalid quiz response.');
    }

    return questions;
  } finally {
    clearTimeout(timeout);
  }
};

class RateLimiter {
  static checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (now - hourlyStartTime > 60 * 60 * 1000) {
      hourlyRequestCount = 0;
      hourlyStartTime = now;
    }

    if (timeSinceLastRequest < 60000 / RATE_LIMIT.requestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    if (hourlyRequestCount >= RATE_LIMIT.requestsPerHour) {
      throw new Error('Hourly rate limit exceeded. Please try again later.');
    }

    lastRequestTime = now;
    hourlyRequestCount++;
  }

  static async retryWithBackoff(operation, maxAttempts = RATE_LIMIT.retryAttempts) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const status = error?.status;
        if (status !== 503 || attempt === maxAttempts) throw error;

        const delay = Math.min(
          RATE_LIMIT.retryDelay * Math.pow(2, attempt - 1),
          RATE_LIMIT.maxRetryDelay
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

export const generativeAIService = {
  async generateQuiz(topic) {
    if (!rawProxyUrl) {
      console.warn('AI proxy is not configured; using local mock quiz data.');
      return this.getMockQuizData(topic);
    }

    try {
      RateLimiter.checkRateLimit();
      return await RateLimiter.retryWithBackoff(() => requestQuizFromProxy(topic));
    } catch (error) {
      console.error('Quiz oluşturulurken hata oluştu:', error?.message);
      console.warn('AI proxy başarısız, mock data kullanılıyor');
      return this.getMockQuizData(topic);
    }
  },

  getMockQuizData(topic) {
    const mockQuestions = {
      'Roma İmparatorluğu': [
        { id: 1, question: `${topic} hakkında örnek soru 1`, options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'], correctAnswer: 0, timeLimit: 15 },
        { id: 2, question: `${topic} hakkında örnek soru 2`, options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'], correctAnswer: 1, timeLimit: 15 },
        { id: 3, question: `${topic} hakkında örnek soru 3`, options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'], correctAnswer: 2, timeLimit: 15 },
        { id: 4, question: `${topic} hakkında örnek soru 4`, options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'], correctAnswer: 3, timeLimit: 15 },
        { id: 5, question: `${topic} hakkında örnek soru 5`, options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'], correctAnswer: 0, timeLimit: 15 },
      ],
    };

    return mockQuestions[topic] || mockQuestions['Roma İmparatorluğu'];
  },
};
