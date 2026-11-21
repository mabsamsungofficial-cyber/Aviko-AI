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
  Cpu,
  ExternalLink,
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
      onToast?.('Master Key Activated');
    } else {
      setPinError('Incorrect 6-Digit PIN');
    }
  };

  // Auto-verify when 6 digits are typed
  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinInput(val);
    setPinError('');
    if (val.length === 6) {
      if (val === SECURITY_CONFIG.masterPin) {
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
        onToast?.('Master Key Activated');
      } else {
        setPinError('Incorrect 6-Digit PIN');
      }
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

  // Close modal and guarantee settings persistence
  const handleCloseAndSave = () => {
    const cleanedKey = (draftSettings.apiKey || '').trim();
    const updated = {
      ...draftSettings,
      apiKey: cleanedKey,
      provider: cleanedKey.startsWith('AQ.') ? 'vertex_express' : 'aistudio',
    };
    onSaveSettings(updated);
    onClose();
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
    const chosen = TTS_MODELS.find((m) => m.id === modelId);
    onToast?.(`TTS: ${chosen?.name || modelId}`);
  };

  const handleSelectTextModel = (modelId) => {
    const updated = { ...draftSettings, textModel: modelId };
    setDraftSettings(updated);
    onSaveSettings(updated);
    setIsTextOpen(false);
    const chosen = TEXT_MODELS.find((m) => m.id === modelId);
    onToast?.(`Script Model: ${chosen?.name || modelId}`);
  };

  if (!isOpen) return null;

  const activeTtsObj =
    TTS_MODELS.find((m) => m.id === draftSettings.model) || TTS_MODELS[0];
  const activeTextObj =
    TEXT_MODELS.find((m) => m.id === draftSettings.textModel) || TEXT_MODELS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg sm:max-w-xl bg-white border border-slate-200/90 rounded-3xl shadow-level-3 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-sm">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-h3 text-slate-900 leading-tight">
                Settings
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Key Security Badge / Toggle (Outlined Pill) */}
            {isMasterActive ? (
              <button
                type="button"
                onClick={handleLockMasterKey}
                className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-subtitle text-xs transition active:scale-95"
                title="Master Key is Active. Click to lock."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Master</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPinPromptOpen(!isPinPromptOpen)}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-full font-subtitle text-xs border transition active:scale-95 ${
                  isPinPromptOpen
                    ? 'bg-[#0F172A] text-white border-[#0F172A]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                }`}
                title="Enter 6-digit Owner PIN to unlock Master Key"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>PIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseAndSave}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-90"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto no-scrollbar flex-1 bg-[#FAFAFA] pb-28">

          {/* 1. ELEGANT OWNER PIN DRAWER */}
          {isPinPromptOpen && !isMasterActive && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-subtitle text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-700" />
                    <span>PIN Access</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinPromptOpen(false);
                    setPinError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleVerifyPin} className="flex items-center gap-2 w-full">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  value={pinInput}
                  onChange={handlePinChange}
                  placeholder="••••••"
                  className="flex-1 min-w-0 w-full h-10 bg-white border border-slate-300 focus:border-slate-800 rounded-xl px-3 text-center text-lg font-mono font-bold tracking-[0.3em] text-slate-900 outline-none shadow-sm"
                />

                <button
                  type="submit"
                  disabled={pinInput.length !== 6}
                  className="h-10 px-4 rounded-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white font-subtitle text-xs shadow-sm transition active:scale-95 shrink-0"
                >
                  Unlock
                </button>
              </form>

              {pinError && (
                <p className="font-caption font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>
          )}

          {/* 2. GEMINI API KEY CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-subtitle text-slate-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-600" />
                <span>API Key</span>
              </span>

              <div className="flex items-center gap-2">
                {draftSettings.apiKey && (
                  <button
                    type="button"
                    onClick={handleVerifyApi}
                    disabled={verifyState.status === 'checking'}
                    className="h-8 px-3 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-subtitle text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${verifyState.status === 'checking' ? 'animate-spin' : ''}`}
                    />
                    <span>{verifyState.status === 'checking' ? 'Testing...' : 'Test'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={draftSettings.apiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  const updated = {
                    ...draftSettings,
                    apiKey: val,
                    provider: val.startsWith('AQ.') ? 'vertex_express' : 'aistudio',
                  };
                  setDraftSettings(updated);
                  onSaveSettings(updated);
                }}
                placeholder="Paste API Key..."
                className="w-full h-10 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-800 rounded-xl pl-3.5 pr-10 font-mono text-xs text-slate-900 transition shadow-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Verification Alert */}
            {verifyState.message && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-caption border animate-in fade-in duration-150 ${
                  verifyState.status === 'verified'
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : verifyState.status === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {verifyState.status === 'verified' && (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                {verifyState.status === 'error' && (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                )}
                {verifyState.status === 'checking' && (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0 text-slate-500" />
                )}
                <span className="truncate font-medium">{verifyState.message}</span>
              </div>
            )}

            {/* Status Row inside card */}
            <div className="flex items-center justify-between font-caption pt-0.5">
              {isMasterActive ? (
                <span className="font-medium text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Master Active</span>
                </span>
              ) : draftSettings.apiKey ? (
                <span className="text-slate-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-slate-700" />
                  <span>Saved</span>
                </span>
              ) : (
                <span className="text-slate-400">
                  Enter key or use PIN
                </span>
              )}

              {draftSettings.apiKey && (
                <button
                  type="button"
                  onClick={handleLockMasterKey}
                  className="font-semibold text-rose-600 hover:text-rose-700 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 3. AI MODELS (FULL-WIDTH DROPDOWNS - ZERO OVERFLOW) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5">
            <span className="font-subtitle text-slate-900 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-600" />
              <span>AI Models</span>
            </span>

            {/* Voice Model (TTS) Dropdown */}
            <div className="relative" ref={ttsDropdownRef}>
              <label className="block font-subtitle text-xs text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Voice Model (TTS)</span>
                </span>
                {activeTtsObj.badge && (
                  <span className="font-caption text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {activeTtsObj.badge}
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsTtsOpen(!isTtsOpen);
                  setIsTextOpen(false);
                }}
                className={`w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border flex items-center justify-between text-left transition shadow-sm active:scale-[0.99] outline-none cursor-pointer ${
                  isTtsOpen
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-subtitle text-xs text-slate-900 font-semibold truncate">
                    {activeTtsObj.name}
                  </p>
                  <p className="font-caption text-slate-500 text-[11px] mt-0.5 truncate">
                    {activeTtsObj.desc}
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                    isTtsOpen ? 'rotate-180 text-slate-900' : ''
                  }`}
                />
              </button>

              {/* Full-Width Dropdown Popover */}
              {isTtsOpen && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  {TTS_MODELS.map((m) => {
                    const isSelected = draftSettings.model === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectTtsModel(m.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-subtitle text-xs text-slate-900 font-semibold">
                              {m.name}
                            </span>
                            {m.badge && (
                              <span className="font-caption text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-caption text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                            {m.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-900 stroke-[2.5] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Script Model Dropdown */}
            <div className="relative pt-1 border-t border-slate-100" ref={textDropdownRef}>
              <label className="block font-subtitle text-xs text-slate-700 mb-1.5 pt-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Script Model</span>
                </span>
                {activeTextObj.badge && (
                  <span className="font-caption text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {activeTextObj.badge}
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsTextOpen(!isTextOpen);
                  setIsTtsOpen(false);
                }}
                className={`w-full p-3 rounded-2xl bg-white hover:bg-slate-50 border flex items-center justify-between text-left transition shadow-sm active:scale-[0.99] outline-none cursor-pointer ${
                  isTextOpen
                    ? 'border-slate-900 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="font-subtitle text-xs text-slate-900 font-semibold truncate">
                    {activeTextObj.name}
                  </p>
                  <p className="font-caption text-slate-500 text-[11px] mt-0.5 truncate">
                    {activeTextObj.desc}
                  </p>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
                    isTextOpen ? 'rotate-180 text-slate-900' : ''
                  }`}
                />
              </button>

              {/* Full-Width Dropdown Popover */}
              {isTextOpen && (
                <div className="absolute top-full left-0 right-0 w-full mt-1.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  {TEXT_MODELS.map((m) => {
                    const isSelected = draftSettings.textModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectTextModel(m.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 text-slate-900 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-subtitle text-xs text-slate-900 font-semibold">
                              {m.name}
                            </span>
                            {m.badge && (
                              <span className="font-caption text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="font-caption text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                            {m.desc}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-slate-900 stroke-[2.5] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="font-subtitle text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition"
          >
            <span>Get API Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleCloseAndSave}
            className="h-9.5 px-6 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-subtitle text-xs transition shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  );
}
