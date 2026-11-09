// Standalone test script for Gnani Prisma STT (v3.0) with real spoken Kannada audio
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

async function runPrismaTest() {
  console.log("=========================================");
  console.log("🔍 TESTING GNANI PRISMA STT INTEGRATION");
  console.log("=========================================");

  const apiKey = process.env.GNANI_API_KEY;
  const sttUrl = process.env.GNANI_STT_URL || "https://api.vachana.ai/stt/v3";
  const ttsUrl = process.env.GNANI_TTS_URL || "https://api.vachana.ai/api/v1/tts/inference";
  const model = process.env.GNANI_STT_MODEL || "prisma-v3.0";

  console.log(`Endpoint: ${sttUrl}`);
  console.log(`Model:    ${model}`);
  console.log(`Language: kn-IN (Kannada)`);
  console.log(`API Key:  ${apiKey ? (apiKey === "replace_with_your_key" ? "PLACEHOLDER (replace_with_your_key)" : apiKey.substring(0, 6) + "..." + apiKey.slice(-4)) : "NOT SET"}`);

  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const rawAudioPath = path.join(tmpDir, `kannada-spoken-${Date.now()}.wav`);
  const convertedWavPath = path.join(tmpDir, `kannada-16k-${Date.now()}.wav`);

  try {
    // Step 1: Synthesize real Kannada speech audio using Gnani Timbre
    console.log("\n1. Generating real spoken Kannada speech audio via Gnani Timbre...");
    const sampleKannadaText = "ರಾಗಿ ಬೆಳೆಯ ಬಿತ್ತನೆಗೆ ಸೂಕ್ತ ಸಮಯ ಯಾವುದು";
    console.log(`Spoken phrase: "${sampleKannadaText}"`);

    const ttsRes = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: sampleKannadaText,
        voice: "Lakshmi",
        model: "timbre-v3.0",
        language: "kn",
        speed: 1.0,
        audio_config: {
          encoding: "linear_pcm",
          container: "wav",
          num_channels: 1,
          sample_rate: 16000
        }
      })
    });

    if (!ttsRes.ok) {
      throw new Error(`Failed to generate speech: ${await ttsRes.text()}`);
    }

    const ttsAudioBuffer = Buffer.from(await ttsRes.arrayBuffer());
    fs.writeFileSync(rawAudioPath, ttsAudioBuffer);
    console.log(`✓ Generated Kannada audio (${ttsAudioBuffer.length} bytes)`);

    // Step 2: Validate and enforce 16kHz mono 16-bit PCM WAV using FFmpeg
    console.log("\n2. Normalizing audio with FFmpeg (16kHz mono 16-bit PCM)...");
    await new Promise((resolve, reject) => {
      execFile("ffmpeg", [
        "-y",
        "-i", rawAudioPath,
        "-ar", "16000",
        "-ac", "1",
        "-c:a", "pcm_s16le",
        convertedWavPath
      ], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const fileStats = fs.statSync(convertedWavPath);
    console.log(`✓ Normalized WAV file: ${convertedWavPath} (${fileStats.size} bytes)`);

    // Step 3: Build multipart/form-data payload with documented fields
    console.log("\n3. Building multipart/form-data payload for Gnani Prisma...");
    const audioBytes = fs.readFileSync(convertedWavPath);
    const blob = new Blob([audioBytes], { type: "audio/wav" });
    const form = new FormData();

    form.append("audio_file", blob, "kannada_speech.wav");
    form.append("model", model);
    form.append("language_code", "kn-IN");
    form.append("preferred_language", "kn-IN");
    form.append("format", "transcribe");

    console.log("✓ Form fields attached: audio_file, model, language_code, preferred_language, format");

    // Step 4: Transmit request to Gnani Prisma STT
    console.log(`\n4. Sending POST request to ${sttUrl}...`);
    const response = await fetch(sttUrl, {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey || ""
      },
      body: form
    });

    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    const payload = await response.json().catch(() => ({}));

    console.log("\nGnani Server Response Payload:");
    console.log(JSON.stringify(payload, null, 2));

    if (response.ok && payload.transcript) {
      console.log("\n✅ GNANI PRISMA STT API CALL SUCCEEDED!");
      console.log(`Original Spoken:   "${sampleKannadaText}"`);
      console.log(`Prisma Transcript: "${payload.transcript}"`);
      console.log(`Detected Language: "${payload.detected_language_code || "kn-IN"}"`);
      console.log(`Latency:           ${(payload.end_to_end_latency * 1000).toFixed(0)} ms`);
    } else if (response.ok) {
      console.log("\n✅ GNANI PRISMA STT API CALL SUCCEEDED (Empty Transcript returned)");
    } else {
      console.log(`\n⚠️ Gnani Server Returned Error (Status ${response.status}):`);
      console.log(`👉 Detail: ${JSON.stringify(payload)}`);
    }
  } catch (netErr) {
    console.error("❌ Test Error:", netErr.message);
  } finally {
    // Cleanup temporary files
    if (fs.existsSync(rawAudioPath)) fs.unlinkSync(rawAudioPath);
    if (fs.existsSync(convertedWavPath)) fs.unlinkSync(convertedWavPath);
    console.log("\n✓ Cleaned up temporary test WAV files.");
  }
}

runPrismaTest();
