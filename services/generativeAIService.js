// The mobile app must never contain a Gemini/API provider key.
// Configure a trusted server endpoint using EXPO_PUBLIC_QUIZ_API_URL.
// The server authenticates callers, rate-limits requests and keeps its Gemini key private.
const QUIZ_API_URL = process.env.EXPO_PUBLIC_QUIZ_API_URL?.trim();

function validateQuestions(payload) {
  if (!payload || !Array.isArray(payload.questions) || payload.questions.length < 1 || payload.questions.length > 20) {
    throw new Error('Sunucu geçerli quiz soruları döndürmedi.');
  }

  return payload.questions.map((q, index) => {
    if (
      !q || typeof q.question !== 'string' || !q.question.trim() ||
      !Array.isArray(q.options) || q.options.length !== 4 ||
      q.options.some(option => typeof option !== 'string' || !option.trim()) ||
      !Number.isInteger(q.correctAnswer) || q.correctAnswer < 0 || q.correctAnswer > 3
    ) {
      throw new Error('Sunucudan gelen quiz yanıtı geçersiz.');
    }
    return {
      id: q.id ?? index + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      timeLimit: Number.isInteger(q.timeLimit) && q.timeLimit >= 5 && q.timeLimit <= 120 ? q.timeLimit : 15,
    };
  });
}

export const generativeAIService = {
  async generateQuiz(topic) {
    if (!QUIZ_API_URL) {
      throw new Error('Quiz sunucusu yapılandırılmamış (EXPO_PUBLIC_QUIZ_API_URL).');
    }
    if (!/^https:\/\//i.test(QUIZ_API_URL) && !(__DEV__ && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(QUIZ_API_URL))) {
      throw new Error('Quiz sunucusu HTTPS kullanmalıdır.');
    }
    if (typeof topic !== 'string' || !topic.trim() || topic.length > 100) {
      throw new Error('Geçersiz quiz konusu.');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(QUIZ_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(response.status === 429
          ? 'Çok fazla istek gönderildi; lütfen daha sonra tekrar deneyin.'
          : 'Quiz servisi şu anda kullanılamıyor.');
      }
      return validateQuestions(await response.json());
    } finally {
      clearTimeout(timeout);
    }
  },

  // Mock data for development/testing when API fails
  getMockQuizData(topic) {
    const mockQuestions = {
      'Roma İmparatorluğu': [
        {
          id: 1,
          question: `${topic} hakkında örnek soru 1`,
          options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
          correctAnswer: 0,
          timeLimit: 15
        },
        {
          id: 2,
          question: `${topic} hakkında örnek soru 2`,
          options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
          correctAnswer: 1,
          timeLimit: 15
        },
        {
          id: 3,
          question: `${topic} hakkında örnek soru 3`,
          options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
          correctAnswer: 2,
          timeLimit: 15
        },
        {
          id: 4,
          question: `${topic} hakkında örnek soru 4`,
          options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
          correctAnswer: 3,
          timeLimit: 15
        },
        {
          id: 5,
          question: `${topic} hakkında örnek soru 5`,
          options: ['Cevap A', 'Cevap B', 'Cevap C', 'Cevap D'],
          correctAnswer: 0,
          timeLimit: 15
        }
      ]
    };

    return mockQuestions[topic] || mockQuestions['Roma İmparatorluğu'];
  }
};
