require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({
  dest: path.join(__dirname, "tmp"),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const knowledge = JSON.parse(
  fs.readFileSync(path.join(__dirname, "knowledge.json"), "utf8")
);

function findAnswer(question) {
  const q = question.toLowerCase();
  const match = knowledge.find(item =>
    item.keywords.some(keyword => q.includes(keyword.toLowerCase()))
  );
  if (!match) return null;
  return match;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    speechConfigured: Boolean(process.env.GNANI_API_KEY),
    message: "KrishiVoice server is running"
  });
});

app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  if (!process.env.GNANI_API_KEY) {
    return res.status(503).json({ error: "Gnani API key is not configured. Add GNANI_API_KEY to your .env file." });
  }
  if (!req.file) return res.status(400).json({ error: "Please record or select an audio file." });

  try {
    const form = new FormData();
    const audioBytes = fs.readFileSync(req.file.path);
    const blob = new Blob([audioBytes], { type: req.file.mimetype || "audio/webm" });
    form.append("audio_file", blob, req.file.originalname || "recording.webm");
    form.append("language_code", req.body.languageCode || "kn-IN");
    form.append("preferred_language", req.body.languageCode || "kn-IN");
    form.append("format", "transcribe");

    const response = await fetch(process.env.GNANI_STT_URL || "https://api.vachana.ai/stt/v3", {
      method: "POST",
      headers: { "X-API-Key-ID": process.env.GNANI_API_KEY },
      body: form
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload.message || payload.error || "Gnani transcription request failed.",
        detail: payload
      });
    }
    res.json({ transcript: payload.transcript || payload.text || "", raw: payload });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Could not reach the speech service. Check your connection and API configuration." });
  } finally {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
});

app.post("/api/ask", (req, res) => {
  const question = String(req.body.question || "").trim();
  if (!question) return res.status(400).json({ error: "Please enter a question." });

  const result = findAnswer(question);
  if (!result) {
    return res.json({
      found: false,
      answer: "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ ನಮ್ಮ ಬಳಿ ಇಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಥಳೀಯ ಕೃಷಿ ಇಲಾಖೆ ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ ಸಲಹೆ ಪಡೆಯಿರಿ.",
      answerEn: "Sorry, we do not have reviewed information for this question yet. Please contact your local agriculture department or Krishi Vigyan Kendra.",
      source: "No matching reviewed entry",
      safety: "Do not apply pesticides, fertilizers or other treatments based only on an unverified online answer."
    });
  }
  res.json({
    found: true,
    answer: result.answerKn,
    answerEn: result.answerEn,
    source: result.source,
    sourceUrl: result.sourceUrl,
    safety: result.safety || ""
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`KrishiVoice running at http://localhost:${port}`));
