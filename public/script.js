// KrishiVoice AI 2.0 - Client Controller
// Robust Dual-Mode STT (Gnani Prisma + WebSpeech), Timbre TTS, Multilingual UI, and Agricultural Knowledge

const $ = (id) => document.getElementById(id);

// Application State
const state = {
  currentLang: "kn",
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  speechRecognition: null,
  gnaniConfigured: false,
  activeSpeechUtterance: null,
  currentAudioPlayer: null,
  history: [],
  currentAnswer: null
};

// Multilingual Dictionary
const I18N = {
  kn: {
    tagline: "ನಿಮ್ಮ ಕೃಷಿ. ನಿಮ್ಮ ಧ್ವನಿ. ನಿಮ್ಮ ಭವಿಷ್ಯ.",
    navAssistant: "ಕೃಷಿ ಸಹಾಯಕ",
    navTopics: "ವಿಷಯಗಳು",
    navSchemes: "ಯೋಜನೆಗಳು",
    navHelpline: "ಸಹಾಯವಾಣಿ",
    heroBadge: "ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ",
    heroTitle: 'ನಿಮ್ಮ ಕೃಷಿ. <span class="gradient-text">ನಿಮ್ಮ ಧ್ವನಿ.</span>',
    heroSubtitle: "ಬೆಳೆ, ರೋಗ ನಿರ್ವಹಣೆ, ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿಯ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ, ಪರಿಶೀಲಿಸಿದ ಅಧಿಕೃತ ಉತ್ತರ ಪಡೆಯಿರಿ.",
    heroVoiceBtn: "ಧ್ವನಿಯಲ್ಲಿ ಮಾತನಾಡಿ",
    heroExploreBtn: "ಮಾಹಿತಿ ವಿಷಯಗಳು ನೋಡಿ",
    trust1Title: "ಪರಿಶೀಲಿಸಿದ ಮಾಹಿತಿ",
    trust1Desc: "ICAR & KSDA ಅಧಿಕೃತ ಆಧಾರ",
    trust2Title: "Gnani Prisma AI",
    trust2Desc: "ನಿಖರ ಕನ್ನಡ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ",
    trust3Title: "ಸುರಕ್ಷಿತ ಕೃಷಿ ಸಲಹೆ",
    trust3Desc: "ಅನಧಿಕೃತ ರಾಸಾಯನಿಕ ಶಿಫಾರಸು ಇಲ್ಲ",
    cardPreviewTag: "ಲೈವ್ ಸಹಾಯಕ",
    previewQuestion: '"ರಾಗಿ ಬೆಳೆಯ ಬಿತ್ತನೆಗೆ ಯಾವುದು ಸೂಕ್ತ ಸಮಯ?"',
    previewAnswer: '"ಕರ್ನಾಟಕದಲ್ಲಿ ಮುಂಗಾರು ಹಂಗಾಮಿನಲ್ಲಿ ಜುಲೈ-ಆಗಸ್ಟ್ ತಿಂಗಳು ರಾಗಿ ಬಿತ್ತನೆಗೆ ಅತ್ಯಂತ ಸೂಕ್ತ. GPU-28 ಮತ್ತು ML-365 ಉತ್ತಮ ತಳಿಗಳು..."',
    topicsEyebrow: "EXPLORE BY CATEGORY",
    topicsTitle: "ಕೃಷಿ ವಿಷಯಗಳ ವರ್ಗಗಳು",
    topicsDesc: "ನಿಮಗೆ ಬೇಕಾದ ವಿಷಯವನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಮತ್ತು ನೇರವಾಗಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    catAll: "ಎಲ್ಲವೂ (All)",
    catCrops: "🌾 ಬೆಳೆಗಳು (Crops)",
    catPest: "🐛 ಕೀಟ ಮತ್ತು ರೋಗ (Pest & Disease)",
    catSchemes: "🏛️ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು (Govt Schemes)",
    catSoil: "🧪 ಮಣ್ಣಿನ ಆರೋಗ್ಯ (Soil Health)",
    catIrrigation: "💧 ನೀರಾವರಿ (Irrigation)",
    catOrganic: "🌿 ಸಾವಯವ ಕೃಷಿ (Organic)",
    catWeather: "⛅ ಹವಾಮಾನ (Weather)",
    step1Title: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    step1Subtitle: "ಧ್ವನಿಯ ಮೂಲಕ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ",
    micReadyTitle: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ",
    micReadyHint: "ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ",
    micListeningTitle: "ಧ್ವನಿ ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ…",
    micListeningHint: "ಮಾತು ಮುಗಿದ ನಂತರ ನಿಲ್ಲಿಸಲು ಮತ್ತೆ ಮೈಕ್ ಒತ್ತಿರಿ",
    micProcessingTitle: "ಧ್ವನಿ ಪಠ್ಯವಾಗುತ್ತಿದೆ…",
    micProcessingHint: "Gnani Prisma STT ಮೂಲಕ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ",
    typeInputLabel: "ಅಥವಾ ಇಲ್ಲಿ ನೇರವಾಗಿ ಟೈಪ್ ಮಾಡಿ",
    clearBtn: "ತೆರವುಗೊಳಿಸಿ",
    inputPlaceholder: "ಉದಾಹರಣೆ: ರಾಗಿ ಬಿತ್ತನೆಗೆ ಸೂಕ್ತ ಸಮಯ ಯಾವುದು? ಅಥವಾ ಕಬ್ಬಿನ ಹನಿ ನೀರಾವರಿ...",
    speechReadyText: "ಕನ್ನಡ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸಿದ್ಧವಾಗಿದೆ",
    getAnswerBtn: "ಉತ್ತರ ಪಡೆಯಿರಿ",
    quickSuggestionsTitle: "ಜನಪ್ರಿಯ ಪ್ರಶ್ನೆಗಳು:",
    step2Title: "ಪರಿಶೀಲಿಸಿದ ಉತ್ತರ",
    step2Subtitle: "ಕೃಷಿ ತಜ್ಞರು ಮತ್ತು ಸಂಶೋಧನಾ ಸಂಸ್ಥೆಗಳ ಮಾರ್ಗದರ್ಶನ",
    stateWaiting: "ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ",
    stateSearching: "ಹುಡುಕಲಾಗುತ್ತಿದೆ",
    stateFound: "ಉತ್ತರ ದೊರೆತಿದೆ",
    stateNotFound: "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
    emptyHeading: "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಲು ನಾವು ಸಿದ್ಧರಿದ್ದೇವೆ",
    emptyDesc: "ಮೈಕ್ ಒತ್ತಿ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ ಅಥವಾ ಮೇಲೆ ನೀಡಿರುವ ಪ್ರಶ್ನೆಗಳಲ್ಲಿ ಒಂದನ್ನು ಆರಿಸಿ. ನಿಖರವಾದ ಕೃಷಿ ಮಾಹಿತಿ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ.",
    loadingHeading: "ಪರಿಶೀಲಿಸಿದ ದತ್ತಸಂಚಯದಲ್ಲಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
    loadingDesc: "ICAR, ವಿಶ್ವವಿದ್ಯಾಲಯಗಳು ಮತ್ತು ಕೃಷಿ ಇಲಾಖೆಯ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ.",
    verifiedBadge: "ಪರಿಶೀಲಿಸಿದ ಕೃಷಿ ಮಾಹಿತಿ",
    hideEnglishBtn: "ಮರೆಮಾಡಿ",
    showEnglishBtn: "ತೋರಿಸಿ",
    speakBtn: "ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ",
    stopSpeakBtn: "ನಿಲ್ಲಿಸಿ",
    sourceLabel: "ಅಧಿಕೃತ ಮೂಲ ಮತ್ತು ದಾಖಲೆ",
    openPortal: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ",
    safetyAlertTitle: "ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ",
    relatedQueriesTitle: "ಸಂಬಂಧಿತ ಇತರ ಪ್ರಶ್ನೆಗಳು:",
    copyBtn: "ಉತ್ತರ ನಕಲಿಸಿ",
    copiedBtn: "ನಕಲಿಸಲಾಗಿದೆ! ✓",
    historyTitle: "ಈ ಅಧಿವೇಶನದ ಹಿಂದಿನ ಪ್ರಶ್ನೆಗಳು",
    clearHistoryBtn: "ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ",
    historyEmpty: "ಯಾವುದೇ ಹಿಂದಿನ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ. ನೀವು ಕೇಳಿದ ಪ್ರಶ್ನೆಗಳು ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತವೆ.",
    schemesEyebrow: "GOVERNMENT WELFARE SCHEMES",
    schemesTitle: "ರೈತರಿಗಾಗಿ ಪ್ರಮುಖ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    schemesDesc: "ಕರ್ನಾಟಕದ ರೈತರು ಪಡೆಯಬಹುದಾದ ಪ್ರಮುಖ ಸಹಾಯಧನ ಮತ್ತು ಆರ್ಥಿಕ ಭದ್ರತಾ ಯೋಜನೆಗಳು.",
    helplineTitle: "ನೇರ ಕೃಷಿ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ",
    helplineDesc: "ಸರ್ಕಾರದ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ ಮೂಲಕ ಬೆಳಿಗ್ಗೆ 6 ರಿಂದ ರಾತ್ರಿ 10 ರವರೆಗೆ ಕನ್ನಡದಲ್ಲೇ ಉಚಿತವಾಗಿ ಕೃಷಿ ವಿಜ್ಞಾನಿಗಳಿಂದ ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.",
    footerAssistant: "ಕೃಷಿ ಸಹಾಯಕ",
    footerTopics: "ವಿಷಯಗಳು",
    footerSchemes: "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    footerDisclaimer: "ಗಮನಿಸಿ: KrishiVoice AI ಒಂದು ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಮಾಹಿತಿ ವೇದಿಕೆಯಾಗಿದೆ. ಯಾವುದೇ ಅಧಿಕೃತ ಬೆಳೆ ಚಿಕಿತ್ಸೆ, ಕೀಟನಾಶಕದ ಪ್ರಮಾಣ ಮತ್ತು ಸರ್ಕಾರಿ ಅನುದಾನದ ಅಂತಿಮ ನಿರ್ಧಾರಕ್ಕೆ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿ/KVK ವಿಜ್ಞಾನಿಗಳ ಸಲಹೆ ಕಡ್ಡಾಯ."
  },
  en: {
    tagline: "Your Farm. Your Voice. Your Future.",
    navAssistant: "Farm Assistant",
    navTopics: "Topics",
    navSchemes: "Govt Schemes",
    navHelpline: "Helpline",
    heroBadge: "AI Farming Companion for Karnataka & India",
    heroTitle: 'Your Farm. <span class="gradient-text">Your Voice.</span>',
    heroSubtitle: "Ask about crops, pests, soil fertility and government schemes using your voice in your native language. Receive verified, trustworthy agricultural guidance.",
    heroVoiceBtn: "Speak Your Question",
    heroExploreBtn: "Explore Topics",
    trust1Title: "Verified Knowledge",
    trust1Desc: "ICAR & KSDA authentic sources",
    trust2Title: "Gnani Prisma AI",
    trust2Desc: "High accuracy speech recognition",
    trust3Title: "Safe Guidance",
    trust3Desc: "No unsupported chemical dosage",
    cardPreviewTag: "LIVE ASSISTANT",
    previewQuestion: '"What is the best time for sowing Ragi?"',
    previewAnswer: '"In Karnataka Kharif season, July to mid-August is ideal for Ragi sowing. Varieties like GPU-28 and ML-365 provide high yield..."',
    topicsEyebrow: "EXPLORE BY CATEGORY",
    topicsTitle: "Agricultural Topics",
    topicsDesc: "Select an agricultural category to explore verified farming answers.",
    catAll: "All Topics",
    catCrops: "🌾 Crops",
    catPest: "🐛 Pest & Disease",
    catSchemes: "🏛️ Government Schemes",
    catSoil: "🧪 Soil Health",
    catIrrigation: "💧 Irrigation",
    catOrganic: "🌿 Organic Farming",
    catWeather: "⛅ Weather",
    step1Title: "Ask Your Question",
    step1Subtitle: "Speak using microphone or type below",
    micReadyTitle: "Tap Mic to Speak",
    micReadyHint: "Speak your agricultural question clearly",
    micListeningTitle: "Listening to your voice…",
    micListeningHint: "Tap mic again when finished speaking",
    micProcessingTitle: "Transcribing speech…",
    micProcessingHint: "Processing with Gnani Prisma STT",
    typeInputLabel: "Or type your question directly",
    clearBtn: "Clear",
    inputPlaceholder: "E.g., What is the best sowing time for Ragi? Or drip irrigation subsidy...",
    speechReadyText: "Speech recognition is active",
    getAnswerBtn: "Get Answer",
    quickSuggestionsTitle: "Popular Questions:",
    step2Title: "Verified Answer",
    step2Subtitle: "Guidance from ICAR, KVK & State Agri Dept",
    stateWaiting: "WAITING",
    stateSearching: "SEARCHING",
    stateFound: "MATCH FOUND",
    stateNotFound: "NO MATCH",
    emptyHeading: "Ready for your question",
    emptyDesc: "Press the mic and speak in Kannada or English, or pick a sample question above. Reviewed agricultural guidance will appear here.",
    loadingHeading: "Searching reviewed agricultural knowledge…",
    loadingDesc: "Cross-referencing ICAR, University package of practices and Dept of Agriculture data.",
    verifiedBadge: "Verified Agri Guidance",
    hideEnglishBtn: "Hide",
    showEnglishBtn: "Show",
    speakBtn: "Listen Spoken Voice",
    stopSpeakBtn: "Stop",
    sourceLabel: "Official Source & Citation",
    openPortal: "Open Official Portal",
    safetyAlertTitle: "Safety Advisory",
    relatedQueriesTitle: "Related Questions:",
    copyBtn: "Copy Answer",
    copiedBtn: "Copied! ✓",
    historyTitle: "Session Conversation History",
    clearHistoryBtn: "Clear History",
    historyEmpty: "No questions asked yet. Your session questions will appear here.",
    schemesEyebrow: "GOVERNMENT WELFARE SCHEMES",
    schemesTitle: "Key Government Schemes for Farmers",
    schemesDesc: "Essential subsidies and financial security schemes available for farmers in Karnataka.",
    helplineTitle: "Speak Directly with Agriculture Scientists",
    helplineDesc: "Get toll-free agricultural guidance from 6:00 AM to 10:00 PM every day through the official Kisan Call Centre in your native language.",
    footerAssistant: "Farm Assistant",
    footerTopics: "Topics",
    footerSchemes: "Govt Schemes",
    footerDisclaimer: "Disclaimer: KrishiVoice AI provides educational information. For specific chemical recommendations and dosage, always consult your local KVK or agricultural officer."
  },
  hi: {
    tagline: "आपकी खेती। आपकी आवाज। आपका भविष्य।",
    navAssistant: "कृषि सहायक",
    navTopics: "विषय",
    navSchemes: "योजनाएं",
    navHelpline: "हेल्पलाइन",
    heroTitle: 'आपकी खेती। <span class="gradient-text">आपकी आवाज।</span>',
    heroSubtitle: "फसल, कीट प्रबंधन, मिट्टी के स्वास्थ्य और सरकारी योजनाओं के बारे में अपनी भाषा में पूछें।",
    heroVoiceBtn: "बोलकर पूछें",
    step1Title: "अपना प्रश्न पूछें",
    step2Title: "सत्यापित उत्तर",
    getAnswerBtn: "उत्तर प्राप्त करें"
  },
  te: {
    tagline: "మీ వ్యవసాయం. మీ గళం. మీ భవిష్యత్తు.",
    navAssistant: "వ్యవసాయ సహాయకుడు",
    navTopics: "విషయాలు",
    navSchemes: "పథకాలు",
    navHelpline: "హెల్ప్‌లైన్",
    heroTitle: 'మీ వ్యవసాయం. <span class="gradient-text">మీ గళం.</span>',
    heroSubtitle: "పంటలు, పురుగుల నివారణ, నేల ఆరోగ్యం మరియు ప్రభుత్వ పథకాల గురించి మీ స్వంత భాషలో అడగండి.",
    heroVoiceBtn: "మాట్లాడి అడగండి",
    step1Title: "మీ ప్రశ్నను అడగండి",
    step2Title: "ధృవీకరించబడిన సమాధానం",
    getAnswerBtn: "సమాధానం పొందండి"
  },
  ta: {
    tagline: "உங்கள் விவசாயம். உங்கள் குரல். உங்கள் எதிர்காலம்.",
    navAssistant: "விவசாய உதவியாளர்",
    navTopics: "தலைப்புகள்",
    navSchemes: "திட்டங்கள்",
    navHelpline: "உதவி எண்",
    heroTitle: 'உங்கள் விவசாயம். <span class="gradient-text">உங்கள் குரல்.</span>',
    heroSubtitle: "பயிர்கள், பூச்சி மேலாண்மை மற்றும் அரசு திட்டங்கள் குறித்து உங்கள் மொழியில் கேட்டு பயன்பெறுங்கள்.",
    heroVoiceBtn: "பேசி கேளுங்கள்",
    step1Title: "உங்கள் கேள்வியை கேளுங்கள்",
    step2Title: "சரிபார்க்கப்பட்ட பதில்",
    getAnswerBtn: "பதில் பெறுக"
  }
};

