#!/usr/bin/env python3
"""
Test B2Sign Navigation
Test navigation to product pages after successful login
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_navigation():
    """Test navigation to B2Sign product pages"""
    try:
        logger.info("🧪 Testing B2Sign navigation to product pages...")
        
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
            
            # Step 1: Navigate to main page and login
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Click Member Sign In
            logger.info("🔐 Step 2: Logging in...")
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Check if login was successful
            current_url = page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
            else:
                logger.error("❌ Login failed")
                return False
            
            # Step 3: Navigate to banners page
            logger.info("🌐 Step 3: Navigating to banners page...")
            await page.goto("https://www.b2sign.com/banners", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Take screenshot of banners page
            await page.screenshot(path='b2sign_banners_page.png')
            logger.info("📸 Screenshot of banners page saved")
            
            # Check page title and URL
            title = await page.title()
            url = page.url
            logger.info(f"📄 Banners page - Title: {title}, URL: {url}")
            
            # Look for banner product links
            banner_links = await page.query_selector_all('a:has-text("13oz Vinyl Banner"), a:has-text("18oz Blockout Banner"), a:has-text("Backlit Banner")')
            logger.info(f"🔍 Found {len(banner_links)} banner product links")
            
            # Step 4: Navigate to tents page
            logger.info("🌐 Step 4: Navigating to custom event tents page...")
            await page.goto("https://www.b2sign.com/custom-event-tents", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Take screenshot of tents page
            await page.screenshot(path='b2sign_tents_page.png')
            logger.info("📸 Screenshot of tents page saved")
            
            # Check page title and URL
            title = await page.title()
            url = page.url
            logger.info(f"📄 Tents page - Title: {title}, URL: {url}")
            
            # Look for tent product links
            tent_links = await page.query_selector_all('a:has-text("10\' x 10\'"), a:has-text("10\' x 15\'"), a:has-text("10\' x 20\'")')
            logger.info(f"🔍 Found {len(tent_links)} tent product links")
            
            # Wait to see the result
            logger.info("⏳ Waiting 5 seconds to inspect the pages...")
            await page.wait_for_timeout(5000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Navigation test completed successfully!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Navigation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_navigation())
    if result:
        logger.info("🎉 Navigation test completed successfully!")
    else:
        logger.error("💥 Navigation test failed!")
