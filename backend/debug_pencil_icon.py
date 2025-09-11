#!/usr/bin/env python3
"""
Debug script to specifically find the pencil icon in the shipping section
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_pencil_icon():
    """Debug script to find the pencil icon in shipping section"""
    try:
        logger.info("🔍 Debugging pencil icon in shipping section...")
        print("🔍 Debugging pencil icon in shipping section...")
        
        async with async_playwright() as p:
            # Launch browser (proven method from test_navigation.py)
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
            
            # Login (proven method)
            logger.info("🔐 Logging in...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Navigate to banner page
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Fill basic form data
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            for i, input_elem in enumerate(mui_inputs[2:6]):
                try:
                    if i == 0: await input_elem.fill('3')
                    elif i == 1: await input_elem.fill('0')
                    elif i == 2: await input_elem.fill('6')
                    elif i == 3: await input_elem.fill('0')
                except:
                    continue
            
            # Select 2 Sides
            dropdowns = await page.query_selector_all('.MuiSelect-button')
            if len(dropdowns) > 0:
                await dropdowns[0].click()
                await page.wait_for_timeout(1000)
                two_sides_option = await page.query_selector('text="2 Sides"')
                if two_sides_option:
                    await two_sides_option.click()
                    await page.wait_for_timeout(2000)
            
            # Select Blind Drop Ship
            all_elements = await page.query_selector_all('*')
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if 'blind drop' in text.lower() and 'ship' in text.lower():
                        await element.click()
                        logger.info("✅ Clicked Blind Drop Ship")
                        break
                except:
                    continue
            
            # Wait for shipping section to appear
            await page.wait_for_timeout(5000)
            
            # Take screenshot
            await page.screenshot(path='debug_pencil_icon.png')
            logger.info("📸 Screenshot saved as 'debug_pencil_icon.png'")
            
            # Look for all buttons and analyze them
            logger.info("🔍 Analyzing all buttons on the page...")
            buttons = await page.query_selector_all('button')
            
            print(f"🔍 Found {len(buttons)} total buttons on the page")
            
            for i, button in enumerate(buttons):
                try:
                    button_text = await button.inner_text()
                    button_class = await button.get_attribute('class')
                    button_aria = await button.get_attribute('aria-label')
                    button_title = await button.get_attribute('title')
                    
                    # Get parent context
                    parent = await button.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    # Look for buttons near "Ship to" text or with edit-related attributes
                    if ('ship to' in parent_text.lower() or 
                        'edit' in (button_aria or '').lower() or 
                        'edit' in (button_title or '').lower() or
                        'pencil' in (button_aria or '').lower() or
                        button_text.strip() == ''):
                        
                        logger.info(f"🔍 Button {i} (potential edit button):")
                        logger.info(f"  Text: '{button_text}'")
                        logger.info(f"  Class: '{button_class}'")
                        logger.info(f"  Aria-label: '{button_aria}'")
                        logger.info(f"  Title: '{button_title}'")
                        logger.info(f"  Parent text: '{parent_text[:200]}...'")
                        print(f"  Button {i}: Text='{button_text}', Class='{button_class}', Aria='{button_aria}', Title='{button_title}'")
                        print(f"    Parent: '{parent_text[:100]}...'")
                        print("  ---")
                        
                except Exception as e:
                    continue
            
            # Look for SVG elements (pencil icons)
            logger.info("🔍 Looking for SVG elements (potential pencil icons)...")
            svgs = await page.query_selector_all('svg')
            
            print(f"🔍 Found {len(svgs)} SVG elements on the page")
            
            for i, svg in enumerate(svgs):
                try:
                    parent = await svg.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    if 'ship to' in parent_text.lower() or 'edit' in parent_text.lower():
                        logger.info(f"🔍 SVG {i} near 'Ship to' or 'edit':")
                        logger.info(f"  Parent text: '{parent_text[:100]}...'")
                        logger.info(f"  Parent tag: {await parent.evaluate('el => el.tagName') if parent else 'None'}")
                        print(f"  SVG {i}: Parent='{parent_text[:100]}...'")
                        print("  ---")
                        
                except Exception as e:
                    continue
            
            # Look for any elements with edit-related attributes
            logger.info("🔍 Looking for elements with edit-related attributes...")
            edit_selectors = [
                '[aria-label*="edit"]',
                '[title*="edit"]',
                '[class*="edit"]',
                '[data-testid*="edit"]',
                '[data-testid*="pencil"]'
            ]
            
            for selector in edit_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                        print(f"🔍 Found {len(elements)} elements with selector: {selector}")
                        for i, element in enumerate(elements):
                            try:
                                text = await element.inner_text()
                                class_attr = await element.get_attribute('class')
                                parent = await element.query_selector('xpath=..')
                                parent_text = await parent.inner_text() if parent else ""
                                
                                logger.info(f"  Element {i+1}:")
                                logger.info(f"    Text: '{text}'")
                                logger.info(f"    Class: '{class_attr}'")
                                logger.info(f"    Parent text: '{parent_text[:100]}...'")
                                print(f"    Element {i+1}: Text='{text}', Class='{class_attr}'")
                                print(f"      Parent: '{parent_text[:100]}...'")
                            except:
                                continue
                except:
                    continue
            
            # Wait to see the result
            logger.info("⏳ Waiting 10 seconds to inspect the page...")
            print("⏳ Waiting 10 seconds to inspect the page...")
            await page.wait_for_timeout(10000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Pencil icon debug completed!")
            print("✅ Pencil icon debug completed!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Pencil icon debug failed: {e}")
        print(f"❌ Pencil icon debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_pencil_icon())
