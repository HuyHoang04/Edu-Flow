@echo off
echo ==========================================
echo      TLCN PRODUCTION BUILD & START
echo ==========================================

echo.
echo [1/3] Building Backend...
cd services\main-backend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo Backend build failed!
    pause
    exit /b %errorlevel%
)
echo Backend built successfully.
cd ..\..

echo.
echo [2/3] Building Frontend...
cd frontend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b %errorlevel%
)
echo Frontend built successfully.
cd ..

echo.
echo [3/3] Starting Services...

:: Start Backend (Production Mode)
start "TLCN Backend (Prod)" cmd /k "cd services\main-backend && npm run start:prod"

:: Start Frontend (Production Mode)
start "TLCN Frontend (Prod)" cmd /k "cd frontend && npm start"

:: Start AI Service
start "TLCN AI Service" cmd /k "cd services\ai-service && call venv\Scripts\activate && uvicorn app.main:app --port 8001"

echo.
echo ==========================================
echo      ALL SERVICES STARTED
echo ==========================================
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo AI Service: http://localhost:8001
echo.
pause
