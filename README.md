# Quizify

Quizify, Expo ve React Native ile geliştirilmiş deneysel bir mobil quiz uygulamasıdır. Kullanıcı bir kategori seçer, süreli soruları yanıtlar, sonuçlarını görür ve yerel profil istatistiklerini takip eder.

> **Durum:** Çalışan prototip. Gerçek AI sağlayıcı anahtarı mobil uygulamada tutulmaz. Güvenilir bir backend proxy yapılandırılmazsa uygulama yerel mock sorularla devam eder.

## Özellikler

- Tarih, coğrafya, biyoloji, kimya, matematik, edebiyat ve müzik kategorileri
- Süreli çoktan seçmeli quiz akışı
- Doğru/yanlış geri bildirimi ve sonuç özeti
- AsyncStorage tabanlı yerel istatistikler
- Sonuç paylaşımı, haptic feedback ve profil ekranı
- İsteğe bağlı backend AI proxy; bağlantı yoksa güvenli mock fallback

## Ekran Akışı

`Splash → Home → Quiz → Results`; `Home → Profile`.

Ana dosyalar:

- `App.js`: React Navigation stack
- `screens/`: uygulama ekranları
- `data/newQuizData.js`: yerel kategori ve soru verisi
- `services/generativeAIService.js`: proxy isteği, retry/rate limit ve mock fallback
- `utils/statsManager.js`: cihazdaki quiz istatistikleri
- `utils/quizContract.mjs`: proxy yanıtı doğrulama sözleşmesi

## Kurulum

Node.js ve Expo geliştirme ortamı gerekir.

```bash
npm ci
npm start
```

Ardından Expo çıktısından Android, iOS veya web hedefini seçin.

## AI Proxy

İstemciye Gemini veya başka bir sağlayıcı anahtarı koymayın. Yalnız güvenilir backend adresini ayarlayın:

```bash
cp .env.example .env
```

```dotenv
EXPO_PUBLIC_AI_PROXY_URL=https://your-ai-proxy.example.com
```

İstemci `POST /v1/quiz` isteğiyle `{ "topic": string }` gönderir. Proxy şu yapıda bir dizi veya `{ "questions": [...] }` döndürmelidir:

```json
{
  "questions": [
    {
      "question": "2 + 2 kaçtır?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "timeLimit": 15
    }
  ]
}
```

`correctAnswer`, `options` dizisindeki sıfır tabanlı indekstir. Uygulama boş, eksik veya aralık dışı yanıtları reddeder. Production proxy; sağlayıcı secret'ını sunucuda tutmalı, kullanıcı/IP bazlı rate limit, authentication, request-size sınırı ve log redaction uygulamalıdır.

## Testler

```bash
npm test
```

- `test:security`: istemci bundle'ına sağlayıcı anahtarı/SDK'sı eklenmediğini denetler.
- `test:unit`: geçerli/geçersiz quiz yanıtı sözleşmesini sınar.

Sonuç ekranı, statik kategori verisini yeniden okumak yerine kullanıcının gerçekten çözdüğü soru dizisini kullanır; tekrar çöz akışı da aynı diziyi korur.

## Bilinen Sınırlar

- Proxy backend bu repository'nin parçası değildir.
- İstatistikler yalnız cihazda tutulur; hesaplar arası senkronizasyon yoktur.
- Mock soru havuzu geliştirme amaçlıdır ve içerik doğruluğu için editoryal inceleme yerine geçmez.
- Component/E2E test altyapısı ve gerçek cihaz ekran görüntüleri henüz eklenmemiştir.
- Uygulama mağazası release süreci belgelenmemiştir.

## Yol Haritası

- Ekran görüntüleri ve kısa demo videosu
- Component testleri ve Expo E2E smoke testi
- Kimlik doğrulamalı, rate-limit'li production proxy
- Soru kaynağı/kalite incelemesi ve erişilebilirlik kontrolü
- Bulut tabanlı kullanıcı/progress senkronizasyonu