// Apply Language strings to DOM
function setLanguage(lang) {
  state.currentLang = lang;
  const dict = I18N[lang] || I18N.kn;
  const fallbackDict = I18N.kn;

  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const text = dict[key] || fallbackDict[key];
    if (text) {
      if (text.includes("<") && text.includes(">")) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    }
  });

  const questionInput = $("questionInput");
  if (questionInput) {
    questionInput.placeholder = dict.inputPlaceholder || fallbackDict.inputPlaceholder;
  }

  // Update language menu labels
  const langLabels = {
    kn: "ಕನ್ನಡ (KN)",
    en: "English (EN)",
    hi: "हिंदी (HI)",
    te: "తెలుగు (TE)",
    ta: "தமிழ் (TA)"
  };
  $("currentLangLabel").textContent = langLabels[lang] || "ಕನ್ನಡ (KN)";

  document.querySelectorAll(".lang-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.lang === lang);
  });
}

// Check Backend Health & Gnani Configuration
async function checkHealth() {
  const statusLabel = $("statusLabel");
  const systemStatusPill = $("systemStatusPill");
  const inputModeBadge = $("inputModeBadge");

  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    state.gnaniConfigured = Boolean(data.speechConfigured);

    if (state.gnaniConfigured) {
      statusLabel.textContent = "Gnani Prisma ಸಕ್ರಿಯ";
      inputModeBadge.innerHTML = '<span class="mode-icon">🎙️</span><span class="mode-text">Gnani Prisma STT</span>';
      systemStatusPill.title = "Gnani Prisma Speech API Connected";
    } else {
      statusLabel.textContent = "Web Speech ಸಕ್ರಿಯ (ಡೆಮೊ)";
      inputModeBadge.innerHTML = '<span class="mode-icon">🎙️</span><span class="mode-text">Web Speech API</span>';
      systemStatusPill.title = "Browser Speech API Active (Set GNANI_API_KEY in .env for Prisma)";
    }
  } catch (err) {
    statusLabel.textContent = "ಸ್ಥಳೀಯ ಮೋಡ್ (Offline)";
    inputModeBadge.innerHTML = '<span class="mode-icon">🎙️</span><span class="mode-text">Speech Offline</span>';
  }
}

