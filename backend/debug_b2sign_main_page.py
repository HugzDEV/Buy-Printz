#!/usr/bin/env python3
"""
Debug B2Sign Main Page
Debug script to see what happens after clicking Member Sign In
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_b2sign_main_page():
    """Debug the B2Sign main page and login process"""
    try:
        logger.info("🔍 Debugging B2Sign main page...")
        
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
            
            # Wait for page to load
            await page.wait_for_timeout(5000)
            
            # Take initial screenshot
            await page.screenshot(path='b2sign_main_page_initial.png')
            logger.info("📸 Initial screenshot saved")
            
            # Find all buttons and links with sign in text
            logger.info("🔍 Finding all sign in related elements...")
            
            # Look for any element containing "sign in" or "login"
            signin_elements = await page.query_selector_all('*:has-text("Sign In"), *:has-text("Login"), *:has-text("Member")')
            logger.info(f"Found {len(signin_elements)} sign in related elements:")
            
            for i, elem in enumerate(signin_elements):
                try:
                    tag_name = await elem.evaluate('el => el.tagName')
                    text_content = await elem.inner_text()
                    class_name = await elem.get_attribute('class')
                    logger.info(f"  Element {i+1}: {tag_name} - '{text_content}' - class: '{class_name}'")
                except:
                    pass
            
            # Try to find and click Member Sign In
            logger.info("🔍 Looking for Member Sign In button...")
            member_signin_selectors = [
                'button:has-text("Member Sign In")',
                'a:has-text("Member Sign In")',
                'button:has-text("Sign In")',
                'a:has-text("Sign In")',
                'button:has-text("Login")',
                'a:has-text("Login")',
                '*:has-text("Member Sign In")',
                '*:has-text("Sign In")'
            ]
            
            signin_clicked = False
            for selector in member_signin_selectors:
                try:
                    element = await page.wait_for_selector(selector, timeout=3000)
                    if element:
                        await element.click()
                        signin_clicked = True
                        logger.info(f"✅ Clicked element using selector: {selector}")
                        break
                except:
                    continue
            
            if not signin_clicked:
                logger.error("❌ Could not find any sign in button")
                return False
            
            # Wait for potential modal or form to appear
            logger.info("⏳ Waiting for login form to appear...")
            await page.wait_for_timeout(3000)
            
            # Take screenshot after clicking
            await page.screenshot(path='b2sign_after_signin_click.png')
            logger.info("📸 Screenshot after sign in click saved")
            
            # Check for any input fields that appeared
            logger.info("🔍 Checking for input fields...")
            inputs = await page.query_selector_all('input')
            logger.info(f"Found {len(inputs)} input elements after sign in click:")
            
            for i, input_elem in enumerate(inputs):
                try:
                    input_type = await input_elem.get_attribute('type')
                    input_name = await input_elem.get_attribute('name')
                    input_id = await input_elem.get_attribute('id')
                    input_placeholder = await input_elem.get_attribute('placeholder')
                    input_class = await input_elem.get_attribute('class')
                    is_visible = await input_elem.is_visible()
                    
                    logger.info(f"  Input {i+1}: type='{input_type}', name='{input_name}', id='{input_id}', placeholder='{input_placeholder}', visible={is_visible}, class='{input_class}'")
                except Exception as e:
                    logger.error(f"  Input {i+1}: Error getting attributes - {e}")
            
            # Check for any forms
            logger.info("🔍 Checking for forms...")
            forms = await page.query_selector_all('form')
            logger.info(f"Found {len(forms)} form elements:")
            
            for i, form_elem in enumerate(forms):
                try:
                    form_action = await form_elem.get_attribute('action')
                    form_method = await form_elem.get_attribute('method')
                    form_class = await form_elem.get_attribute('class')
                    is_visible = await form_elem.is_visible()
                    
                    logger.info(f"  Form {i+1}: action='{form_action}', method='{form_method}', visible={is_visible}, class='{form_class}'")
                except Exception as e:
                    logger.error(f"  Form {i+1}: Error getting attributes - {e}")
            
            # Check current URL
            current_url = page.url
            logger.info(f"🔗 Current URL: {current_url}")
            
            # Wait to see the result
            logger.info("⏳ Waiting 10 seconds to inspect the page...")
            await page.wait_for_timeout(10000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Debug completed!")
            
    except Exception as e:
        logger.error(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_b2sign_main_page())
