from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.app.core.config import settings
from backend.app.api.routes_analyze import router as analyze_router
from backend.app.api.routes_jobs import router as jobs_router
from backend.app.api.routes_models import router as models_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable CNN-Based Deepfake and AI-Generated Media Detection API"
)

# Enable CORS for local Vite development and deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(analyze_router, prefix=settings.API_V1_STR)
app.include_router(jobs_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)

# Mount sample media directory if exists
if os.path.exists(settings.SAMPLE_DATA_DIR):
    app.mount("/samples", StaticFiles(directory=settings.SAMPLE_DATA_DIR), name="samples")

@app.get("/")
def read_root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
