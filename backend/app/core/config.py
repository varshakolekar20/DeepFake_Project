import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "DeepGuard - Deepfake & Synthetic Media Detection"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Storage & Upload limits
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    WEIGHTS_DIR: str = os.path.join(BASE_DIR, "weights")
    TEMP_UPLOADS_DIR: str = os.path.join(BASE_DIR, "temp_uploads")
    SAMPLE_DATA_DIR: str = os.path.abspath(os.path.join(BASE_DIR, "..", "sample_data"))
    
    MAX_IMAGE_SIZE_BYTES: int = 15 * 1024 * 1024       # 15 MB
    MAX_VIDEO_SIZE_BYTES: int = 100 * 1024 * 1024      # 100 MB
    MAX_VIDEO_DURATION_SECONDS: int = 60               # 60 seconds
    
    # Supported mime types
    ALLOWED_IMAGE_EXTENSIONS: list[str] = [".jpg", ".jpeg", ".png", ".webp"]
    ALLOWED_VIDEO_EXTENSIONS: list[str] = [".mp4", ".mov", ".avi", ".webm"]
    
    # Thresholds for Honest Decision Making (Calibrated dual-threshold system)
    # Scores are P(manipulated/fake) in [0.0, 1.0]
    TAU_HIGH_MANIPULATED: float = 0.55   # >= 0.55 -> Likely FAKE
    TAU_LOW_AUTHENTIC: float = 0.35      # <= 0.35 -> Likely REAL
    # 0.35 < score < 0.55 -> INCONCLUSIVE
    
    # Quality minimum requirements
    MIN_FACE_RESOLUTION: int = 40        # pixels width & height
    MIN_LAPLACIAN_BLUR_VAR: float = 35.0 # Laplacian variance under 35 considered heavily blurred
    
    # Video sampling parameters
    VIDEO_SAMPLE_FPS: float = 1.0        # sample 1 frame per second
    MAX_SAMPLED_FRAMES: int = 30         # cap on frames analyzed per clip

settings = Settings()

# Ensure directories exist
os.makedirs(settings.WEIGHTS_DIR, exist_ok=True)
os.makedirs(settings.TEMP_UPLOADS_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DATA_DIR, exist_ok=True)
