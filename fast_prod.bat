@echo off
echo Starting TLCN Application...

:: Check for Ollama (Required for Phi-3)
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Ollama is not installed!
    echo Please download and install it from: https://ollama.com
    echo After installing, run this script again.
    pause
    exit /b
)

:: Ensure Phi-3 model is ready
echo Checking/Pulling Phi-3 model...
call ollama pull phi3

:: Start Backend (Production Mode)
start "TLCN Backend (Prod)" cmd /k "cd services\main-backend && npm run start:prod"

:: Wait for Backend to initialize
timeout /t 10

:: Start Frontend (Production Mode)
start "TLCN Frontend (Prod)" cmd /k "cd frontend && npm start"

:: Start AI Service
start "TLCN AI Service" cmd /k "cd services\ai-service && call venv\Scripts\activate && uvicorn app.main:app --port 8001"


echo Application starting...
echo Backend running on port 3000 (usually)
echo Frontend running on port 3001 (usually)
echo AI Service running on port 8001
