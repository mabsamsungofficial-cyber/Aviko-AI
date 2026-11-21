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
      <div className="w-full max-w-lg sm:max-w-xl bg-white border border-slate-200/90 rounded-[28px] shadow-level-3 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                API & Model Settings
              </h3>
              <p className="text-[11px] font-medium text-slate-400 leading-tight">
                Manage Gemini API access & AI models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Master Key Security Badge / Toggle */}
            {isMasterActive ? (
              <button
                type="button"
                onClick={handleLockMasterKey}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 text-xs font-bold transition active:scale-95"
                title="Master Key is Active. Click to lock."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Master Active</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPinPromptOpen(!isPinPromptOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition active:scale-95 ${
                  isPinPromptOpen
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200/90'
                }`}
                title="Enter 6-digit Owner PIN to unlock Master Key"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Owner PIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseAndSave}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition active:scale-90"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto no-scrollbar flex-1 bg-[#F9FAFB]/60 pb-28">

          {/* 1. ELEGANT OWNER PIN DRAWER */}
          {isPinPromptOpen && !isMasterActive && (
            <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200 rounded-[22px] p-3.5 sm:p-4 shadow-level-1 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Owner Master Access</span>
                  </span>
                  <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                    Enter your 6-digit secret PIN to unlock the master engine
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinPromptOpen(false);
                    setPinError('');
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-emerald-100/50 transition"
                >
                  <X className="w-4 h-4" />
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
                  onChange={handlePinChange}
                  placeholder="••••••"
                  className="flex-1 h-11 bg-white border border-emerald-200 rounded-xl px-4 text-center text-lg font-mono font-bold tracking-[0.4em] text-slate-900 focus-ring-mint transition shadow-sm"
                />

                <button
                  type="submit"
                  disabled={pinInput.length !== 6}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white text-xs font-bold shadow-tactile-primary transition active:scale-95 shrink-0"
                >
                  Unlock
                </button>
              </form>

              {pinError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pinError}</span>
                </p>
              )}
            </div>
          )}

          {/* 2. GEMINI API KEY CARD */}
          <div className="bg-white border border-slate-200/90 rounded-[22px] p-3.5 sm:p-4 shadow-level-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gemini API Key</span>
              </span>

              <div className="flex items-center gap-2">
                {draftSettings.apiKey && (
                  <button
                    type="button"
                    onClick={handleVerifyApi}
                    disabled={verifyState.status === 'checking'}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition active:scale-95"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${verifyState.status === 'checking' ? 'animate-spin' : ''}`}
                    />
                    <span>{verifyState.status === 'checking' ? 'Testing...' : 'Test Key'}</span>
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
                placeholder="AIza... or paste your Gemini API key"
                className="w-full h-11 bg-slate-50/90 border border-slate-200/90 rounded-xl pl-3.5 pr-10 text-xs font-mono font-medium text-slate-900 focus-ring-mint transition shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Verification Alert */}
            {verifyState.message && (
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border animate-in fade-in duration-150 ${
                  verifyState.status === 'verified'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
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
                <span className="truncate font-semibold">{verifyState.message}</span>
              </div>
            )}

            {/* Status Row inside card */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              {isMasterActive ? (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Master Key Active & Ready</span>
                </span>
              ) : draftSettings.apiKey ? (
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved in local storage</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Enter key above or click Owner PIN
                </span>
              )}

              {draftSettings.apiKey && (
                <button
                  type="button"
                  onClick={handleLockMasterKey}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
                >
                  Clear Key
                </button>
              )}
            </div>
          </div>

          {/* 3. AI ENGINE MODELS (SIDE-BY-SIDE TACTILE CARDS) */}
          <div className="bg-white border border-slate-200/90 rounded-[22px] p-3.5 sm:p-4 shadow-level-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Engine Models</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Instant sync
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {/* TTS Model Dropdown */}
              <div className="relative" ref={ttsDropdownRef}>
                <label className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>TTS Voice Model</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800">
                    {activeTtsObj.badge || 'Voice'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsTtsOpen(!isTtsOpen);
                    setIsTextOpen(false);
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border flex items-center justify-between text-left transition shadow-sm active:scale-[0.99] focus:outline-none ${
                    isTtsOpen
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activeTtsObj.name || activeTtsObj.label}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {activeTtsObj.id}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isTtsOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {/* TTS Popover */}
                {isTtsOpen && (
                  <div className="absolute top-full left-0 right-0 sm:left-0 sm:right-auto sm:w-72 mt-1.5 z-50 bg-white border border-slate-200/95 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select TTS Voice Model
                    </div>
                    {TTS_MODELS.map((m) => {
                      const isSelected = draftSettings.model === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectTtsModel(m.id)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between transition ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80 shadow-sm'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {m.name || m.label}
                              </span>
                              {m.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 shrink-0">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                              {m.desc || m.id}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5] shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Story Model Dropdown */}
              <div className="relative" ref={textDropdownRef}>
                <label className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    <span>Script & Story Model</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-teal-100/70 text-teal-800">
                    {activeTextObj.badge || 'Script'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setIsTextOpen(!isTextOpen);
                    setIsTtsOpen(false);
                  }}
                  className={`w-full h-11 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border flex items-center justify-between text-left transition shadow-sm active:scale-[0.99] focus:outline-none ${
                    isTextOpen
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activeTextObj.name || activeTextObj.label}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">
                      {activeTextObj.id}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isTextOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {/* Story Popover */}
                {isTextOpen && (
                  <div className="absolute top-full right-0 left-0 sm:left-auto sm:right-0 sm:w-76 mt-1.5 z-50 bg-white border border-slate-200/95 rounded-2xl shadow-level-3 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Select Script & Story Model
                    </div>
                    {TEXT_MODELS.map((m) => {
                      const isSelected = draftSettings.textModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleSelectTextModel(m.id)}
                          className={`w-full p-2.5 rounded-xl text-left flex items-start justify-between transition ${
                            isSelected
                              ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200/80 shadow-sm'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {m.name || m.label}
                              </span>
                              {m.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 shrink-0">
                                  {m.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                              {m.desc || m.id}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-teal-600 stroke-[2.5] shrink-0 mt-0.5" />
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
        <div className="px-5 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            <span>Get Free Gemini Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={handleCloseAndSave}
            className="h-9.5 px-6 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-tactile-dark active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Done</span>
          </button>
        </div>

      </div>
    </div>
  );
}
