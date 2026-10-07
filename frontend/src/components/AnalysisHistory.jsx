import React from 'react';
import { History, Trash2, X, Clock, ExternalLink, Image as ImageIcon, Film, ShieldAlert, ShieldCheck, HelpCircle } from 'lucide-react';

export default function AnalysisHistory({ isOpen, onClose, history, onSelectHistoryItem, onClearHistory }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Session Analysis History
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited scans saved locally in browser storage ({history.length} items)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center space-x-1 border border-red-500/20"
                title="Clear all local history entries"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close history modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of Past Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {history.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-navy-950 flex items-center justify-center text-slate-400">
                <Clock className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Past Scans Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Media files you analyze will appear here with timestamps, confidence scores, and preview snapshots.
              </p>
            </div>
          ) : (
            history.map((item, idx) => {
              const isReal = item.verdict?.toLowerCase().includes('real');
              const isFake = item.verdict?.toLowerCase().includes('fake');
              
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-navy-950/70 hover:border-teal-500/50 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {/* Thumbnail or Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-navy-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.fileName} className="w-full h-full object-cover" />
                      ) : (
                        item.fileType === 'video' ? <Film className="w-5 h-5 text-teal-500" /> : <ImageIcon className="w-5 h-5 text-teal-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-[180px] sm:max-w-xs">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                          {item.fileType}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>•</span>
                        <span>{item.mode === 'aigen' ? 'AI-Gen Mode' : 'Facial Mode'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict & Action */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isReal
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : isFake
                          ? 'bg-red-500/10 text-red-500 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}>
                        {isReal ? <ShieldCheck className="w-3 h-3 mr-0.5" /> : isFake ? <ShieldAlert className="w-3 h-3 mr-0.5" /> : <HelpCircle className="w-3 h-3 mr-0.5" />}
                        <span>{item.verdict}</span>
                      </span>
                      <span className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.display_confidence_pct ? `${item.display_confidence_pct}%` : `${item.percentage}%`}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="p-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 transition-colors"
                      title="Load this result into workspace"
                      aria-label="Load result"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/50 text-center">
          <p className="text-[11px] text-slate-400">
            * History is stored solely on your device. No user uploads are transmitted to external servers without consent.
          </p>
        </div>

      </div>
    </div>
  );
}
