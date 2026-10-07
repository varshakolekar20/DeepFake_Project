import os
import uuid
import time
import shutil
from pathlib import Path
from backend.app.core.config import settings

def generate_job_id() -> str:
    """Generate a collision-resistant unique identifier for tasks and uploads."""
    return str(uuid.uuid4())

def sanitize_filename(filename: str) -> str:
    """Produce a safe server-side storage filename preserving only valid extension."""
    ext = Path(filename).suffix.lower()
    return f"{uuid.uuid4().hex}{ext}"

def cleanup_file_safely(file_path: str):
    """Safely delete a temporary file if it exists without throwing unhandled exceptions."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"[DeepGuard Security] Warning: Failed to clean up file {file_path}: {e}")

def cleanup_old_temp_files(max_age_seconds: int = 3600):
    """Garbage collect temporary files older than max_age_seconds."""
    now = time.time()
    for root, dirs, files in os.walk(settings.TEMP_UPLOADS_DIR):
        for f in files:
            path = os.path.join(root, f)
            try:
                if os.path.getmtime(path) < (now - max_age_seconds):
                    os.remove(path)
            except Exception:
                pass
