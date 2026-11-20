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
    <footer className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-3 sm:px-6 py-3.5 sm:py-4 shadow-level-3">
      <div className="max-w-3xl mx-auto">
        {audioUrl ? (
          <div className="space-y-3">
            {/* Player Controls Bar */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-[22px] p-2.5 sm:px-4 sm:py-3 shadow-level-1">
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 hover:from-emerald-600 hover:to-teal-800 active:scale-95 text-white flex items-center justify-center shrink-0 transition shadow-tactile-primary cursor-pointer"
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
                  className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 tabular-nums mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={onDownload}
                className="h-11 px-4 sm:px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition shrink-0 active:scale-95 shadow-tactile-dark cursor-pointer"
                title="Download WAV"
              >
                <Download className="w-4 h-4" />
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

            {/* Quick Regenerate Button */}
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full h-11 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-level-1 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating New Audio...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Regenerate Audio</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Primary Full-width CTA with Styleguide Physics - Substantial, Thick & Tactile */
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full h-14 sm:h-[54px] rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60 text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition active:scale-[0.98] active:translate-y-0.5 shadow-tactile-primary border-t border-white/30 tracking-wide cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Studio Voiceover...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-emerald-100" />
                <span>Generate Voiceover</span>
              </>
            )}
          </button>
        )}
      </div>
    </footer>
  );
}
