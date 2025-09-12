#!/usr/bin/env python3
"""
Simple script to install Playwright browsers in production
This should be run in the production environment to fix the browser installation issue
"""

import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def install_playwright_browsers():
    """Install Playwright browsers"""
    logger.info("🚀 Installing Playwright browsers for production...")
    
    try:
        # Install Chromium browser
        logger.info("📦 Installing Chromium browser...")
        result = subprocess.run(
            ["python", "-m", "playwright", "install", "chromium"],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("✅ Chromium browser installed successfully")
        logger.info(f"Output: {result.stdout}")
        
        # Install system dependencies
        logger.info("🔧 Installing system dependencies...")
        result = subprocess.run(
            ["python", "-m", "playwright", "install-deps", "chromium"],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("✅ System dependencies installed successfully")
        logger.info(f"Output: {result.stdout}")
        
        # Verify installation
        logger.info("🧪 Verifying Playwright installation...")
        result = subprocess.run(
            ["python", "-c", "import playwright; print('Playwright installed successfully')"],
            check=True,
            capture_output=True,
            text=True
        )
        logger.info("✅ Playwright verification successful")
        logger.info(f"Output: {result.stdout}")
        
        logger.info("🎉 Playwright browsers installation completed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Playwright installation failed: {e}")
        if e.stdout:
            logger.error(f"Stdout: {e.stdout}")
        if e.stderr:
            logger.error(f"Stderr: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error during Playwright installation: {e}")
        return False

if __name__ == "__main__":
    success = install_playwright_browsers()
    sys.exit(0 if success else 1)
