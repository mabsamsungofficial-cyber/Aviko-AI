import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  Sparkles,
  Eye,
  EyeOff,
  X,
  RefreshCw,
  Trash2,
  FileText,
  Sliders,
  Lightbulb,
  ArrowRight,
  Copy,
  Check,
  BookOpen,
  Globe,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Video,
  Smartphone,
  Monitor,
  ExternalLink,
} from 'lucide-react';

const PREBUILT_VOICES = [
  { id: 'Kore', label: 'Kore · Firm' },
  { id: 'Puck', label: 'Puck · Upbeat' },
  { id: 'Aoede', label: 'Aoede · Breezy' },
  { id: 'Charon', label: 'Charon · Informative' },
  { id: 'Fenrir', label: 'Fenrir · Excitable' },
  { id: 'Zephyr', label: 'Zephyr · Bright' },
  { id: 'Sulafat', label: 'Sulafat · Warm' },
  { id: 'Leda', label: 'Leda · Youthful' },
  { id: 'Orus', label: 'Orus · Firm' },
  { id: 'Achird', label: 'Achird · Friendly' },
  { id: 'Achernar', label: 'Achernar · Soft' },
  { id: 'Algenib', label: 'Algenib · Gravelly' },
  { id: 'Algieba', label: 'Algieba · Smooth' },
  { id: 'Alnilam', label: 'Alnilam · Firm' },
  { id: 'Autonoe', label: 'Autonoe · Bright' },
  { id: 'Callirrhoe', label: 'Callirrhoe · Easy-going' },
  { id: 'Despina', label: 'Despina · Smooth' },
  { id: 'Enceladus', label: 'Enceladus · Breathy' },
  { id: 'Erinome', label: 'Erinome · Clear' },
  { id: 'Gacrux', label: 'Gacrux · Mature' },
  { id: 'Iapetus', label: 'Iapetus · Clear' },
  { id: 'Laomedeia', label: 'Laomedeia · Upbeat' },
  { id: 'Pulcherrima', label: 'Pulcherrima · Forward' },
  { id: 'Rasalgethi', label: 'Rasalgethi · Informative' },
  { id: 'Sadachbia', label: 'Sadachbia · Lively' },
  { id: 'Sadaltager', label: 'Sadaltager · Knowledgeable' },
  { id: 'Schedar', label: 'Schedar · Even' },
  { id: 'Umbriel', label: 'Umbriel · Easy-going' },
  { id: 'Vindemiatrix', label: 'Vindemiatrix · Gentle' },
  { id: 'Zubenelgenubi', label: 'Zubenelgenubi · Casual' },
];

const TTS_MODELS = [
  { id: 'gemini-3.8-flash-tts', label: 'gemini-3.8-flash-tts' },
  { id: 'gemini-3.8-flash-lite-tts', label: 'gemini-3.8-flash-lite-tts' },
];

const TEXT_MODELS = [
  { id: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Fast & Reliable)' },
  { id: 'gemini-flash-lite-latest', label: 'gemini-flash-lite-latest' },
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash' },
];

const STYLE_PRESETS = [
  { label: 'Hook', value: 'curious, energetic, and fast-paced' },
  { label: 'Explainer', value: 'calm, clear, and informative' },
  { label: 'Story', value: 'warm, expressive, and engaging' },
  { label: 'Whisper', value: 'whispered urgently, low volume' },
  { label: 'Serious', value: 'serious, firm, and impactful' },
];

const FORMAT_OPTIONS = [
  { id: '9:16', label: '9:16 Shorts / Reels', resolution: '1080×1920', targetDuration: '45–60 sec (115–145 words at 140 WPM)' },
  { id: '16:9', label: '16:9 YouTube', resolution: '1920×1080', targetDuration: '95–120 sec (220–280 words at 140 WPM)' },
];

const LANGUAGE_OPTIONS = [
  {
    id: 'hinglish',
    label: 'Hinglish',
    nativeLabel: 'हिंग्लिश (Indian Tone)',
    description: 'Hindi in Roman letters with natural Indian accent',
    instruction:
      'Spoken in natural conversational Hinglish with an authentic, friendly Indian accent. Crucially, pronounce all Hindi words with fluent, natural Indian pronunciation and do NOT adopt an American, British, or foreign accent, even if the sentence starts with English words. Blend English and Hindi smoothly.',
  },
  {
    id: 'hindi',
    label: 'Hindi',
    nativeLabel: 'शुद्ध हिन्दी Accent',
    description: 'Authentic Indian Hindi pronunciation',
    instruction:
      'Spoken in fluent native Hindi with an authentic Indian accent and clear, natural Hindi pronunciation.',
  },
  {
    id: 'english_in',
    label: 'English (IN)',
    nativeLabel: 'Indian English Accent',
    description: 'Modern natural Indian English accent',
    instruction:
      'Spoken in clear, fluent English with a natural modern Indian accent and professional cadence.',
  },
  {
    id: 'english_us',
    label: 'English (US)',
    nativeLabel: 'American Accent',
    description: 'Standard modern American English',
    instruction:
      'Spoken in clear, natural American English accent with crisp pronunciation.',
  },
  {
    id: 'english_uk',
    label: 'English (UK)',
    nativeLabel: 'British Accent',
    description: 'Crisp British English accent',
    instruction:
      'Spoken in crisp, refined British English accent with natural pacing.',
  },
  {
    id: 'urdu',
    label: 'Urdu',
    nativeLabel: 'اردو / Desi Tone',
    description: 'Subcontinent Urdu / Hindustani tone',
    instruction:
      'Spoken in natural, expressive Urdu / Hindustani with authentic subcontinent pronunciation, warm tone, and natural cadence.',
  },
];

