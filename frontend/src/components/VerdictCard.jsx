import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, Info, ChevronDown, ChevronUp, Sliders, Scan, Target, Check } from 'lucide-react';

export default function VerdictCard({ result, mediaType = 'Image', onOpenFeedback }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const { verdict, percentage, raw_score, display_confidence_pct, explanation, thresholds, mode, quality, suspicious_regions } = result;

  const isFake = verdict.includes('Manipulated') || verdict.includes('AI-Generated') || verdict.includes('FAKE');
  const isReal = verdict.includes('Authentic') || verdict.includes('REAL');
  const isInconclusive = verdict.includes('Inconclusive') || verdict.includes('INCONCLUSIVE');
  const isUnable = verdict.includes('Unable');

  const mediaLabel = result.timeline ? 'Video' : 'Image';

  // Format short, clear primary headline
  let formattedHeadline = '';
  let badgeColor = '';
  let headlineColor = '';
  let Icon = HelpCircle;

  if (isFake) {
    formattedHeadline = `${mediaLabel}: Likely FAKE`;
    badgeColor = 'bg-red-500/10 border-red-500/30 text-red-500';
    headlineColor = 'text-red-600 dark:text-red-400';
    Icon = AlertTriangle;
  } else if (isReal) {
    formattedHeadline = `${mediaLabel}: Likely REAL`;
    badgeColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500';
    headlineColor = 'text-emerald-600 dark:text-emerald-400';
    Icon = CheckCircle2;
  } else if (isInconclusive) {
    formattedHeadline = 'INCONCLUSIVE — Unable to determine reliably';
    badgeColor = 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    headlineColor = 'text-amber-600 dark:text-amber-400';
    Icon = HelpCircle;
  } else {
    formattedHeadline = 'Unable to analyze media';
    badgeColor = 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    headlineColor = 'text-slate-500 dark:text-slate-400';
    Icon = XCircle;
  }

  // Intuitive confidence percentage (e.g. 98.5% Real or 99.9% Fake)
  const confidenceScore = display_confidence_pct !== undefined ? display_confidence_pct : (
    isReal ? Math.round((1.0 - (raw_score ?? 0.5)) * 1000) / 10 : Math.round((raw_score ?? 0.5) * 1000) / 10
  );

  const tauLow = thresholds?.authentic_below ?? 0.35;
  const tauHigh = thresholds?.manipulated_above ?? 0.55;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm space-y-5">
      {/* Top Tag & Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Forensic Verdict
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {mode === 'facial' ? 'Facial Analysis' : 'Full-Frame Synthetic'}
          </span>
        </div>

        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badgeColor}`}>
          <Icon className="w-4 h-4" />
          <span>{mediaLabel} Assessment</span>
        </div>
      </div>

      {/* Primary Clear Result Headline */}
      <div>
        <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${headlineColor}`}>
          {formattedHeadline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {explanation}
        </p>

        {mode === 'facial' && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">
            * Note: This forensic assessment concerns strictly the analyzed facial regions. A "Likely REAL" prediction does not prove that the overall scene or narrative is authentic.
          </p>
        )}
      </div>

      {/* Prominent Confidence Meter */}
      {!isUnable && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/70 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className={isReal ? 'text-emerald-600 dark:text-emerald-400' : (isFake ? 'text-red-600 dark:text-red-400' : 'text-amber-600')}>
              {isReal ? 'Authenticity Confidence' : (isFake ? 'Manipulation Risk Score' : 'Uncertainty Index')}
            </span>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
              {confidenceScore}%
            </span>
          </div>

          <div className="relative w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ease-out ${
                isFake ? 'bg-red-500' : (isReal ? 'bg-emerald-500' : 'bg-amber-500')
              }`}
              style={{ width: `${Math.min(100, Math.max(5, confidenceScore))}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{isReal ? 'High Authentic Evidence' : (isFake ? 'Low Real Evidence' : 'Ambiguous')}</span>
            <span>{isReal ? 'Authentic Photographic Features' : (isFake ? 'Synthetic Neural Artifacts' : 'Needs Verification')}</span>
          </div>
        </div>
      )}

      {/* Anatomical Region Analysis: "Which part of the photo or video is AI or not" */}
      {suspicious_regions && suspicious_regions.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-2 mb-3">
            <Scan className="w-4 h-4 text-teal-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Which Part of the Photo is AI / Manipulated?
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suspicious_regions.map((reg, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-navy-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {reg.region}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reg.badge || 'bg-slate-100 text-slate-600'}`}>
                    {reg.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {reg.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible Technical Details Drawer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 transition-colors py-1"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showDetails ? 'Hide technical calibration details' : 'View calibration & quality diagnostics'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

          {showDetails && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>Raw Model Logit Output: <span className="font-bold text-slate-800 dark:text-slate-200">{raw_score}</span></div>
              <div>Authentic Threshold: <span className="font-bold text-emerald-500">&le; {tauLow}</span></div>
              <div>Manipulated Threshold: <span className="font-bold text-red-500">&ge; {tauHigh}</span></div>
              <div>Inconclusive Window: <span className="font-bold text-amber-500">{tauLow} – {tauHigh}</span></div>
            </div>

            {quality && (
              <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 font-mono">
                <div>Image Resolution: {quality.width} × {quality.height} px</div>
                <div>Laplacian Sharpness: {quality.laplacian_var}</div>
                <div>Contrast Std Dev: {quality.contrast_std}</div>
                <div>Optical Quality Check: <span className="text-emerald-500">Passed</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Forensic Audit Footer & User Feedback Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span>EfficientNet-B0 v2.4</span>
          <span>•</span>
          <span>Dual-Threshold Softmax</span>
        </div>

        {onOpenFeedback && (
          <button
            type="button"
            onClick={onOpenFeedback}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors flex items-center space-x-1 underline underline-offset-4"
          >
            <span>Report Prediction Discrepancy</span>
          </button>
        )}
      </div>
    </div>
  );
}
