#!/usr/bin/env python3
"""
Inspect B2Sign Login Page
Debug script to see what elements are available on the login page
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def inspect_b2sign_login():
    """Inspect the B2Sign login page to see available elements"""
    try:
        logger.info("🔍 Inspecting B2Sign login page...")
        
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
            
            # Navigate to login page
            logger.info("🌐 Navigating to B2Sign login page...")
            await page.goto("https://www.b2sign.com/login", wait_until='networkidle')
            
            # Wait for page to load
            await page.wait_for_timeout(5000)
            
            # Get page title
            title = await page.title()
            logger.info(f"📄 Page title: {title}")
            
            # Get current URL
            current_url = page.url
            logger.info(f"🔗 Current URL: {current_url}")
            
            # Find all input elements
            logger.info("🔍 Finding all input elements...")
            inputs = await page.query_selector_all('input')
            logger.info(f"📝 Found {len(inputs)} input elements:")
            
            for i, input_elem in enumerate(inputs):
                try:
                    input_type = await input_elem.get_attribute('type')
                    input_name = await input_elem.get_attribute('name')
                    input_id = await input_elem.get_attribute('id')
                    input_placeholder = await input_elem.get_attribute('placeholder')
                    input_class = await input_elem.get_attribute('class')
                    
                    logger.info(f"  Input {i+1}: type='{input_type}', name='{input_name}', id='{input_id}', placeholder='{input_placeholder}', class='{input_class}'")
                except Exception as e:
                    logger.error(f"  Input {i+1}: Error getting attributes - {e}")
            
            # Find all button elements
            logger.info("🔍 Finding all button elements...")
            buttons = await page.query_selector_all('button')
            logger.info(f"🔘 Found {len(buttons)} button elements:")
            
            for i, button_elem in enumerate(buttons):
                try:
                    button_type = await button_elem.get_attribute('type')
                    button_text = await button_elem.inner_text()
                    button_class = await button_elem.get_attribute('class')
                    
                    logger.info(f"  Button {i+1}: type='{button_type}', text='{button_text}', class='{button_class}'")
                except Exception as e:
                    logger.error(f"  Button {i+1}: Error getting attributes - {e}")
            
            # Try to find form elements
            logger.info("🔍 Finding form elements...")
            forms = await page.query_selector_all('form')
            logger.info(f"📋 Found {len(forms)} form elements:")
            
            for i, form_elem in enumerate(forms):
                try:
                    form_action = await form_elem.get_attribute('action')
                    form_method = await form_elem.get_attribute('method')
                    form_class = await form_elem.get_attribute('class')
                    
                    logger.info(f"  Form {i+1}: action='{form_action}', method='{form_method}', class='{form_class}'")
                except Exception as e:
                    logger.error(f"  Form {i+1}: Error getting attributes - {e}")
            
            # Take a screenshot for debugging
            await page.screenshot(path='b2sign_login_debug.png')
            logger.info("📸 Screenshot saved as 'b2sign_login_debug.png'")
            
            # Wait a bit to see the page
            logger.info("⏳ Waiting 10 seconds to inspect the page visually...")
            await page.wait_for_timeout(10000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Inspection completed!")
            
    except Exception as e:
        logger.error(f"❌ Inspection failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(inspect_b2sign_login())
