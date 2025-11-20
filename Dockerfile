# Use official Playwright Python image with all dependencies pre-installed
FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Set environment variables for Playwright
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Verify Playwright browsers are available (base image includes them)
RUN playwright install chromium

# Copy application code
COPY backend/ ./backend/
COPY . .

# Set environment variables for Playwright and Python
ENV PYTHONPATH=/app
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Set default port and expose it
ENV PORT=8080
EXPOSE 8080

# Create startup script with proper Python path
RUN echo '#!/bin/sh\nexport PYTHONPATH=/app:$PYTHONPATH\npython -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}' > /start.sh && chmod +x /start.sh

# Start the application
CMD ["/start.sh"]
