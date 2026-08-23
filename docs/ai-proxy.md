# AI Proxy Security Contract

The Expo application must never ship a Gemini/Google provider credential. It only receives the public URL of a trusted backend through `EXPO_PUBLIC_AI_PROXY_URL`.

The backend owns `GEMINI_API_KEY` as a server-side secret and must authenticate callers, enforce per-user/IP rate limits, validate the topic and response schema, and avoid logging credentials or raw prompts/responses.

## Endpoint

`POST /v1/quiz`

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

Production URLs must use HTTPS. Without a configured proxy, the app intentionally uses its existing local mock quiz data.
