#!/bin/bash

echo "Starting B2Sign Pro Frontend..."
echo

cd frontend

echo "Installing Node.js dependencies..."
npm install

echo
echo "Starting React development server on http://localhost:3000"
echo

npm run dev
