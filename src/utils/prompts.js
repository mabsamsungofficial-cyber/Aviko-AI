import { FORMAT_OPTIONS, LANGUAGE_OPTIONS } from '../constants/options';

export function buildIdeasPrompt(topicInput, format) {
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

export function buildResearchAndScriptPrompt(topicOrIdea, format, langId) {
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

export function extractJsonArray(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not parse ideas JSON from response.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export function extractJsonObject(rawText) {
  const cleaned = rawText.replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not parse script JSON from response.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

export function cleanScriptForVoiceover(rawScript) {
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
