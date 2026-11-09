require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure temporary storage directory exists
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Load agricultural knowledge base
const knowledgePath = path.join(__dirname, "knowledge.json");
let knowledge = [];
try {
  knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
  console.log(`Loaded ${knowledge.length} verified agricultural knowledge entries.`);
} catch (err) {
  console.error("Failed to load knowledge.json:", err.message);
}

// Normalized stop words for Kannada & English farming queries
const STOP_WORDS = new Set([
  "ಏನು", "ಹೇಗೆ", "ಯಾವಾಗ", "ಎಲ್ಲಿ", "ಯಾವ", "ಯಾವುದು", "ಯಾರು", "ಬಗ್ಗೆ", "ತಿಳಿಸಿ", "ಹೇಳಿ", "ಬೇಕು",
  "ಮಾಡಬೇಕು", "ಮಾಡಲಿ", "ಮಾಡಲು", "ಆಗುತ್ತದೆ", "ಕೊಡಿ", "ಸಲಹೆ", "ಮಾಹಿತಿ", "ಬೆಳೆ", "ಹೊಲ", "ಜಮೀನು",
  "what", "how", "when", "where", "which", "who", "tell", "me", "about", "give", "advice",
  "information", "please", "is", "are", "the", "a", "an", "in", "to", "for", "of", "and"
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, " ")
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function findAnswer(rawQuestion) {
  const query = rawQuestion.trim();
  const qLower = query.toLowerCase();
  const qTokens = tokenize(query);

  let bestMatch = null;
  let highestScore = 0;

  for (const item of knowledge) {
    let score = 0;

    // 1. Direct whole-query match in keywords or title
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (qLower === kwLower) {
        score += 30;
      } else if (qLower.includes(kwLower)) {
        score += 15 + Math.min(kwLower.length, 10);
      } else if (kwLower.includes(qLower)) {
        score += 10;
      }
    }

    // 2. Token overlap score
    for (const token of qTokens) {
      // Check in keywords
      const kwMatch = item.keywords.some(kw => kw.toLowerCase().includes(token));
      if (kwMatch) score += 6;

      // Check in Kannada title or English title
      if (item.titleKn && item.titleKn.toLowerCase().includes(token)) score += 5;
      if (item.titleEn && item.titleEn.toLowerCase().includes(token)) score += 5;

      // Check in answer text
      if (item.answerKn && item.answerKn.toLowerCase().includes(token)) score += 2;
      if (item.answerEn && item.answerEn.toLowerCase().includes(token)) score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Related suggestions pool
  const relatedSuggestions = knowledge
    .filter(item => item !== bestMatch)
    .slice(0, 3)
    .map(item => ({
      titleKn: item.titleKn,
      titleEn: item.titleEn,
      category: item.category,
      suggestedQueryKn: item.keywords[0],
      suggestedQueryEn: item.keywords.find(k => /^[a-zA-Z\s]+$/.test(k)) || item.keywords[0]
    }));

  if (!bestMatch || highestScore < 6) {
    return {
      found: false,
      score: highestScore,
      answer: "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ನೇರ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ ನಮ್ಮ ದತ್ತಸಂಚಯದಲ್ಲಿ ದೊರೆತಿಲ್ಲ. ದಯವಿಟ್ಟು ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ (ಟೋಲ್ ಫ್ರೀ: 1800-180-1551) ಅಥವಾ ನಿಮ್ಮ ಹೋಬಳಿಯ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರವನ್ನು (RSK) ಸಂಪರ್ಕಿಸಿ.",
      answerEn: "Sorry, direct verified information for this specific query is not available in our knowledge base yet. Please call Kisan Call Centre (Toll-Free: 1800-180-1551) or visit your nearest Raitha Samparka Kendra (RSK).",
      source: "Kisan Call Centre & Karnataka Department of Agriculture",
      sourceUrl: "https://raitamitra.karnataka.gov.in/",
      safety: "ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯ ಪರಿಶೀಲನೆಯಿಲ್ಲದೆ ಯಾವುದೇ ಕೀಟನಾಶಕ ಅಥವಾ ರಸಗೊಬ್ಬರಗಳ ಪ್ರಮಾಣ ನಿರ್ಧರಿಸಬೇಡಿ.",
      suggestions: relatedSuggestions
    };
  }

  return {
    found: true,
    score: highestScore,
    id: bestMatch.id,
    category: bestMatch.category,
    titleKn: bestMatch.titleKn,
    titleEn: bestMatch.titleEn,
    answer: bestMatch.answerKn,
    answerEn: bestMatch.answerEn,
    source: bestMatch.source,
    sourceUrl: bestMatch.sourceUrl,
    safety: bestMatch.safety || "ಸ್ಥಳೀಯ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    lastVerified: bestMatch.lastVerified,
    suggestions: relatedSuggestions
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const categories = [...new Set(knowledge.map(k => k.category))];
  res.json({
    ok: true,
    appName: "KrishiVoice AI 2.0",
    speechConfigured: Boolean(process.env.GNANI_API_KEY && process.env.GNANI_API_KEY !== "replace_with_your_key"),
    ttsConfigured: Boolean(process.env.GNANI_API_KEY && process.env.GNANI_API_KEY !== "replace_with_your_key"),
    knowledgeCount: knowledge.length,
    categories,
    message: "KrishiVoice AI 2.0 server is running"
  });
});

// Knowledge categories & sample prompts
app.get("/api/knowledge", (_req, res) => {
  const categories = [...new Set(knowledge.map(k => k.category))];
  const samplePrompts = knowledge.map(k => ({
    id: k.id,
    category: k.category,
    titleKn: k.titleKn,
    titleEn: k.titleEn,
    sampleKn: k.keywords[0],
    sampleEn: k.keywords.find(kw => /^[a-zA-Z\s]+$/.test(kw)) || k.keywords[0]
  }));
  res.json({ categories, topics: samplePrompts });
});

// STT Endpoint - Gnani Prisma
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  const hasKey = Boolean(process.env.GNANI_API_KEY && process.env.GNANI_API_KEY !== "replace_with_your_key");
  
  if (!hasKey) {
    if (req.file) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
    return res.status(200).json({
      fallbackMode: true,
      transcript: "",
      message: "Gnani API key is not configured in .env. Client Web Speech API fallback active."
    });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Please record or upload an audio file." });
  }

  try {
    const audioBytes = fs.readFileSync(req.file.path);
    const form = new FormData();
    const mimeType = req.file.mimetype || "audio/webm";
    const filename = req.file.originalname || "recording.webm";
    const blob = new Blob([audioBytes], { type: mimeType });

    form.append("audio_file", blob, filename);
    form.append("model", process.env.GNANI_STT_MODEL || "prisma-v3.0");
    form.append("language_code", req.body.languageCode || "kn-IN");
    form.append("preferred_language", req.body.languageCode || "kn-IN");
    form.append("format", "transcribe");

    const sttUrl = process.env.GNANI_STT_URL || "https://api.vachana.ai/stt/v3";
    const response = await fetch(sttUrl, {
      method: "POST",
      headers: {
        "X-API-Key-ID": process.env.GNANI_API_KEY
      },
      body: form
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload.message || payload.error || "Gnani Prisma transcription request failed.",
        detail: payload
      });
    }

    const transcript = payload.transcript || payload.text || "";
    res.json({ transcript, raw: payload });
  } catch (err) {
    console.error("Gnani Prisma STT error:", err);
    res.status(500).json({
      error: "Could not reach Gnani speech service. Please check network connection and credentials.",
      detail: err.message
    });
  } finally {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
});

