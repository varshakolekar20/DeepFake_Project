from fastapi import APIRouter, UploadFile, File, Form, Query, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, FileResponse
import os
import io
import cv2
import numpy as np
from PIL import Image
from backend.app.core.config import settings
from backend.app.core.security import generate_job_id, sanitize_filename, cleanup_file_safely
from backend.app.services.face_extractor import face_extractor
from backend.app.services.model_loader import model_manager
from backend.app.services.video_processor import video_processor
from backend.app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/analyze", tags=["Analysis"])

def to_jsonable(obj):
    if isinstance(obj, dict):
        return {str(k): to_jsonable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [to_jsonable(v) for v in obj]
    elif isinstance(obj, (np.integer,)):
        return int(obj)
    elif isinstance(obj, (np.floating,)):
        return float(obj)
    elif isinstance(obj, (np.bool_,)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return to_jsonable(obj.tolist())
    return obj

@router.post("/image")
async def analyze_image(
    file: UploadFile = File(...),
    mode: str = Query("facial", pattern="^(facial|aigen)$")
):
    """
    Analyzes an uploaded image for either:
    1. Facial manipulation (deepfakes, face swaps, reenactments)
    2. General AI-generated synthetic images (diffusion, GANs)
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Supported: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )

    contents = await file.read()
    if len(contents) > settings.MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size ({settings.MAX_IMAGE_SIZE_BYTES // (1024*1024)}MB)."
        )

    # Decode image with OpenCV
    nparr = np.frombuffer(contents, np.uint8)
    image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image_bgr is None:
        raise HTTPException(status_code=400, detail="Corrupted or undecodable image file.")

    pil_img = Image.open(io.BytesIO(contents)).convert('RGB')
    quality = face_extractor.assess_quality(image_bgr)

    # MODE 1: Facial Manipulation Detection
    if mode == "facial":
        faces = face_extractor.extract_faces(image_bgr)
        
        if len(faces) == 0:
            return JSONResponse(to_jsonable({
                "mode": "facial",
                "verdict": "Unable to Analyze",
                "verdict_badge": "muted",
                "raw_score": 0.0,
                "percentage": 0.0,
                "confidence": 0.0,
                "face_count": 0,
                "quality": quality,
                "explanation": (
                    "No human faces were detected in the uploaded image. "
                    "DeepGuard facial manipulation mode requires a clear, unobstructed facial region (min 40x40 px)."
                ),
                "faces": [],
                "heatmap_data_uri": None
            }))

        face_results = []
        highest_score = -1.0
        primary_pred = None

        for face in faces:
            pred = model_manager.classify_and_explain(
                model_manager.facial_model, 
                face["crop_pil"], 
                mode="facial"
            )
            
            face_info = {
                "face_id": face["face_id"],
                "bbox": face["bbox"],
                "padded_bbox": face["padded_bbox"],
                "verdict": pred["verdict"],
                "raw_score": pred["raw_score"],
                "percentage": pred["percentage"],
                "display_confidence_pct": pred.get("display_confidence_pct", round(pred["confidence"] * 100, 1)),
                "confidence": pred["confidence"],
                "explanation": pred["explanation"],
                "heatmap_data_uri": pred["heatmap_data_uri"],
                "suspicious_regions": pred.get("suspicious_regions", [])
            }
            face_results.append(face_info)

            if pred["raw_score"] > highest_score:
                highest_score = pred["raw_score"]
                primary_pred = pred

        # If any face is classified as manipulated, the overall image is flagged
        return JSONResponse(to_jsonable({
            "mode": "facial",
            "verdict": primary_pred["verdict"],
            "verdict_badge": primary_pred["verdict_badge"],
            "raw_score": primary_pred["raw_score"],
            "percentage": primary_pred["percentage"],
            "display_confidence_pct": primary_pred.get("display_confidence_pct", round(primary_pred["confidence"] * 100, 1)),
            "confidence": primary_pred["confidence"],
            "face_count": len(faces),
            "quality": quality,
            "explanation": primary_pred["explanation"],
            "faces": face_results,
            "heatmap_data_uri": primary_pred["heatmap_data_uri"],
            "suspicious_regions": primary_pred.get("suspicious_regions", []),
            "thresholds": primary_pred["thresholds"],
            "model_metadata": model_manager.facial_metadata
        }))

    # MODE 2: General AI-Generated Image Detection
    else:
        pred = model_manager.classify_and_explain(
            model_manager.aigen_model, 
            pil_img, 
            mode="aigen"
        )
        return JSONResponse(to_jsonable({
            "mode": "aigen",
            "verdict": pred["verdict"],
            "verdict_badge": pred["verdict_badge"],
            "raw_score": pred["raw_score"],
            "percentage": pred["percentage"],
            "display_confidence_pct": pred.get("display_confidence_pct", round(pred["confidence"] * 100, 1)),
            "confidence": pred["confidence"],
            "face_count": "N/A (Global Image Analysis)",
            "quality": quality,
            "explanation": pred["explanation"],
            "faces": [],
            "heatmap_data_uri": pred["heatmap_data_uri"],
            "suspicious_regions": pred.get("suspicious_regions", []),
            "thresholds": pred["thresholds"],
            "model_metadata": model_manager.aigen_metadata
        }))

@router.post("/video")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Submits a video for asynchronous keyframe extraction and face-tracking analysis.
    Returns a job_id for tracking status and progress.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Supported: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}"
        )

    job_id = generate_job_id()
    safe_name = sanitize_filename(file.filename)
    save_path = os.path.join(settings.TEMP_UPLOADS_DIR, f"{job_id}_{safe_name}")

    contents = await file.read()
    if len(contents) > settings.MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Video exceeds size limit ({settings.MAX_VIDEO_SIZE_BYTES // (1024*1024)}MB)."
        )

    with open(save_path, "wb") as f:
        f.write(contents)

    job = video_processor.create_job(job_id, save_path)
    background_tasks.add_task(video_processor.process_video, job_id)

    return JSONResponse({
        "job_id": job_id,
        "status": "queued",
        "message": "Video job successfully registered and submitted for processing."
    })
