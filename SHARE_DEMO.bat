@echo off
echo ===============================================
echo   COLLEGE ADMIN PRO - SHARE DEMO
echo ===============================================
echo.
echo Starting demo server for sharing...
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    for /f "tokens=*" %%b in ("%%a") do set IP=%%b
)

REM Remove leading space
set IP=%IP:~1%

echo ===============================================
echo SHARE THIS LINK WITH USERS:
echo ===============================================
echo.
echo http://%IP%:8000
echo.
echo ===============================================
echo LOCAL ACCESS (your computer only):
echo ===============================================
echo.
echo http://localhost:8000
echo.
echo ===============================================

REM Start the demo server
cd college-admin-demo
python -m http.server 8000

pause
