#!/usr/bin/env python3
"""
Debug script to understand why B2Sign login is failing
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_login_issue():
    """Debug the login issue"""
    logger.info("🔍 Debugging B2Sign login issue...")
    
    try:
        # Use existing integration
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        
        # Take screenshot before login
        await integration.page.screenshot(path='before_login.png')
        logger.info("📸 Screenshot saved as 'before_login.png'")
        
        # Try to login
        logger.info("🔐 Attempting login...")
        login_success = await integration.login()
        
        # Take screenshot after login attempt
        await integration.page.screenshot(path='after_login_attempt.png')
        logger.info("📸 Screenshot saved as 'after_login_attempt.png'")
        
        # Check current URL
        current_url = integration.page.url
        logger.info(f"🔗 Current URL after login attempt: {current_url}")
        
        # Check if we're on a login page
        if 'login' in current_url:
            logger.warning("⚠️ Still on login page - login failed")
            
            # Look for error messages
            error_selectors = [
                '.error',
                '.alert',
                '.warning',
                '[class*="error"]',
                '[class*="alert"]',
                '[class*="warning"]',
                '[role="alert"]'
            ]
            
            for selector in error_selectors:
                try:
                    elements = await integration.page.query_selector_all(selector)
                    if elements:
                        logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                        for i, element in enumerate(elements):
                            try:
                                text = await element.inner_text()
                                if text.strip():
                                    logger.info(f"  Error {i+1}: '{text.strip()}'")
                            except:
                                continue
                except:
                    continue
            
            # Check if login form is still visible
            login_form_selectors = [
                'form',
                'input[type="email"]',
                'input[type="password"]',
                'button[type="submit"]'
            ]
            
            for selector in login_form_selectors:
                try:
                    elements = await integration.page.query_selector_all(selector)
                    if elements:
                        logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                except:
                    continue
                    
        else:
            logger.info("✅ Login successful - not on login page")
        
        # Try to navigate to the banner page
        logger.info("🌐 Attempting to navigate to banner page...")
        await integration.page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
        await integration.page.wait_for_timeout(3000)
        
        # Take screenshot of banner page
        await integration.page.screenshot(path='banner_page_after_login.png')
        logger.info("📸 Screenshot saved as 'banner_page_after_login.png'")
        
        # Check if we can see the form elements
        logger.info("🔍 Checking for form elements on banner page...")
        
        # Look for dimension inputs
        dimension_inputs = await integration.page.query_selector_all('.MuiInput-input')
        logger.info(f"🔍 Found {len(dimension_inputs)} MUI input fields")
        
        # Look for dropdowns
        dropdowns = await integration.page.query_selector_all('.MuiSelect-root')
        logger.info(f"🔍 Found {len(dropdowns)} MUI dropdowns")
        
        # Look for buttons
        buttons = await integration.page.query_selector_all('button')
        logger.info(f"🔍 Found {len(buttons)} buttons")
        
        # Check if we can see any shipping-related elements
        all_elements = await integration.page.query_selector_all('*')
        shipping_elements = []
        
        for element in all_elements:
            try:
                text = await element.inner_text()
                if text and any(keyword in text.lower() for keyword in ['ship', 'shipping', 'delivery', 'blind drop']):
                    shipping_elements.append(text.strip())
            except:
                continue
        
        logger.info(f"🔍 Found {len(shipping_elements)} elements with shipping-related text:")
        for i, text in enumerate(shipping_elements[:10]):  # Show first 10
            logger.info(f"  {i+1}. '{text[:100]}...'")
        
        logger.info("✅ Login debug complete!")
        
    except Exception as e:
        logger.error(f"❌ Error during login debug: {e}")
    finally:
        if 'integration' in locals():
            await integration.close()

if __name__ == "__main__":
    asyncio.run(debug_login_issue())
