import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, FlipHorizontal, AlertTriangle, ShieldAlert, Sparkles } from 'lucide-react';

export default function LiveCameraCapture({ onCapture, onClose }) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) or 'environment' (rear)
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Stop all media stream tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      setStream(null);
    }
  }, [stream]);

  // Check available video devices
  useEffect(() => {
    const checkDevices = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        }
      } catch (err) {
        console.warn('Unable to enumerate camera devices:', err);
      }
    };
    checkDevices();
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (mode) => {
    setIsLoading(true);
    setCameraError(null);

    // Ensure previous stream is released first
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API is not supported in this browser or context. Live camera requires localhost or an HTTPS connection.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Camera initialization error:', err);
      let message = 'Failed to initialize camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access in your browser site settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No video capture hardware / camera was detected on your system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is currently in use by another application or blocked by system privacy controls.';
      } else if (err.name === 'OverconstrainedError') {
        // Fallback to basic constraint without facingMode specification
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setIsLoading(false);
          return;
        } catch (fbErr) {
          message = 'Requested camera resolution or facing mode is unavailable.';
        }
      } else {
        message = err.message || message;
      }
      setCameraError(message);
      setIsLoading(false);
    }
  }, [stream]);

  // Start on mount and whenever facingMode changes (if not already captured)
  useEffect(() => {
    if (!capturedPreview) {
      startCamera(facingMode);
    }

    // Cleanup when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // Make sure videoRef gets attached when video becomes ready
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, capturedPreview]);

  // Switch front/back camera
  const handleFlipCamera = () => {
    if (isLoading) return;
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Capture snapshot from current frame
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    // If front camera was mirrored in preview, mirror the captured image canvas too so user sees what they previewed
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Failed to capture frame from video stream.');
          return;
        }
        const preview = URL.createObjectURL(blob);
        setCapturedBlob(blob);
        setCapturedPreview(preview);
        // Stop stream to release hardware while user reviews photo
        stopStream();
      },
      'image/jpeg',
      0.95
    );
  };

  // Retake photo
  const handleRetake = () => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    setCapturedBlob(null);
    setCapturedPreview(null);
    setCameraError(null);
    startCamera(facingMode);
  };

  // Submit captured photo to parent
  const handleSubmit = () => {
    if (!capturedBlob) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = new File([capturedBlob], `live_capture_${timestamp}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    // Stop camera and deliver file
    stopStream();
    onCapture(file);
  };

  // Close camera modal / screen
  const handleClose = () => {
    stopStream();
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
    if (onClose) onClose();
  };

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-slate-900/95 dark:bg-navy-950/95 p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-400" />
            <span>Live Camera Studio</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {hasMultipleCameras && !capturedPreview && (
            <button
              onClick={handleFlipCamera}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center space-x-1.5 border border-slate-700/60"
              title="Switch Camera (Front / Rear)"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Flip ({facingMode === 'user' ? 'Front' : 'Rear'})</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700/60"
            title="Close Camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Viewport / Preview */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
        {cameraError ? (
          <div className="p-6 text-center max-w-md space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Camera Access Error</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/40"
              >
                Retry Camera
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : capturedPreview ? (
          /* Captured Photo Preview Screen */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={capturedPreview}
              alt="Live Camera Snapshot"
              className="max-h-full max-w-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-teal-500/90 text-navy-950 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow">
              Photo Captured Ready for Analysis
            </div>
          </div>
        ) : (
          /* Live Video Stream View */
          <>
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-10 space-y-2">
                <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                <span className="text-xs text-slate-300 font-mono">Initializing Camera Sensor...</span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? '-scale-x-100' : ''
              }`}
            />

            {/* Target Reticle / Face Framing Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-68 sm:w-64 sm:h-80 border-2 border-teal-400/40 rounded-[40px] relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-teal-400" />
                <div className="absolute top-2 left-0 right-0 text-center">
                  <span className="bg-navy-950/80 text-[10px] text-teal-300 font-mono px-2 py-0.5 rounded-full border border-teal-500/20">
                    Align Face in Frame
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Controls Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {capturedPreview ? (
          /* Captured Actions */
          <div className="w-full flex items-center justify-between gap-3">
            <button
              onClick={handleRetake}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Photo</span>
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 text-xs font-bold shadow-lg shadow-teal-500/25 transition-all flex items-center space-x-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Submit for Forensic Inspection</span>
            </button>
          </div>
        ) : (
          /* Live Stream Capture Button */
          <div className="w-full flex items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200">Position face centered under even lighting</p>
              <p className="text-[11px] text-slate-400">Capture resolution: 1280×720 HQ</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleCapture}
                disabled={isLoading || !!cameraError}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-navy-950 text-xs font-bold shadow-lg shadow-teal-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Take Snapshot</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Transparency Note */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Forensic Notice:</strong> Captured live snapshots are processed directly through the forensic CNN inference pipeline. DeepGuard evaluates image pixels directly and <em>never classifies media as authentic simply because it came from a camera sensor</em>. Pointing your camera at a digital monitor or printed paper image introduces optical moiré and specular reflection patterns that reduce diagnostic confidence.
        </p>
      </div>
    </div>
  );
}
