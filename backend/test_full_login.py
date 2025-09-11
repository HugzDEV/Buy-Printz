#!/usr/bin/env python3
"""
Test Full B2Sign Login Process
Test the complete login process and see what happens after submission
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_full_login():
    """Test the complete B2Sign login process"""
    try:
        logger.info("🔐 Testing full B2Sign login process...")
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=False,  # Run in visible mode for debugging
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
            
            # Navigate to main page
            logger.info("🌐 Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Click Member Sign In
            logger.info("🔍 Clicking Member Sign In...")
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form
            logger.info("📧 Filling email...")
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            
            logger.info("🔑 Filling password...")
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            
            # Take screenshot before submission
            await page.screenshot(path='b2sign_before_submit.png')
            logger.info("📸 Screenshot before submit saved")
            
            # Submit form
            logger.info("🚀 Submitting form...")
            await page.click('button[type="submit"]')
            
            # Wait for response
            logger.info("⏳ Waiting for response...")
            await page.wait_for_timeout(5000)
            
            # Check for any error messages
            logger.info("🔍 Checking for error messages...")
            error_elements = await page.query_selector_all('*:has-text("error"), *:has-text("Error"), *:has-text("invalid"), *:has-text("Invalid")')
            if error_elements:
                logger.info(f"Found {len(error_elements)} potential error elements:")
                for i, elem in enumerate(error_elements):
                    try:
                        text = await elem.inner_text()
                        logger.info(f"  Error {i+1}: {text}")
                    except:
                        pass
            
            # Check current URL
            current_url = page.url
            logger.info(f"🔗 Current URL after login: {current_url}")
            
            # Check page title
            title = await page.title()
            logger.info(f"📄 Page title: {title}")
            
            # Take screenshot after submission
            await page.screenshot(path='b2sign_after_submit.png')
            logger.info("📸 Screenshot after submit saved")
            
            # Check if we're logged in by looking for user-specific elements
            logger.info("🔍 Checking for logged-in indicators...")
            logged_in_indicators = [
                'text="Dashboard"',
                'text="Logout"',
                'text="Profile"',
                'text="Account"',
                'text="Welcome"',
                '[data-testid*="user"]',
                '[data-testid*="dashboard"]'
            ]
            
            logged_in = False
            for indicator in logged_in_indicators:
                try:
                    element = await page.wait_for_selector(indicator, timeout=2000)
                    if element:
                        logger.info(f"✅ Found logged-in indicator: {indicator}")
                        logged_in = True
                        break
                except:
                    continue
            
            if not logged_in:
                logger.info("❌ No logged-in indicators found")
            
            # Wait to see the result
            logger.info("⏳ Waiting 10 seconds to inspect the page...")
            await page.wait_for_timeout(10000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Full login test completed!")
            return logged_in
            
    except Exception as e:
        logger.error(f"❌ Full login test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_full_login())
    if result:
        logger.info("🎉 Login test completed successfully!")
    else:
        logger.error("💥 Login test failed!")
