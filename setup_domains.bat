@echo off
echo ===============================================
echo   COLLEGE ADMIN PRO - DOMAIN SETUP
echo ===============================================
echo.
echo This script will help you set up professional domain names
echo for your College Admin Pro system.
echo.
echo The system will be accessible at:
echo - http://college-admin.edu (Frontend)
echo - http://api.college-admin.edu (Backend API)
echo.
echo ===============================================

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator privileges detected.
) else (
    echo Please run this script as Administrator to modify the hosts file.
    echo.
    echo Right-click on setup_domains.bat and select "Run as administrator"
    pause
    exit /b 1
)

echo Adding domain entries to hosts file...
echo.

REM Backup hosts file
copy "C:\Windows\System32\drivers\etc\hosts" "C:\Windows\System32\drivers\etc\hosts.backup" >nul 2>&1

REM Add localhost entries
echo 127.0.0.1    college-admin.edu >> "C:\Windows\System32\drivers\etc\hosts"
echo 127.0.0.1    api.college-admin.edu >> "C:\Windows\System32\drivers\etc\hosts"

echo.
echo ===============================================
echo SUCCESS! Domain names have been configured.
echo ===============================================
echo.
echo Your system is now accessible at:
echo - Frontend: http://college-admin.edu
echo - Backend:  http://api.college-admin.edu
echo.
echo To start the system:
echo 1. Run 'open_demo.bat' to start everything
echo 2. Or start manually:
echo    cd backend && python wsgi.py
echo    cd frontend && npm start
echo.
echo Press any key to continue...
pause >nul
