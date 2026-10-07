import React, { useState } from 'react';
import { MessageSquare, X, CheckCircle2, AlertCircle, Send, ShieldAlert, Lock } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, currentResult, mode }) {
  const [userAssessment, setUserAssessment] = useState('Actually Real');
  const [reason, setReason] = useState('Optical Sensor Compression');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        timestamp: Date.now(),
        mode: mode || 'facial',
        predicted_verdict: currentResult?.verdict || 'Unknown',
        user_assessment: userAssessment,
        reason: reason,
        comments: comments
      };

      const res = await fetch('/api/v1/jobs/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Server returned an error submitting feedback.');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="feedback-title" className="text-base font-bold text-slate-900 dark:text-white">
                Submit Forensic Feedback
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help researchers audit model reliability & false positives
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Feedback Logged</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Your assessment has been recorded in the forensic audit queue for manual researcher evaluation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Prediction Summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Model Prediction:</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {currentResult?.verdict || 'N/A'} ({currentResult?.display_confidence_pct || currentResult?.percentage || 0}%)
              </span>
            </div>

            {/* User Assessment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Assessment of this Media:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Actually Real', 'Actually Fake', 'Uncertain / Blur'].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setUserAssessment(opt)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      userAssessment === opt
                        ? 'border-teal-500 bg-teal-500/15 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Forensic Rationale */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Primary Observation:
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500"
              >
                <option value="Optical Sensor Compression">Phone camera compression or motion blur</option>
                <option value="Subtle Face Swap Boundary">Subtle face swap or boundary seam missed</option>
                <option value="Unnatural Eyes/Mouth">Unnatural eye gaze, teeth, or mouth deformation</option>
                <option value="AI Diffusion Smoothness">AI generative skin texture smoothing</option>
                <option value="Lighting Shadow Inconsistency">Inconsistent lighting or head angle</option>
                <option value="Other">Other observation</option>
              </select>
            </div>

            {/* Comments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Additional Notes (Optional):
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Describe any specific artifacts or camera conditions..."
                className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Strict Forensic Privacy Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 flex items-start space-x-2">
              <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Research Ethics Notice:</strong> Feedback is held for manual evaluation. User feedback is never automatically ingested as unsupervised training ground truth.
              </p>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 text-center">{errorMsg}</p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-navy-950 flex items-center space-x-1.5 shadow-sm transition-all"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