// Dual-Mode Voice Transcription
function initVoiceHandlers() {
  const recordBtn = $("recordBtn");
  const micPod = $("micPod");
  const waveVisualizer = $("waveVisualizer");
  const recordStatusTitle = $("recordStatusTitle");
  const recordStatusHint = $("recordStatusHint");
  const questionInput = $("questionInput");

  // Check if browser Web Speech API is supported
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  async function startRecording() {
    state.isRecording = true;
    micPod.classList.add("recording");
    waveVisualizer.classList.add("show");

    const dict = I18N[state.currentLang] || I18N.kn;
    recordStatusTitle.textContent = dict.micListeningTitle || "ಧ್ವನಿ ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ…";
    recordStatusHint.textContent = dict.micListeningHint || "ಮಾತು ಮುಗಿದ ನಂತರ ನಿಲ್ಲಿಸಲು ಮತ್ತೆ ಮೈಕ್ ಒತ್ತಿರಿ";

    // If Gnani API key is configured, record audio with MediaRecorder for server-side Prisma STT
    if (state.gnaniConfigured && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.audioChunks = [];
        const preferredTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav"];
        const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";
        
        state.mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        state.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) state.audioChunks.push(e.data);
        };

        state.mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(state.audioChunks, { type: state.mediaRecorder.mimeType || "audio/webm" });
          await sendAudioToPrisma(audioBlob);
        };

        state.mediaRecorder.start();
        return;
      } catch (err) {
        console.warn("MediaRecorder failed, falling back to Web Speech API:", err);
      }
    }

    // Browser Web Speech API Fallback
    if (SpeechRecognition) {
      try {
        if (!state.speechRecognition) {
          state.speechRecognition = new SpeechRecognition();
          state.speechRecognition.continuous = false;
          state.speechRecognition.interimResults = true;
        }

        const langCodes = { kn: "kn-IN", en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN" };
        state.speechRecognition.lang = langCodes[state.currentLang] || "kn-IN";

        state.speechRecognition.onresult = (event) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          questionInput.value = final || interim;
        };

        state.speechRecognition.onerror = (event) => {
          console.warn("Web Speech Error:", event.error);
          stopRecording();
        };

        state.speechRecognition.onend = () => {
          stopRecording();
          if (questionInput.value.trim()) {
            submitQuestion();
          }
        };

        state.speechRecognition.start();
        return;
      } catch (err) {
        console.error("SpeechRecognition error:", err);
      }
    }

    recordStatusHint.textContent = "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ಲಭ್ಯವಿಲ್ಲ ಅಥವಾ HTTPS ಅಗತ್ಯವಿದೆ.";
    stopRecording();
  }

  function stopRecording() {
    state.isRecording = false;
    micPod.classList.remove("recording");
    waveVisualizer.classList.remove("show");

    const dict = I18N[state.currentLang] || I18N.kn;
    recordStatusTitle.textContent = dict.micReadyTitle || "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ";
    recordStatusHint.textContent = dict.micReadyHint || "ಕನ್ನಡದಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿ";

    if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
      state.mediaRecorder.stop();
    }
    if (state.speechRecognition) {
      try { state.speechRecognition.stop(); } catch (_) {}
    }
  }

  async function sendAudioToPrisma(audioBlob) {
    const dict = I18N[state.currentLang] || I18N.kn;
    recordStatusTitle.textContent = dict.micProcessingTitle || "ಧ್ವನಿ ಪಠ್ಯವಾಗುತ್ತಿದೆ…";
    recordStatusHint.textContent = dict.micProcessingHint || "Gnani Prisma STT ಮೂಲಕ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ";

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    const langCodes = { kn: "kn-IN", en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN" };
    formData.append("languageCode", langCodes[state.currentLang] || "kn-IN");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.transcript) {
        questionInput.value = data.transcript;
        recordStatusHint.textContent = "ಧ್ವನಿ ಪಠ್ಯವಾಗಿದೆ ✓";
        submitQuestion();
      } else {
        recordStatusHint.textContent = data.message || "ಧ್ವನಿಯಿಂದ ಪಠ್ಯ ಸಿಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
      }
    } catch (err) {
      recordStatusHint.textContent = "ಧ್ವನಿ ಪ್ರಕ್ರಿಯೆ ವಿಫಲವಾಯಿತು: " + err.message;
    } finally {
      setTimeout(() => {
        recordStatusTitle.textContent = dict.micReadyTitle;
        recordStatusHint.textContent = dict.micReadyHint;
      }, 3000);
    }
  }

  recordBtn.addEventListener("click", () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  });

  // Hero Quick Voice Button
  const startVoiceHeroBtn = $("startVoiceHeroBtn");
  if (startVoiceHeroBtn) {
    startVoiceHeroBtn.addEventListener("click", (e) => {
      e.preventDefault();
      $("assistant").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        if (!state.isRecording) startRecording();
      }, 600);
    });
  }
}