// TTS Endpoint - Gnani Timbre
app.post("/api/tts", async (req, res) => {
  const text = String(req.body.text || "").trim();
  const language = req.body.language || "kn";
  const voice = req.body.voice || "Nalini";

  if (!text) {
    return res.status(400).json({ error: "Text is required for TTS synthesis." });
  }

  const hasKey = Boolean(process.env.GNANI_API_KEY && process.env.GNANI_API_KEY !== "replace_with_your_key");
  if (!hasKey) {
    return res.json({
      useBrowserFallback: true,
      message: "Gnani API key not configured. Using browser speech synthesis fallback."
    });
  }

  try {
    const ttsUrl = process.env.GNANI_TTS_URL || "https://api.vachana.ai/api/v1/tts/inference";
    const response = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "X-API-Key-ID": process.env.GNANI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        voice,
        model: "timbre-v3.0",
        language,
        speed: 1.0,
        audio_config: {
          encoding: "linear_pcm",
          container: "wav",
          num_channels: 1,
          sample_rate: 24000
        }
      })
    });

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: "Gnani Timbre TTS request failed.",
        detail: errPayload,
        useBrowserFallback: true
      });
    }

    // Check content type to see if binary WAV or JSON
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("audio")) {
      res.setHeader("Content-Type", contentType);
      const arrayBuffer = await response.arrayBuffer();
      return res.send(Buffer.from(arrayBuffer));
    } else {
      const json = await response.json();
      return res.json(json);
    }
  } catch (err) {
    console.error("Gnani Timbre TTS error:", err);
    res.json({
      useBrowserFallback: true,
      error: err.message
    });
  }
});

// Agricultural QA Endpoint
app.post("/api/ask", (req, res) => {
  const question = String(req.body.question || "").trim();
  if (!question) {
    return res.status(400).json({ error: "Please enter or speak a question." });
  }

  const result = findAnswer(question);
  res.json(result);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🌾 KrishiVoice AI 2.0 running at http://localhost:${port}`);
  console.log(`📡 Gnani STT Status: ${process.env.GNANI_API_KEY ? "CONFIGURED" : "DEMO / BROWSER FALLBACK MODE"}`);
});
