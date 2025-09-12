# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables for Playwright
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install system dependencies required for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libnss3 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (CRITICAL FOR B2SIGN INTEGRATION)
RUN playwright install chromium
RUN playwright install-deps chromium

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
RUN echo '#!/bin/sh\nexport PYTHONPATH=/app:$PYTHONPATH\npython -m uvicorn backend.shipping_costs_api:router --host 0.0.0.0 --port ${PORT:-8080}' > /start.sh && chmod +x /start.sh

# Start the application
CMD ["/start.sh"]
