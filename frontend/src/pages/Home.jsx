import React from 'react';
import { ShieldCheck, Scan, Cpu, BarChart3, ArrowRight, Sparkles, CheckCircle2, Lock, Activity, Eye, Zap, Layers } from 'lucide-react';
import Hero3D from '../components/Hero3D';

export default function Home({ onNavigateAnalyze }) {
  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section with 3D Scanner */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Forensic Neural Media Verification v2.4</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Explainable <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500">
                  Deepfake & AI Media
                </span> <br />
                Detection.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                DeepGuard inspects digital portraits and video keyframes using deep CNN feature extraction, 
                2D FFT high-frequency spectral forensics, and Grad-CAM spatial activation mapping to pinpoint exact manipulated regions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onNavigateAnalyze}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 font-bold text-sm sm:text-base shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all flex items-center space-x-2 group"
                >
                  <Scan className="w-5 h-5" />
                  <span>Analyze Media Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#architecture-overview"
                  className="px-5 py-3.5 rounded-xl bg-slate-100 dark:bg-navy-900 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm transition-all flex items-center space-x-2"
                >
                  <Cpu className="w-4 h-4 text-teal-500" />
                  <span>Explore Architecture</span>
                </a>
              </div>

              {/* Trust & Architecture Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-mono font-bold text-teal-500">EfficientNet-B0</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">5.3M Parameters</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-mono font-bold text-cyan-400">Grad-CAM</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Region Attention</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-mono font-bold text-teal-500">2D FFT</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Spectral Analysis</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="block text-xs font-mono font-bold text-amber-500">Dual Threshold</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Honest Inconclusive</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive 3D Hero Mesh */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-gradient-to-b from-teal-500/10 via-navy-900/50 to-transparent p-1 rounded-3xl border border-teal-500/20 shadow-2xl">
                <Hero3D />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Core Forensic Capabilities */}
      <section id="architecture-overview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forensic Analysis Pipeline
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Engineered to overcome common false positives caused by phone camera compression, motion blur, and portrait lighting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Anatomical Localization
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Instead of an opaque black-box number, DeepGuard isolates five facial sectors (Eyes, Mouth, Nose, Forehead, Jawline) to reveal where blending seams or warping occurred.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-teal-600 dark:text-teal-400">
              Sector-by-Sector Audit
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              2D FFT Spectral Forensics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Optical camera sensors exhibit natural continuous frequency rolloff. DeepGuard computes azimuthal radial spectrum integrals to distinguish physical lens optics from AI upsamplers.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-cyan-500">
              High-Frequency Anomaly Filter
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-teal-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Video Temporal Persistence
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sparse 1-fps keyframe sampling extracts primary faces across clip timelines. Video verdicts require persistent facial manipulation across multiple timestamps to prevent motion blur false alarms.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-emerald-500">
              Non-Max Suppression & Area Tracking
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pre-Loaded Test Benchmark Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-teal-900/40 via-navy-900 to-navy-950 border border-teal-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-widest">
              Ready-To-Test Benchmarks
            </span>
            <h3 className="text-2xl font-bold text-white">
              Try Authentic & Deepfake Samples with 1 Click
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Pre-loaded with verified genuine camera portraits, mobile selfies, face-swapped deepfake portraits, and video clips.
            </p>
          </div>

          <button
            onClick={onNavigateAnalyze}
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm whitespace-nowrap shadow-md hover:scale-105 transition-all flex items-center space-x-2"
          >
            <span>Launch Analysis Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
