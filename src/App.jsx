import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  Play,
  Pause,
  Download,
  Settings,
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
  Languages,
  Globe,
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
  { id: 'gemini-3.8-flash', label: 'gemini-3.8-flash' },
  { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash' },
];

const STYLE_PRESETS = [
  { label: 'Hook', value: 'curious, energetic, and fast-paced' },
  { label: 'Explainer', value: 'calm, clear, and informative' },
  { label: 'Story', value: 'warm, expressive, and engaging' },
  { label: 'Whisper', value: 'whispered urgently, low volume' },
  { label: 'Serious', value: 'serious, firm, and impactful' },
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

const STORAGE_KEY = 'script_voice_studio_v1';

const PROMPT_A = `Act as a practical Indian startup strategist and short-form content creator. Generate 5 unique, actionable, low-investment business ideas tailored for the Indian market (under ₹10,000 investment).

Focus on B2B local services, AI/no-code micro-services, and digital commerce. Avoid generic ideas like "start a YouTube channel" or "dropshipping".

Return the output strictly as a JSON array with these keys for each idea:
- "id": (1 to 5)
- "title": (Catchy 4-5 word title)
- "target_customer": (Who pays for this)
- "core_problem": (What specific problem it solves)
- "monetization": (How money is made)`;

function buildPromptB(idea) {
  return `Write a high-retention 35-second Instagram Reel / YouTube Short script in natural conversational Hinglish (Hindi written in English script, using everyday English business words like 'leads', 'client', 'setup', 'commission').

Selected Business Idea:
Title: ${idea.title}
Target Customer: ${idea.target_customer}
Core Problem: ${idea.core_problem}
Monetization: ${idea.monetization}

Strict Rules:
1. NO robotic intros like "Hello doston" or "Aaj hum baat karenge". Start directly with a punchy 3-second hook.
2. Keep sentences short, crisp, and punchy (80-100 words total).
3. Include [Visual Hook] and [On-Screen Text] cues.
4. End with a single strong Call-To-Action (Save or Comment).
5. Tone: Practical, direct, and street-smart—not overly formal or salesy.`;
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

function cleanScriptForVoiceover(rawScript) {
  return rawScript
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^\[?(Visual Hook|On-Screen Text|Audio|Voiceover|CTA|Hook|Scene)\s*[:\]]/i.test(line)) {
        // Keep spoken text if line is like "Voiceover: ..."
        if (/^Voiceover\s*:/i.test(line)) return true;
        return false;
      }
      return true;
    })
    .map((line) =>
      line
        .replace(/^Voiceover\s*:\s*/i, '')
        .replace(/\[Visual Hook[^\]]*\]/gi, '')
        .replace(/\[On-Screen Text[^\]]*\]/gi, '')
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
    apiKey: '',
    model: 'gemini-3.8-flash-tts',
    textModel: 'gemini-3.8-flash',
    voice: 'Kore',
    language: 'hinglish',
    provider: 'aistudio', // aistudio | vertex_express
  });
  const [draftSettings, setDraftSettings] = useState(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [verifyState, setVerifyState] = useState({ status: 'idle', message: '' });

  // Top-level navigation: 'story' (Step 1) | 'voiceover' (Step 2)
  const [activeSection, setActiveSection] = useState('story');
  // Sub-tab inside Voiceover: 'script' | 'style'
  const [activeTab, setActiveTab] = useState('script');

  // Story State
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [storyScript, setStoryScript] = useState('');
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [copiedStory, setCopiedStory] = useState(false);

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
        setSettings((prev) => ({ ...prev, ...parsed }));
        setDraftSettings((prev) => ({ ...prev, ...parsed }));
        if (parsed.language) {
          setLanguage(parsed.language);
        }
        if (parsed.apiKey) {
          setVerifyState({ status: 'idle', message: 'Saved API key loaded' });
        }
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
    setDraftSettings(settings);
    setIsSettingsOpen(true);
  };

  const handleVerifyApi = async () => {
    const key = draftSettings.apiKey.trim();
    if (!key) {
      setVerifyState({ status: 'error', message: 'Enter your API key.' });
      return;
    }

    setVerifyState({ status: 'checking', message: 'Verifying API key...' });

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        { method: 'GET' }
      );
      if (res.ok) {
        setDraftSettings((prev) => ({ ...prev, provider: 'aistudio' }));
        setVerifyState({ status: 'verified', message: 'API Key Verified (Gemini API)' });
        return;
      }
    } catch {
      // Fall through to Vertex Express check
    }

    try {
      const res = await fetch(
        `https://aiplatform.googleapis.com/v1/publishers/google/models/${
          draftSettings.model
        }:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { voice: draftSettings.voice } },
            },
          }),
        }
      );

      if (res.ok) {
        setDraftSettings((prev) => ({ ...prev, provider: 'vertex_express' }));
        setVerifyState({ status: 'verified', message: 'API Key Verified (Vertex Express)' });
        return;
      }

      const errData = await res.json().catch(() => ({}));
      setVerifyState({
        status: 'error',
        message: errData?.error?.message || `Verification failed (HTTP ${res.status})`,
      });
    } catch (err) {
      setVerifyState({
        status: 'error',
        message: err?.message || 'Network verification failed',
      });
    }
  };

  const handleSaveSettings = () => {
    const cleaned = {
      ...draftSettings,
      apiKey: draftSettings.apiKey.trim(),
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

  const callTextModelWithSearch = async (promptText) => {
    const key = settings.apiKey.trim();
    const modelName = settings.textModel || 'gemini-3.8-flash';
    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      tools: [{ google_search: {} }],
    };

    const endpoints =
      settings.provider === 'vertex_express'
        ? [
            `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelName}:generateContent?key=${encodeURIComponent(
              key
            )}`,
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
              key
            )}`,
          ]
        : [
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
              key
            )}`,
            `https://aiplatform.googleapis.com/v1/publishers/google/models/${modelName}:generateContent?key=${encodeURIComponent(
              key
            )}`,
          ];

    let lastError = 'Request failed';
    for (const url of endpoints) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        const text = parts
          .map((p) => p.text || '')
          .join('')
          .trim();
        if (!text) throw new Error('Empty response from model.');
        return text;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastError = errJson?.error?.message || `HTTP ${res.status}`;
      }
    }
    throw new Error(lastError);
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
      const rawText = await callTextModelWithSearch(PROMPT_A);
      const parsed = extractJsonArray(rawText);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('No ideas found in response.');
      }
      setIdeas(parsed);
      setSelectedIdeaId(parsed[0]?.id ?? null);
      showToast('5 Daily Ideas ready');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate ideas.');
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const handleGenerateStoryScript = async () => {
    setErrorMsg('');
    if (!settings.apiKey.trim()) {
      openSettings();
      setVerifyState({ status: 'error', message: 'Enter your API key first.' });
      return;
    }

    const selected = ideas.find((item) => item.id === selectedIdeaId);
    if (!selected) {
      setErrorMsg('Select an idea first.');
      return;
    }

    setIsLoadingStory(true);
    try {
      const text = await callTextModelWithSearch(buildPromptB(selected));
      setStoryScript(text);
      showToast('Script generated');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate story script.');
    } finally {
      setIsLoadingStory(false);
    }
  };

  const copyStoryToClipboard = () => {
    if (!storyScript) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(storyScript).catch(() => {});
    } else {
      const el = document.createElement('textarea');
      el.value = storyScript;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedStory(true);
    setTimeout(() => setCopiedStory(false), 1800);
  };

  const sendToVoiceover = () => {
    if (!storyScript.trim()) return;
    const spokenOnly = cleanScriptForVoiceover(storyScript);
    setScript(spokenOnly || storyScript);
    setActiveSection('voiceover');
    setActiveTab('script');
    showToast('Loaded into Voiceover');
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
    const key = settings.apiKey.trim();
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

    const endpoints =
      settings.provider === 'vertex_express'
        ? [
            `https://aiplatform.googleapis.com/v1/publishers/google/models/${
              settings.model
            }:generateContent?key=${encodeURIComponent(key)}`,
            `https://generativelanguage.googleapis.com/v1beta/models/${
              settings.model
            }:generateContent?key=${encodeURIComponent(key)}`,
          ]
        : [
            `https://generativelanguage.googleapis.com/v1beta/models/${
              settings.model
            }:generateContent?key=${encodeURIComponent(key)}`,
            `https://aiplatform.googleapis.com/v1/publishers/google/models/${
              settings.model
            }:generateContent?key=${encodeURIComponent(key)}`,
          ];

    try {
      let successData = null;
      let lastError = 'Request failed';

      for (const url of endpoints) {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          successData = await res.json();
          break;
        } else {
          const errJson = await res.json().catch(() => ({}));
          lastError = errJson?.error?.message || `HTTP ${res.status}`;
        }
      }

      if (!successData) {
        throw new Error(lastError);
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

    // Native Android: save WAV into Documents and open the share sheet
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
              Story
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
              ? 'API Verified'
              : settings.apiKey
              ? 'Key Saved'
              : 'API Setup'}
          </span>
          <Settings className="w-3.5 h-3.5 text-slate-500" />
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
            Story
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

        {/* SECTION 1: STORY */}
        {activeSection === 'story' && (
          <div className="space-y-4">
            {/* Daily Ideas Header */}
            <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Daily Ideas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateIdeas}
                  disabled={isLoadingIdeas}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  {isLoadingIdeas ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Researching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Daily Ideas</span>
                    </>
                  )}
                </button>
              </div>

              {ideas.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  Click "Generate Daily Ideas" to fetch 5 ideas
                </div>
              ) : (
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
                            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-medium text-slate-700">Customer:</span>{' '}
                          {idea.target_customer} ·{' '}
                          <span className="font-medium text-slate-700">Problem:</span>{' '}
                          {idea.core_problem} ·{' '}
                          <span className="font-medium text-slate-700">Revenue:</span>{' '}
                          {idea.monetization}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {ideas.length > 0 && (
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
                        <span>Writing Script...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-3.5 h-3.5" />
                        <span>Generate Script</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </section>

            {/* Generated Story Script Card */}
            {storyScript && (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Generated Script
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyStoryToClipboard}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedStory ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={sendToVoiceover}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                    >
                      <span>Use for Voiceover</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={storyScript}
                  onChange={(e) => setStoryScript(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm leading-relaxed text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 resize-y"
                />
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
                  Style & Language
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
                    {/* Quick Language Selector on Script Box */}
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

                {/* Language & Accent Tone Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Language & Accent Tone
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
                    <strong>💡 Accent Tip:</strong> Agar script mein pehla word English hai (e.g. <em>ScriptVoice</em>, <em>Startup</em>) par poori script Hindi/Hinglish hai, toh <strong>Hinglish</strong> chunein. Isse AI English tone mein nahi balki natural Desi/Indian tone mein bolega.
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">API Settings</h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  API Key (AQ.Ab... or AIza...)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={draftSettings.apiKey}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, apiKey: e.target.value })
                    }
                    placeholder="AQ.Ab... or AIza..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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