@echo off
echo Opening College Timetable System Demo...
echo.
echo This will open two windows:
echo 1. Static demo page (timetable_demo.html)
echo 2. Full React application (http://localhost:3000)
echo.
echo If the React app doesn't open automatically, manually go to:
echo http://localhost:3000
echo.

REM Open the static demo page
start timetable_demo.html

REM Open the React application
start http://localhost:3000

echo Demo opened successfully!
echo Press any key to close this window...
pause >nul
