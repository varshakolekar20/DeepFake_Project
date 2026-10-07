import React, { useState } from 'react';
import { Film, AlertTriangle, Clock, ZoomIn, ShieldAlert, CheckCircle2, Eye } from 'lucide-react';

export default function VideoTimeline({ timeline, suspiciousFrames, durationSeconds, coveragePct, onSeekTimestamp }) {
  const [selectedFrame, setSelectedFrame] = useState(null);

  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Film className="w-4 h-4 text-teal-500" />
            <span>Temporal Sampling Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {timeline.length} sampled timestamps across {durationSeconds}s duration ({coveragePct}% facial coverage)
          </p>
        </div>

        {suspiciousFrames && suspiciousFrames.length > 0 ? (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{suspiciousFrames.length} Suspicious Timestamps</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Manipulated Keyframes</span>
          </span>
        )}
      </div>

      {/* Interactive Timeline Bar */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 block">
          Click any timestamp to seek & inspect keyframe:
        </span>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[560px] flex items-center space-x-2 py-3 px-3 bg-slate-50 dark:bg-navy-950/70 rounded-xl border border-slate-200/60 dark:border-slate-800">
            {timeline.map((frame, idx) => {
              const score = frame.max_score || 0;
              const isSuspicious = score >= 0.55;
              const isAuthentic = score <= 0.35 && frame.faces && frame.faces.length > 0;
              const isNoFace = !frame.faces || frame.faces.length === 0;

              let dotColor = 'bg-amber-400 border-amber-500';
              if (isSuspicious) dotColor = 'bg-red-500 border-red-600 animate-pulse';
              else if (isAuthentic) dotColor = 'bg-emerald-500 border-emerald-600';
              else if (isNoFace) dotColor = 'bg-slate-300 dark:bg-slate-700 border-slate-400';

              const isCurrent = selectedFrame?.timestamp === frame.timestamp;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedFrame(frame);
                    if (onSeekTimestamp) onSeekTimestamp(frame.timestamp);
                  }}
                  className={`group flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-teal-500/15 border border-teal-500/40 shadow-sm'
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full border-2 ${dotColor} mb-1.5 shadow-sm group-hover:scale-125 transition-transform`} />
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {frame.timestamp}s
                  </span>
                  <span className="text-[9px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {isNoFace ? 'No Face' : `${Math.round(score * 100)}%`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Frame Detail Inspection Card */}
      {selectedFrame && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-teal-500/30 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-teal-500 flex-shrink-0" />
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Inspected Timestamp at {selectedFrame.timestamp}s
              </span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {selectedFrame.faces && selectedFrame.faces.length > 0 
                  ? `Faces Analyzed: ${selectedFrame.faces.length} • Max Risk: ${Math.round((selectedFrame.max_score || 0) * 100)}%` 
                  : 'No faces detected in this sampled frame.'}
              </span>
            </div>
          </div>

          {selectedFrame.faces && selectedFrame.faces[0] && (
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-black">
                <img src={selectedFrame.faces[0].thumbnail} alt="Face Crop" className="w-full h-full object-cover" />
              </div>
              {selectedFrame.faces[0].heatmap_preview && (
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-teal-500/40 bg-black">
                  <img src={selectedFrame.faces[0].heatmap_preview} alt="Grad-CAM" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Gallery of Suspicious Sampled Frames */}
      {suspiciousFrames && suspiciousFrames.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Gallery of Flagged Frames
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {suspiciousFrames.map((sf, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (onSeekTimestamp) onSeekTimestamp(sf.timestamp);
                }}
                className="cursor-pointer group p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-red-500/30 hover:border-red-500/70 transition-all flex flex-col items-center"
              >
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-black mb-1.5 border border-slate-700">
                  {sf.preview ? (
                    <img src={sf.preview} alt={`Frame ${sf.timestamp}s`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono font-bold text-red-500">
                  {Math.round(sf.score * 100)}% Risk
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {sf.timestamp}s
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
