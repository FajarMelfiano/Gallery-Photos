@echo off
REM Photo Gallery - Windows Start Script
REM Double-click this file to start the server

echo ========================================
echo   Photo Gallery - Server Startup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this file from the 'backend' folder.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed!
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo Starting Photo Gallery Server...
echo.
echo ========================================
echo Open your browser and go to:
echo   🖼️  Gallery: http://localhost:5000
echo   🔐 Admin:   http://localhost:5000/admin
echo ========================================
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start
pause
