import React, { useState, useRef, useEffect } from 'react';
import { Eye, Layers, Sparkles, HelpCircle, Sliders, SplitSquareVertical } from 'lucide-react';

export default function HeatmapViewer({ originalImage, heatmapImage, title = "CNN Explainability (Grad-CAM)" }) {
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'side-by-side' | 'blend'
  const [blendOpacity, setBlendOpacity] = useState(65);
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const sliderContainerRef = useRef(null);

  const displayHeatmap = heatmapImage || originalImage;

  // Mouse / Touch Dragging for Split Comparison Slider
  const handleMove = (clientX) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const stopDrag = () => setIsDragging(false);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchend', stopDrag);
    };
  }, []);

  if (!originalImage && !heatmapImage) return null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm space-y-4">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gradient-weighted Class Activation Mapping (Grad-CAM)
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'slider'
                ? 'bg-white dark:bg-navy-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Split Slider</span>
          </button>
          
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-navy-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('blend')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              viewMode === 'blend'
                ? 'bg-white dark:bg-navy-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Blend</span>
          </button>
        </div>
      </div>

      {/* 1. Interactive Split-Wipe Comparison Slider */}
      {viewMode === 'slider' && (
        <div className="space-y-3">
          <div
            ref={sliderContainerRef}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            className="relative w-full aspect-square max-h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 mx-auto cursor-ew-resize select-none"
          >
            {/* Background: Grad-CAM Heatmap */}
            <img
              src={displayHeatmap}
              alt="Grad-CAM Activation"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />

            {/* Foreground: Original Image (Clipped by slider position) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={originalImage || displayHeatmap}
                alt="Original Photo"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{ width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%' }}
              />
            </div>

            {/* Draggable Divider Handle Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-teal-400 pointer-events-none shadow-[0_0_10px_rgba(20,184,166,0.8)]"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal-500 border-2 border-white shadow-lg flex items-center justify-center text-navy-950 font-bold text-xs">
                ⇄
              </div>
            </div>

            {/* Top Labels */}
            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-navy-950/80 backdrop-blur-sm border border-slate-700 text-[10px] font-mono font-bold text-slate-200">
              ORIGINAL
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-navy-950/80 backdrop-blur-sm border border-teal-500/40 text-[10px] font-mono font-bold text-teal-400">
              GRAD-CAM HEATMAP
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            Drag the slider left or right to wipe between original facial details and neural attention gradients.
          </p>
        </div>
      )}

      {/* 2. Side-by-Side View */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Original Input Face
            </span>
            <div className="w-full aspect-square max-h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {originalImage ? (
                <img src={originalImage} alt="Original Face" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-500">Not Available</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-teal-500 mb-2 uppercase tracking-wider">
              Neural Attention Map
            </span>
            <div className="w-full aspect-square max-h-[300px] rounded-xl overflow-hidden border border-teal-500/30 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
              {displayHeatmap ? (
                <img src={displayHeatmap} alt="Grad-CAM" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-slate-500">Heatmap Generation Failed</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Opacity Blend View */}
      {viewMode === 'blend' && (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-h-[320px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 mx-auto flex items-center justify-center">
            {originalImage && (
              <img src={originalImage} alt="Original Base" className="absolute inset-0 w-full h-full object-contain" />
            )}
            {displayHeatmap && (
              <img
                src={displayHeatmap}
                alt="Heatmap Overlay"
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
                style={{ opacity: blendOpacity / 100 }}
              />
            )}
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Original Photo</span>
              <span className="font-mono font-bold text-teal-400">{blendOpacity}% Heatmap</span>
              <span>Full Heatmap</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blendOpacity}
              onChange={(e) => setBlendOpacity(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Forensic Transparency Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200/80 dark:border-slate-800/80 flex items-start space-x-2.5 text-xs text-slate-500 dark:text-slate-400">
        <HelpCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">Forensic Transparency Note:</strong> Grad-CAM highlights spatial regions where the convolutional filters detected elevated feature gradients that influenced the prediction. It represents <em>neural attention</em>, not a verified polygon outline of manual tampering.
        </p>
      </div>

    </div>
  );
}
