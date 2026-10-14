from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
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

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Determine frontend production build path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
frontend_dist = os.path.join(BASE_DIR, "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API, docs, or sample endpoints
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
            or full_path.startswith("samples")
            or full_path == "health"
        ):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_path = os.path.join(frontend_dist, "index.html")
        return FileResponse(index_path)
else:
    @app.get("/")
    def read_root():
        return {
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs_url": "/docs",
            "api_v1_prefix": settings.API_V1_STR
        }
