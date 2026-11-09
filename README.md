# KrishiVoice AI

A Kannada-first student prototype for asking basic farming-information questions by voice or text.

## Features
- Responsive Kannada-first interface.
- Express backend with a curated, small JSON knowledge base.
- Gnani Prisma speech-to-text integration (API key stays on the server).
- Text answer with source links and a clear no-match response.
- Browser speech synthesis is included as an optional playback fallback. It is **not** Gnani Timbre.

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- Gnani API key for real transcription

## Run locally
1. Install Node.js.
2. Extract this project and open its folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your Gnani API key to `.env`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

Without an API key, text questions still work using the sample knowledge base. Voice transcription returns a clear setup message.

## Gnani Prisma configuration
The server sends audio to `POST https://api.vachana.ai/stt/v3` by default with:
- Header: `X-API-Key-ID`
- Multipart field: `audio_file`
- `language_code=kn-IN`
- `preferred_language=kn-IN`
- `format=transcribe`

Confirm the endpoint, model access, accepted audio formats and credentials in your Gnani dashboard and current official docs before the final demo. Browser-recorded WebM audio may not be accepted by every account/API configuration. If so, convert to a supported format on the backend or use a supported upload format from the API docs.

## TTS status
Timbre is not wired into this starter because the correct voice/model/endpoint must be confirmed for your account and Kannada voice. The speaker button uses the browser's speech synthesis if available and is clearly a fallback, not a Gnani model integration. Do not claim Timbre is integrated until you implement and test it.

## Deploy
Deploy as a Node web service (for example Render):
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `GNANI_API_KEY`
- Optional: `GNANI_STT_URL`

Do not commit `.env`, API keys, recordings or private user data.

## Important prototype limitations
- The farming knowledge base is intentionally small and keyword-based, not a general AI model.
- Agricultural entries are general educational information. Have a qualified local expert review all content and Kannada translations before public use.
- Do not use this prototype to prescribe pesticide doses, diagnose crop disease or make high-stakes farm decisions.
