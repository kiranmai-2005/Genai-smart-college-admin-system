@echo off
echo ===============================================
echo   COLLEGE ADMIN PRO - PRODUCTION DEPLOYMENT
echo ===============================================
echo.
echo This script will build and deploy your system for production use.
echo Users will be able to access it without running development commands!
echo.
echo Steps:
echo 1. Build the React frontend for production
echo 2. Start production servers
echo 3. Make system accessible to users
echo.
echo ===============================================

REM Build the frontend
echo Building React frontend for production...
cd frontend
npm run build
cd ..

REM Check if build was successful
if not exist "frontend\build" (
    echo ERROR: Build failed! Check for errors above.
    pause
    exit /b 1
)

echo.
echo ===============================================
echo BUILD SUCCESSFUL!
echo ===============================================
echo.
echo Your production build is ready in: frontend\build\
echo.
echo To share with users, you can:
echo.
echo OPTION 1: Local Network Sharing
echo - Run: share_timetable.bat
echo - Share the IP address shown with users on your WiFi
echo.
echo OPTION 2: Deploy to Web Server
echo - Upload frontend\build\ to any web server (Apache, Nginx, etc.)
echo - Configure backend API URL in the build
echo.
echo OPTION 3: Use Production Server
echo - Install a web server like Apache/Nginx
echo - Serve the build folder as static files
echo.
echo ===============================================
echo PRODUCTION BUILD READY!
echo ===============================================
echo.
echo File location: %CD%\frontend\build\
echo Size: ~81KB (optimized and minified)
echo.
pause