// Ask Assistant & Fetch Verified Answer
async function submitQuestion() {
  const questionInput = $("questionInput");
  const rawText = questionInput.value.trim();

  if (!rawText) {
    questionInput.focus();
    questionInput.placeholder = "ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ…";
    return;
  }

  const askSubmitBtn = $("askSubmitBtn");
  const emptyAnswerState = $("emptyAnswerState");
  const loadingAnswerState = $("loadingAnswerState");
  const answerPayload = $("answerPayload");
  const answerStateText = $("answerStateText");
  const answerCard = $("answerCard");

  // UI Loading State
  askSubmitBtn.disabled = true;
  emptyAnswerState.hidden = true;
  loadingAnswerState.hidden = false;
  answerPayload.hidden = true;
  answerStateText.textContent = "SEARCHING";

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ question: rawText })
    });

    const data = await res.json();
    state.currentAnswer = data;

    // Render Answer
    renderAnswer(data);

    // Add to session history
    addToHistory(rawText, data);

    answerStateText.textContent = data.found ? "MATCH FOUND" : "NO MATCH";
  } catch (err) {
    console.error("Ask query error:", err);
    loadingAnswerState.hidden = true;
    emptyAnswerState.hidden = false;
    $("emptyHeading").textContent = "ದೋಷ ಉಂಟಾಗಿದೆ";
    $("emptyDesc").textContent = "ಸರ್ವರ್ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ: " + err.message;
    answerStateText.textContent = "ERROR";
  } finally {
    askSubmitBtn.disabled = false;
    loadingAnswerState.hidden = true;
  }
}

