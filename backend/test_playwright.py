#!/usr/bin/env python3
"""
Test Playwright Integration
Simple test to verify Playwright is working correctly
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_playwright_basic():
    """Test basic Playwright functionality"""
    try:
        logger.info("🚀 Testing basic Playwright functionality...")
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            # Create context
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Test navigation
            logger.info("🌐 Testing navigation to B2Sign...")
            await page.goto("https://www.b2sign.com")
            
            # Get page title
            title = await page.title()
            logger.info(f"✅ Page title: {title}")
            
            # Check if page loaded
            content = await page.content()
            logger.info(f"✅ Page loaded successfully, content length: {len(content)}")
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Basic Playwright test completed successfully!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Playwright test failed: {e}")
        return False

async def test_b2sign_integration():
    """Test B2Sign integration specifically"""
    try:
        logger.info("🚀 Testing B2Sign integration...")
        
        # Import our integration
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        
        # Create instance
        integration = B2SignPlaywrightIntegration()
        
        # Initialize
        await integration.initialize()
        logger.info("✅ B2Sign integration initialized successfully")
        
        # Test login
        login_success = await integration.login()
        logger.info(f"✅ Login result: {login_success}")
        
        # Cleanup
        await integration.cleanup()
        logger.info("✅ B2Sign integration test completed")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ B2Sign integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tests"""
    logger.info("🧪 Starting Playwright tests...")
    
    # Test 1: Basic Playwright
    basic_test = await test_playwright_basic()
    
    # Test 2: B2Sign Integration
    integration_test = await test_b2sign_integration()
    
    # Results
    logger.info(f"📊 Test Results:")
    logger.info(f"   Basic Playwright: {'✅ PASS' if basic_test else '❌ FAIL'}")
    logger.info(f"   B2Sign Integration: {'✅ PASS' if integration_test else '❌ FAIL'}")
    
    if basic_test and integration_test:
        logger.info("🎉 All tests passed!")
    else:
        logger.error("💥 Some tests failed!")

if __name__ == "__main__":
    asyncio.run(main())
