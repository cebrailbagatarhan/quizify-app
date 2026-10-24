# Quizify (Expo)

React Native quiz app. AI-generated quizzes must be served by a **trusted backend**, not by directly calling Gemini from a mobile application.

## Security incident / migration

An earlier public commit contained a provider API key in `services/generativeAIService.js`. **Revoke/rotate it in Google Cloud immediately**, review API usage and billing, and check other copies and Git history. Removing the key from the latest branch does **not** make the exposed key secret again. Do not paste replacement credentials into this repository, Expo environment variables, or the mobile bundle.

## Mobile setup

```sh
npm ci
# In .env.local, add only the public URL of your backend:
# EXPO_PUBLIC_QUIZ_API_URL=https://your-backend.example/api/quiz
npx expo start
```

`EXPO_PUBLIC_*` variables are public and embedded in mobile builds: **never put a Gemini key there**.

The app sends `POST` to `EXPO_PUBLIC_QUIZ_API_URL` with `{"topic":"Tarih"}` and expects JSON:

```json
{"questions":[{"id":1,"question":"Soru?","options":["A","B","C","D"],"correctAnswer":0,"timeLimit":15}]}
```

The client checks response structure before using questions. The server must implement authenticated access, rate limits, safe topic validation, timeouts, secure provider credentials, and a schema-validated Gemini output. The endpoint is not included in this repo; AI quiz generation is unavailable until configured. An offline mock method remains available for explicit development/testing but is **not** silently used on production API errors.

## Next steps

- Deploy the server-side quiz API, keep the provider secret in server-side secret management.
- Add production authentication and throttling; prevent anonymous unlimited provider spend.
- Audit Git history and any previously distributed app bundles for exposed credentials.
- Add API contract tests and end-to-end tests before release.