function renderAnswer(data) {
  const answerPayload = $("answerPayload");
  const emptyAnswerState = $("emptyAnswerState");
  emptyAnswerState.hidden = true;
  answerPayload.hidden = false;

  // Metadata
  $("answerCategoryTag").textContent = data.category ? `🌾 ${data.category}` : "🌾 ಸಾಮಾನ್ಯ ಕೃಷಿ";
  $("answerTitle").textContent = (state.currentLang === "en" && data.titleEn) ? data.titleEn : (data.titleKn || "ಕೃಷಿ ಮಾಹಿತಿ");

  // Primary text
  const primaryText = $("answerTextPrimary");
  primaryText.textContent = (state.currentLang === "en" && data.answerEn) ? data.answerEn : data.answer;

  // English translation reference
  const translationBox = $("answerTranslationBox");
  const secondaryText = $("answerTextSecondary");
  if (data.answerEn && state.currentLang !== "en") {
    translationBox.hidden = false;
    secondaryText.textContent = data.answerEn;
  } else {
    translationBox.hidden = true;
  }

  // Source Citation
  $("sourceOrgName").textContent = data.source || "ICAR & Karnataka State Agri Dept";
  $("citationDate").textContent = data.lastVerified || "2026-03";
  const sourceLink = $("sourceExternalLink");
  if (data.sourceUrl) {
    sourceLink.href = data.sourceUrl;
    sourceLink.style.display = "inline-flex";
  } else {
    sourceLink.style.display = "none";
  }

  // Safety Advisory
  $("safetyAlertText").textContent = data.safety || "ಯಾವುದೇ ರಾಸಾಯನಿಕ ಶಿಫಾರಸಿಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಯ ಸಲಹೆ ಕಡ್ಡಾಯ.";

  // Related Queries Chips
  const relatedChips = $("relatedChips");
  relatedChips.innerHTML = "";
  if (data.suggestions && data.suggestions.length > 0) {
    data.suggestions.forEach((s) => {
      const chip = document.createElement("button");
      chip.className = "related-chip";
      chip.textContent = state.currentLang === "en" ? s.titleEn : s.titleKn;
      chip.addEventListener("click", () => {
        $("questionInput").value = state.currentLang === "en" ? s.suggestedQueryEn : s.suggestedQueryKn;
        submitQuestion();
      });
      relatedChips.appendChild(chip);
    });
    $("relatedQueriesBox").hidden = false;
  } else {
    $("relatedQueriesBox").hidden = true;
  }

  // Auto-scroll on mobile
  if (window.innerWidth < 960) {
    answerPayload.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Spoken Audio Synthesis (Gnani Timbre + Web Speech Fallback)
function initTtsControls() {
  const playAudioBtn = $("playAudioBtn");
  const stopAudioBtn = $("stopAudioBtn");
  const voiceEngineLabel = $("voiceEngineLabel");

  async function speakAnswer() {
    if (!state.currentAnswer) return;
    const textToSpeak = (state.currentLang === "en" && state.currentAnswer.answerEn)
      ? state.currentAnswer.answerEn
      : (state.currentAnswer.answer || state.currentAnswer.answerKn);

    if (!textToSpeak) return;

    // Toggle Buttons
    playAudioBtn.hidden = true;
    stopAudioBtn.hidden = false;

    // 1. Try Gnani Timbre Backend if configured
    if (state.gnaniConfigured) {
      voiceEngineLabel.textContent = "Gnani Timbre Voice";
      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textToSpeak,
            language: state.currentLang === "en" ? "en" : "kn",
            voice: "Nalini"
          })
        });

        if (response.ok && response.headers.get("content-type")?.includes("audio")) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          state.currentAudioPlayer = new Audio(audioUrl);
          state.currentAudioPlayer.onended = stopSpeaking;
          state.currentAudioPlayer.onerror = () => speakBrowserFallback(textToSpeak);
          state.currentAudioPlayer.play();
          return;
        }
      } catch (err) {
        console.warn("Gnani Timbre synthesis error, falling back to browser speech:", err);
      }
    }

    // 2. Browser SpeechSynthesis Fallback
    speakBrowserFallback(textToSpeak);
  }

  function speakBrowserFallback(text) {
    if (!("speechSynthesis" in window)) {
      alert("ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಸೌಲಭ್ಯ ಲಭ್ಯವಿಲ್ಲ.");
      stopSpeaking();
      return;
    }

    voiceEngineLabel.textContent = "Browser Voice Synthesis";
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCodes = { kn: "kn-IN", en: "en-IN", hi: "hi-IN", te: "te-IN", ta: "ta-IN" };
    utterance.lang = langCodes[state.currentLang] || "kn-IN";
    utterance.rate = 0.95; // Slightly slower for clear rural comprehension

    utterance.onend = stopSpeaking;
    utterance.onerror = stopSpeaking;

    state.activeSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (state.currentAudioPlayer) {
      state.currentAudioPlayer.pause();
      state.currentAudioPlayer = null;
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    playAudioBtn.hidden = false;
    stopAudioBtn.hidden = true;
  }

  playAudioBtn.addEventListener("click", speakAnswer);
  stopAudioBtn.addEventListener("click", stopSpeaking);
}

