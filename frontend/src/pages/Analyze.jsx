import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Film, RefreshCw, Download, FileText, CheckCircle2, AlertCircle, Sparkles, X, ShieldAlert, Sliders } from 'lucide-react';
import VerdictCard from '../components/VerdictCard';
import HeatmapViewer from '../components/HeatmapViewer';
import QualityMetrics from '../components/QualityMetrics';
import VideoTimeline from '../components/VideoTimeline';
import FaceSelector from '../components/FaceSelector';
import FeedbackModal from '../components/FeedbackModal';

export default function Analyze({ onSaveHistory }) {
  const [mode, setMode] = useState('facial'); // 'facial' | 'aigen'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' | 'video'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeJobId, setActiveJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedFaceId, setSelectedFaceId] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const SAMPLE_ITEMS = [
    {
      id: 'real-portrait',
      title: 'Real Portrait',
      type: 'image',
      mode: 'facial',
      badge: 'REAL PHOTO',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      filename: 'sample_real_portrait.jpg',
      url: '/samples/sample_real_portrait.jpg',
      mimeType: 'image/jpeg',
      description: 'Authentic camera portrait (192960.jpg)'
    },
    {
      id: 'real-selfie',
      title: 'Real Selfie',
      type: 'image',
      mode: 'facial',
      badge: 'REAL PHOTO',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      filename: 'sample_real_selfie.jpg',
      url: '/samples/sample_real_selfie.jpg',
      mimeType: 'image/jpeg',
      description: 'Authentic mobile camera selfie'
    },
    {
      id: 'deepfake-photo',
      title: 'Deepfake Face-Swap',
      type: 'image',
      mode: 'facial',
      badge: 'FAKE PHOTO',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30',
      filename: 'sample_deepfake_faceswap.jpg',
      url: '/samples/sample_deepfake_faceswap.jpg',
      mimeType: 'image/jpeg',
      description: 'Face-swap with boundary seam artifacts'
    },
    {
      id: 'aigen-photo',
      title: 'AI Generated Image',
      type: 'image',
      mode: 'aigen',
      badge: 'AI SYNTHETIC',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      filename: 'sample_aigen_diffusion.jpg',
      url: '/samples/sample_aigen_diffusion.jpg',
      mimeType: 'image/jpeg',
      description: 'Ultra-realistic AI generator photo'
    },
    {
      id: 'real-video',
      title: 'Real Camera Video',
      type: 'video',
      mode: 'facial',
      badge: 'REAL VIDEO',
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      filename: 'sample_real_video.mp4',
      url: '/samples/sample_real_video.mp4',
      mimeType: 'video/mp4',
      description: 'Authentic portrait video clip'
    },
    {
      id: 'deepfake-video',
      title: 'Deepfake Video',
      type: 'video',
      mode: 'facial',
      badge: 'FAKE VIDEO',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/30',
      filename: 'sample_deepfake_video.mp4',
      url: '/samples/sample_deepfake_video.mp4',
      mimeType: 'video/mp4',
      description: 'Face-swapped manipulated video clip'
    }
  ];

  const loadSample = async (sample) => {
    try {
      setIsAnalyzing(false);
      setErrorMessage(null);
      setResult(null);
      setSelectedFaceId(null);
      setProgress(0);
      if (sample.mode) setMode(sample.mode);

      const response = await fetch(sample.url);
      if (!response.ok) throw new Error("Unable to fetch sample file.");
      const blob = await response.blob();
      const loadedFile = new File([blob], sample.filename, { type: sample.mimeType });
      
      setFile(loadedFile);
      setFileType(sample.type);
      setPreviewUrl(URL.createObjectURL(loadedFile));
    } catch (err) {
      setErrorMessage("Failed to load sample: " + err.message);
    }
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setErrorMessage(null);
    setResult(null);
    setSelectedFaceId(null);

    const isVideo = selectedFile.type.startsWith('video/') || selectedFile.name.match(/\.(mp4|mov|avi|webm)$/i);
    const isImage = selectedFile.type.startsWith('image/') || selectedFile.name.match(/\.(jpg|jpeg|png|webp)$/i);

    if (!isImage && !isVideo) {
      setErrorMessage("Please select a supported image (.jpg, .png, .webp) or video (.mp4, .mov, .avi) file.");
      return;
    }

    if (mode === 'aigen' && isVideo) {
      setErrorMessage("General AI-Generated detector evaluates static images. For video, please use Facial Manipulation mode.");
      return;
    }

    setFile(selectedFile);
    setFileType(isVideo ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setProgress(15);
    setErrorMessage(null);
    setSelectedFaceId(null);

    try {
      if (fileType === 'image') {
        setProgress(35);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/v1/analyze/image?mode=${mode}`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "Image analysis failed. Please verify file integrity.");
        }

        setProgress(85);
        const data = await response.json();
        setResult(data);
        setProgress(100);

        if (onSaveHistory) {
          onSaveHistory({
            fileName: file.name,
            fileType: 'image',
            mode,
            verdict: data.verdict,
            display_confidence_pct: data.display_confidence_pct,
            percentage: data.percentage,
            thumbnail: previewUrl,
            timestamp: Date.now()
          });
        }
      } else {
        // Video Analysis (Background Job)
        const formData = new FormData();
        formData.append('file', file);

        const initRes = await fetch('/api/v1/analyze/video', {
          method: 'POST',
          body: formData,
        });

        if (!initRes.ok) {
          const errData = await initRes.json().catch(() => ({}));
          throw new Error(errData.detail || "Video submission failed.");
        }

        const { job_id } = await initRes.json();
        setActiveJobId(job_id);

        const pollInterval = setInterval(async () => {
          try {
            const jobRes = await fetch(`/api/v1/jobs/${job_id}`);
            const jobData = await jobRes.json();

            setProgress(jobData.progress || 20);

            if (jobData.status === 'completed') {
              clearInterval(pollInterval);
              const finalRes = { ...jobData.result, mode: 'facial' };
              setResult(finalRes);
              setIsAnalyzing(false);
              setActiveJobId(null);

              if (onSaveHistory) {
                onSaveHistory({
                  fileName: file.name,
                  fileType: 'video',
                  mode: 'facial',
                  verdict: finalRes.verdict,
                  display_confidence_pct: finalRes.display_confidence_pct,
                  percentage: finalRes.percentage,
                  thumbnail: previewUrl,
                  timestamp: Date.now()
                });
              }
            } else if (jobData.status === 'failed' || jobData.status === 'cancelled') {
              clearInterval(pollInterval);
              setIsAnalyzing(false);
              setActiveJobId(null);
              setErrorMessage(jobData.error_message || "Video analysis was interrupted.");
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
            setIsAnalyzing(false);
            setErrorMessage("Failed to fetch job updates.");
          }
        }, 1200);

        return;
      }
    } catch (err) {
      setErrorMessage(err.message || "An unexpected error occurred during inference.");
    } finally {
      if (fileType === 'image') {
        setIsAnalyzing(false);
      }
    }
  };

  const handleCancelVideoJob = async () => {
    if (!activeJobId) return;
    try {
      await fetch(`/api/v1/jobs/${activeJobId}/cancel`, { method: 'POST' });
      setIsAnalyzing(false);
      setActiveJobId(null);
      setErrorMessage("Analysis cancelled by user.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setFileType(null);
    setResult(null);
    setSelectedFaceId(null);
    setErrorMessage(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadReport = async (format) => {
    if (!result) return;
    try {
      const response = await fetch(`/api/v1/jobs/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DeepGuard_Forensic_Report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      alert("Failed to export report: " + e.message);
    }
  };

  // Determine current active face for inspection
  const activeFace = result?.faces && selectedFaceId
    ? result.faces.find(f => f.face_id === selectedFaceId) || result.faces[0]
    : result?.faces?.[0];

  const currentHeatmap = activeFace?.heatmap_data_uri || result?.heatmap_data_uri;
  const currentVerdict = activeFace || result;

  // Realistic Stage Description
  const getStageDescription = () => {
    if (progress <= 20) return "Validating file integrity & computing metadata...";
    if (progress <= 45) return "Sampling keyframes & Haar-cascade facial localization...";
    if (progress <= 75) return "Executing EfficientNet-B0 inference & spectral forensics...";
    if (progress <= 95) return "Computing Grad-CAM attention maps & sector audits...";
    return "Forensic audit finalized.";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Media Integrity Verification Workspace
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Upload media to audit for facial deepfake manipulation or full-frame AI image synthesis.
        </p>
      </div>

      {/* 1. Quick Test Samples Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-navy-900/60 p-4 sm:p-5 backdrop-blur-sm shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Instant Test Benchmarks (1-Click)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            Curated Real & Manipulated Assets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SAMPLE_ITEMS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadSample(sample)}
              className="group p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-navy-950/70 hover:border-teal-500/60 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 text-left transition-all flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${sample.badgeColor} mb-1.5`}>
                  {sample.badge}
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                  {sample.title}
                </p>
              </div>
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Analysis Mode Selector */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 bg-slate-200/80 dark:bg-navy-900/90 rounded-2xl border border-slate-300/60 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => { setMode('facial'); handleReset(); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'facial'
                ? 'bg-white dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-teal-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Facial Manipulation (Faces & Videos)</span>
          </button>
          
          <button
            onClick={() => { setMode('aigen'); handleReset(); }}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === 'aigen'
                ? 'bg-white dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-200 dark:border-teal-500/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Generated Image (Full Synthetic)</span>
          </button>
        </div>
      </div>

      {/* 3. Upload & Dropzone Area */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700/80 hover:border-teal-500/60 rounded-3xl p-10 sm:p-14 text-center cursor-pointer bg-white/50 dark:bg-navy-900/50 hover:bg-slate-50 dark:hover:bg-navy-900/80 transition-all group shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={mode === 'facial' ? "image/*,video/*" : "image/*"}
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
          />
          <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8 stroke-[1.8]" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop your media here, or <span className="text-teal-500 underline underline-offset-4">browse</span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {mode === 'facial'
              ? 'Supports JPG, PNG, WEBP images (up to 15MB) and MP4, MOV, AVI videos (up to 100MB, 60s)'
              : 'Supports JPG, PNG, WEBP static synthetic images (up to 15MB)'}
          </p>
        </div>
      ) : (
        /* File Preview & Actions Bar */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-teal-500">
                {fileType === 'video' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block truncate max-w-xs sm:max-w-md">
                  {file.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileType.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                Change File
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing... {progress > 0 && `${progress}%`}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Forensic Inspection</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Media Player / Preview */}
          <div className="max-h-[380px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
            {fileType === 'video' ? (
              <video ref={videoPlayerRef} src={previewUrl} controls className="max-h-[380px] w-auto mx-auto" />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-[380px] w-auto object-contain mx-auto" />
            )}
          </div>

          {/* Realistic Progress Status Stages */}
          {isAnalyzing && (
            <div className="pt-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{getStageDescription()}</span>
                <span className="font-bold text-teal-400">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              {activeJobId && (
                <button
                  onClick={handleCancelVideoJob}
                  className="text-xs text-red-500 hover:underline pt-1 block"
                >
                  Cancel Background Job
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 5. Results Section */}
      {result && (
        <div className="space-y-6 pt-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Forensic Inspection Outcome
            </h2>

            {/* Export Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:text-teal-500 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={() => downloadReport('json')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:text-teal-500 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export JSON Audit</span>
              </button>
            </div>
          </div>

          {/* Multiple Faces Selector (if > 1 face) */}
          {result.faces && result.faces.length > 1 && (
            <FaceSelector
              faces={result.faces}
              selectedFaceId={selectedFaceId}
              onSelectFace={(id) => setSelectedFaceId(id)}
            />
          )}

          {/* Verdict Overview Card */}
          <VerdictCard
            result={currentVerdict}
            onOpenFeedback={() => setFeedbackModalOpen(true)}
          />

          {/* Explainability Heatmap Viewer */}
          {currentHeatmap && (
            <HeatmapViewer
              originalImage={previewUrl}
              heatmapImage={currentHeatmap}
              title={`CNN Explainability Map (${mode === 'facial' ? 'Face Crop Attention' : 'Full Frame'})`}
            />
          )}

          {/* Video Timeline (if video analysis) */}
          {result.timeline && (
            <VideoTimeline
              timeline={result.timeline}
              suspiciousFrames={result.suspicious_frames}
              durationSeconds={result.duration_seconds}
              coveragePct={result.analysis_coverage_pct}
              onSeekTimestamp={(sec) => {
                if (videoPlayerRef.current) {
                  videoPlayerRef.current.currentTime = sec;
                  videoPlayerRef.current.play();
                }
              }}
            />
          )}

          {/* Quality Metrics Breakdown */}
          {result.quality && (
            <QualityMetrics
              quality={result.quality}
              faceCount={result.face_count}
              format={fileType}
              size={file ? (file.size / (1024 * 1024)).toFixed(2) : '1.0'}
            />
          )}

          {/* Reset Action */}
          <div className="text-center pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Analyze Another Media File
            </button>
          </div>
        </div>
      )}

      {/* User Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        currentResult={result}
        mode={mode}
      />

    </div>
  );
}
