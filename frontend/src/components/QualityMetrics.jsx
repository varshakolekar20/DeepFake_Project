import React from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Activity, Info, AlertCircle, Eye } from 'lucide-react';

export default function QualityMetrics({ quality, faceCount, format, size, isVideo = false }) {
  if (!quality) return null;

  const { width, height, laplacian_var, is_blurry, contrast_std, is_low_contrast, quality_pass, mean_brightness } = quality;

  // Practical heuristic alerts
  const guidanceNotes = [];

  if (is_blurry) {
    guidanceNotes.push({
      type: 'warning',
      title: 'Motion Blur or Soft Focus Detected',
      message: 'The image has low high-frequency gradient variance (Laplacian < 50.0). Retake with a steady camera for maximum accuracy.',
    });
  }

  if (is_low_contrast) {
    guidanceNotes.push({
      type: 'warning',
      title: 'Low Lighting / Poor Contrast',
      message: 'Lighting is too low (Contrast Std Dev < 20.0). Facial boundary and skin pore artifacts are harder to distinguish.',
    });
  }

  if (mean_brightness && mean_brightness > 225) {
    guidanceNotes.push({
      type: 'warning',
      title: 'Overexposure / Glare Detected',
      message: 'High brightness highlights may wash out subtle facial blending seam lines.',
    });
  }

  if (width && height && (width < 224 || height < 224)) {
    guidanceNotes.push({
      type: 'info',
      title: 'Low Input Resolution',
      message: `Image resolution (${width}×${height}) is below optimal 224×224 px. Neural feature maps will be upscaled.`,
    });
  }

  if (faceCount === 0 && !isVideo) {
    guidanceNotes.push({
      type: 'error',
      title: 'No Human Faces Detected',
      message: 'Facial manipulation mode requires a visible frontal or profile face. Move closer to the camera or ensure even lighting.',
    });
  } else if (faceCount > 1) {
    guidanceNotes.push({
      type: 'info',
      title: `Multiple Faces Detected (${faceCount})`,
      message: 'DeepGuard analyzed all detected faces. Use the interactive face selector below to view isolated per-face Grad-CAM heatmaps and scores.',
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Activity className="w-4 h-4 text-teal-500" />
          <span>Pre-Inference Quality & Forensic Eligibility</span>
        </h3>
        <span
          className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${
            quality_pass
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
          }`}
        >
          {quality_pass ? '✓ Quality Criteria Met' : '⚠️ Quality Warnings'}
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {/* Resolution */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Resolution
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
            {width && height ? `${width} × ${height}` : 'N/A'}
          </span>
          <span
            className={`text-[10px] font-mono mt-0.5 inline-block ${
              width >= 224 && height >= 224 ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            {width >= 224 && height >= 224 ? '✓ Standard HQ' : '⚠️ Sub-224px'}
          </span>
        </div>

        {/* Sharpness / Blur */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Sharpness (Laplacian)
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
            {laplacian_var !== undefined ? laplacian_var : 'N/A'}
          </span>
          <span
            className={`text-[10px] font-mono mt-0.5 inline-block ${
              is_blurry ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {is_blurry ? '⚠️ Motion Blur' : '✓ Sharp Focus'}
          </span>
        </div>

        {/* Contrast / Lighting */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Contrast (Std Dev)
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
            {contrast_std !== undefined ? contrast_std : 'N/A'}
          </span>
          <span
            className={`text-[10px] font-mono mt-0.5 inline-block ${
              is_low_contrast ? 'text-amber-500' : 'text-emerald-500'
            }`}
          >
            {is_low_contrast ? '⚠️ Low Lighting' : '✓ Balanced'}
          </span>
        </div>

        {/* Faces Found */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/60 dark:border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Faces Detected
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 block font-mono">
            {faceCount !== undefined ? faceCount : '1'}
          </span>
          <span className="text-[10px] text-teal-500 font-mono mt-0.5 inline-block">
            {faceCount > 0 ? '✓ Isolated & Cropped' : 'Full Frame'}
          </span>
        </div>
      </div>

      {/* Actionable Guidance Banners */}
      {guidanceNotes.length > 0 && (
        <div className="space-y-2 pt-1">
          {guidanceNotes.map((note, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
                note.type === 'error'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : note.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-teal-500/10 border-teal-500/30 text-teal-300'
              }`}
            >
              {note.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              ) : note.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-teal-400" />
              )}
              <div>
                <strong className="block font-semibold">{note.title}</strong>
                <p className="mt-0.5 opacity-90 leading-relaxed">{note.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Methodological Disclosure */}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
        * <em>Quality thresholds</em> (Laplacian variance threshold = 50.0, contrast threshold = 20.0) are heuristic pre-inference checks to alert operators of degraded input conditions. They guide capture quality and do not fabricate or alter neural model confidence scores.
      </p>
    </div>
  );
}
