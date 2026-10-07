import React from 'react';
import { Cpu, ShieldCheck, Eye, Layers, AlertCircle, FileSearch, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onNavigateAnalyze }) {
  const steps = [
    {
      num: "01",
      title: "Input Validation & Media Sanitization",
      desc: "Uploaded images and videos are verified against strict container security rules. Videos are checked for duration (max 60s) and frames are decoded safely without storing unhashed raw content.",
      icon: ShieldCheck
    },
    {
      num: "02",
      title: "Forensic Face Isolation & Margin Padding",
      desc: "Faces are detected using Haar/DNN multiscale detectors. A 25% margin padding is added around the bounding box to capture subtle blending seams along the jawline, forehead, and hair boundaries.",
      icon: FileSearch
    },
    {
      num: "03",
      title: "EfficientNet-B0 Convolutional Inference",
      desc: "Extracted crops are normalized to 224x224 RGB and passed through EfficientNet-B0. The network evaluates deep textural and frequency inconsistencies learned during supervised training.",
      icon: Cpu
    },
    {
      num: "04",
      title: "Grad-CAM Mathematical Explainability",
      desc: "Gradients of the predicted score are backpropagated into the final convolutional layer (features[-1]). This generates a 2D class activation heatmap revealing spatial attention regions.",
      icon: Eye
    },
    {
      num: "05",
      title: "Calibrated Dual-Threshold Decision Rule",
      desc: "Instead of an arbitrary 0.5 coin toss, DeepGuard applies two thresholds: ≥0.65 for Likely Manipulated, ≤0.35 for Likely Authentic, and the middle zone as Inconclusive.",
      icon: Layers
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          How DeepGuard Operates
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          A transparent look into the end-to-end computer vision and explainable AI architecture.
        </p>
      </div>

      {/* Step by step pipeline */}
      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 shadow-sm hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center space-x-4 shrink-0">
                <span className="text-2xl font-black font-mono text-teal-500/60 dark:text-teal-400/40">
                  {step.num}
                </span>
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Principles & Honesty Callout */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-2">
          <AlertCircle className="w-5 h-5 text-teal-500" />
          <span>Core Academic Guarantees & Non-Claims</span>
        </h3>
        <ul className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400 list-disc list-inside">
          <li><strong>No Guaranteed Accuracy Claim:</strong> Deep learning detectors are bounded by their training distributions (e.g. FaceForensics++, GenImage). DeepGuard makes no claim of 100% detection on unseen future generators.</li>
          <li><strong>Explainability vs Proof:</strong> Grad-CAM highlights what the model attended to, not a legally binding tamper map.</li>
          <li><strong>Anti-Leakage Splitting:</strong> In training, video frames and their manipulated derivatives are kept grouped together to prevent inflated test metrics.</li>
        </ul>
      </div>

      {onNavigateAnalyze && (
        <div className="text-center pt-2">
          <button
            onClick={onNavigateAnalyze}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-bold text-sm shadow-md transition-all inline-flex items-center space-x-2"
          >
            <span>Launch Analysis Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
