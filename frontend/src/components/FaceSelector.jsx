import React from 'react';
import { Users, User, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

export default function FaceSelector({ faces, selectedFaceId, onSelectFace }) {
  if (!faces || faces.length <= 1) return null;

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-teal-500" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Multiple Faces Detected ({faces.length} Subjects)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Click a face to inspect individual activation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {faces.map((f, idx) => {
          const isSelected = (f.face_id === selectedFaceId) || (!selectedFaceId && idx === 0);
          const isReal = f.verdict?.toLowerCase().includes('real');
          const isFake = f.verdict?.toLowerCase().includes('fake');
          
          return (
            <button
              key={f.face_id || idx}
              type="button"
              onClick={() => onSelectFace(f.face_id)}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                isSelected
                  ? 'border-teal-500 bg-teal-500/10 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/70 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-navy-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-500">
                <User className="w-5 h-5 text-teal-500" />
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  Face #{f.face_id} {idx === 0 && '(Dominant)'}
                </span>
                
                <span className={`inline-flex items-center text-[10px] font-semibold mt-0.5 ${
                  isReal ? 'text-emerald-500' : isFake ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {isReal ? 'Likely REAL' : isFake ? 'Likely FAKE' : 'Inconclusive'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
