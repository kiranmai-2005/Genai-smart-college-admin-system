@echo off
echo ===============================================
echo   COLLEGE ADMIN PRO - SHAREABLE LINK
echo ===============================================
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    for /f "tokens=*" %%b in ("%%a") do set IP=%%b
)

REM Remove leading space
set IP=%IP:~1%

echo Your College Admin Pro system is running!
echo.
echo ===============================================
echo SHARE THIS LINK WITH USERS:
echo ===============================================
echo.
echo http://%IP%:8080
echo.
echo ===============================================
echo LOCAL ACCESS (your computer only):
echo ===============================================
echo.
echo http://localhost:8080
echo.
echo ===============================================
echo INSTRUCTIONS FOR USERS:
echo ===============================================
echo.
echo 1. Make sure you're on the same WiFi network
echo 2. Open the link above in any web browser
echo 3. No installation or setup required!
echo 4. Full timetable system loads instantly
echo.
echo Press any key to close...
pause >nul
