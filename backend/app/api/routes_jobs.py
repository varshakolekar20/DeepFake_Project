from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
import os
import time
import json
import tempfile
from typing import Dict, Any
from backend.app.services.video_processor import video_processor
from backend.app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/jobs", tags=["Jobs & Reports"])

@router.get("/{job_id}")
async def get_job_status(job_id: str):
    """Retrieves current processing state, progress percentage, and final results."""
    job = video_processor.active_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job ID not found.")
        
    return JSONResponse({
        "job_id": job.job_id,
        "status": job.status,
        "progress": job.progress,
        "result": job.result,
        "error_message": job.error_message
    })

@router.post("/{job_id}/cancel")
async def cancel_job(job_id: str):
    """Signals cancellation to an active video processing job."""
    success = video_processor.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Active job not found or already completed.")
    return JSONResponse({"job_id": job_id, "status": "cancelled", "message": "Cancellation confirmed."})

@router.post("/export/pdf")
async def export_pdf(payload: Dict[str, Any] = Body(...)):
    """Generates and streams a downloadable PDF audit report."""
    temp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_pdf.close()
    
    ReportGenerator.generate_pdf_report(payload, temp_pdf.name)
    return FileResponse(
        temp_pdf.name,
        media_type="application/pdf",
        filename="DeepGuard_Forensic_Report.pdf"
    )

@router.post("/export/json")
async def export_json(payload: Dict[str, Any] = Body(...)):
    """Formats and returns a standardized JSON audit record."""
    json_str = ReportGenerator.generate_json_report(payload)
    temp_json = tempfile.NamedTemporaryFile(delete=False, suffix=".json")
    with open(temp_json.name, "w", encoding="utf-8") as f:
        f.write(json_str)
        
    return FileResponse(
        temp_json.name,
        media_type="application/json",
        filename="DeepGuard_Forensic_Report.json"
    )

@router.post("/feedback")
async def submit_feedback(payload: Dict[str, Any] = Body(...)):
    """
    Collects user forensic feedback for model evaluation and manual review.
    Feedback is audited separately and never directly used as automated training ground truth.
    """
    feedback_dir = os.path.join(os.path.dirname(__file__), "..", "..", "feedback_logs")
    os.makedirs(feedback_dir, exist_ok=True)
    log_file = os.path.join(feedback_dir, "user_feedback.jsonl")
    
    entry = {
        "timestamp": payload.get("timestamp", time.time()),
        "mode": payload.get("mode", "facial"),
        "predicted_verdict": payload.get("predicted_verdict"),
        "user_assessment": payload.get("user_assessment"),
        "reason": payload.get("reason"),
        "user_comments": payload.get("comments", ""),
        "review_status": "pending_manual_audit"
    }
    
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
        
    return JSONResponse({
        "status": "success",
        "message": "Feedback submitted successfully. Thank you for contributing to forensic audit evaluations."
    })

