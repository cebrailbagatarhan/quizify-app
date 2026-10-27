# Quiz API Security Contract

The Expo application must never ship a Gemini/Google provider credential. It only receives the public URL of a trusted backend through `EXPO_PUBLIC_QUIZ_API_URL`.

The backend owns `GEMINI_API_KEY` as a server-side secret and must authenticate callers, enforce per-user/IP rate limits, validate the topic and response schema, and avoid logging credentials or raw prompts/responses.

## Endpoint

`POST $EXPO_PUBLIC_QUIZ_API_URL`

Request:

```json
{ "topic": "Roma İmparatorluğu" }
```

Response:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "timeLimit": 15
    }
  ]
}
```

Production URLs must use HTTPS. Without a configured URL, quiz generation fails with an explicit error; mock data is never used silently.

`npm run test:security` (`scripts/check-client-secrets.mjs`) fails if a Google API key literal, `@google/genai`, or a client-side Gemini key variable appears in client sources.
