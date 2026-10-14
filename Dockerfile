# ========================================================
# Stage 1: Build the React Frontend (Node.js)
# ========================================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

# Copy frontend dependency manifests
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code and build production assets
COPY frontend/ ./
RUN npm run build

# ========================================================
# Stage 2: Python FastAPI Production Server with PyTorch
# ========================================================
FROM python:3.11-slim AS production

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install minimal OS dependencies for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-optimized PyTorch first (much smaller & faster than CUDA wheels)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install backend dependencies
COPY requirements.txt ./
# Remove torch & torchvision from requirements to avoid reinstallation
RUN grep -v "torch" requirements.txt > requirements_cloud.txt && \
    pip install --no-cache-dir -r requirements_cloud.txt

# Copy backend source code, model weights, and sample data
COPY backend/ ./backend/
COPY weights/ ./weights/
COPY samples/ ./samples/

# Copy compiled frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port (Render/Railway/HuggingFace dynamic PORT supported)
EXPOSE 8000

# Run FastAPI production server
CMD ["sh", "-c", "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
