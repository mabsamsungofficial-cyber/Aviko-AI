import React, { useState, useMemo } from 'react';
import { X, Search, Check, Star, Tag, Edit2 } from 'lucide-react';
import { PREBUILT_VOICES, VOICE_CATEGORIES } from '../constants/voices';

const TAG_PRESETS = ['Narrator', 'Host', 'Lead', 'Expert', 'Villain', 'Friend'];

export default function VoicePickerModal({
  isOpen,
  onClose,
  selectedVoiceId,
  onSelectVoice,
  favorites = {},
  onToggleFavorite,
  onUpdateCharacterTag,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'favorites' | 'male' | 'female' | categoryId
  const [editingTagVoiceId, setEditingTagVoiceId] = useState(null);
  const [customTagInput, setCustomTagInput] = useState('');

  const starredCount = useMemo(() => {
    return Object.values(favorites).filter((f) => f?.starred).length;
  }, [favorites]);

  const filteredVoices = useMemo(() => {
    return PREBUILT_VOICES.filter((voice) => {
      // Filter
      if (activeFilter === 'favorites') {
        if (!favorites[voice.id]?.starred) return false;
      } else if (activeFilter === 'male') {
        if (voice.gender !== 'Male') return false;
      } else if (activeFilter === 'female') {
        if (voice.gender !== 'Female') return false;
      } else if (activeFilter !== 'all') {
        if (voice.category !== activeFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const customTag = (favorites[voice.id]?.tag || '').toLowerCase();
        const matchesName = voice.name.toLowerCase().includes(query);
        const matchesTone = voice.tone.toLowerCase().includes(query);
        const matchesBestFor = voice.bestFor.toLowerCase().includes(query);
        const matchesTag = customTag.includes(query);
        if (!matchesName && !matchesTone && !matchesBestFor && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, activeFilter, favorites]);

  const handleStartEditTag = (e, voiceId, currentTag) => {
    e.stopPropagation();
    setEditingTagVoiceId(voiceId);
    setCustomTagInput(currentTag || '');
  };

  const handleSaveTag = (e, voiceId) => {
    e.stopPropagation();
    onUpdateCharacterTag?.(voiceId, customTagInput.trim());
    setEditingTagVoiceId(null);
    setCustomTagInput('');
  };

  const handleApplyPresetTag = (e, voiceId, preset) => {
    e.stopPropagation();
    onUpdateCharacterTag?.(voiceId, preset);
    setEditingTagVoiceId(null);
    setCustomTagInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Container: Native Bottom Sheet on Mobile (<sm), Centered Fixed Modal on Desktop (sm+) */}
      <div className="w-full sm:max-w-3xl h-[86vh] sm:h-[560px] bg-white rounded-t-[28px] sm:rounded-[24px] shadow-level-3 border border-slate-200/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150">
        
        {/* Mobile Drag Indicator Bar */}
        <div className="pt-2.5 pb-1 sm:hidden flex justify-center shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Static Header */}
        <div className="h-13 sm:h-14 px-4 sm:px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Studio Voices</h2>
            <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
              ({filteredVoices.length})
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Controls (Visible ONLY on Mobile < sm) */}
        <div className="sm:hidden px-3 pt-2.5 pb-2.5 space-y-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
          {/* Search Box on Mobile - Pill Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by voice name or character..."
              className="w-full h-9 bg-white border border-slate-200/90 rounded-full pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus-ring-mint shadow-level-1 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Segmented Filter for Mobile (Chips styled like Styleguide) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-level-1'
                  : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
              }`}
            >
              All (30)
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('favorites')}
              className={`h-8 flex items-center gap-1 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                activeFilter === 'favorites'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-level-1'
                  : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Favorites {starredCount > 0 ? `(${starredCount})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('male')}
              className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                activeFilter === 'male'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-level-1'
                  : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
              }`}
            >
              Male
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('female')}
              className={`h-8 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                activeFilter === 'female'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-level-1'
                  : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
              }`}
            >
              Female
            </button>

            {VOICE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveFilter(cat.id)}
                className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                  activeFilter === cat.id
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-level-1'
                    : 'bg-white text-slate-600 border-slate-200/80 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Split View & Mobile Vertical Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Left Filter Sidebar (Hidden on Mobile) */}
          <aside className="hidden sm:flex w-52 bg-slate-50 border-r border-slate-100 flex-col p-3 overflow-y-auto no-scrollbar shrink-0 space-y-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                Library
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`w-full text-left px-3 h-8.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  activeFilter === 'all'
                    ? 'bg-white text-emerald-800 font-bold shadow-level-1 border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>All Voices</span>
                <span className="text-[10px] text-slate-400 font-normal">30</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('favorites')}
                className={`w-full text-left px-3 h-8.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  activeFilter === 'favorites'
                    ? 'bg-white text-amber-700 font-bold shadow-level-1 border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Star
                    className={`w-3 h-3 ${
                      activeFilter === 'favorites'
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>Favorites</span>
                </span>
                {starredCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-bold">
                    {starredCount}
                  </span>
                )}
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                Gender
              </span>
              <button
                type="button"
                onClick={() => setActiveFilter('male')}
                className={`w-full text-left px-3 h-8.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  activeFilter === 'male'
                    ? 'bg-white text-emerald-800 font-bold shadow-level-1 border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>Male</span>
                <span className="text-[10px] text-slate-400 font-normal">16</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('female')}
                className={`w-full text-left px-3 h-8.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                  activeFilter === 'female'
                    ? 'bg-white text-emerald-800 font-bold shadow-level-1 border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>Female</span>
                <span className="text-[10px] text-slate-400 font-normal">14</span>
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
                Categories
              </span>
              {VOICE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const active = activeFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveFilter(cat.id)}
                    className={`w-full text-left px-3 h-8 rounded-xl text-xs font-medium transition truncate block ${
                      active
                        ? 'bg-white text-emerald-800 font-bold shadow-level-1 border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Voice Grid Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Desktop Search Bar (Pill Input) */}
            <div className="hidden sm:block p-3 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search voices, tones, or character tags..."
                  className="w-full h-9 bg-slate-50 border border-slate-200/80 rounded-full pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus-ring-mint transition shadow-level-1 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Voice Cards Scroll Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2">
              {filteredVoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-xs text-slate-400">
                  {activeFilter === 'favorites'
                    ? 'No favorites starred yet. Click the star on any voice to save it here with a character tag.'
                    : 'No voices found matching your criteria.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredVoices.map((voice) => {
                    const isSelected = voice.id === selectedVoiceId;
                    const isStarred = !!favorites[voice.id]?.starred;
                    const characterTag = favorites[voice.id]?.tag || '';
                    const isEditingTag = editingTagVoiceId === voice.id;
                    const initials = voice.name.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={voice.id}
                        onClick={() => {
                          onSelectVoice(voice.id);
                          onClose();
                        }}
                        className={`text-left p-2.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2.5 active:scale-[0.99] h-[64px] shadow-level-1 ${
                          isSelected
                            ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400/40'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        {/* Left: Initials Avatar */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 tracking-wider ${
                            isSelected
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {initials}
                        </div>

                        {/* Middle: Name + Tags + Tone */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {voice.name}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {voice.gender}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/80">
                              {voice.bestFor}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mt-0.5">
                            <span className="truncate">{voice.tone}</span>
                            {characterTag && (
                              <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200 shrink-0">
                                {characterTag}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right: Star Button + Selection */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isStarred && (
                            <button
                              type="button"
                              onClick={(e) => handleStartEditTag(e, voice.id, characterTag)}
                              className="p-1 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                              title="Edit Character Tag"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite?.(voice.id);
                            }}
                            className="p-1 rounded-full text-slate-300 hover:text-amber-500 hover:bg-amber-50 transition"
                            title={isStarred ? 'Remove favorite' : 'Add favorite'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isStarred
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 hover:text-amber-400'
                              }`}
                            />
                          </button>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-0.5 shadow-2xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inline Tag Edit Popover Sheet */}
        {editingTagVoiceId && (
          <div
            className="p-3.5 bg-emerald-50/70 border-t border-emerald-100 flex flex-col gap-2 shrink-0 animate-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">
                Assign Character Tag to{' '}
                {PREBUILT_VOICES.find((v) => v.id === editingTagVoiceId)?.name}
              </span>
              <button
                type="button"
                onClick={() => setEditingTagVoiceId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                placeholder="e.g. Host, Narrator, Expert, Hero..."
                className="flex-1 h-8.5 bg-white border border-emerald-300 rounded-full px-3.5 text-xs text-slate-900 focus-ring-mint font-medium shadow-level-1"
              />
              <button
                type="button"
                onClick={(e) => handleSaveTag(e, editingTagVoiceId)}
                className="h-8.5 px-4 rounded-full bg-slate-900 text-white text-xs font-bold shadow-tactile-dark active:scale-95 transition"
              >
                Save
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {TAG_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={(e) => handleApplyPresetTag(e, editingTagVoiceId, p)}
                  className="h-6.5 px-2.5 rounded-full bg-white hover:bg-emerald-100/80 text-[10px] font-semibold text-emerald-900 border border-emerald-200/80 shadow-2xs transition active:scale-95"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="h-13 px-4 sm:px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600 truncate mr-2">
            Selected Voice:{' '}
            <span className="font-bold text-slate-900">
              {PREBUILT_VOICES.find((v) => v.id === selectedVoiceId)?.name || selectedVoiceId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-8.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0 shadow-tactile-dark active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
