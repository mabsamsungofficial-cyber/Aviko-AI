import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Globe,
  Sparkles,
  FileText,
  Smartphone,
  Monitor,
  ShieldCheck,
  ExternalLink,
  Video,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { FORMAT_OPTIONS, LANGUAGE_OPTIONS } from '../constants/options';

export default function ResearchSection({
  topicInput,
  setTopicInput,
  videoFormat,
  setVideoFormat,
  language,
  setLanguage,
  ideas,
  selectedIdeaId,
  setSelectedIdeaId,
  isLoadingIdeas,
  isLoadingStory,
  onGenerateIdeas,
  onDirectTopicScript,
  onGenerateStoryScript,
  verifiedFacts,
  searchSources,
  searchGrounded,
  geminiVideoScript,
  setGeminiVideoScript,
  voiceoverNarration,
  setVoiceoverNarration,
  youtubeTitles,
  thumbnailText,
  copiedVideoScript,
  copiedNarration,
  onCopyText,
  onSendToVoiceover,
}) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const activeLangObj =
    LANGUAGE_OPTIONS.find((l) => l.id === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search & Topic Research Box */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="font-subtitle text-slate-800 tracking-tight uppercase">
            Topic Research &amp; Trends
          </span>

          {/* Format Selector: 9:16 vs 16:9 - Segmented Pill Control */}
          <div className="inline-flex items-center bg-slate-100 border border-slate-200 rounded-full p-1">
            {FORMAT_OPTIONS.map((fmt) => {
              const active = videoFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setVideoFormat(fmt.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full font-subtitle text-xs transition ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {fmt.id === '9:16' ? (
                    <Smartphone className="w-3.5 h-3.5" />
                  ) : (
                    <Monitor className="w-3.5 h-3.5" />
                  )}
                  <span>{fmt.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Input Box */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Enter topic (e.g. Zepto dark stores) or leave blank for trends..."
              className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 rounded-xl pl-9 pr-9 font-body text-slate-900 placeholder:text-slate-400 transition outline-none shadow-sm"
            />
            {topicInput && (
              <button
                type="button"
                onClick={() => setTopicInput('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                title="Clear topic"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Script Language Custom Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <label className="block font-subtitle text-slate-700 mb-1.5 truncate flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Script Language</span>
            </label>

            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="w-full sm:w-72 h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 focus:border-slate-800 flex items-center justify-between font-body text-slate-900 shadow-sm transition active:scale-[0.99] outline-none"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-semibold text-slate-900 truncate">{activeLangObj.label}</span>
                <span className="font-caption text-slate-400 truncate">
                  ({activeLangObj.accent})
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                  isLangOpen ? 'rotate-180 text-slate-900' : ''
                }`}
              />
            </button>

            {/* Language Popover Menu */}
            {isLangOpen && (
              <div className="absolute top-full left-0 w-72 mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onGenerateIdeas}
              disabled={isLoadingIdeas || isLoadingStory}
              className="h-10 px-4 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-subtitle text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm cursor-pointer disabled:opacity-40"
            >
              {isLoadingIdeas ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                  <span>Searching Trends...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                  <span>Generate Ideas</span>
                </>
              )}
            </button>

            {topicInput.trim() && (
              <button
                type="button"
                onClick={onDirectTopicScript}
                disabled={isLoadingStory || isLoadingIdeas}
                className="h-10 px-5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:bg-black disabled:opacity-40 text-white font-subtitle text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {isLoadingStory ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
                    <span>Writing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-200" />
                    <span>Write Script</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Ideas List */}
        {ideas.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-1 gap-2">
              {ideas.map((idea) => {
                const isSelected = idea.id === selectedIdeaId;
                return (
                  <button
                    key={idea.id}
                    type="button"
                    onClick={() => setSelectedIdeaId(idea.id)}
                    className={`text-left p-3.5 rounded-xl border transition active:scale-[0.99] ${
                      isSelected
                        ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-subtitle text-slate-900">
                        {idea.id}. {idea.title}
                      </span>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#0F172A] text-white font-caption font-semibold shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                    {idea.trend_angle && (
                      <p className="font-caption font-semibold text-slate-700 mb-1">
                        {idea.trend_angle}
                      </p>
                    )}
                    <p className="font-caption text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-800">Mechanism:</span>{' '}
                      {idea.core_process || idea.core_problem} ·{' '}
                      <span className="font-semibold text-slate-800">Hook:</span>{' '}
                      {idea.fact_hook || idea.monetization}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onGenerateStoryScript}
                disabled={isLoadingStory || !selectedIdeaId}
                className="h-10 px-5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white font-subtitle text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95 cursor-pointer"
              >
                {isLoadingStory ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
                    <span>Fact-Checking &amp; Writing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5 text-slate-200" />
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
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="font-subtitle text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Facts</span>
            </span>
            {searchGrounded && (
              <span className="font-caption font-semibold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                Google Grounded
              </span>
            )}
          </div>

          {verifiedFacts.length > 0 && (
            <ul className="space-y-1 font-body text-slate-700 list-disc pl-4 leading-relaxed">
              {verifiedFacts.map((fact, idx) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          )}

          {searchSources.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {searchSources.slice(0, 4).map((src, idx) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 font-caption text-slate-700 hover:bg-slate-100 transition max-w-[200px] truncate shadow-sm"
                >
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{src.title}</span>
                </a>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Script Box 1: Gemini Video Script */}
      {geminiVideoScript && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-slate-600" />
              <span className="font-subtitle text-slate-900">
                1. Gemini Video Script ({videoFormat})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyText(geminiVideoScript, 'video')}
              className="h-8 px-3 rounded-full border border-slate-300 bg-white hover:bg-slate-50 font-subtitle text-xs text-slate-700 flex items-center gap-1 transition shadow-sm active:scale-95"
            >
              {copiedVideoScript ? (
                <>
                  <Check className="w-3.5 h-3.5 text-slate-900" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Script</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={7}
            value={geminiVideoScript}
            onChange={(e) => setGeminiVideoScript(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800 resize-none shadow-sm"
          />
        </section>
      )}

      {/* Script Box 2: Clean Voiceover Narration */}
      {voiceoverNarration && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-slate-600" />
              <span className="font-subtitle text-slate-900">
                2. Spoken Narration
              </span>
              <span className="font-caption px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 tabular-nums">
                {voiceoverNarration.trim().split(/\s+/).filter(Boolean).length} words · ~{Math.round((voiceoverNarration.trim().split(/\s+/).filter(Boolean).length / 140) * 60)}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onCopyText(voiceoverNarration, 'narration')}
                className="h-8 px-3 rounded-full border border-slate-300 bg-white hover:bg-slate-50 font-subtitle text-xs text-slate-700 flex items-center gap-1 transition shadow-sm active:scale-95"
              >
                {copiedNarration ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-900" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onSendToVoiceover}
                className="h-8.5 px-4 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-subtitle text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
              >
                <span>Send to Voiceover</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={voiceoverNarration}
            onChange={(e) => setVoiceoverNarration(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 font-body-medium text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 resize-none shadow-sm"
          />
        </section>
      )}

      {/* Titles & Thumbnail Hook */}
      {(youtubeTitles.length > 0 || thumbnailText) && (
        <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-2.5">
          <span className="font-subtitle text-slate-800 uppercase tracking-wide block">
            3. Titles &amp; Thumbnail Hook
          </span>
          {thumbnailText && (
            <div className="font-body text-slate-700">
              <span className="font-semibold text-slate-900">Hook:</span>{' '}
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-900 font-semibold border border-slate-200">{thumbnailText}</span>
            </div>
          )}
          {youtubeTitles.length > 0 && (
            <ul className="space-y-1 font-body text-slate-700 list-disc pl-4">
              {youtubeTitles.map((t, idx) => (
                <li key={idx}>{t}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