const VOCAL_TAGS = ['<short pause>', '<sigh>', '<laugh>', '<gasp>', '<cough>'];

const MASTER_CONFIG = {
  apiKey: atob('QVEuQWI4Uk42SXBicHFSRGlwa0VQMFBPRzRQdldKaHhGdU13blZGQ0RFeDBISGRrVTluQXc='),
  projectId: '235557718080',
  provider: 'aistudio',
  pin: '3663',
};

const STORAGE_KEY = 'script_voice_studio_v2';

function buildIdeasPrompt(topicInput, format) {
  const formatLabel = format === '9:16' ? '9:16 vertical Shorts/Reels' : '16:9 horizontal YouTube explainer';
  const topicInstruction = topicInput.trim()
    ? `The user wants ideas related to this topic or niche: "${topicInput.trim()}". Use Google Search to find what is currently trending, timely, or highly relevant around this topic in business, startups, small business operations, or company processes.`
    : `No specific topic was entered. Use Google Search to find what is currently trending right now in Indian & global business, startups, D2C brands, small business growth, or company operational case studies that a creator can hop on today.`;

  return `Act as a sharp business researcher, startup analyst, and high-retention explainer video strategist.

${topicInstruction}

Generate 4 unique, high-retention video topic ideas tailored for ${formatLabel} explainers. Avoid generic clickbait or clichés like "start a YouTube channel" or "dropshipping". Every idea must be grounded in a real business mechanism, trend, or verifiable case study.

Return the output strictly as a valid JSON array (no markdown fences, no extra commentary) with 4 objects, each having these exact keys:
- "id": (number 1 to 4)
- "title": (Catchy 5-8 word title)
- "trend_angle": (1 crisp sentence explaining why this topic is trending or timely right now)
- "target_audience": (Who benefits from watching this: founders, small shop owners, professionals, etc.)
- "core_process": (The specific business model, process, or mechanism being explained)
- "fact_hook": (One concrete real-world stat, metric, or verified case-study hook found via search)`;
}

function buildResearchAndScriptPrompt(topicOrIdea, format, langId) {
  const fmt = FORMAT_OPTIONS.find((f) => f.id === format) || FORMAT_OPTIONS[0];
  const langObj = LANGUAGE_OPTIONS.find((l) => l.id === langId) || LANGUAGE_OPTIONS[0];

  const langGuide =
    langId === 'hinglish'
      ? 'Natural conversational Hinglish (Hindi written in Roman/English script, blending everyday English business terms like revenue, margin, supply chain, dark store, cashflow). Write numbers clearly for speech (e.g., "10 minute", "40 percent", "500 crore").'
      : langId === 'hindi'
      ? 'Natural conversational Hindi in Devanagari script with clear everyday business terms.'
      : `Clear, engaging, natural ${langObj.label} suitable for spoken narration.`;

  const topicDetails =
    typeof topicOrIdea === 'string'
      ? `Topic: ${topicOrIdea}`
      : `Title: ${topicOrIdea.title}
Trend Angle: ${topicOrIdea.trend_angle || ''}
Target Audience: ${topicOrIdea.target_audience || topicOrIdea.target_customer || ''}
Core Process / Mechanism: ${topicOrIdea.core_process || topicOrIdea.core_problem || ''}
Initial Fact Hook: ${topicOrIdea.fact_hook || topicOrIdea.monetization || ''}`;

  return `Act as an investigative business researcher and viral 2D explainer scriptwriter.

SELECTED TOPIC:
${topicDetails}

TARGET FORMAT: ${fmt.id} (${fmt.label}, ${fmt.resolution})
STRICT WORD BUDGET (140 WPM): ${fmt.targetDuration}
NARRATION LANGUAGE: ${langGuide}

STEP 1 — MANDATORY ONLINE FACT-CHECK:
Use Google Search to verify real-world facts, numbers, dates, company processes, unit economics, or case-study details. NEVER invent fake statistics or generic AI fluff.

STEP 2 — 9-STEP HIGH-RETENTION STORYTELLING ARC (FLOWING CONTINUOUSLY):
Weave these naturally into ONE uninterrupted narration (no headings inside the voiceover):
1. Punchy 3–5 sec Hook (shocking stat, contradiction, or mystery—NEVER start with "Hello doston", "Namaste", or "Aaj hum baat karenge").
2. Relatable business problem or market context.
3. Founder / customer / company introduced naturally.
4. Step-by-step operational process or mechanism.
5. Curiosity gap (e.g., "Lekin asli game yahan shuru hota hai...") to hold retention.
6. Hidden unit-economics twist or insight.
7. Scale / real-world impact.
8. Crisp practical takeaway.
9. Thought-provoking question + short natural CTA.

STEP 3 — RETURN STRICT JSON OBJECT (no markdown fences, no extra commentary):
{
  "verified_facts": ["Fact 1 with real figure/detail", "Fact 2...", "Fact 3..."],
  "youtube_titles": ["Clickable truthful title 1", "Title 2", "Title 3"],
  "thumbnail_text": "2–4 word high-contrast hook",
  "voiceover_narration": "Pure spoken narration ONLY hitting the exact word budget. Zero brackets, zero [Scene]/[Visual] tags, zero speaker labels.",
  "gemini_video_script": "Start with FORMAT: ${fmt.id} (${fmt.resolution}) and TOPIC. Then [SCENE 1], [SCENE 2]... with [VISUAL / DIAGRAM], [ON-SCREEN TEXT], and [NARRATION] matching voiceover_narration word-for-word."
}`;
}

