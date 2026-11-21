export const TTS_MODELS = [
  {
    id: 'gemini-3.8-flash-tts',
    name: 'Gemini 2.5 Flash Voice',
    label: 'Gemini 2.5 Flash Voice (Latest Exp)',
    badge: 'Latest Exp',
    desc: 'High-fidelity natural human expressiveness',
  },
  {
    id: 'gemini-3.8-flash-lite-tts',
    name: 'Gemini 2.5 Flash Lite Voice',
    label: 'Gemini 2.5 Flash Lite Voice',
    badge: 'Fast',
    desc: 'Lightweight & instant audio synthesis',
  },
];

export const TEXT_MODELS = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    label: 'Gemini 2.5 Flash Lite (Fast & Reliable)',
    badge: 'Recommended',
    desc: 'Optimized for high-retention viral scripts',
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite Latest',
    label: 'Gemini Flash Lite (Stable)',
    badge: 'Stable',
    desc: 'Ultra low latency & high consistency',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 2.5 Flash',
    label: 'Gemini 2.5 Flash (Deep Research)',
    badge: 'Deep Research',
    desc: 'Comprehensive multi-source grounding',
  },
];

export const STYLE_PRESETS = [
  { label: 'High-Retention Hook', value: 'curious, energetic, and fast-paced' },
  { label: 'Clear Explainer', value: 'calm, clear, and informative' },
  { label: 'Deep Story', value: 'warm, expressive, and engaging' },
  { label: 'Urgent Whisper', value: 'whispered urgently, low volume' },
  { label: 'Serious & Impactful', value: 'serious, firm, and impactful' },
];

export const FORMAT_OPTIONS = [
  { id: '9:16', label: '9:16 Shorts / Reels', resolution: '1080×1920', targetDuration: '45–60 sec (115–145 words at 140 WPM)' },
  { id: '16:9', label: '16:9 YouTube', resolution: '1920×1080', targetDuration: '95–120 sec (220–280 words at 140 WPM)' },
];

export const LANGUAGE_OPTIONS = [
  {
    id: 'hinglish',
    label: 'Hinglish',
    accent: 'Indian Tone',
    description: 'Hindi in Roman letters with natural Indian accent',
    instruction:
      'Spoken in natural conversational Hinglish with an authentic, friendly Indian accent. Crucially, pronounce all Hindi words with fluent, natural Indian pronunciation and do NOT adopt an American, British, or foreign accent, even if the sentence starts with English words. Blend English and Hindi smoothly.',
  },
  {
    id: 'hindi',
    label: 'Hindi',
    accent: 'Native Accent',
    description: 'Authentic Indian Hindi pronunciation in Devanagari',
    instruction:
      'Spoken in fluent native Hindi with an authentic Indian accent and clear, natural Hindi pronunciation.',
  },
  {
    id: 'english_in',
    label: 'English (IN)',
    accent: 'Indian English',
    description: 'Modern natural Indian English accent',
    instruction:
      'Spoken in clear, fluent English with a natural modern Indian accent and professional cadence.',
  },
  {
    id: 'english_us',
    label: 'English (US)',
    accent: 'American',
    description: 'Standard modern American English',
    instruction:
      'Spoken in clear, natural American English accent with crisp pronunciation.',
  },
  {
    id: 'english_uk',
    label: 'English (UK)',
    accent: 'British',
    description: 'Crisp British English accent',
    instruction:
      'Spoken in crisp, refined British English accent with natural pacing.',
  },
  {
    id: 'urdu',
    label: 'Urdu',
    accent: 'Desi Subcontinent',
    description: 'Subcontinent Urdu / Hindustani tone',
    instruction:
      'Spoken in natural, expressive Urdu / Hindustani with authentic subcontinent pronunciation, warm tone, and natural cadence.',
  },
];

import { SECURITY_CONFIG } from './securityConfig';
export { SECURITY_CONFIG };

export const MASTER_CONFIG = {
  apiKey: SECURITY_CONFIG.masterKey,
  projectId: SECURITY_CONFIG.projectId,
  provider: 'aistudio',
  pin: SECURITY_CONFIG.masterPin,
};

export const STORAGE_KEY = 'aviko_ai_studio_v2';
