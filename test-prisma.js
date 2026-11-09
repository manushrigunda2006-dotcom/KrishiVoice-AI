// Standalone test script for Gnani Prisma STT (v3.0)
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
  const model = process.env.GNANI_STT_MODEL || "prisma-v3.0";

  console.log(`Endpoint: ${sttUrl}`);
  console.log(`Model:    ${model}`);
  console.log(`Language: kn-IN (Kannada)`);
  console.log(`API Key:  ${apiKey ? (apiKey === "replace_with_your_key" ? "PLACEHOLDER (replace_with_your_key)" : apiKey.substring(0, 6) + "..." + apiKey.slice(-4)) : "NOT SET"}`);

  // Step 1: Generate a test 2-second WAV tone at 16kHz mono using FFmpeg
  const tmpDir = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const testWavPath = path.join(tmpDir, `test-stt-${Date.now()}.wav`);

  console.log("\n1. Generating valid 16kHz mono 16-bit PCM WAV using FFmpeg...");
  await new Promise((resolve, reject) => {
    execFile("ffmpeg", [
      "-y",
      "-f", "lavfi",
      "-i", "sine=frequency=800:duration=2",
      "-ar", "16000",
      "-ac", "1",
      "-c:a", "pcm_s16le",
      testWavPath
    ], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const fileStats = fs.statSync(testWavPath);
  console.log(`✓ Generated WAV audio file: ${testWavPath} (${fileStats.size} bytes)`);

  // Step 2: Build multipart/form-data payload according to Gnani Prisma specification
  console.log("\n2. Building multipart/form-data payload with documented fields...");
  const audioBytes = fs.readFileSync(testWavPath);
  const blob = new Blob([audioBytes], { type: "audio/wav" });
  const form = new FormData();

  form.append("audio_file", blob, "test_audio.wav");
  form.append("model", model);
  form.append("language_code", "kn-IN");
  form.append("preferred_language", "kn-IN");
  form.append("format", "transcribe");

  console.log("✓ Form fields attached: audio_file, model, language_code, preferred_language, format");

  // Step 3: Transmit request to Gnani Prisma
  console.log(`\n3. Sending POST request to ${sttUrl}...`);
  try {
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

    if (response.ok) {
      console.log("\n✅ GNANI PRISMA STT API CALL SUCCEEDED!");
      console.log(`Transcript: "${payload.transcript || payload.text || ""}"`);
    } else {
      console.log(`\n⚠️ Gnani Server Returned Error (Status ${response.status}):`);
      if (response.status === 401) {
        console.log("👉 Cause: Invalid, expired, or placeholder GNANI_API_KEY.");
        console.log("👉 Resolution: Provide your real Gnani API key from https://api.vachana.ai in the .env file.");
      } else {
        console.log(`👉 Detail: ${JSON.stringify(payload)}`);
      }
    }
  } catch (netErr) {
    console.error("❌ Network / Fetch Error:", netErr.message);
  } finally {
    // Cleanup
    if (fs.existsSync(testWavPath)) {
      fs.unlinkSync(testWavPath);
      console.log("\n✓ Cleaned up temporary test WAV file.");
    }
  }
}

runPrismaTest();
