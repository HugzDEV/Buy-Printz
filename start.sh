#!/bin/bash

echo "Starting BuyPrintz Backend Server..."
echo

cd backend

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Starting FastAPI server on port $PORT"
echo

uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

