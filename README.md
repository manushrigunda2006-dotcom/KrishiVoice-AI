# KrishiVoice AI 2.0
### AI-Powered Multilingual Agricultural Intelligence Platform
**Tagline:** "ನಿಮ್ಮ ಕೃಷಿ. ನಿಮ್ಮ ಧ್ವನಿ. ನಿಮ್ಮ ಭವಿಷ್ಯ." *(Your Farm. Your Voice. Your Future.)*

---

## Overview

**KrishiVoice AI 2.0** is a production-oriented, mobile-first agricultural intelligence platform built specifically to empower farmers across Karnataka and India. Farmers can ask agricultural questions in Kannada or English using natural voice or text, and receive immediate, verified guidance sourced from authoritative agricultural bodies such as ICAR, UAS Bangalore (GKVK), UAS Dharwad, and the Karnataka State Department of Agriculture (KSDA).

---

## Key Features Implemented (Phase 1: Foundation)

- **Kannada-First Multilingual Assistant:** Conversational query engine optimized for Kannada (`kn-IN`) and English (`en-IN`), with foundation for Hindi, Telugu, and Tamil.
- **Dual-Mode Speech Recognition (STT):**
  - **Gnani Prisma STT Integration:** Directly calls `https://api.vachana.ai/stt/v3` with `audio_file`, `model=prisma-v3.0`, and `X-API-Key-ID`.
  - **Browser Web Speech Fallback:** Automatically operates via `webkitSpeechRecognition` when running locally without API credentials, ensuring seamless demonstration without breaking.
- **Text-to-Speech (TTS) Engine:**
  - **Gnani Timbre TTS:** Configured endpoint for `https://api.vachana.ai/api/v1/tts/inference` (`timbre-v3.0`, `voice: "Nalini"`).
  - **Browser Speech Synthesis Fallback:** Clear audio narration with adjusted speech rates for rural comprehension.
- **Reviewed Agricultural Knowledge Base:**
  - Over 19 comprehensive, verified entries categorized into:
    1. *Major Crops* (Ragi, Paddy, Maize, Sugarcane, Groundnut, Cotton, Onion, Arecanut, Tomato).
    2. *Pest & Disease Management* (Paddy blast, Fall Armyworm, Koleroga, Tomato leaf curl, Pink bollworm, Tikka).
    3. *Soil Health & Organic Farming* (Soil testing, Jeevamrutha, Vermicomposting, Bio-fertilizers).
    4. *Micro-Irrigation* (Drip & Sprinkler subsidies under PMKSY).
    5. *Government Schemes* (PM-KISAN ₹6000, Raitha Siri millet incentive, PMFBY crop insurance, Krishi Bhagya).
    6. *Seasonal Agro-Advisories & Helplines* (Kisan Call Centre 1800-180-1551).
- **Intelligent Multi-Token Search & Tokenizer:** Tokenizes Kannada and English queries, strips stop words, calculates TF-IDF keyword overlap scores, and offers related suggestions when questions are unmatched.
- **Agricultural Safety System:** Strict safety guards preventing unverified pesticide doses or chemical prescriptions; every response references official sources and advises local KVK / Agriculture Officer consultations.
- **Modern Mobile-First UI/UX:**
  - Forest Green & Fresh Leaf Green palette (`#143826`, `#2d6a4f`).
  - Dual typography (`Noto Sans Kannada` + `DM Sans`).
  - Dynamic audio waveform visualizer and animated mic pulse rings.
  - Active session conversation history with one-tap query re-run.
  - Instant zero-reload language toggle.

---

## Tech Stack

- **Backend:** Node.js, Express.js, Multer (multipart audio uploads)
- **Frontend:** Vanilla TypeScript/JavaScript, Semantic HTML5, Custom Mobile-First CSS Design System, SVG Lucide/Feather icons
- **Speech & AI:** Gnani.ai Prisma STT (v3.0), Gnani.ai Timbre TTS (v3.0), Web Speech API
- **Knowledge Sources:** ICAR, UAS Bangalore (GKVK), UAS Dharwad, KSDA Raitha Mitra, Soil Health Portal, PM-KISAN Portal

