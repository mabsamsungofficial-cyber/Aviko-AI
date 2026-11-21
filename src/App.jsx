import React, { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import {
  Volume2,
  BookOpen,
  Lock,
  AlertCircle,
  X,
  CheckCircle2,
  Download,
  ShieldCheck,
} from 'lucide-react';

import {
  MASTER_CONFIG,
  STORAGE_KEY,
  LANGUAGE_OPTIONS,
} from './constants/options';
import { PREBUILT_VOICES } from './constants/voices';
import {
  buildIdeasPrompt,
  buildResearchAndScriptPrompt,
  extractJsonArray,
  extractJsonObject,
  cleanScriptForVoiceover,
} from './utils/prompts';
import {
  base64ToUint8Array,
  ensureWavBlob,
  blobToBase64,
  generateSmartFilename,
} from './utils/audio';

import VoicePickerModal from './components/VoicePickerModal';
import SettingsModal from './components/SettingsModal';
import ResearchSection from './components/ResearchSection';
import VoiceoverSection from './components/VoiceoverSection';
import AudioPlayerBar from './components/AudioPlayerBar';

const FAVORITES_STORAGE_KEY = 'aviko_favorites_v2';

export default function App() {
  const [settings, setSettings] = useState({
    apiKey: '', // By default empty for new users / fresh browsers
    model: 'gemini-3.8-flash-tts',
    textModel: 'gemini-3.5-flash-lite',
    voice: 'Kore',
    language: 'hinglish',
    provider: 'aistudio',
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Top-level navigation: 'story' | 'voiceover'
  const [activeSection, setActiveSection] = useState('voiceover');

  // Story & Research State
  const [topicInput, setTopicInput] = useState('');
  const [videoFormat, setVideoFormat] = useState('9:16');
  const [ideas, setIdeas] = useState([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState(null);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);

  // Script Outputs
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

  // Audio State
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  // PWA Install Prompt Listener & Standalone Detection
  useEffect(() => {
    const isAppStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(isAppStandalone);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('App installed to home screen!');
      setDeferredInstallPrompt(null);
    }
  };

  // Load Settings on Mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const resolvedKey = parsed.apiKey ? parsed.apiKey.trim() : '';
        const resolvedProvider = resolvedKey.startsWith('AQ.')
          ? 'vertex_express'
          : parsed.provider || 'aistudio';

        const updated = {
          ...parsed,
          apiKey: resolvedKey,
          provider: resolvedProvider,
        };

        setSettings((prev) => ({ ...prev, ...updated }));
        if (parsed.voice) {
          setSettings((prev) => ({ ...prev, voice: parsed.voice }));
        }
        if (parsed.language) {
          setLanguage(parsed.language);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Native status bar
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    }
  }, []);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Ignore
    }
  };

  const handleSelectVoice = (voiceId) => {
    const updated = { ...settings, voice: voiceId };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    const voiceObj = PREBUILT_VOICES.find((v) => v.id === voiceId);
    showToast(`Voice set to ${voiceObj?.name || voiceId}`);
  };

  const handleUpdateLanguage = (newLang) => {
    setLanguage(newLang);
    const updated = { ...settings, language: newLang };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (voiceId) => {
    setFavorites((prev) => {
      const isFav = !!prev[voiceId]?.starred;
      let nextState;
      if (isFav) {
        const copy = { ...prev };
        delete copy[voiceId];
        nextState = copy;
        showToast('Removed from favorites');
      } else {
        nextState = {
          ...prev,
          [voiceId]: { starred: true, tag: prev[voiceId]?.tag || '' },
        };
        showToast('Added to favorites');
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore
      }
      return nextState;
    });
  };

  // Update Character Tag
  const handleUpdateCharacterTag = (voiceId, tag) => {
    setFavorites((prev) => {
      const nextState = {
        ...prev,
        [voiceId]: { starred: true, tag: tag.trim() },
      };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextState));
      } catch {
        // Ignore
      }
      if (tag.trim()) {
        showToast(`Tagged as "${tag.trim()}"`);
      } else {
        showToast('Tag cleared');
      }
      return nextState;
    });
  };

  // Backend API Call for Text Models (Google Search Grounding)
  const callTextModelWithSearch = async (promptText, enableSearch = true) => {
    const key = (settings.apiKey || '').trim();
    if (!key) {
      setIsSettingsOpen(true);
      setErrorMsg('API Key required. Enter your key in Settings or enter the 6-Digit PIN.');
      throw new Error('API Key missing. Configure in Settings.');
    }
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
        return await runRequest(false);
      }
    }
    return await runRequest(false);
  };

  const handleGenerateIdeas = async () => {
    setErrorMsg('');
    if (!settings.apiKey.trim()) {
      setIsSettingsOpen(true);
      setErrorMsg('Configure your API key first.');
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
      showToast(`${Math.min(parsed.length, 5)} Ideas generated`);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to generate ideas.');
    } finally {
      setIsLoadingIdeas(false);
    }
  };

  const runFactCheckedScript = async (topicOrIdea) => {
    setErrorMsg('');
    if (!settings.apiKey.trim()) {
      setIsSettingsOpen(true);
      setErrorMsg('Configure your API key first.');
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
      showToast('Script ready');
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to research and generate script.');
    } finally {
      setIsLoadingStory(false);
    }
  };

  const handleGenerateStoryScript = async () => {
    const selected = ideas.find((item) => item.id === selectedIdeaId);
    if (!selected) {
      setErrorMsg('Select an idea first or enter a topic.');
      return;
    }
    await runFactCheckedScript(selected);
  };

  const handleDirectTopicScript = async () => {
    if (!topicInput.trim()) {
      setErrorMsg('Enter a topic first.');
      return;
    }
    await runFactCheckedScript(topicInput.trim());
  };

  const copyText = (value, type) => {
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
    if (type === 'video') {
      setCopiedVideoScript(true);
      setTimeout(() => setCopiedVideoScript(false), 1800);
    } else {
      setCopiedNarration(true);
      setTimeout(() => setCopiedNarration(false), 1800);
    }
  };

  const sendToVoiceover = () => {
    const cleanText = voiceoverNarration.trim() || cleanScriptForVoiceover(geminiVideoScript);
    if (!cleanText) return;
    setScript(cleanText);
    setActiveSection('voiceover');
    showToast('Loaded into Voiceover');
  };

  // Backend Voice Generation Call (Untouched Core Logic)
  const handleGenerate = async () => {
    setErrorMsg('');
    const key = (settings.apiKey || '').trim();
    if (!key) {
      setIsSettingsOpen(true);
      setErrorMsg('API Key required. Enter your key in Settings or enter the 6-Digit PIN.');
      return;
    }

    if (!script.trim()) {
      setErrorMsg('Script is empty. Please enter narration text.');
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
        throw new Error('No audio data received in response.');
      }

      const bytes = base64ToUint8Array(inlineData.data);
      const wavBlob = ensureWavBlob(bytes, inlineData.mimeType || '');
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioBlob(wavBlob);
      setAudioUrl(URL.createObjectURL(wavBlob));
      setCurrentTime(0);
      showToast('Voiceover audio generated');
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

  // Smart Descriptive Filename Generator on Download
  const handleDownload = async () => {
    if (!audioBlob && !audioUrl) return;

    const activeVoiceObj = PREBUILT_VOICES.find((v) => v.id === settings.voice);
    const activeTag = favorites[settings.voice]?.tag || '';
    const activeTopic =
      topicInput.trim() ||
      (ideas.find((i) => i.id === selectedIdeaId)?.title) ||
      '';

    const filename = generateSmartFilename({
      voiceName: activeVoiceObj?.name || settings.voice,
      characterTag: activeTag,
      topic: activeTopic,
      scriptText: script,
    });

    if (Capacitor.isNativePlatform() && audioBlob) {
      try {
        const data = await blobToBase64(audioBlob);
        const saved = await Filesystem.writeFile({
          path: `ScriptVoice/${filename}`,
          data,
          directory: Directory.Documents,
          recursive: true,
        });
        showToast(`Saved: ${filename}`);
        try {
          await Share.share({ title: filename, url: saved.uri, dialogTitle: 'Save / Share WAV' });
        } catch {
          // Share dismissed
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
      showToast(`Downloading: ${filename}`);
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
        // Fallback
      }
    }

    if (audioUrl) {
      triggerDownload(audioUrl);
    }
  };

  const activeVoiceObj =
    PREBUILT_VOICES.find((v) => v.id === settings.voice) || PREBUILT_VOICES[0];
  const activeCharacterTag = favorites[settings.voice]?.tag || '';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex flex-col overscroll-none">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3.5 sm:px-6 h-14 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Volume2 className="w-4 h-4" />
          </div>
          <span className="font-h3 text-slate-900 truncate">
            Aviko AI <span className="font-caption text-slate-400">v2</span>
          </span>

          {/* Primary Nav Switcher (Desktop / Tablet) - Styled like Style Guide Segmented Pill Tabs */}
          <nav className="hidden sm:inline-flex items-center bg-slate-100 border border-slate-200/90 rounded-full p-1 ml-3">
            <button
              type="button"
              onClick={() => setActiveSection('story')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-subtitle text-xs transition ${
                activeSection === 'story'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Research &amp; Script</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('voiceover')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-subtitle text-xs transition ${
                activeSection === 'voiceover'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voiceover Studio</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* PWA Install Button (Shows when in browser and installable) */}
          {deferredInstallPrompt && !isStandalone && (
            <button
              type="button"
              onClick={handleInstallPWA}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-subtitle text-xs shadow-sm transition active:scale-95"
              title="Install App"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          )}

          {/* Settings / API Button with Dynamic Security Status (Outlined Pill Button) */}
          {(() => {
            const isMaster = settings.apiKey === MASTER_CONFIG.apiKey;
            const hasCustom = !!settings.apiKey && !isMaster;
            return (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="h-9 px-3.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-subtitle text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                title={
                  isMaster
                    ? 'Master Key Active (Unlocked)'
                    : hasCustom
                    ? 'Custom API Key Active'
                    : 'No API Key - Tap to Configure'
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMaster
                      ? 'bg-emerald-500'
                      : hasCustom
                      ? 'bg-blue-500'
                      : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span>API</span>
                {isMaster || hasCustom ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            );
          })()}
        </div>
      </header>

      {/* Mobile Nav Switcher (Top segmented control for phones) */}
      <div className="sm:hidden px-3 pt-2.5 pb-2 bg-white/90 border-b border-slate-200/70 flex justify-center">
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-full border border-slate-200/90 w-full max-w-sm">
          <button
            type="button"
            onClick={() => setActiveSection('story')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full font-subtitle text-xs transition ${
              activeSection === 'story'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Research &amp; Script</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('voiceover')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-full font-subtitle text-xs transition ${
              activeSection === 'voiceover'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Voiceover Studio</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-36 space-y-4">
        {errorMsg && (
          <div className="flex items-center justify-between gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2.5 rounded-2xl text-xs shadow-level-1">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate font-medium">{errorMsg}</span>
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

        {/* SECTION 1: RESEARCH & SCRIPT */}
        {activeSection === 'story' && (
          <ResearchSection
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            videoFormat={videoFormat}
            setVideoFormat={setVideoFormat}
            language={language}
            setLanguage={handleUpdateLanguage}
            ideas={ideas}
            selectedIdeaId={selectedIdeaId}
            setSelectedIdeaId={setSelectedIdeaId}
            isLoadingIdeas={isLoadingIdeas}
            isLoadingStory={isLoadingStory}
            onGenerateIdeas={handleGenerateIdeas}
            onDirectTopicScript={handleDirectTopicScript}
            onGenerateStoryScript={handleGenerateStoryScript}
            verifiedFacts={verifiedFacts}
            searchSources={searchSources}
            searchGrounded={searchGrounded}
            geminiVideoScript={geminiVideoScript}
            setGeminiVideoScript={setGeminiVideoScript}
            voiceoverNarration={voiceoverNarration}
            setVoiceoverNarration={setVoiceoverNarration}
            youtubeTitles={youtubeTitles}
            thumbnailText={thumbnailText}
            copiedVideoScript={copiedVideoScript}
            copiedNarration={copiedNarration}
            onCopyText={copyText}
            onSendToVoiceover={sendToVoiceover}
          />
        )}

        {/* SECTION 2: VOICEOVER STUDIO */}
        {activeSection === 'voiceover' && (
          <VoiceoverSection
            script={script}
            setScript={setScript}
            style={style}
            setStyle={setStyle}
            language={language}
            setLanguage={handleUpdateLanguage}
            selectedVoiceId={settings.voice}
            onOpenVoicePicker={() => setIsVoicePickerOpen(true)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Bottom Sticky Player Bar on Voiceover section */}
      {activeSection === 'voiceover' && (
        <AudioPlayerBar
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          isGenerating={isGenerating}
          onTogglePlay={togglePlay}
          onSeek={handleSeek}
          onDownload={handleDownload}
          onGenerate={handleGenerate}
          audioRef={audioRef}
          setCurrentTime={setCurrentTime}
          setDuration={setDuration}
          setIsPlaying={setIsPlaying}
          activeVoiceName={
            activeCharacterTag
              ? `${activeVoiceObj.name} (${activeCharacterTag})`
              : activeVoiceObj.name
          }
          activeModelName={settings.model}
        />
      )}

      {/* Modals */}
      <VoicePickerModal
        isOpen={isVoicePickerOpen}
        onClose={() => setIsVoicePickerOpen(false)}
        selectedVoiceId={settings.voice}
        onSelectVoice={handleSelectVoice}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onUpdateCharacterTag={handleUpdateCharacterTag}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onToast={showToast}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 sm:top-18 right-3 sm:right-6 z-50 bg-[#0F172A] text-white px-4 py-2 rounded-full font-subtitle text-xs shadow-level-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
