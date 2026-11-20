import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Key,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { SECURITY_CONFIG } from '../constants/securityConfig';
import { TEXT_MODELS, TTS_MODELS } from '../constants/options';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onToast,
}) {
  const [draftSettings, setDraftSettings] = useState(settings);
  const [isPinPromptOpen, setIsPinPromptOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Custom Dropdowns State
  const [isTtsOpen, setIsTtsOpen] = useState(false);
  const [isTextOpen, setIsTextOpen] = useState(false);
  const ttsDropdownRef = useRef(null);
  const textDropdownRef = useRef(null);

  const [verifyState, setVerifyState] = useState({
    status: 'idle',
    message: '',
  });

  // Sync draft settings when opened
  useEffect(() => {
    if (isOpen) {
      setDraftSettings(settings);
      setIsPinPromptOpen(false);
      setPinInput('');
      setPinError('');
      setVerifyState({ status: 'idle', message: '' });
      setIsTtsOpen(false);
      setIsTextOpen(false);
    }
  }, [isOpen, settings]);

  // Click outside to close custom dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (ttsDropdownRef.current && !ttsDropdownRef.current.contains(event.target)) {
        setIsTtsOpen(false);
      }
      if (textDropdownRef.current && !textDropdownRef.current.contains(event.target)) {
        setIsTextOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const isMasterActive =
    !!draftSettings.apiKey && draftSettings.apiKey === SECURITY_CONFIG.masterKey;

  // 6-Digit PIN Verification & Master Key Injection
  const handleVerifyPin = (e) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === SECURITY_CONFIG.masterPin) {
      const updated = {
        ...draftSettings,
        apiKey: SECURITY_CONFIG.masterKey,
        provider: 'aistudio',
      };
      setDraftSettings(updated);
      onSaveSettings(updated);
      setPinError('');
      setPinInput('');
      setIsPinPromptOpen(false);
      onToast?.('Master Key Activated!');
    } else {
      setPinError('Incorrect PIN');
    }
  };

  // Lock / Clear Master Key
  const handleLockMasterKey = () => {
    const updated = {
      ...draftSettings,
      apiKey: '',
    };
    setDraftSettings(updated);
    onSaveSettings(updated);
    setPinInput('');
    setPinError('');
    setIsPinPromptOpen(false);
    onToast?.('Master Key Locked');
  };

  // Save Custom Key entered by user
  const handleSaveCustomKey = () => {
    const cleanedKey = draftSettings.apiKey.trim();
    const updated = {
      ...draftSettings,
      apiKey: cleanedKey,
      provider: cleanedKey.startsWith('AQ.') ? 'vertex_express' : 'aistudio',
    };
    onSaveSettings(updated);
    onToast?.(cleanedKey ? 'API Key saved' : 'Key cleared');
  };

  // Verify Key with Google API
  const handleVerifyApi = async () => {
    const key = (draftSettings.apiKey || '').trim();
    if (!key) {
      setVerifyState({ status: 'error', message: 'Enter your API key first.' });
      return;
    }

    setVerifyState({ status: 'checking', message: 'Verifying with Google API...' });

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        {
          method: 'GET',
          headers: { 'x-goog-api-key': key },
        }
      );
      if (res.ok) {
        setVerifyState({ status: 'verified', message: 'API Key Active & Verified' });
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
        message: e?.message || 'Verification failed. Check network or key.',
      });
    }
  };

  // Model updates with auto-save
  const handleSelectTtsModel = (modelId) => {
    const updated = { ...draftSettings, model: modelId };
    setDraftSettings(updated);
    onSaveSettings(updated);
    setIsTtsOpen(false);
    onToast?.(`TTS Model: ${modelId}`);
  };

  const handleSelectTextModel = (modelId) => {
    const updated = { ...draftSettings, textModel: modelId };
    setDraftSettings(updated);
    onSaveSettings(updated);
    setIsTextOpen(false);
    onToast?.('Story Model updated');
  };

  if (!isOpen) return null;

  const activeTtsObj =
    TTS_MODELS.find((m) => m.id === draftSettings.model) || TTS_MODELS[0];
  const activeTextObj =
    TEXT_MODELS.find((m) => m.id === draftSettings.textModel) || TEXT_MODELS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md sm:max-w-lg bg-white border border-slate-200/80 rounded-[24px] shadow-level-3 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Key className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">API Settings</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Discrete Lock Icon Button in Header */}
            {!isMasterActive ? (
              <button
                type="button"
                onClick={() => setIsPinPromptOpen(!isPinPromptOpen)}
                className={`p-1.5 rounded-full transition active:scale-95 ${
                  isPinPromptOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Unlock with Owner PIN"
              >
                <Lock className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLockMasterKey}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 text-[10px] font-bold transition active:scale-95"
                title="Click to lock master key"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Master Active</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto no-scrollbar flex-1 bg-[#F9FAFB]/50">

          {/* 1. CLEAN PIN PROMPT (Only appears when Lock icon is clicked!) */}
          {isPinPromptOpen && !isMasterActive && (
            <div className="bg-white border border-emerald-200/90 rounded-2xl p-3 shadow-level-1 animate-in fade-in zoom-in-95 duration-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Enter 6-Digit PIN</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinPromptOpen(false);
                    setPinError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleVerifyPin} className="flex items-center gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPinInput(val);
                    setPinError('');
                  }}
                  placeholder="••••••"
                  className="flex-1 h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-sm font-mono font-bold tracking-[0.3em] text-slate-900 focus-ring-mint transition"
                />

                <button
                  type="submit"
                  disabled={pinInput.length !== 6}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 text-white text-xs font-bold shadow-tactile-primary transition active:scale-95 shrink-0"
                >
                  Unlock
                </button>
              </form>

              {pinError && (
                <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>
          )}

          {/* 2. GEMINI API KEY CARD (Compact, Clean, Zero-Clutter) */}
          <div className="bg-white border border-slate-200/80 rounded-[20px] p-3.5 sm:p-4 shadow-level-1 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <span>Gemini API Key</span>
              </label>

              <div className="flex items-center gap-2">
                {/* Lock icon next to label too, for easy discovery */}
                {!isMasterActive && !isPinPromptOpen && (
                  <button
                    type="button"
                    onClick={() => setIsPinPromptOpen(true)}
                    className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition"
                    title="Unlock with PIN"
                  >
                    <Lock className="w-3 h-3" />
                    <span>PIN</span>
                  </button>
                )}

                {draftSettings.apiKey && (
                  <button
                    type="button"
                    onClick={handleVerifyApi}
                    disabled={verifyState.status === 'checking'}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${verifyState.status === 'checking' ? 'animate-spin' : ''}`}
                    />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draftSettings.apiKey}
                onChange={(e) =>
                  setDraftSettings({ ...draftSettings, apiKey: e.target.value })
                }
                placeholder="AIza... or paste Gemini API key"
                className="w-full h-10 bg-slate-50/90 border border-slate-200/80 rounded-xl pl-3 pr-10 text-xs font-mono text-slate-900 focus-ring-mint transition shadow-level-1 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {verifyState.message && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border ${
                  verifyState.status === 'verified'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : verifyState.status === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {verifyState.status === 'verified' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />}
                {verifyState.status === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />}
                {verifyState.status === 'checking' && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                <span className="truncate font-semibold">{verifyState.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              {draftSettings.apiKey ? (
                <button
                  type="button"
                  onClick={handleLockMasterKey}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Clear Key
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Key saved locally</span>
              )}

              <button
                type="button"
                onClick={handleSaveCustomKey}
                className="h-8 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-tactile-dark active:scale-95 transition"
              >
                Save Key
              </button>
            </div>
          </div>

          {/* 3. AI MODELS SELECTION (SIDE-BY-SIDE CLEAN DROPDOWNS) */}
          <div className="bg-white border border-slate-200/80 rounded-[20px] p-3.5 sm:p-4 shadow-level-1 space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
              AI Models
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {/* TTS Model Custom Dropdown */}
              <div className="relative" ref={ttsDropdownRef}>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3 text-slate-400" />
                  <span>TTS Voice Model</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsTtsOpen(!isTtsOpen);
                    setIsTextOpen(false);
                  }}
                  className="w-full h-9.5 px-3 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-800 shadow-level-1 transition active:scale-[0.99] focus:outline-none focus:border-emerald-500"
                >
                  <span className="font-bold text-slate-900 truncate">{activeTtsObj.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                      isTtsOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {/* TTS Dropdown Popover Menu */}
                {isTtsOpen && (
                  <div className="absolute top-full left-0 right-0 sm:left-0 sm:right-auto sm:w-60 mt-1.5 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    {TTS_MODELS.map((m) => {
                      const isSelected = draftSettings.model === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectTtsModel(m.id)}
                          className={`w-full h-8.5 px-3 rounded-xl text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-100'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 truncate">{m.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Story Model Custom Dropdown */}
              <div className="relative" ref={textDropdownRef}>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span>Script & Story Model</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsTextOpen(!isTextOpen);
                    setIsTtsOpen(false);
                  }}
                  className="w-full h-9.5 px-3 rounded-xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-800 shadow-level-1 transition active:scale-[0.99] focus:outline-none focus:border-emerald-500"
                >
                  <span className="font-bold text-slate-900 truncate">{activeTextObj.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                      isTextOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {/* Story Dropdown Popover Menu */}
                {isTextOpen && (
                  <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-64 mt-1.5 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    {TEXT_MODELS.map((m) => {
                      const isSelected = draftSettings.textModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectTextModel(m.id)}
                          className={`w-full h-8.5 px-3 rounded-xl text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-100'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 truncate">{m.label}</span>
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
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-tactile-dark active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
