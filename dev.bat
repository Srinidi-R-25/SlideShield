@echo off
echo Starting SlideShield Full-Stack Server...
echo [Backend] http://127.0.0.1:8000
echo [Frontend] http://localhost:3000
echo.

start "SlideShield Backend" python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
cd frontend && npm run dev
