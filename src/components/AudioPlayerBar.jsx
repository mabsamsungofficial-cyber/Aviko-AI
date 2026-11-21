import React from 'react';
import { Play, Pause, Download, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { formatTime } from '../utils/audio';

export default function AudioPlayerBar({
  audioUrl,
  isPlaying,
  currentTime,
  duration,
  isGenerating,
  onTogglePlay,
  onSeek,
  onDownload,
  onGenerate,
  audioRef,
  setCurrentTime,
  setDuration,
  setIsPlaying,
  activeVoiceName,
  activeModelName,
}) {
  return (
    <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-level-3">
      <div className="max-w-3xl mx-auto">
        {audioUrl ? (
          <div className="space-y-3">
            {/* Player Controls Bar */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-sm">
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-11 h-11 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:bg-black active:scale-95 text-white flex items-center justify-center shrink-0 transition shadow-sm cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              {/* Progress Slider */}
              <div className="flex-1 flex flex-col justify-center min-w-0 px-1">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.05}
                  value={currentTime}
                  onChange={onSeek}
                  className="w-full accent-[#0F172A] h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between items-center font-caption text-slate-500 tabular-nums mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Download Outlined Button */}
              <button
                type="button"
                onClick={onDownload}
                className="h-10 px-4 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-subtitle flex items-center gap-1.5 transition shrink-0 active:scale-95 shadow-sm cursor-pointer"
                title="Download WAV"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Save WAV</span>
              </button>

              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={() =>
                  audioRef.current && setCurrentTime(audioRef.current.currentTime)
                }
                onLoadedMetadata={() =>
                  audioRef.current && setDuration(audioRef.current.duration)
                }
                onEnded={() => setIsPlaying(false)}
              />
            </div>

            {/* Quick Regenerate Outlined Pill Button */}
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full h-11 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-subtitle flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-sm cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                  <span>Generating New Audio...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-600" />
                  <span>Regenerate Audio</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Primary Full-width CTA - 02 Style Guide Filled Pill (56px Height / #0F172A) */
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full h-14 rounded-full bg-[#0F172A] hover:bg-[#1E293B] active:bg-black active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-subtitle text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-tactile-dark cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                <span>Generating Studio Voiceover...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-200" />
                <span>Generate Voiceover</span>
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
}
