@echo off
echo Starting TLCN Application...

:: Start Backend
start "TLCN Backend" cmd /k "cd services\main-backend && npm run start:dev"

:: Start Frontend
start "TLCN Frontend" cmd /k "cd frontend && npm run dev"

:: Start AI Service
start "TLCN AI Service" cmd /k "cd services\ai-service && call venv\Scripts\activate && uvicorn app.main:app --reload --port 8001"

echo Application starting...
echo Backend running on port 3000 (usually)
echo Frontend running on port 3001 (usually)
echo AI Service running on port 8001
