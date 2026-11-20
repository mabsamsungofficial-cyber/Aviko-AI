export function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function ensureWavBlob(bytes, mimeType = '') {
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

export function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates structured, descriptive filenames for creators:
 * e.g. Voiceover_Puck-Host_Zepto-Dark-Stores.wav
 */
export function generateSmartFilename({
  voiceName = 'Voice',
  characterTag = '',
  topic = '',
  scriptText = '',
}) {
  let voicePart = (voiceName || 'Voice').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (characterTag && characterTag.trim()) {
    const cleanTag = characterTag.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleanTag) {
      voicePart += `-${cleanTag}`;
    }
  }

  let topicPart = '';
  if (topic && topic.trim()) {
    topicPart = topic.trim();
  } else if (scriptText && scriptText.trim()) {
    // Extract first 4-5 meaningful words from script text
    const clean = scriptText
      .replace(/<[^>]+>/g, ' ')
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/[\r\n\t]+/g, ' ')
      .trim();
    const words = clean.split(/\s+/).filter(Boolean).slice(0, 5);
    topicPart = words.join('-');
  }

  let cleanSlug = topicPart
    .replace(/[\/\\:\*\?"<>\|\.,!?;:()]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);

  if (!cleanSlug) {
    cleanSlug = 'Audio';
  }

  return `Voiceover_${voicePart}_${cleanSlug}.wav`;
}
