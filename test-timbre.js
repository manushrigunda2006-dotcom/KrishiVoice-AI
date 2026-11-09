// Standalone test script for Gnani Timbre TTS (v3.0)
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function runTimbreTest() {
  console.log("=========================================");
  console.log("🔊 TESTING GNANI TIMBRE TTS INTEGRATION");
  console.log("=========================================");

  const apiKey = process.env.GNANI_API_KEY;
  const ttsUrl = process.env.GNANI_TTS_URL || "https://api.vachana.ai/api/v1/tts/inference";
  const voice = process.env.GNANI_TTS_VOICE || "Nalini";
  const model = "timbre-v3.0";
  const language = "kn"; // Kannada
  const testText = "ನಮಸ್ಕಾರ, ಕೃಷಿವಾಯ್ಸ್ ಎಐ ವೇದಿಕೆಗೆ ನಿಮಗೆ ಆತ್ಮೀಯ ಸ್ವಾಗತ.";

  console.log(`Endpoint: ${ttsUrl}`);
  console.log(`Model:    ${model}`);
  console.log(`Voice:    ${voice}`);
  console.log(`Language: ${language} (Kannada)`);
  console.log(`Text:     "${testText}"`);
  console.log(`API Key:  ${apiKey ? (apiKey === "replace_with_your_key" ? "PLACEHOLDER (replace_with_your_key)" : apiKey.substring(0, 6) + "..." + apiKey.slice(-4)) : "NOT SET"}`);

  const payload = {
    text: testText,
    voice: voice,
    model: model,
    language: language,
    speed: 1.0,
    audio_config: {
      encoding: "linear_pcm",
      container: "wav",
      num_channels: 1,
      sample_rate: 24000
    }
  };

  console.log("\n1. Sending POST request to Gnani Timbre TTS...");
  try {
    const response = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        "X-API-Key-ID": apiKey || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    const contentType = response.headers.get("content-type") || "";
    console.log(`Content-Type: ${contentType}`);

    if (contentType.includes("audio") || contentType.includes("octet-stream")) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const outPath = path.join(__dirname, "tmp", `test-timbre-output-${Date.now()}.wav`);
      fs.writeFileSync(outPath, buffer);
      console.log(`\n✅ GNANI TIMBRE TTS SYNTHESIS SUCCEEDED!`);
      console.log(`Saved synthesized audio to: ${outPath} (${buffer.length} bytes)`);
    } else {
      const resJson = await response.json().catch(() => ({}));
      console.log("\nGnani Server Response Payload:");
      console.log(JSON.stringify(resJson, null, 2));

      if (response.ok) {
        if (resJson.audio || resJson.audio_content) {
          console.log("\n✅ GNANI TIMBRE TTS RETURNED BASE64 AUDIO!");
        } else {
          console.log("\n✅ GNANI TIMBRE TTS COMPLETED:", resJson);
        }
      } else {
        console.log(`\n⚠️ Gnani Server Returned Error (Status ${response.status}):`);
        if (response.status === 401) {
          console.log("👉 Cause: Invalid, expired, or placeholder GNANI_API_KEY.");
          console.log("👉 Resolution: Provide your real Gnani API key from https://api.vachana.ai in the .env file.");
        } else {
          console.log(`👉 Detail: ${JSON.stringify(resJson)}`);
        }
      }
    }
  } catch (netErr) {
    console.error("❌ Network / Fetch Error:", netErr.message);
  }
}

runTimbreTest();
