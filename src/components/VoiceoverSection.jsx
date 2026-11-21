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
      {/* 1. HERO STUDIO VOICE CARD */}
      <div
        onClick={onOpenVoicePicker}
        className="w-full bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4 shadow-sm transition cursor-pointer active:scale-[0.99] group flex items-center justify-between gap-3.5"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar (Monochromatic Dark Pill) */}
          <div className="w-11 h-11 rounded-full bg-[#0F172A] text-white font-subtitle flex items-center justify-center shrink-0 shadow-sm tracking-wide">
            {voiceInitials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-h3 text-slate-900 tracking-tight">
                {activeVoice.name}
              </span>

              {/* Style Guide Outlined Pill Chips */}
              <span className="h-6 px-2.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center">
                {activeVoice.gender}
              </span>

              <span className="h-6 px-2.5 rounded-full text-[11px] font-medium bg-white text-slate-800 border border-slate-300 flex items-center">
                {activeVoice.bestFor}
              </span>

              {characterTag && (
                <span className="h-6 px-2.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{characterTag}</span>
                </span>
              )}
            </div>

            <p className="font-caption text-slate-500 truncate mt-0.5">
              {activeVoice.tone} · Tap to change voice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
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

          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-slate-100 text-slate-400 group-hover:text-slate-700 flex items-center justify-center transition">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. UNIFIED SETTINGS CARD: LANGUAGE & DELIVERY MOOD (SIDE-BY-SIDE + INPUT BELOW) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        {/* SIDE-BY-SIDE DROPDOWNS ROW */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* LEFT: LANGUAGE & ACCENT CUSTOM DROPDOWN */}
          <div className="relative" ref={langDropdownRef}>
            <label className="block font-subtitle text-slate-700 mb-1.5 truncate flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Language &amp; Accent</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsLangOpen(!isLangOpen);
                setIsMoodOpen(false);
              }}
              className="w-full h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 focus:border-slate-800 flex items-center justify-between font-body text-slate-900 shadow-sm transition active:scale-[0.99] outline-none"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-slate-900 truncate">{activeLangObj.label}</span>
                <span className="font-caption text-slate-400 truncate hidden sm:inline">
                  ({activeLangObj.accent})
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isLangOpen ? 'rotate-180 text-slate-900' : ''
                }`}
              />
            </button>

            {/* Language Popover Menu */}
            {isLangOpen && (
              <div className="absolute top-full left-0 w-64 sm:w-72 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
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
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-slate-900">{lang.label}</span>
                        <span className="font-caption text-slate-400 truncate">
                          ({lang.accent})
                        </span>
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-slate-900 stroke-[2.5] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: DELIVERY MOOD CUSTOM DROPDOWN */}
          <div className="relative" ref={moodDropdownRef}>
            <label className="block font-subtitle text-slate-700 mb-1.5 truncate flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Delivery Mood</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setIsMoodOpen(!isMoodOpen);
                setIsLangOpen(false);
              }}
              className="w-full h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 focus:border-slate-800 flex items-center justify-between font-body text-slate-900 shadow-sm transition active:scale-[0.99] outline-none"
            >
              <span className="font-semibold text-slate-900 truncate">
                {activePreset.label}
              </span>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  isMoodOpen ? 'rotate-180 text-slate-900' : ''
                }`}
              />
            </button>

            {/* Delivery Mood Popover Menu */}
            {isMoodOpen && (
              <div className="absolute top-full right-0 w-64 sm:w-72 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
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
                          ? 'bg-slate-100 text-slate-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {preset.label}
                      </span>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-slate-900 stroke-[2.5] shrink-0" />
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
            className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl px-3.5 font-body text-slate-900 placeholder:text-slate-400 transition outline-none shadow-sm"
          />
        </div>
      </div>

      {/* 3. SCRIPT NARRATION CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="font-h3 text-slate-900">
            Narration Script
          </span>

          <div className="flex items-center gap-2">
            <span className="font-caption px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 tabular-nums">
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
          className="w-full p-4 font-body-medium text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent"
        />

        {/* Collapsible Emotion / Vocal Tags Accessory Bar */}
        <div className="border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setIsVocalTagsOpen(!isVocalTagsOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/50 transition group"
          >
            <div className="flex items-center gap-2">
              <span className="font-subtitle text-slate-600 group-hover:text-slate-900 transition">
                Vocal Emotion Tags
              </span>
              <span className="font-caption px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">
                {VOCAL_TAGS.length} tags
              </span>
            </div>

            <div className="flex items-center gap-1 font-caption font-medium text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50 transition shadow-sm">
              <span>{isVocalTagsOpen ? 'Hide' : 'Add Emotions'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isVocalTagsOpen ? 'rotate-180 text-slate-900' : 'text-slate-400'
                }`}
              />
            </div>
          </button>

          {isVocalTagsOpen && (
            <div className="px-4 pb-3.5 pt-1 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center gap-1.5">
                {VOCAL_TAGS.map((tagItem) => (
                  <button
                    key={tagItem.tag}
                    type="button"
                    onClick={() => insertTag(tagItem.tag)}
                    className="h-8 px-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-caption transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                  >
                    <span className="text-sm">{tagItem.emoji}</span>
                    <span className="font-medium">{tagItem.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. FULLSCREEN SCRIPT EDITOR MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-3 sm:p-6 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150">
          <div className="w-full max-w-4xl h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-level-3 flex flex-col overflow-hidden">
            {/* Fullscreen Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="font-h3 text-slate-900">
                  Narration Script
                </span>
                <span className="font-caption font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                  Full Screen Editor
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="font-caption px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 tabular-nums">
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
                className="w-full h-full min-h-[300px] font-body-medium text-base sm:text-lg leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent"
              />
            </div>

            {/* Fullscreen Vocal Tags Dock */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-caption font-semibold text-slate-500 uppercase tracking-wider">
                  Vocal Tags:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {VOCAL_TAGS.map((tagItem) => (
                    <button
                      key={tagItem.tag}
                      type="button"
                      onClick={() => insertTag(tagItem.tag)}
                      className="h-8 px-3 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-caption transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <span className="text-sm">{tagItem.emoji}</span>
                      <span className="font-medium">{tagItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="h-9 px-5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-subtitle text-xs shadow-tactile-dark active:scale-95 transition"
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