// Conversation Session History
function addToHistory(query, answerData) {
  const item = {
    id: Date.now(),
    query,
    title: answerData.titleKn || answerData.titleEn || query,
    category: answerData.category || "General",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    data: answerData
  };

  state.history.unshift(item);
  if (state.history.length > 10) state.history.pop();

  try {
    sessionStorage.setItem("krishivoice_session_history", JSON.stringify(state.history));
  } catch (_) {}

  renderHistory();
}

function renderHistory() {
  const historyList = $("historyList");
  if (!historyList) return;

  if (state.history.length === 0) {
    historyList.innerHTML = `<div class="history-empty" data-i18n="historyEmpty">${I18N[state.currentLang]?.historyEmpty || "ಯಾವುದೇ ಹಿಂದಿನ ಪ್ರಶ್ನೆಗಳಿಲ್ಲ."}</div>`;
    return;
  }

  historyList.innerHTML = "";
  state.history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `
      <span class="history-query">${item.query}</span>
      <div class="history-meta">
        <span class="history-tag">🌾 ${item.category}</span>
        <span class="history-time">${item.timestamp}</span>
      </div>
    `;
    row.addEventListener("click", () => {
      $("questionInput").value = item.query;
      renderAnswer(item.data);
    });
    historyList.appendChild(row);
  });
}

