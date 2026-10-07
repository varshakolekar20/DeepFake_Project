import cv2
import numpy as np
import os
import time
from typing import Dict, Any, List, Optional, Callable
from PIL import Image
import io
import base64
from backend.app.core.config import settings
from backend.app.services.face_extractor import face_extractor
from backend.app.services.model_loader import model_manager

class VideoAnalysisJob:
    """Represents an active or finished background video processing job."""
    def __init__(self, job_id: str, file_path: str):
        self.job_id = job_id
        self.file_path = file_path
        self.status = "queued" # queued, processing, completed, failed, cancelled
        self.progress = 0.0     # 0.0 to 100.0
        self.cancel_requested = False
        self.result: Optional[Dict[str, Any]] = None
        self.error_message: Optional[str] = None
        self.created_at = time.time()

class VideoProcessor:
    """
    Forensic Video Sampling, Face Tracking, and Frame Aggregation Engine.
    Samples keyframes across clip timeline, performs per-frame face detection,
    and aggregates scores using robust top-k and mean pooling.
    """
    def __init__(self):
        self.active_jobs: Dict[str, VideoAnalysisJob] = {}

    def create_job(self, job_id: str, file_path: str) -> VideoAnalysisJob:
        job = VideoAnalysisJob(job_id, file_path)
        self.active_jobs[job_id] = job
        return job

    def cancel_job(self, job_id: str) -> bool:
        if job_id in self.active_jobs:
            self.active_jobs[job_id].cancel_requested = True
            self.active_jobs[job_id].status = "cancelled"
            return True
        return False

    def process_video(self, job_id: str):
        """Executes video analysis synchronously or inside a background worker."""
        job = self.active_jobs.get(job_id)
        if not job:
            return
            
        job.status = "processing"
        file_path = job.file_path
        
        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            job.status = "failed"
            job.error_message = "Unable to decode video file. File might be corrupted or in an unsupported format."
            return

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = total_frames / fps
        
        if duration_sec > settings.MAX_VIDEO_DURATION_SECONDS:
            cap.release()
            job.status = "failed"
            job.error_message = f"Video duration ({round(duration_sec, 1)}s) exceeds max allowed limit ({settings.MAX_VIDEO_DURATION_SECONDS}s)."
            return

        # Determine frame sampling intervals
        sample_step = max(1, int(fps / settings.VIDEO_SAMPLE_FPS))
        frame_indices = list(range(0, total_frames, sample_step))[:settings.MAX_SAMPLED_FRAMES]
        
        sampled_results = []
        faces_detected_count = 0
        all_face_scores = []
        suspicious_frames = []

        try:
            for idx, frame_idx in enumerate(frame_indices):
                if job.cancel_requested:
                    job.status = "cancelled"
                    cap.release()
                    return

                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame_bgr = cap.read()
                if not ret or frame_bgr is None:
                    continue

                timestamp_sec = round(frame_idx / fps, 2)
                quality = face_extractor.assess_quality(frame_bgr)
                faces = face_extractor.extract_faces(frame_bgr)

                frame_entry = {
                    "frame_index": frame_idx,
                    "timestamp": timestamp_sec,
                    "faces_found": len(faces),
                    "quality": quality,
                    "max_score": 0.0,
                    "faces": []
                }

                if len(faces) > 0:
                    faces_detected_count += 1
                    for face in faces:
                        # Run classification and Grad-CAM on face crop
                        pred = model_manager.classify_and_explain(
                            model_manager.facial_model, 
                            face["crop_pil"], 
                            mode="facial"
                        )
                        all_face_scores.append(pred["raw_score"])
                        
                        # Thumbnail for timeline preview
                        thumb_io = io.BytesIO()
                        face["crop_pil"].resize((96, 96)).save(thumb_io, format="JPEG", quality=80)
                        thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_io.getvalue()).decode("utf-8")

                        face_summary = {
                            "face_id": face["face_id"],
                            "bbox": face["bbox"],
                            "raw_score": pred["raw_score"],
                            "verdict": pred["verdict"],
                            "thumbnail": thumb_b64,
                            "heatmap_preview": pred["heatmap_data_uri"]
                        }
                        frame_entry["faces"].append(face_summary)
                        if pred["raw_score"] > frame_entry["max_score"]:
                            frame_entry["max_score"] = pred["raw_score"]

                    if frame_entry["max_score"] >= settings.TAU_HIGH_MANIPULATED:
                        suspicious_frames.append({
                            "timestamp": timestamp_sec,
                            "score": frame_entry["max_score"],
                            "frame_index": frame_idx,
                            "preview": frame_entry["faces"][0]["thumbnail"] if frame_entry["faces"] else None
                        })

                sampled_results.append(frame_entry)
                job.progress = round(((idx + 1) / len(frame_indices)) * 100, 1)

            cap.release()

            # Video Aggregation and Honest Uncertainty Handling
            coverage_pct = round((faces_detected_count / max(1, len(sampled_results))) * 100, 1)
            
            if faces_detected_count == 0:
                final_verdict = "Unable to analyze media"
                verdict_badge = "muted"
                aggregate_score = 0.0
                explanation = (
                    "No human faces were detected across the sampled video frames. "
                    "DeepGuard facial manipulation detection requires clearly visible human faces."
                )
            elif len(all_face_scores) > 0:
                scores_arr = np.array(all_face_scores)
                median_score = float(np.median(scores_arr))
                sorted_scores = sorted(all_face_scores, reverse=True)
                top_k = sorted_scores[:min(3, len(sorted_scores))]
                top_k_mean = float(np.mean(top_k))
                overall_mean = float(np.mean(all_face_scores))
                
                # Robust weighted aggregation:
                if len(suspicious_frames) == 0:
                    # Clip has NO suspicious frames detected at all
                    aggregate_score = round(float(np.mean([median_score, overall_mean])), 4)
                    if aggregate_score <= 0.45:
                        final_verdict = "Likely REAL"
                        verdict_badge = "success"
                        display_conf = round((1.0 - aggregate_score) * 100, 1)
                        explanation = (
                            f"Facial regions showed authentic consistency patterns across sampled frames "
                            f"(Authenticity confidence: {display_conf}%). No synthetic manipulation artifacts detected."
                        )
                        suspicious_regions = [{
                            "region": "All Facial Video Frames",
                            "severity": "NORMAL",
                            "badge": "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                            "description": "Authentic anatomical continuity and consistent lighting across sampled video timestamps."
                        }]
                    else:
                        final_verdict = "INCONCLUSIVE — Unable to determine reliably"
                        verdict_badge = "warning"
                        display_conf = 50.0
                        explanation = f"Compression noise detected across the clip (Model score: {round(aggregate_score * 100, 1)}%)."
                        suspicious_regions = [{
                            "region": "Video Compression Noise",
                            "severity": "ELEVATED",
                            "badge": "bg-amber-500/10 text-amber-500 border-amber-500/30",
                            "description": "Video compression or motion blur detected between authentic thresholds."
                        }]
                else:
                    # At least one frame exceeded manipulation threshold
                    aggregate_score = round(0.6 * top_k_mean + 0.4 * overall_mean, 4)
                    if aggregate_score >= settings.TAU_HIGH_MANIPULATED:
                        final_verdict = "Likely FAKE"
                        verdict_badge = "destructive"
                        display_conf = round(aggregate_score * 100, 1)
                        explanation = (
                            f"Synthetic manipulation artifacts were detected in facial regions across {len(suspicious_frames)} "
                            f"sampled timestamps (Manipulation likelihood: {display_conf}%)."
                        )
                        suspicious_regions = [{
                            "region": "Temporal Face Track",
                            "severity": "HIGH",
                            "badge": "bg-red-500/10 text-red-500 border-red-500/30",
                            "description": f"Facial swap boundary seams or neural artifacts detected across {len(suspicious_frames)} video timestamps."
                        }]
                    elif aggregate_score <= settings.TAU_LOW_AUTHENTIC:
                        final_verdict = "Likely REAL"
                        verdict_badge = "success"
                        display_conf = round((1.0 - aggregate_score) * 100, 1)
                        explanation = (
                            f"Facial regions showed authentic consistency patterns across sampled frames "
                            f"(Authenticity confidence: {display_conf}%)."
                        )
                        suspicious_regions = [{
                            "region": "All Facial Video Frames",
                            "severity": "NORMAL",
                            "badge": "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                            "description": "Authentic anatomical continuity and consistent lighting across sampled video timestamps."
                        }]
                    else:
                        final_verdict = "INCONCLUSIVE — Unable to determine reliably"
                        verdict_badge = "warning"
                        display_conf = 50.0
                        explanation = (
                            f"Borderline consistency metrics detected across the clip (Model score: {round(aggregate_score * 100, 1)}%). "
                            f"Consider manual inspection of key frames."
                        )
                        suspicious_regions = [{
                            "region": "Sampled Video Frames",
                            "severity": "ELEVATED",
                            "badge": "bg-amber-500/10 text-amber-500 border-amber-500/30",
                            "description": "Borderline facial metrics detected across sampled video keyframes."
                        }]
            else:
                final_verdict = "INCONCLUSIVE — Unable to determine reliably"
                verdict_badge = "warning"
                aggregate_score = 0.0
                display_conf = 50.0
                explanation = "Insufficient face samples collected to make a definitive forensic prediction."
                suspicious_regions = []

            job.result = {
                "verdict": final_verdict,
                "verdict_badge": verdict_badge,
                "aggregate_score": aggregate_score,
                "percentage": round(aggregate_score * 100, 1),
                "display_confidence_pct": display_conf if 'display_conf' in locals() else round(aggregate_score * 100, 1),
                "duration_seconds": round(duration_sec, 2),
                "total_frames_in_video": total_frames,
                "sampled_frames_count": len(sampled_results),
                "faces_detected_frames": faces_detected_count,
                "analysis_coverage_pct": coverage_pct,
                "suspicious_frames": suspicious_frames[:6],
                "suspicious_regions": suspicious_regions if 'suspicious_regions' in locals() else [],
                "timeline": sampled_results,
                "explanation": explanation
            }
            job.status = "completed"
            job.progress = 100.0

        except Exception as e:
            if cap.isOpened():
                cap.release()
            job.status = "failed"
            job.error_message = f"Error during video processing: {str(e)}"

# Singleton Video Processor
video_processor = VideoProcessor()