---

## Directory Structure

```text
KrishiVoice-AI/
├── .env.example            # Environment variables template
├── .gitignore              # Ignored files (node_modules, .env, tmp/)
├── knowledge.json          # Curated agricultural knowledge entries
├── package.json            # Project manifest and dependencies
├── README.md               # Complete platform documentation
├── server.js               # Express API server with Gnani Prisma & Timbre routes
└── public/
    ├── index.html          # Responsive, mobile-first frontend
    ├── script.js           # Client controller, STT/TTS engine & localization
    └── style.css           # Agricultural design system stylesheet
```

---

## Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Node 20 LTS recommended)
- **npm**: v9.0.0 or higher

### 2. Installation
Clone or extract the repository, navigate into the directory and install dependencies:
```bash
cd KrishiVoice-AI
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to configure your credentials:
```env
PORT=3000
GNANI_API_KEY=your_actual_gnani_api_key_here
GNANI_STT_URL=https://api.vachana.ai/stt/v3
GNANI_STT_MODEL=prisma-v3.0
GNANI_TTS_URL=https://api.vachana.ai/api/v1/tts/inference
GNANI_TTS_VOICE=Nalini
```
*(Note: If you do not have a Gnani API key yet, the application automatically runs in demo mode using browser-native Web Speech recognition and synthesis!)*

### 4. Running the Server
```bash
npm start
```
For development with automatic reloading:
```bash
npm run dev
```

Visit **`http://localhost:3000`** in your browser (Chrome or Edge recommended for full microphone and speech synthesis support).

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check returning speech configuration, knowledge count, and categories. |
| `GET` | `/api/knowledge` | Returns list of categories and sample query prompts. |
| `POST` | `/api/transcribe` | Accepts multipart audio (`audio_file`) and calls Gnani Prisma STT (`kn-IN`). |
| `POST` | `/api/tts` | Calls Gnani Timbre TTS (`kn`) with text payload and voice parameters. |
| `POST` | `/api/ask` | Natural language question matcher returning verified agricultural guidance, citations, safety disclaimers, and related suggestions. |

---

## Testing

Run the included automated endpoint test suite using PowerShell:
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes('{"question":"ರಾಗಿ ಬಿತ್ತನೆಗೆ ಸೂಕ್ತ ಸಮಯ ಯಾವುದು?"}')
Invoke-RestMethod -Uri "http://localhost:3000/api/ask" -Method Post -ContentType "application/json; charset=utf-8" -Body $body
```

---

## Multi-Phase Roadmap

- **Phase 1: Foundation (COMPLETED)**
  - Audit existing starter, fix multer race condition and encoding errors.
  - Deliver responsive Kannada-first agricultural UI with mobile-first cards.
  - Implement dual-mode speech recognition (Gnani Prisma STT + Web Speech fallback).
  - Integrate authoritative 19+ topic Karnataka knowledge base with safety disclaimers.
  - Implement full bilingual localization and session conversation history.
- **Phase 2: Intelligence (Next Phase)**
  - Full Gnani Timbre real-time streaming audio integration.
  - Vision model for crop disease detection from leaf photographs.
  - Multi-turn conversational memory.
- **Phase 3: Agricultural Tools**
  - Live IMD weather intelligence and micro-climate advisories.
  - Real-time AGMARKNET Karnataka APMC mandi prices.
  - Automated Smart Farm Calendar with crop lifecycle reminders.
- **Phase 4: Personalisation**
  - Farmer registration and land registry (FRUITS / RTC integration).
  - Farm dashboard with active crops and notification engine.
- **Phase 5: Advanced Platform**
  - Offline-first PWA caching and sync.
  - Protected admin dashboard for KVK scientists.
