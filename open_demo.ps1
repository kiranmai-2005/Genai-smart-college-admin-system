# PowerShell script to open the College Timetable System Demo
Write-Host "Opening College Timetable System Demo..." -ForegroundColor Green
Write-Host ""
Write-Host "This will open two windows:" -ForegroundColor Yellow
Write-Host "1. Static demo page (timetable_demo.html)" -ForegroundColor Cyan
Write-Host "2. Full React application (http://localhost:3000)" -ForegroundColor Cyan
Write-Host ""
Write-Host "If the React app doesn't open automatically, manually go to:" -ForegroundColor Yellow
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Get the current directory path
$currentPath = Get-Location
$demoPath = Join-Path $currentPath "timetable_demo.html"

# Open the static demo page
Write-Host "Opening static demo page..." -ForegroundColor Cyan
Start-Process $demoPath

# Open the React application
Write-Host "Opening React application..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Demo opened successfully!" -ForegroundColor Green
Write-Host "Press Enter to close this window..." -ForegroundColor Gray
Read-Host
