#!/usr/bin/env python3
"""
Debug script to identify the correct shipping dropdown selectors
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_shipping_selectors():
    """Debug shipping dropdown selectors"""
    try:
        logger.info("🔍 Debugging shipping dropdown selectors...")
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=False,  # Run in visible mode for debugging
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            
            page = await context.new_page()
            
            # Navigate to B2Sign and login
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Login (using proven method)
            await page.fill('input[name="email"]', 'huggenslafond@gmail.com')
            await page.fill('input[name="password"]', 'Huggens123!')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Navigate to banner product
            await page.goto("https://www.b2sign.com/products/banners/vinyl-banners", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Fill banner options
            await page.select_option('select[name="sides"]', '2')
            await page.wait_for_timeout(2000)
            
            # Select Blind Drop Ship
            await page.click('input[value="blind_drop_ship"]')
            await page.wait_for_timeout(3000)
            
            # Open address modal
            pencil_icon = await page.query_selector('button[aria-label*="edit"], button[title*="edit"], .MuiIconButton-root:has(svg)')
            if pencil_icon:
                await pencil_icon.click()
                await page.wait_for_timeout(2000)
                
                # Fill address
                await page.fill('input[name="fullname"]', 'Test User')
                await page.fill('input[name="telephone"]', '6175551234')
                await page.fill('input[placeholder="Street address"]', '123 Test St')
                await page.fill('input[name="city"]', 'Boston')
                await page.fill('input[name="postcode"]', '02124')
                
                # Select state
                await page.click('input[name="state"]')
                await page.wait_for_timeout(1000)
                await page.click('li[data-value="MA"]')
                await page.wait_for_timeout(1000)
                
                # Click Use this address
                use_address_btn = await page.query_selector('button:has-text("Use this address")')
                if use_address_btn:
                    await use_address_btn.click()
                    await page.wait_for_timeout(5000)
                    
                    # Now debug all possible shipping dropdown selectors
                    logger.info("🔍 Looking for shipping dropdown...")
                    
                    # Get all buttons and select elements
                    all_buttons = await page.query_selector_all('button')
                    all_selects = await page.query_selector_all('select')
                    all_divs = await page.query_selector_all('div[role="button"]')
                    
                    logger.info(f"Found {len(all_buttons)} buttons, {len(all_selects)} selects, {len(all_divs)} div buttons")
                    
                    # Check all buttons
                    for i, button in enumerate(all_buttons):
                        try:
                            text = await button.inner_text()
                            if '$' in text or 'ground' in text.lower() or 'shipping' in text.lower():
                                logger.info(f"Button {i}: '{text}' - POTENTIAL SHIPPING DROPDOWN")
                        except:
                            pass
                    
                    # Check all selects
                    for i, select in enumerate(all_selects):
                        try:
                            text = await select.inner_text()
                            if '$' in text or 'ground' in text.lower() or 'shipping' in text.lower():
                                logger.info(f"Select {i}: '{text}' - POTENTIAL SHIPPING DROPDOWN")
                        except:
                            pass
                    
                    # Check all div buttons
                    for i, div in enumerate(all_divs):
                        try:
                            text = await div.inner_text()
                            if '$' in text or 'ground' in text.lower() or 'shipping' in text.lower():
                                logger.info(f"Div button {i}: '{text}' - POTENTIAL SHIPPING DROPDOWN")
                        except:
                            pass
                    
                    # Wait for user to see the page
                    logger.info("⏳ Waiting 30 seconds for manual inspection...")
                    await page.wait_for_timeout(30000)
                    
            await browser.close()
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_shipping_selectors())