function extractJsonArray(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not parse ideas JSON from response.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function extractJsonObject(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not parse script JSON from response.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function cleanScriptForVoiceover(rawScript) {
  return rawScript
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^\[?(Visual|On-Screen Text|Audio|Voiceover|CTA|Hook|Scene|FORMAT|TOPIC|VERIFIED FACTS)\s*[:\]]/i.test(line)) {
        if (/^(\[?NARRATION\]?|Voiceover)\s*:/i.test(line)) return true;
        return false;
      }
      return true;
    })
    .map((line) =>
      line
        .replace(/^(\[?NARRATION\]?|Voiceover)\s*:\s*/i, '')
        .replace(/\[[^\]]+\]/g, '')
        .trim()
    )
    .filter(Boolean)
    .join('\n');
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function ensureWavBlob(bytes, mimeType = '') {
  const isRiff =
    bytes.length >= 4 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46;

  if (isRiff || mimeType.includes('wav')) {
    return new Blob([bytes], { type: 'audio/wav' });
  }

  const sampleRate = 24000;
  const totalPcmLength = bytes.length;
  const buffer = new ArrayBuffer(44 + totalPcmLength);
  const view = new DataView(buffer);
  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + totalPcmLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, totalPcmLength, true);

  new Uint8Array(buffer).set(bytes, 44);
  return new Blob([buffer], { type: 'audio/wav' });
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const [settings, setSettings] = useState({
    apiKey: MASTER_CONFIG.apiKey,
    model: 'gemini-3.8-flash-tts',
    textModel: 'gemini-3.5-flash-lite',
    voice: 'Kore',
    language: 'hinglish',
    provider: MASTER_CONFIG.provider,
  });
  const [draftSettings, setDraftSettings] = useState(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [verifyState, setVerifyState] = useState({
    status: 'verified',
    message: 'Master Key active (Project 235557718080)',
  });

  // Top-level navigation: 'story' (Step 1) | 'voiceover' (Step 2)
  const [activeSection, setActiveSection] = useState('story');
  // Sub-tab inside Voiceover: 'script' | 'style'
  const [activeTab, setActiveTab] = useState('script');

  // Story & Research State
  const [topicInput, setTopicInput] = useState('');
  const [videoFormat, setVideoFormat] = useState('9:16');
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  // Dual Script & Research Outputs
  const [verifiedFacts, setVerifiedFacts] = useState([]);
  const [searchSources, setSearchSources] = useState([]);
  const [searchGrounded, setSearchGrounded] = useState(false);
  const [geminiVideoScript, setGeminiVideoScript] = useState('');
  const [voiceoverNarration, setVoiceoverNarration] = useState('');
  const [youtubeTitles, setYoutubeTitles] = useState([]);
  const [thumbnailText, setThumbnailText] = useState('');
  const [copiedVideoScript, setCopiedVideoScript] = useState(false);
  const [copiedNarration, setCopiedNarration] = useState(false);

  // Voiceover State
  const [script, setScript] = useState(
    'रुकिए! <short pause> क्या आप जानते हैं कि ninety percent लोग ये एक गलती रोज़ करते हैं?'
  );
  const [style, setStyle] = useState('curious, energetic, and fast-paced');
  const [language, setLanguage] = useState('hinglish');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isOldKey = parsed.apiKey && parsed.apiKey.includes('47474876096');
        const resolvedKey =
          !parsed.apiKey || isOldKey
            ? MASTER_CONFIG.apiKey
            : parsed.apiKey.trim();
        const resolvedProvider = resolvedKey.startsWith('AQ.')
          ? 'vertex_express'
          : parsed.provider || 'vertex_express';

        const updated = {
          ...parsed,
          apiKey: resolvedKey,
          provider: resolvedProvider,
        };

        setSettings((prev) => ({ ...prev, ...updated }));
        setDraftSettings((prev) => ({ ...prev, ...updated }));
        if (parsed.language) {
          setLanguage(parsed.language);
        }
        setVerifyState({
          status: 'verified',
          message: 'Master Key active (Project 235557718080)',
        });
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const openSettings = () => {
    if (isPinUnlocked) {
      setDraftSettings(settings);
      setIsSettingsOpen(true);
      return;
    }
    setPinInput('');
    setPinError('');
    setIsPinModalOpen(true);
  };

  const handleVerifyPin = (e) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === MASTER_CONFIG.pin) {
      setIsPinUnlocked(true);
      setIsPinModalOpen(false);
      setPinError('');
      setDraftSettings(settings);
      setIsSettingsOpen(true);
      showToast('Settings Unlocked');
    } else {
      setPinError('Incorrect PIN. Access Denied.');
    }
  };

  const handleVerifyApi = async () => {
    const key = (draftSettings.apiKey || MASTER_CONFIG.apiKey).trim();
    if (!key) {
      setVerifyState({ status: 'error', message: 'Enter your API key.' });
      return;
    }

    setVerifyState({ status: 'checking', message: 'Verifying API key...' });

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        {
          method: 'GET',
          headers: { 'x-goog-api-key': key },
        }
      );
      if (res.ok) {
        setDraftSettings((prev) => ({ ...prev, provider: 'aistudio' }));
        setVerifyState({ status: 'verified', message: 'API Key Verified (Gemini API · Active)' });
        return;
      }
      const errJson = await res.json().catch(() => ({}));
      setVerifyState({
        status: 'error',
        message: errJson?.error?.message || `HTTP ${res.status}`,
      });
    } catch (e) {
      setVerifyState({
        status: 'error',
        message: e?.message || 'Network verification failed',
      });
    }
  };

  const handleSaveSettings = () => {
    const rawKey = draftSettings.apiKey.trim();
    const keyToSave = rawKey || MASTER_CONFIG.apiKey;

    const cleaned = {
      ...draftSettings,
      apiKey: keyToSave,
      provider: 'aistudio',
    };
    setSettings(cleaned);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    } catch {
      // Ignore storage errors
    }
    setIsSettingsOpen(false);
    showToast('Settings saved');
  };

  const callTextModelWithSearch = async (promptText, enableSearch = true) => {
    const key = (settings.apiKey || MASTER_CONFIG.apiKey).trim();
    const modelName = settings.textModel || 'gemini-3.5-flash-lite';

    const runRequest = async (useSearchTool) => {
      const payload = {
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        ...(useSearchTool ? { tools: [{ google_search: {} }] } : {}),
      };

      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
          key
        )}`,
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelName}:generateContent?key=${encodeURIComponent(
          key
        )}`,
      ];

      let primaryError = '';
      let lastError = 'Request failed';
      for (let i = 0; i < endpoints.length; i++) {
        const url = endpoints[i];
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          const candidate = data?.candidates?.[0];
          const parts = candidate?.content?.parts || [];
          const text = parts
            .map((p) => p.text || '')
            .join('')
            .trim();
          if (!text) throw new Error('Empty response from model.');

          const chunks = candidate?.groundingMetadata?.groundingChunks || [];
          const sources = chunks
            .map((c) => c?.web)
            .filter((w) => w?.uri)
            .map((w) => ({ title: w.title || w.uri, uri: w.uri }));

          return { text, sources, grounded: useSearchTool };
        } else {
          const errJson = await res.json().catch(() => ({}));
          const msg = errJson?.error?.message || `HTTP ${res.status}`;
          if (i === 0) primaryError = msg;
          lastError = msg;
        }
      }
      throw new Error(primaryError || lastError);
    };

    if (enableSearch) {
      try {
        return await runRequest(true);
      } catch {
        // Fallback without google_search if endpoint/model doesn't support search grounding
        return await runRequest(false);
      }
    }
    return await runRequest(false);
  };

  const handleGenerateIdeas = async () => {
    setErrorMsg('');
    if (!settings.apiKey.trim()) {
      openSettings();
      setVerifyState({ status: 'error', message: 'Enter your API key first.' });
      return;
    }

    setIsLoadingIdeas(true);
    try {
      const { text, sources, grounded } = await callTextModelWithSearch(
        buildIdeasPrompt(topicInput, videoFormat),
        true
      );
      const parsed = extractJsonArray(text);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('No ideas found in response.');
      }
      setIdeas(parsed.slice(0, 5));
      setSelectedIdeaId(parsed[0]?.id ?? null);
      setSearchSources(sources);
      setSearchGrounded(grounded);
      showToast(`${Math.min(parsed.length, 5)} Trending Ideas ready`);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate ideas.');
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const runFactCheckedScript = async (topicOrIdea) => {
    setErrorMsg('');
    if (!settings.apiKey.trim()) {
      openSettings();
      setVerifyState({ status: 'error', message: 'Enter your API key first.' });
      return;
    }

    setIsLoadingStory(true);
    try {
      const { text, sources, grounded } = await callTextModelWithSearch(
        buildResearchAndScriptPrompt(topicOrIdea, videoFormat, language),
        true
      );

      let parsedObj = null;
      try {
        parsedObj = extractJsonObject(text);
      } catch {
        // Graceful fallback if model returned plain text
        parsedObj = {
          verified_facts: [],
          gemini_video_script: text,
          voiceover_narration: cleanScriptForVoiceover(text),
        };
      }

      const vScript = (parsedObj.gemini_video_script || '').trim();
      const vNarration = (
        parsedObj.voiceover_narration || cleanScriptForVoiceover(vScript)
      ).trim();

      setVerifiedFacts(Array.isArray(parsedObj.verified_facts) ? parsedObj.verified_facts : []);
      setSearchSources(sources);
      setSearchGrounded(grounded);
      setGeminiVideoScript(vScript);
      setVoiceoverNarration(vNarration);
      setYoutubeTitles(Array.isArray(parsedObj.youtube_titles) ? parsedObj.youtube_titles : []);
      setThumbnailText((parsedObj.thumbnail_text || '').trim());
      showToast('Fact-checked scripts ready');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to research & generate script.');
    } finally {
      setIsLoadingStory(false);
    }
  };

  const handleGenerateStoryScript = async () => {
    const selected = ideas.find((item) => item.id === selectedIdeaId);
    if (!selected) {
      setErrorMsg('Select an idea first or type a topic above.');
      return;
    }
    await runFactCheckedScript(selected);
  };

  const handleDirectTopicScript = async () => {
    if (!topicInput.trim()) {
      setErrorMsg('Enter a topic first, or click "Generate Ideas".');
      return;
    }
    await runFactCheckedScript(topicInput.trim());
  };

  const copyText = (value, onCopied) => {
    if (!value) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => {});
    } else {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    onCopied(true);
    setTimeout(() => onCopied(false), 1800);
  };

  const sendToVoiceover = () => {
    const cleanText = voiceoverNarration.trim() || cleanScriptForVoiceover(geminiVideoScript);
    if (!cleanText) return;
    setScript(cleanText);
    setActiveSection('voiceover');
    setActiveTab('script');
    showToast('Narration loaded into Voiceover');
  };

  const insertTag = (tag) => {
    const el = textareaRef.current;
    if (!el) {
      setScript((prev) => `${prev} ${tag}`.trim());
      return;
    }
    const start = el.selectionStart ?? script.length;
    const end = el.selectionEnd ?? script.length;
    const before = script.slice(0, start);
    const after = script.slice(end);
    const spacerBefore = before && !before.endsWith(' ') ? ' ' : '';
    const spacerAfter = after && !after.startsWith(' ') ? ' ' : '';
    const updated = `${before}${spacerBefore}${tag}${spacerAfter}${after}`;
    setScript(updated);
    setTimeout(() => {
      el.focus();
      const pos = (before + spacerBefore + tag + spacerAfter).length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleGenerate = async () => {
    setErrorMsg('');
    const key = (settings.apiKey || MASTER_CONFIG.apiKey).trim();
    if (!key) {
      openSettings();
      setVerifyState({ status: 'error', message: 'Enter your API key first.' });
      return;
    }

    if (!script.trim()) {
      setActiveTab('script');
      setErrorMsg('Script box is empty.');
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();

    const activeLang =
      LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];
    const userStyle = style.trim() || 'natural and clear';
    const computedSpeechStyle = activeLang?.instruction
      ? `${activeLang.instruction} Delivery style: ${userStyle}.`
      : userStyle;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: script.trim(),
              speechMetadata: { style: computedSpeechStyle },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { voice: settings.voice },
        },
      },
    };

    const endpoints = [
      `https://generativelanguage.googleapis.com/v1beta/models/${
        settings.model
      }:generateContent?key=${encodeURIComponent(key)}`,
      `https://aiplatform.googleapis.com/v1/publishers/google/models/${
        settings.model
      }:generateContent?key=${encodeURIComponent(key)}`,
    ];

    try {
      let successData = null;
      let primaryError = '';
      let lastError = 'Request failed';

      for (let i = 0; i < endpoints.length; i++) {
        const url = endpoints[i];
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successData = await res.json();
          break;
        } else {
          const errJson = await res.json().catch(() => ({}));
          const msg = errJson?.error?.message || `HTTP ${res.status}`;
          if (i === 0) primaryError = msg;
          lastError = msg;
        }
      }

      if (!successData) {
        throw new Error(primaryError || lastError);
      }

      const inlineData = successData?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!inlineData?.data) {
        throw new Error('No audio returned in response.');
      }

      const bytes = base64ToUint8Array(inlineData.data);
      const wavBlob = ensureWavBlob(bytes, inlineData.mimeType || '');
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));
      setCurrentTime(0);
      showToast('Voiceover ready');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate audio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const val = Number(e.target.value);
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleDownload = async () => {
    if (!audioBlob && !audioUrl) return;
    const filename = `voiceover_${Date.now()}.wav`;

    if (Capacitor.isNativePlatform() && audioBlob) {
      try {
        const data = await blobToBase64(audioBlob);
        const saved = await Filesystem.writeFile({
          path: `ScriptVoice/${filename}`,
          data,
          directory: Directory.Documents,
          recursive: true,
        });
        showToast('Saved: Documents/ScriptVoice');
        try {
          await Share.share({ title: filename, url: saved.uri, dialogTitle: 'Save / Share WAV' });
        } catch {
          // Share sheet dismissed
        }
      } catch (err) {
        setErrorMsg(err?.message || 'Could not save the WAV file.');
      }
      return;
    }

    const triggerDownload = (href) => {
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading WAV...');
    };

    if (audioBlob) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            triggerDownload(reader.result);
          } else if (audioUrl) {
            triggerDownload(audioUrl);
          }
        };
        reader.readAsDataURL(audioBlob);
        return;
      } catch {
        // Fallback below
      }
    }

    if (audioUrl) {
      triggerDownload(audioUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900 truncate">
            ScriptVoice
          </span>

          {/* Primary Nav Tabs: 1. Story | 2. Voiceover */}
          <nav className="hidden sm:inline-flex items-center bg-slate-100 border border-slate-200 rounded-xl p-0.5 ml-2">
            <button
              type="button"
              onClick={() => setActiveSection('story')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSection === 'story'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Research &amp; Script
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('voiceover')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeSection === 'voiceover'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Voiceover
            </button>
          </nav>
        </div>

        <button
          type="button"
          onClick={openSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              verifyState.status === 'verified'
                ? 'bg-emerald-500'
                : settings.apiKey
                ? 'bg-amber-500'
                : 'bg-slate-400'
            }`}
          />
          <span>
            {verifyState.status === 'verified'
              ? 'API Ready'
              : settings.apiKey
              ? 'Key Saved'
              : 'API Setup'}
          </span>
          {isPinUnlocked ? (
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </header>

      {/* Mobile Primary Nav */}
      <div className="sm:hidden px-4 pt-3">
        <div className="grid grid-cols-2 bg-slate-200/70 border border-slate-200 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setActiveSection('story')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSection === 'story' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Research &amp; Script
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('voiceover')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSection === 'voiceover'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            Voiceover
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-5 pb-32 space-y-4">
        {errorMsg && (
          <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate">{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-rose-400 hover:text-rose-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: TOPIC RESEARCH & SCRIPT */}
        {activeSection === 'story' && (
          <div className="space-y-4">
            {/* Topic Input + Format + Generate Ideas */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Topic Research &amp; Trending Ideas
                  </span>
                </div>

                {/* Format Selector: 9:16 vs 16:9 */}
                <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const active = videoFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setVideoFormat(fmt.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                          active
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {fmt.id === '9:16' ? (
                          <Smartphone className="w-3 h-3" />
                        ) : (
                          <Monitor className="w-3 h-3" />
                        )}
                        <span>{fmt.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Search / Input Box */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Enter a topic (e.g. Zepto dark stores, Kirana scaling) or leave blank for trending ideas..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition"
                  />
                  {topicInput && (
                    <button
                      type="button"
                      onClick={() => setTopicInput('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      title="Clear topic"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Quick Language Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 rounded-lg px-2.5 py-1.5 border border-slate-200 transition">
                    <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <select
                      value={language}
                      onChange={(e) => updateLanguage(e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {LANGUAGE_OPTIONS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={handleGenerateIdeas}
                      disabled={isLoadingIdeas || isLoadingStory}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      {isLoadingIdeas ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Searching Trends...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Ideas</span>
                        </>
                      )}
                    </button>

                    {topicInput.trim() && (
                      <button
                        type="button"
                        onClick={handleDirectTopicScript}
                        disabled={isLoadingStory || isLoadingIdeas}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        {isLoadingStory ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Fact-Checking...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>Research &amp; Write Script</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Ideas List (3-5 Trending Topics) */}
              {ideas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl px-4">
                  Click <strong>&ldquo;Generate Ideas&rdquo;</strong> to search 4 trending business/startup topics, or type your own topic above and click <strong>&ldquo;Research &amp; Write Script&rdquo;</strong>.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2.5">
                    {ideas.map((idea) => {
                      const isSelected = idea.id === selectedIdeaId;
                      return (
                        <button
                          key={idea.id}
                          type="button"
                          onClick={() => setSelectedIdeaId(idea.id)}
                          className={`text-left p-3.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400/40'
                              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900">
                              {idea.id}. {idea.title}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                          {idea.trend_angle && (
                            <p className="text-xs text-indigo-700 font-medium mb-1">
                              {idea.trend_angle}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-medium text-slate-700">Process:</span>{' '}
                            {idea.core_process || idea.core_problem} ·{' '}
                            <span className="font-medium text-slate-700">Fact Hook:</span>{' '}
                            {idea.fact_hook || idea.monetization}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleGenerateStoryScript}
                      disabled={isLoadingStory || !selectedIdeaId}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {isLoadingStory ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying Facts &amp; Writing...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>Fact-Check &amp; Generate Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Verified Facts & Sources */}
            {(verifiedFacts.length > 0 || searchSources.length > 0) && (
              <section className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified Research Facts
                  </span>
                  {searchGrounded && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                      Google Search Grounded
                    </span>
                  )}
                </div>

                {verifiedFacts.length > 0 && (
                  <ul className="space-y-1 text-xs text-emerald-950 list-disc pl-4">
                    {verifiedFacts.map((fact, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {fact}
                      </li>
                    ))}
                  </ul>
                )}

                {searchSources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {searchSources.slice(0, 5).map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[10px] font-medium text-emerald-700 hover:bg-emerald-100 transition max-w-[200px] truncate"
                      >
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{src.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* BOX 1: Gemini Video Script (Paste into Gemini with Master Prompt) */}
            {geminiVideoScript && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      1. Gemini Video Script ({videoFormat})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(geminiVideoScript, setCopiedVideoScript)}
                    className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 flex items-center gap-1.5 transition"
                  >
                    {copiedVideoScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy for Gemini
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500">
                  Paste this into Gemini alongside your <strong>Business Explainer Master Prompt</strong> and generated audio file.
                </p>

                <textarea
                  rows={9}
                  value={geminiVideoScript}
                  onChange={(e) => setGeminiVideoScript(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 resize-y"
                />
              </section>
            )}

            {/* BOX 2: Clean Voiceover Narration (TTS Ready) */}
            {voiceoverNarration && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                      2. Voiceover Narration (TTS Ready)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 tabular-nums">
                      {voiceoverNarration.trim().split(/\s+/).filter(Boolean).length} words · ~{Math.round((voiceoverNarration.trim().split(/\s+/).filter(Boolean).length / 140) * 60)}s
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(voiceoverNarration, setCopiedNarration)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedNarration ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Narration
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={sendToVoiceover}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Generate Voiceover</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={voiceoverNarration}
                  onChange={(e) => setVoiceoverNarration(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm leading-relaxed text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 resize-y"
                />
              </section>
            )}

            {(youtubeTitles.length > 0 || thumbnailText) && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  3. Titles &amp; Thumbnail Hook
                </span>
                {thumbnailText && (
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Thumbnail Text:</span>{' '}
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">{thumbnailText}</span>
                  </div>
                )}
                {youtubeTitles.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                    {youtubeTitles.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        )}

        {/* SECTION 2: VOICEOVER */}
        {activeSection === 'voiceover' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('script')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'script'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Script
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('style')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'style'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Style &amp; Language
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('style')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 hover:border-indigo-300 transition shadow-sm"
              >
                <span className="font-medium text-slate-900">{settings.voice}</span>
                <span className="text-slate-300">·</span>
                <span className="text-indigo-600 font-semibold">
                  {LANGUAGE_OPTIONS.find((l) => l.id === language)?.label || 'Hinglish'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="max-w-[140px] truncate">{style || 'Natural'}</span>
              </button>
            </div>

            {/* Sub-tab 1: Script Box */}
            {activeTab === 'script' && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Script
                  </span>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/70 rounded-lg px-2 py-1 border border-slate-200 transition">
                      <Globe className="w-3 h-3 text-indigo-600 shrink-0" />
                      <select
                        value={language}
                        onChange={(e) => updateLanguage(e.target.value)}
                        className="bg-transparent text-[11px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        title="Voice language & accent"
                      >
                        {LANGUAGE_OPTIONS.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.label} · {l.nativeLabel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-xs text-slate-400 tabular-nums">
                      {script.length} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => setScript('')}
                      disabled={!script}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                      title="Clear script"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={9}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Apna Hindi ya Hinglish script yahan paste karein..."
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 resize-y transition"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {VOCAL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => insertTag(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-200 text-[11px] font-mono text-slate-600 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Sub-tab 2: Voice Style & Language */}
            {activeTab === 'style' && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Voice
                  </label>
                  <select
                    value={settings.voice}
                    onChange={(e) => {
                      const updated = { ...settings, voice: e.target.value };
                      setSettings(updated);
                      try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                      } catch {
                        // Ignore
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition"
                  >
                    {PREBUILT_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Language &amp; Accent Tone
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold">
                      {LANGUAGE_OPTIONS.find((l) => l.id === language)?.label} ({LANGUAGE_OPTIONS.find((l) => l.id === language)?.nativeLabel})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = language === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => updateLanguage(lang.id)}
                          className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-slate-900">{lang.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />}
                          </div>
                          <span className="text-[10px] text-indigo-700 font-medium mt-0.5">
                            {lang.nativeLabel}
                          </span>
                          <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                            {lang.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                    <strong>Accent Tip:</strong> Agar script mein pehla word English hai (e.g. <em>ScriptVoice</em>, <em>Startup</em>) par poori script Hindi/Hinglish hai, toh <strong>Hinglish</strong> chunein. Isse AI English tone mein nahi balki natural Desi/Indian tone mein bolega.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Delivery Style
                  </label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g. warm and conversational"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Presets
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {STYLE_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setStyle(p.value)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                          style === p.value
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/80'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Player & Generate Bar (shown on Voiceover section) */}
      {activeSection === 'voiceover' && (
        <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {audioUrl ? (
              <div className="flex-1 flex items-center gap-3 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 transition shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.05}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 accent-indigo-600 h-1.5 bg-slate-300 rounded-lg cursor-pointer"
                />

                <span className="text-[11px] font-medium text-slate-600 tabular-nums shrink-0">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition shrink-0 shadow-sm"
                  title="Download WAV"
                >
                  <Download className="w-4 h-4" />
                </button>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onTimeUpdate={() =>
                    audioRef.current && setCurrentTime(audioRef.current.currentTime)
                  }
                  onLoadedMetadata={() =>
                    audioRef.current && setDuration(audioRef.current.duration)
                  }
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <div className="flex-1 hidden sm:flex items-center text-xs text-slate-500">
                {settings.voice} · {settings.model}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shrink-0 shadow-sm shadow-indigo-600/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Voiceover</span>
                </>
              )}
            </button>
          </div>
        </footer>
      )}

      {/* Security PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security Verification</h3>
                  <p className="text-[11px] text-slate-500">Settings are PIN-protected</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 text-center">
                  Enter 4-Digit Security PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full tracking-[0.6em] text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 text-slate-900 placeholder:tracking-normal placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 text-center font-medium mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">API Settings</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Unlocked
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPinUnlocked(false);
                    setIsSettingsOpen(false);
                    showToast('Settings Locked');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-slate-100 transition"
                  title="Lock settings now"
                >
                  <Lock className="w-3 h-3" />
                  Lock
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    API Key (AQ.Ab... or AIza...)
                  </label>
                  {draftSettings.apiKey === MASTER_CONFIG.apiKey && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      Master Key Active
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draftSettings.apiKey}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, apiKey: e.target.value })
                    }
                    placeholder="AQ.Ab... or AIza..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {draftSettings.apiKey !== MASTER_CONFIG.apiKey && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraftSettings({
                        ...draftSettings,
                        apiKey: MASTER_CONFIG.apiKey,
                        provider: 'vertex_express',
                      })
                    }
                    className="mt-1.5 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    ↺ Reset to Master Key (Project {MASTER_CONFIG.projectId})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Story Model
                  </label>
                  <select
                    value={draftSettings.textModel}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, textModel: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  >
                    {TEXT_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    TTS Model
                  </label>
                  <select
                    value={draftSettings.model}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, model: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  >
                    {TTS_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Default Voice
                </label>
                <select
                  value={draftSettings.voice}
                  onChange={(e) =>
                    setDraftSettings({ ...draftSettings, voice: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  {PREBUILT_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {verifyState.message && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                    verifyState.status === 'verified'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : verifyState.status === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {verifyState.status === 'verified' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {verifyState.status === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  {verifyState.status === 'checking' && (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  )}
                  <span className="truncate">{verifyState.message}</span>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleVerifyApi}
                disabled={verifyState.status === 'checking'}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    verifyState.status === 'checking' ? 'animate-spin' : ''
                  }`}
                />
                Verify API
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-slate-200 text-slate-800 px-3.5 py-2 rounded-lg text-xs font-medium shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}