#!/usr/bin/env python3
"""
Test B2Sign Login with Exact Selectors
Test the login process using the exact selectors we found
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_b2sign_login():
    """Test B2Sign login with exact selectors"""
    try:
        logger.info("🔐 Testing B2Sign login with exact selectors...")
        
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
            
            # Navigate to main page (login is on the main page)
            logger.info("🌐 Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            
            # Wait for page to load
            await page.wait_for_timeout(5000)
            
            # Look for "Member Sign In" button and click it
            logger.info("🔍 Looking for Member Sign In button...")
            member_signin_selectors = [
                'button:has-text("Member Sign In")',
                'a:has-text("Member Sign In")',
                'button:has-text("Sign In")',
                'a:has-text("Sign In")',
                'button:has-text("Login")',
                'a:has-text("Login")'
            ]
            
            signin_clicked = False
            for selector in member_signin_selectors:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    await page.click(selector)
                    signin_clicked = True
                    logger.info(f"✅ Member Sign In button clicked using selector: {selector}")
                    break
                except:
                    continue
            
            if not signin_clicked:
                logger.error("❌ Could not find Member Sign In button")
                return False
            
            # Wait for login form to appear
            await page.wait_for_timeout(2000)
            
            # Test exact selectors we found
            logger.info("🔍 Testing exact selectors...")
            
            # Try email field with exact selector
            try:
                logger.info("📧 Trying to fill email field...")
                await page.wait_for_selector('input[name="email"]', timeout=10000)
                await page.fill('input[name="email"]', 'order@buyprintz.com')
                logger.info("✅ Email field filled successfully")
            except Exception as e:
                logger.error(f"❌ Email field failed: {e}")
                return False
            
            # Try password field with exact selector
            try:
                logger.info("🔑 Trying to fill password field...")
                await page.wait_for_selector('input[name="password"]', timeout=10000)
                await page.fill('input[name="password"]', '$AG@BuyPr!n1z')
                logger.info("✅ Password field filled successfully")
            except Exception as e:
                logger.error(f"❌ Password field failed: {e}")
                return False
            
            # Try submit button
            try:
                logger.info("🚀 Trying to click submit button...")
                await page.wait_for_selector('button[type="submit"]', timeout=10000)
                await page.click('button[type="submit"]')
                logger.info("✅ Submit button clicked successfully")
            except Exception as e:
                logger.error(f"❌ Submit button failed: {e}")
                return False
            
            # Wait for navigation
            logger.info("⏳ Waiting for navigation...")
            await page.wait_for_load_state('networkidle', timeout=15000)
            
            # Check if login was successful
            current_url = page.url
            logger.info(f"🔗 Current URL after login: {current_url}")
            
            if 'login' not in current_url:
                logger.info("✅ Login appears to be successful!")
                
                # Take a screenshot of the logged-in page
                await page.screenshot(path='b2sign_logged_in.png')
                logger.info("📸 Screenshot saved as 'b2sign_logged_in.png'")
                
                # Wait to see the result
                await page.wait_for_timeout(5000)
                
                return True
            else:
                logger.error("❌ Login failed - still on login page")
                
                # Take a screenshot of the failed login
                await page.screenshot(path='b2sign_login_failed.png')
                logger.info("📸 Screenshot saved as 'b2sign_login_failed.png'")
                
                return False
            
    except Exception as e:
        logger.error(f"❌ Login test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        try:
            await browser.close()
        except:
            pass

if __name__ == "__main__":
    result = asyncio.run(test_b2sign_login())
    if result:
        logger.info("🎉 Login test completed successfully!")
    else:
        logger.error("💥 Login test failed!")
