# KrishiVoice AI 2.0
### AI-Powered Multilingual Agricultural Intelligence Platform
**Tagline:** "ನಿಮ್ಮ ಕೃಷಿ. ನಿಮ್ಮ ಧ್ವನಿ. ನಿಮ್ಮ ಭವಿಷ್ಯ." *(Your Farm. Your Voice. Your Future.)*

---

## Overview

**KrishiVoice AI 2.0** is a production-oriented, mobile-first agricultural intelligence platform built specifically to empower farmers across Karnataka and India. It integrates **Gnani.ai's official speech technology suite** (`api.vachana.ai`):
1. **Gnani Prisma STT (Speech-to-Text)**: High-accuracy Kannada (`kn-IN`) and multilingual speech recognition.
2. **Gnani Timbre TTS (Text-to-Speech)**: Natural Indian voice synthesis for agricultural advice playback.

---

## Complete Voice Interaction Workflow

```text
[🎤 Farmer Speaks in Kannada]
          │
          ▼
[Browser MediaRecorder (WebM/WAV)]
          │
          ▼ (POST /api/transcribe)
[Backend FFmpeg Audio Validator & 16kHz Mono WAV Converter]
          │
          ▼ (Multipart Form-Data to https://api.vachana.ai/stt/v3)
[Gnani Prisma v3.0 STT Model]
          │
          ▼ (Returns Kannada Transcript)
[Editable Transcript in UI + POST /api/ask]
          │
          ▼
[Verified ICAR/KSDA Agricultural Knowledge Matcher]
          │
          ▼ (POST /api/tts)
[Gnani Timbre v3.0 TTS Model (https://api.vachana.ai/api/v1/tts/inference)]
          │
          ▼ (Streams Binary WAV Audio)
[🔊 Audio Playback with Play & Stop Controls]
```

---

## Gnani.ai Speech Integrations

### 1. Gnani Prisma Speech-to-Text (STT)
- **Endpoint**: `https://api.vachana.ai/stt/v3`
- **Method**: `POST`
- **Authentication Header**: `X-API-Key-ID: <GNANI_API_KEY>`
- **Content-Type**: `multipart/form-data`
- **Documented Request Fields**:
  - `audio_file`: Converted 16kHz mono 16-bit PCM WAV file.
  - `model`: `prisma-v3.0`
  - `language_code`: `kn-IN` (Kannada), `en-IN` (English), etc.
  - `preferred_language`: `kn-IN`
  - `format`: `transcribe`
- **Audio Validation & Conversion**: Built-in backend integration using `ffmpeg` automatically normalizes any browser audio format (WebM, OGG, MP4, AAC) into standard 16kHz mono 16-bit PCM WAV and caps recording duration at 30 seconds.
- **Backend Security**: All temporary files are unlinked and destroyed immediately in the `finally` execution block.

### 2. Gnani Timbre Text-to-Speech (TTS)
- **Endpoint**: `https://api.vachana.ai/api/v1/tts/inference`
- **Method**: `POST`
- **Authentication Header**: `X-API-Key-ID: <GNANI_API_KEY>`
- **Content-Type**: `application/json`
- **Request Payload**:
  ```json
  {
    "text": "ರಾಗಿ ಬಿತ್ತನೆಗೆ ಜುಲೈ-ಆಗಸ್ಟ್ ತಿಂಗಳು ಅತ್ಯಂತ ಸೂಕ್ತ...",
    "voice": "Nalini",
    "model": "timbre-v3.0",
    "language": "kn",
    "speed": 1.0,
    "audio_config": {
      "encoding": "linear_pcm",
      "container": "wav",
      "num_channels": 1,
      "sample_rate": 24000
    }
  }
  ```
- **Response Parsing**: Server streams the binary WAV audio directly to the client as `audio/wav`.
- **Playback Controls**: The UI provides responsive Play and Stop buttons, active audio visualizer indicators, and error reporting. (Browser speech synthesis is strictly not used as a substitute for Gnani Timbre).

---

## Environment Variables Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your credentials in `.env`:
```env
PORT=3000

# Your official Gnani API key from https://api.vachana.ai
GNANI_API_KEY=your_actual_api_key_here

# Gnani Prisma STT Endpoint & Model
GNANI_STT_URL=https://api.vachana.ai/stt/v3
GNANI_STT_MODEL=prisma-v3.0

# Gnani Timbre TTS Endpoint & Voice
GNANI_TTS_URL=https://api.vachana.ai/api/v1/tts/inference
GNANI_TTS_VOICE=Nalini
```

---

## Testing Gnani AI Integrations Independently

Two dedicated standalone test scripts are provided to verify the live Gnani AI API integrations independently without running the whole frontend:

### 1. Test Gnani Prisma STT:
```bash
node test-prisma.js
```
*What it tests:*
- Generates a valid 16kHz mono WAV audio file with FFmpeg.
- Constructs the official multipart/form-data payload with documented fields.
- Transmits to `https://api.vachana.ai/stt/v3` with `X-API-Key-ID`.
- Prints HTTP status, response JSON, and diagnostic advice.

### 2. Test Gnani Timbre TTS:
```bash
node test-timbre.js
```
*What it tests:*
- Prepares the JSON synthesis request for Kannada (`kn`) using model `timbre-v3.0` and voice `Nalini`.
- Sends POST request to `https://api.vachana.ai/api/v1/tts/inference`.
- Verifies binary WAV audio streaming and saves a sample WAV file to `tmp/`.

---

## Running the Platform Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
4. Click the **🎙️ microphone button** to grant microphone permission, record a query in Kannada, and experience the complete Gnani AI voice flow.