// UI Utilities & Event Listeners
function initUI() {
  // Submit Question Button
  $("askSubmitBtn").addEventListener("click", submitQuestion);

  // Clear Input Button
  $("clearInputBtn").addEventListener("click", () => {
    $("questionInput").value = "";
    $("questionInput").focus();
  });

  // Enter Key to Submit (Shift+Enter for newline)
  $("questionInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitQuestion();
    }
  });

  // Language Dropdown Toggle
  const langBtn = $("langBtn");
  const langMenu = $("langMenu");
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    langMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    langMenu.classList.remove("show");
  });

  document.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      setLanguage(opt.dataset.lang);
      langMenu.classList.remove("show");
    });
  });

  // Quick Suggestion Chips
  document.querySelectorAll(".chip-item, [data-query]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const q = chip.dataset.query;
      if (q) {
        $("questionInput").value = q;
        submitQuestion();
      }
    });
  });

  // Category Pills Filter
  document.querySelectorAll(".pill-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".pill-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      if (cat !== "ALL") {
        $("questionInput").value = `${btn.textContent.trim()} ಮಾಹಿತಿ`;
        submitQuestion();
      }
    });
  });

  // Toggle English Box
  $("toggleEnBtn").addEventListener("click", () => {
    const textSec = $("answerTextSecondary");
    const isHidden = textSec.style.display === "none";
    textSec.style.display = isHidden ? "block" : "none";
    $("toggleEnBtn").textContent = isHidden ? (I18N[state.currentLang]?.hideEnglishBtn || "ಮರೆಮಾಡಿ") : (I18N[state.currentLang]?.showEnglishBtn || "ತೋರಿಸಿ");
  });

  // Copy Answer
  $("copyAnswerBtn").addEventListener("click", () => {
    const primary = $("answerTextPrimary").textContent;
    if (!primary) return;
    navigator.clipboard.writeText(primary).then(() => {
      const copyBtnText = $("copyBtnText");
      const prev = copyBtnText.textContent;
      copyBtnText.textContent = I18N[state.currentLang]?.copiedBtn || "ನಕಲಿಸಲಾಗಿದೆ! ✓";
      setTimeout(() => {
        copyBtnText.textContent = prev;
      }, 2000);
    });
  });

  // Clear History
  $("clearHistoryBtn").addEventListener("click", () => {
    state.history = [];
    try { sessionStorage.removeItem("krishivoice_session_history"); } catch (_) {}
    renderHistory();
  });

  // Load past session history if present
  try {
    const saved = sessionStorage.getItem("krishivoice_session_history");
    if (saved) {
      state.history = JSON.parse(saved);
      renderHistory();
    }
  } catch (_) {}
}

// Initial Boot
document.addEventListener("DOMContentLoaded", () => {
  setLanguage("kn");
  checkHealth();
  initVoiceHandlers();
  initTtsControls();
  initUI();
});
