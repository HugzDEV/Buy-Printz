@echo off
echo Starting B2Sign Pro Backend Server...
echo.

cd backend

echo Installing Python dependencies...
pip install -r ../requirements.txt

echo.
echo Starting FastAPI server on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause
