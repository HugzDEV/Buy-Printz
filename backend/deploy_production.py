#!/usr/bin/env python3
"""
Production deployment script for BuyPrintz B2Sign integration
This script ensures all Playwright dependencies are properly installed
"""

import subprocess
import sys
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a command and log the result"""
    logger.info(f"🔄 {description}...")
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        logger.info(f"✅ {description} completed successfully")
        if result.stdout:
            logger.info(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} failed: {e}")
        if e.stdout:
            logger.error(f"Stdout: {e.stdout}")
        if e.stderr:
            logger.error(f"Stderr: {e.stderr}")
        return False

def install_production_dependencies():
    """Install all production dependencies including Playwright browsers"""
    logger.info("🚀 Installing production dependencies for B2Sign integration...")
    
    # Step 1: Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        logger.error("❌ Failed to install Python dependencies")
        return False
    
    # Step 2: Install Playwright browsers
    if not run_command("playwright install chromium", "Installing Playwright Chromium browser"):
        logger.error("❌ Failed to install Playwright browsers")
        return False
    
    # Step 3: Install system dependencies for Playwright
    if not run_command("playwright install-deps chromium", "Installing system dependencies for Playwright"):
        logger.warning("⚠️ System dependencies installation failed, but continuing...")
    
    # Step 4: Verify Playwright installation
    if not run_command("python -c 'import playwright; print(\"Playwright installed successfully\")'", "Verifying Playwright installation"):
        logger.error("❌ Playwright verification failed")
        return False
    
    logger.info("✅ All production dependencies installed successfully!")
    return True

def test_b2sign_integration():
    """Test the B2Sign integration to ensure it works"""
    logger.info("🧪 Testing B2Sign integration...")
    
    try:
        # Import and test the integration
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        import asyncio
        
        async def test_integration():
            integration = B2SignPlaywrightIntegration()
            success = await integration.initialize()
            if success:
                logger.info("✅ B2Sign integration test passed")
                await integration.cleanup()
                return True
            else:
                logger.error("❌ B2Sign integration test failed")
                return False
        
        result = asyncio.run(test_integration())
        return result
        
    except Exception as e:
        logger.error(f"❌ B2Sign integration test failed: {e}")
        return False

def main():
    """Main deployment function"""
    logger.info("🚀 Starting BuyPrintz B2Sign integration production deployment...")
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        logger.error("❌ requirements.txt not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Install dependencies
    if not install_production_dependencies():
        logger.error("❌ Production deployment failed during dependency installation")
        sys.exit(1)
    
    # Test integration
    if not test_b2sign_integration():
        logger.error("❌ Production deployment failed during integration test")
        sys.exit(1)
    
    logger.info("🎉 Production deployment completed successfully!")
    logger.info("✅ B2Sign integration is ready for production use")

if __name__ == "__main__":
    main()
