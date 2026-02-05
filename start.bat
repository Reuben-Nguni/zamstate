@echo off
REM ZAMSTATE Quick Start Script (Windows)
REM Starts both frontend and backend servers

echo.
echo ========================================
echo     ZAMSTATE Full Stack Startup
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

echo Checking Node.js version...
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js %NODE_VERSION% found

echo.
echo Starting Backend Server...
start "ZAMSTATE Backend" cmd /k "cd server && npm install && npm run dev"
timeout /t 3 /nobreak

echo.
echo Starting Frontend Server...
start "ZAMSTATE Frontend" cmd /k "npm install && npm run dev"
timeout /t 2 /nobreak

echo.
echo ========================================
echo ZAMSTATE is starting!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5000
echo.
echo Admin Credentials:
echo   Email:    admin@zamstate.com
echo   Password: Admin@123456
echo.
echo Close the terminal windows to stop servers
echo ========================================
echo.
