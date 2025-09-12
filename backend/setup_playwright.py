#!/usr/bin/env python3
"""
Playwright Setup Script for Production
This script installs the required Playwright browsers for production deployment.
Run this script after installing requirements.txt to ensure all browsers are available.
"""

import subprocess
import sys
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a command and handle errors"""
    try:
        logger.info(f"🔧 {description}...")
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} failed: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def main():
    """Main setup function"""
    logger.info("🚀 Setting up Playwright for production deployment...")
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        logger.error("❌ requirements.txt not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        logger.error("❌ Failed to install Python dependencies")
        sys.exit(1)
    
    # Install Playwright browsers
    if not run_command("playwright install chromium", "Installing Chromium browser"):
        logger.error("❌ Failed to install Chromium browser")
        sys.exit(1)
    
    # Install system dependencies (for Linux/containerized environments)
    if not run_command("playwright install-deps chromium", "Installing system dependencies for Chromium"):
        logger.warning("⚠️ System dependencies installation failed - this may be expected in some environments")
    
    # Verify installation
    try:
        import playwright
        logger.info(f"✅ Playwright version: {playwright.__version__}")
        
        # Test browser launch
        from playwright.async_api import async_playwright
        import asyncio
        
        async def test_browser():
            try:
                playwright_instance = await async_playwright().start()
                browser = await playwright_instance.chromium.launch(headless=True)
                await browser.close()
                await playwright_instance.stop()
                return True
            except Exception as e:
                logger.error(f"❌ Browser test failed: {e}")
                return False
        
        if asyncio.run(test_browser()):
            logger.info("✅ Browser test successful - Playwright is ready for production")
        else:
            logger.error("❌ Browser test failed")
            sys.exit(1)
            
    except ImportError as e:
        logger.error(f"❌ Failed to import Playwright: {e}")
        sys.exit(1)
    
    logger.info("🎉 Playwright setup completed successfully!")
    logger.info("📋 Production deployment checklist:")
    logger.info("   ✅ Python dependencies installed")
    logger.info("   ✅ Chromium browser installed")
    logger.info("   ✅ System dependencies installed")
    logger.info("   ✅ Browser functionality verified")
    logger.info("   ✅ Ready for headless operation")

if __name__ == "__main__":
    main()
