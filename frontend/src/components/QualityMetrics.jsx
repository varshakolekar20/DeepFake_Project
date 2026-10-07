import React from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Activity, Image as ImageIcon } from 'lucide-react';

export default function QualityMetrics({ quality, faceCount, format, size }) {
  if (!quality) return null;

  const { width, height, laplacian_var, is_blurry, contrast_std, is_low_contrast, quality_pass } = quality;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-4">
        <Activity className="w-4 h-4 text-teal-500" />
        <span>Media Quality & Forensic Eligibility</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {/* Resolution */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Resolution
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {width && height ? `${width} × ${height}` : 'N/A'}
          </span>
          <span className="text-[10px] text-emerald-500 mt-0.5 inline-block font-mono">
            {width >= 224 && height >= 224 ? '✓ Standard HQ' : '✓ Compatible'}
          </span>
        </div>

        {/* Blur Check */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Sharpness (Laplacian)
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {laplacian_var ?? 'N/A'}
          </span>
          <span className={`text-[10px] font-mono mt-0.5 inline-block ${is_blurry ? 'text-amber-500' : 'text-emerald-500'}`}>
            {is_blurry ? '⚠️ Motion Blur' : '✓ Sharp Focus'}
          </span>
        </div>

        {/* Contrast Check */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Contrast Std Dev
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {contrast_std ?? 'N/A'}
          </span>
          <span className={`text-[10px] font-mono mt-0.5 inline-block ${is_low_contrast ? 'text-amber-500' : 'text-emerald-500'}`}>
            {is_low_contrast ? '⚠️ Low Lighting' : '✓ Balanced'}
          </span>
        </div>

        {/* Faces Found */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Faces Detected
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block">
            {faceCount !== undefined ? faceCount : '1'}
          </span>
          <span className="text-[10px] text-teal-500 font-mono mt-0.5 inline-block">
            {faceCount > 0 ? '✓ Isolated & Cropped' : 'Full Frame'}
          </span>
        </div>
      </div>
    </div>
  );
}
