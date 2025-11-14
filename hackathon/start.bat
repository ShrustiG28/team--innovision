@echo off
REM Quick Start Script for Decentralized Identity Vault
REM Windows PowerShell version

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🔐 Decentralized Identity Vault - Quick Start          ║
echo ║     Starting Backend and Frontend...                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Clean npm cache to avoid corruption issues
echo 🧹 Cleaning npm cache...
call npm cache clean --force >nul 2>&1
echo.

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
REM Remove corrupted node_modules if present
if exist node_modules (
    echo Removing corrupted node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ⚠️  Retrying backend installation...
    call npm install --legacy-peer-deps
)
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    echo Try running: cd backend && npm install
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
REM Remove corrupted node_modules if present
if exist node_modules (
    echo Removing corrupted node_modules...
    rmdir /s /q node_modules >nul 2>&1
)
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ⚠️  Retrying frontend installation...
    call npm install --legacy-peer-deps
)
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    echo Try running: cd frontend && npm install
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
echo.

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Starting Services...                                  ║
echo ║                                                        ║
echo ║  Backend:  http://localhost:5000                       ║
echo ║  Frontend: http://localhost:3000                       ║
echo ║                                                        ║
echo ║  Keep this window open. A new window will open        ║
echo ║  for the backend. Do NOT close either window.         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Start backend in new window
cd ..\backend
start cmd /k "npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ✅ Services started!
echo    - Backend running on http://localhost:5000
echo    - Frontend running on http://localhost:3000
echo.
echo 📝 Next steps:
echo    1. Wait for both windows to show "ready" message
echo    2. Open http://localhost:3000 in your browser
echo    3. Start with the 🆔 Identity tab to create your DID
echo.
echo 💡 To stop, close both terminal windows
echo.
pause
