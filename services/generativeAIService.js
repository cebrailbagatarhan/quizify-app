import { GoogleGenAI } from '@google/genai';

// API key'i direkt al
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyByAxI64OoS1NRnOTcz5GE7Jv0oJbXLpg4';

// Initialize Google GenAI
const genAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Rate limiting configuration
const RATE_LIMIT = {
  requestsPerMinute: 30,
  requestsPerHour: 300,
  retryAttempts: 3,
  retryDelay: 2000, // Start with 2 seconds
  maxRetryDelay: 10000, // Max 10 seconds
};

let requestCount = 0;
let lastRequestTime = 0;
let hourlyRequestCount = 0;
let hourlyStartTime = Date.now();

class RateLimiter {
  static checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    // Reset hourly counter if an hour has passed
    if (now - hourlyStartTime > 60 * 60 * 1000) {
      hourlyRequestCount = 0;
      hourlyStartTime = now;
    }

    // Check per-minute rate limit
    if (timeSinceLastRequest < 60000 / RATE_LIMIT.requestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before making another request.');
    }

    // Check per-hour rate limit
    if (hourlyRequestCount >= RATE_LIMIT.requestsPerHour) {
      throw new Error('Hourly rate limit exceeded. Please try again later.');
    }

    lastRequestTime = now;
    requestCount++;
    hourlyRequestCount++;
  }

  static async retryWithBackoff(operation, maxAttempts = RATE_LIMIT.retryAttempts) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();

        if (result) {
          return result;
        }
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error.message);

        // Only retry on API overload (503) errors, not rate limit errors
        if (error.message.includes('Rate limit exceeded') ||
            error.message.includes('API anahtarı')) {
          throw error;
        }

        // Only retry on 503 (overloaded) errors
        if (attempt < maxAttempts && error.message.includes('503')) {
          const delay = Math.min(
            RATE_LIMIT.retryDelay * Math.pow(2, attempt - 1),
            RATE_LIMIT.maxRetryDelay
          );
          console.log(`Model overloaded, retrying in ${delay}ms... (Attempt ${attempt}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

export const generativeAIService = {
  async generateQuiz(topic) {
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
      throw new Error('Gemini API anahtarı bulunamadı. Lütfen .env dosyanızı kontrol edin.');
    }

    const prompt = `
      Lütfen aşağıdaki konsepti kullanarak bir quiz oluşturun:

      **Konu:** ${topic}

      **İstekler:**
      1.  **Soru Sayısı:** 5 adet çoktan seçmeli soru oluşturun.
      2.  **Zorluk:** Orta seviyede.
      3.  **Format:** Her soru için 4 seçenek ve doğru cevabı belirten bir index numarası (0'dan başlayarak).
      4.  **Bilgi Kaynağı:** Soruları oluştururken Britannica gibi güvenilir kaynaklardan yararlanın. Cevapların doğruluğunu garanti altına almak için teyit edilmiş bilgiler kullanın.
      5.  **Dil:** Türkçe.

      **Örnek Çıktı Formatı (JSON):**
      \`\`\`json
      {
        "questions": [
          {
            "id": 1,
            "question": "Roma İmparatorluğu'nun ilk imparatoru kimdir?",
            "options": [
              "Jül Sezar",
              "Augustus",
              "Nero",
              "Tiberius"
            ],
            "correctAnswer": 1,
            "timeLimit": 15
          }
        ]
      }
      \`\`\`

      Önemli: Sadece JSON formatında yanıt verin, başka hiçbir açıklama eklemeyin.
    `;

    try {
      // Check rate limit before making the API call
      RateLimiter.checkRateLimit();

      console.log('Google GenAI ile quiz oluşturuluyor...');

      const response = await genAI.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      console.log('GenAI yanıtı alındı');

      if (!response || !response.text) {
        throw new Error('Empty response from GenAI');
      }

      const textResponse = response.text;
      console.log('Text Response length:', textResponse.length);

      // Try to extract JSON from the response
      const jsonMatch = textResponse.match(/```json([\s\S]*?)```/);

      if (!jsonMatch || !jsonMatch[1]) {
        console.error("Raw GenAI response:", textResponse.substring(0, 500));
        // Fallback: try to parse the entire response as JSON
        try {
          const quizData = JSON.parse(textResponse.trim());
          return quizData.questions;
        } catch {
          throw new Error("GenAI'den gelen yanıtta geçerli bir JSON formatı bulunamadı.");
        }
      }

      const jsonString = jsonMatch[1].trim();
      const quizData = JSON.parse(jsonString);

      if (!quizData.questions || quizData.questions.length === 0) {
        throw new Error('Quiz soruları oluşturulamadı.');
      }

      return quizData.questions;

    } catch (error) {
      console.error('Quiz oluşturulurken hata oluştu:', error.message);

      // Return mock data if API fails (for development)
      if (error.message.includes('API anahtarı')) {
        throw error; // Re-throw API key errors
      }

      // For other errors, return mock data
      console.warn('GenAI başarısız, mock data kullanılıyor');
      return this.getMockQuizData(topic);
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
