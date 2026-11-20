import React, { useState, useRef, useEffect } from 'react';
import {
  Trash2,
  Globe,
  ChevronRight,
  ChevronDown,
  Star,
  Tag,
  SlidersHorizontal,
  Check,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { PREBUILT_VOICES } from '../constants/voices';
import { VOCAL_TAGS } from '../constants/vocalTags';
import { LANGUAGE_OPTIONS, STYLE_PRESETS } from '../constants/options';

export default function VoiceoverSection({
  script,
  setScript,
  style,
  setStyle,
  language,
  setLanguage,
  selectedVoiceId,
  onOpenVoicePicker,
  favorites = {},
  onToggleFavorite,
}) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [isVocalTagsOpen, setIsVocalTagsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const langDropdownRef = useRef(null);
  const moodDropdownRef = useRef(null);
  const textareaRef = useRef(null);

  const activeVoice =
    PREBUILT_VOICES.find((v) => v.id === selectedVoiceId) || PREBUILT_VOICES[0];
  const activeLangObj =
    LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  const activePreset =
    STYLE_PRESETS.find((p) => p.value === style) || {
      label: 'Custom Mood',
      value: style,
    };

  const isStarred = !!favorites[selectedVoiceId]?.starred;
  const characterTag = favorites[selectedVoiceId]?.tag || '';

  // Voice initials
  const voiceInitials = activeVoice.name.slice(0, 2).toUpperCase();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(event.target)) {
        setIsMoodOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

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

  const wordCount = script.trim() ? script.trim().split(/\s+/).filter(Boolean).length : 0;
  const estimatedSeconds = Math.round((wordCount / 140) * 60);

  return (
    <div className="space-y-4">
      {/* 1. HERO STUDIO VOICE CARD (Elevated Squircle Card) */}
      <div
        onClick={onOpenVoicePicker}
        className="w-full bg-white border border-slate-200/80 hover:border-emerald-400 rounded-[22px] p-3.5 sm:p-4 shadow-level-2 transition cursor-pointer active:scale-[0.99] group flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 tracking-wider">
            {voiceInitials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-slate-900 tracking-tight">
                {activeVoice.name}
              </span>

              {/* Styleguide Pill Chips */}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                {activeVoice.gender}
              </span>

              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                {activeVoice.bestFor}
              </span>

              {characterTag && (
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{characterTag}</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
              {activeVoice.tone} · Tap to change voice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(activeVoice.id);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition active:scale-90"
            title={isStarred ? 'Unstar voice' : 'Star voice'}
          >
            <Star
              className={`w-4 h-4 ${
                isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
              }`}
            />
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-700 flex items-center justify-center transition">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. UNIFIED SETTINGS CARD: LANGUAGE & DELIVERY MOOD (SIDE-BY-SIDE + INPUT BELOW) */}
      <div className="bg-white border border-slate-200/80 rounded-[22px] p-4 shadow-level-2 space-y-3">
        {/* SIDE-BY-SIDE DROPDOWNS ROW */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
          
          {/* LEFT: LANGUAGE & ACCENT CUSTOM DROPDOWN */}
          <div className="relative" ref={langDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 truncate flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Language &amp; Accent</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsMoodOpen(false);
              }}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-800 shadow-level-1 transition active:scale-[0.99] focus:outline-none focus:border-emerald-500"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-slate-900 truncate">{activeLangObj.label}</span>
                <span className="text-[10px] text-slate-400 font-normal truncate hidden sm:inline">
                  ({activeLangObj.accent})
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isLangOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>

            {/* Language Popover Menu */}
            {isLangOpen && (
              <div className="absolute top-full left-0 w-60 sm:w-68 mt-2 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.id);
                        setIsLangOpen(false);
                      }}
                      className={`w-full h-9 px-3 rounded-xl text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-bold text-slate-900">{lang.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate">
                          ({lang.accent})
                        </span>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: DELIVERY MOOD CUSTOM DROPDOWN */}
          <div className="relative" ref={moodDropdownRef}>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 truncate flex items-center gap-1.5">
              <SlidersHorizontal className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Delivery Mood</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsMoodOpen(!isMoodOpen);
                setIsLangOpen(false);
              }}
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-800 shadow-level-1 transition active:scale-[0.99] focus:outline-none focus:border-emerald-500"
            >
              <span className="font-bold text-slate-900 truncate">
                {activePreset.label}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isMoodOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>

            {/* Delivery Mood Popover Menu */}
            {isMoodOpen && (
              <div className="absolute top-full right-0 w-60 sm:w-68 mt-2 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                {STYLE_PRESETS.map((preset) => {
                  const isSelected = style === preset.value;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setStyle(preset.value);
                        setIsMoodOpen(false);
                      }}
                      className={`w-full h-9 px-3 rounded-xl text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-100'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {preset.label}
                      </span>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FULL WIDTH CUSTOM STYLE INPUT (RIGHT BELOW BOTH DROPDOWNS INSIDE THE SAME CARD) */}
        <div>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Custom delivery style prompt..."
            className="w-full h-10 bg-slate-50/90 border border-slate-200/80 rounded-xl px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus-ring-mint transition font-medium shadow-level-1"
          />
        </div>
      </div>

      {/* 3. SCRIPT NARRATION CARD */}
      <div className="bg-white border border-slate-200/80 rounded-[22px] shadow-level-2 overflow-hidden focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            Narration Script
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-slate-200/80 text-slate-600 tabular-nums shadow-level-1">
              {wordCount} words · ~{estimatedSeconds}s
            </span>

            <button
              type="button"
              onClick={() => setScript('')}
              disabled={!script}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
              title="Clear script"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90"
              title="Expand to full screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={7}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Paste or type your script in Hindi, Hinglish, or English..."
          className="w-full p-4 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent"
        />

        {/* Collapsible Emotion / Vocal Tags Accessory Bar */}
        <div className="border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setIsVocalTagsOpen(!isVocalTagsOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/50 transition group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition">
                Vocal Emotion Tags
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                {VOCAL_TAGS.length} tags
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 group-hover:bg-emerald-100 transition">
              <span>{isVocalTagsOpen ? 'Hide' : 'Add Emotions'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isVocalTagsOpen ? 'rotate-180 text-emerald-700' : 'text-slate-400'
                }`}
              />
            </div>
          </button>

          {isVocalTagsOpen && (
            <div className="px-4 pb-3 pt-1 border-t border-slate-100/80 space-y-2 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center gap-1.5">
                {VOCAL_TAGS.map((tagItem) => (
                  <button
                    key={tagItem.tag}
                    type="button"
                    onClick={() => insertTag(tagItem.tag)}
                    className="h-8 px-3 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-level-1"
                  >
                    <span className="text-sm">{tagItem.emoji}</span>
                    <span className="text-[11px] font-semibold">{tagItem.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. FULLSCREEN SCRIPT EDITOR MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-2 sm:p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-4xl h-[94vh] bg-white border border-slate-200/90 rounded-[24px] shadow-level-3 flex flex-col overflow-hidden">
            {/* Fullscreen Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 tracking-tight">
                  Narration Script
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Full Screen Editor
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-white border border-slate-200/80 text-slate-600 tabular-nums shadow-level-1">
                  {wordCount} words · ~{estimatedSeconds}s
                </span>

                <button
                  type="button"
                  onClick={() => setScript('')}
                  disabled={!script}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition"
                  title="Clear script"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition active:scale-95"
                  title="Close full screen"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fullscreen Textarea */}
            <div className="flex-1 p-5 overflow-y-auto">
              <textarea
                autoFocus
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Paste or type your script in Hindi, Hinglish, or English..."
                className="w-full h-full min-h-[300px] text-base sm:text-lg leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent font-normal"
              />
            </div>

            {/* Fullscreen Vocal Tags Dock */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Vocal Tags:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {VOCAL_TAGS.map((tagItem) => (
                    <button
                      key={tagItem.tag}
                      type="button"
                      onClick={() => insertTag(tagItem.tag)}
                      className="h-8 px-3 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 text-xs font-medium text-slate-700 transition flex items-center gap-1.5 active:scale-95 shadow-level-1"
                    >
                      <span className="text-sm">{tagItem.emoji}</span>
                      <span className="text-[11px] font-semibold">{tagItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="h-9 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-tactile-dark active:scale-95 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
