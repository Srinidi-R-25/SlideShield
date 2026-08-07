# SlideShield Single Terminal Launcher
# Starts both FastAPI Backend and Next.js Frontend together in PowerShell

$PythonPath = "python"

Write-Host "🚀 Starting SlideShield Full-Stack Application..." -ForegroundColor Green
Write-Host "1. Launching Backend on http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host "2. Launching Frontend on http://localhost:3000" -ForegroundColor Cyan

# Start Backend in background process
$BackendJob = Start-Job -ScriptBlock {
    param($py)
    Set-Location "c:\Users\LENOVO SLIM 3 008\OneDrive\Documents\SlideShield"
    & $py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
} -ArgumentList $PythonPath

# Start Frontend in current terminal
Set-Location "c:\Users\LENOVO SLIM 3 008\OneDrive\Documents\SlideShield\frontend"
npm run dev

# Stop backend job on exit
Stop-Job $BackendJob
Remove-Job $BackendJob
