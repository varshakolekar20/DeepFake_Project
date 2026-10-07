@echo off
title DeepGuard - Deepfake Detection System
echo ========================================================
echo        Starting DeepGuard AI Detection System
echo ========================================================
echo.

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "DeepGuard Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching Vite React Frontend on http://localhost:5173 ...
cd frontend
start "DeepGuard Frontend" cmd /k "npm run dev -- --host"
cd ..

echo.
echo ========================================================
echo DeepGuard is starting up!
echo Backend Docs: http://127.0.0.1:8000/docs
echo Frontend App: http://localhost:5173/
echo ========================================================
pause
