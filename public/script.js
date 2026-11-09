const $ = (id) => document.getElementById(id);
let recorder, chunks = [], recordedBlob = null, isRecording = false, currentAnswer = "";
const question = $("question");

async function checkHealth() {
  try {
    const r = await fetch("/api/health");
    const data = await r.json();
    $("apiStatus").textContent = data.speechConfigured ? "Gnani API ಸಂಪರ್ಕ ಲಭ್ಯ" : "ಡೆಮೊ ಮೋಡ್ · API key ಸೇರಿಸಿಲ್ಲ";
  } catch {
    $("apiStatus").textContent = "ಸರ್ವರ್ ಸಂಪರ್ಕ ಲಭ್ಯವಿಲ್ಲ";
  }
}
checkHealth();

document.querySelectorAll("[data-question]").forEach(btn => {
  btn.addEventListener("click", () => {
    question.value = btn.dataset.question;
    question.focus();
  });
});

$("recordBtn").addEventListener("click", async () => {
  if (isRecording) return stopRecording();
  if (!navigator.mediaDevices?.getUserMedia) {
    $("recordHint").textContent = "ಮೈಕ್ರೋಫೋನ್‌ಗೆ HTTPS ಅಥವಾ localhost ಅಗತ್ಯ.";
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find(t => MediaRecorder.isTypeSupported(t));
    recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = async () => {
      recordedBlob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      stream.getTracks().forEach(t => t.stop());
      $("recordTitle").textContent = "ರೆಕಾರ್ಡಿಂಗ್ ಸಿದ್ಧವಾಗಿದೆ";
      $("recordHint").textContent = "ಈಗ 'ಉತ್ತರ ಪಡೆಯಿರಿ' ಒತ್ತಿರಿ";
      $("recordingBars").classList.remove("show");
      await transcribeRecording();
    };
    recorder.start();
    isRecording = true;
    $("recordBtn").classList.add("recording");
    $("recordTitle").textContent = "ರೆಕಾರ್ಡಿಂಗ್ ನಡೆಯುತ್ತಿದೆ…";
    $("recordHint").textContent = "ಮುಗಿಸಲು ಮತ್ತೆ ಮೈಕ್ ಒತ್ತಿರಿ";
    $("recordingBars").classList.add("show");
  } catch (e) {
    $("recordHint").textContent = "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಲಾಗಿಲ್ಲ.";
  }
});

function stopRecording() {
  if (recorder && isRecording) {
    isRecording = false;
    $("recordBtn").classList.remove("recording");
    recorder.stop();
  }
}

async function transcribeRecording() {
  if (!recordedBlob) return;
  $("recordHint").textContent = "Gnani Prisma ಮೂಲಕ ಧ್ವನಿ ಪಠ್ಯವಾಗುತ್ತಿದೆ…";
  const form = new FormData();
  form.append("audio", recordedBlob, "krishivoice-recording.webm");
  form.append("languageCode", "kn-IN");
  try {
    const response = await fetch("/api/transcribe", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Transcription failed");
    question.value = data.transcript || "";
    $("recordHint").textContent = question.value ? "ಪಠ್ಯ ಸಿದ್ಧವಾಗಿದೆ. ಪರಿಶೀಲಿಸಿ." : "ಧ್ವನಿಯಿಂದ ಪಠ್ಯ ಸಿಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
  } catch (err) {
    $("recordHint").textContent = err.message;
  }
}

$("askBtn").addEventListener("click", async () => {
  const text = question.value.trim();
  if (!text) {
    question.focus();
    question.placeholder = "ಮೊದಲು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ…";
    return;
  }
  $("askBtn").disabled = true;
  $("askBtn").textContent = "ಹುಡುಕಲಾಗುತ್ತಿದೆ…";
  $("answerStatus").textContent = "SEARCHING";
  $("emptyAnswer").hidden = false;
  $("emptyAnswer").querySelector("h3").textContent = "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…";
  $("emptyAnswer").querySelector("p").textContent = "ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿಯಲ್ಲಿ ಸಂಬಂಧಿತ ಉತ್ತರ ಹುಡುಕುತ್ತಿದ್ದೇವೆ.";
  $("answerContent").hidden = true;
  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not get answer");
    currentAnswer = data.answer || "";
    $("answerText").textContent = data.answer || "";
    $("answerEnglish").textContent = data.answerEn || "";
    $("answerEnglish").hidden = !data.answerEn;
    $("sourceLink").textContent = data.source || "Source information";
    if (data.sourceUrl) {
      $("sourceLink").href = data.sourceUrl;
      $("sourceLink").style.pointerEvents = "auto";
    } else {
      $("sourceLink").removeAttribute("href");
    }
    $("safetyText").textContent = data.safety || "";
    $("emptyAnswer").hidden = true;
    $("answerContent").hidden = false;
    $("answerStatus").textContent = data.found ? "MATCH FOUND" : "NO MATCH";
    $("speakBtn").disabled = !("speechSynthesis" in window);
  } catch (err) {
    $("emptyAnswer").hidden = false;
    $("emptyAnswer").querySelector("h3").textContent = "ಸಂಪರ್ಕ ಸಮಸ್ಯೆ";
    $("emptyAnswer").querySelector("p").textContent = err.message;
    $("answerStatus").textContent = "ERROR";
  } finally {
    $("askBtn").disabled = false;
    $("askBtn").innerHTML = 'ಉತ್ತರ ಪಡೆಯಿರಿ <span>→</span>';
  }
});

$("speakBtn").addEventListener("click", () => {
  if (!currentAnswer || !("speechSynthesis" in window)) return;
  // Browser speech synthesis fallback. This is NOT Gnani Timbre.
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(currentAnswer);
  utterance.lang = "kn-IN";
  speechSynthesis.speak(utterance);
});

let english = false;
$("languageToggle").addEventListener("click", () => {
  english = !english;
  $("languageToggle").textContent = english ? "ಕನ್ನಡ / EN ✓" : "ಕನ್ನಡ / EN";
  document.documentElement.lang = english ? "en" : "kn";
  document.querySelector(".hero h1").innerHTML = english ? 'Your farm.<br><em>Your voice.</em>' : 'ನಿಮ್ಮ ಕೃಷಿ.<br><em>ನಿಮ್ಮ ಧ್ವನಿ.</em>';
  document.querySelector(".lead").textContent = english
    ? "Ask farming questions in your language. Speak, ask and explore reviewed guidance."
    : "ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ. ಮಾತನಾಡಿ, ಪ್ರಶ್ನೆ ಕೇಳಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.";
});
