#!/usr/bin/env python3
"""
Debug script to map out the shipping modal structure
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_shipping_modal():
    """Debug script to map out the shipping modal structure"""
    try:
        logger.info("🔍 Debugging shipping modal structure...")
        print("🔍 Debugging shipping modal structure...")
        
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
            
            # Click the pencil icon to open modal
            svgs = await page.query_selector_all('svg')
            for i, svg in enumerate(svgs):
                try:
                    parent = await svg.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    if 'ship to different location' in parent_text.lower():
                        await svg.click()
                        logger.info("✅ Clicked pencil icon to open modal")
                        break
                except:
                    continue
            
            # Wait for modal to open
            await page.wait_for_timeout(3000)
            
            # Take screenshot of modal
            await page.screenshot(path='debug_shipping_modal.png')
            logger.info("📸 Screenshot of modal saved as 'debug_shipping_modal.png'")
            
            # Map out all elements in the modal
            logger.info("🔍 Mapping out modal structure...")
            print("🔍 Mapping out modal structure...")
            
            # Look for modal container
            modal_selectors = [
                '.MuiModal-root',
                '.MuiDialog-root',
                '[role="dialog"]',
                '.modal',
                '[class*="modal"]',
                '[class*="Modal"]'
            ]
            
            modal_found = False
            for selector in modal_selectors:
                try:
                    modals = await page.query_selector_all(selector)
                    if modals:
                        logger.info(f"🔍 Found {len(modals)} elements with selector: {selector}")
                        print(f"🔍 Found {len(modals)} elements with selector: {selector}")
                        modal_found = True
                        break
                except:
                    continue
            
            if not modal_found:
                logger.info("⚠️ No modal container found, analyzing all elements...")
                print("⚠️ No modal container found, analyzing all elements...")
            
            # Analyze all buttons in the modal
            logger.info("🔍 Analyzing all buttons...")
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
                    
                    # Look for buttons that might be in the modal
                    if (button_text.strip() or 
                        'use' in button_text.lower() or 
                        'address' in button_text.lower() or
                        'submit' in button_text.lower() or
                        'save' in button_text.lower() or
                        'close' in button_text.lower() or
                        'cancel' in button_text.lower()):
                        
                        logger.info(f"🔍 Button {i} (potential modal button):")
                        logger.info(f"  Text: '{button_text}'")
                        logger.info(f"  Class: '{button_class}'")
                        logger.info(f"  Aria-label: '{button_aria}'")
                        logger.info(f"  Title: '{button_title}'")
                        logger.info(f"  Parent text: '{parent_text[:200]}...'")
                        print(f"  Button {i}: Text='{button_text}', Class='{button_class}'")
                        print(f"    Parent: '{parent_text[:100]}...'")
                        print("  ---")
                        
                except Exception as e:
                    continue
            
            # Analyze all input fields in the modal
            logger.info("🔍 Analyzing all input fields...")
            inputs = await page.query_selector_all('input')
            
            print(f"🔍 Found {len(inputs)} total input fields on the page")
            
            for i, input_elem in enumerate(inputs):
                try:
                    input_type = await input_elem.get_attribute('type')
                    input_placeholder = await input_elem.get_attribute('placeholder')
                    input_name = await input_elem.get_attribute('name')
                    input_class = await input_elem.get_attribute('class')
                    input_value = await input_elem.get_attribute('value')
                    
                    # Get parent context
                    parent = await input_elem.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    logger.info(f"🔍 Input {i}:")
                    logger.info(f"  Type: '{input_type}'")
                    logger.info(f"  Placeholder: '{input_placeholder}'")
                    logger.info(f"  Name: '{input_name}'")
                    logger.info(f"  Class: '{input_class}'")
                    logger.info(f"  Value: '{input_value}'")
                    logger.info(f"  Parent text: '{parent_text[:200]}...'")
                    print(f"  Input {i}: Type='{input_type}', Placeholder='{input_placeholder}', Name='{input_name}'")
                    print(f"    Parent: '{parent_text[:100]}...'")
                    print("  ---")
                        
                except Exception as e:
                    continue
            
            # Analyze all select elements in the modal
            logger.info("🔍 Analyzing all select elements...")
            selects = await page.query_selector_all('select')
            
            print(f"🔍 Found {len(selects)} total select elements on the page")
            
            for i, select_elem in enumerate(selects):
                try:
                    select_name = await select_elem.get_attribute('name')
                    select_class = await select_elem.get_attribute('class')
                    select_id = await select_elem.get_attribute('id')
                    
                    # Get parent context
                    parent = await select_elem.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    logger.info(f"🔍 Select {i}:")
                    logger.info(f"  Name: '{select_name}'")
                    logger.info(f"  Class: '{select_class}'")
                    logger.info(f"  ID: '{select_id}'")
                    logger.info(f"  Parent text: '{parent_text[:200]}...'")
                    print(f"  Select {i}: Name='{select_name}', Class='{select_class}', ID='{select_id}'")
                    print(f"    Parent: '{parent_text[:100]}...'")
                    print("  ---")
                        
                except Exception as e:
                    continue
            
            # Look for MUI Select components (they're often buttons, not select elements)
            logger.info("🔍 Analyzing MUI Select components...")
            mui_selects = await page.query_selector_all('.MuiSelect-root, .MuiSelect-button')
            
            print(f"🔍 Found {len(mui_selects)} MUI Select components on the page")
            
            for i, select_elem in enumerate(mui_selects):
                try:
                    select_text = await select_elem.inner_text()
                    select_class = await select_elem.get_attribute('class')
                    select_aria = await select_elem.get_attribute('aria-label')
                    
                    # Get parent context
                    parent = await select_elem.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    logger.info(f"🔍 MUI Select {i}:")
                    logger.info(f"  Text: '{select_text}'")
                    logger.info(f"  Class: '{select_class}'")
                    logger.info(f"  Aria-label: '{select_aria}'")
                    logger.info(f"  Parent text: '{parent_text[:200]}...'")
                    print(f"  MUI Select {i}: Text='{select_text}', Class='{select_class}'")
                    print(f"    Parent: '{parent_text[:100]}...'")
                    print("  ---")
                        
                except Exception as e:
                    continue
            
            # Wait to see the result
            logger.info("⏳ Waiting 15 seconds to inspect the modal...")
            print("⏳ Waiting 15 seconds to inspect the modal...")
            await page.wait_for_timeout(15000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Shipping modal debug completed!")
            print("✅ Shipping modal debug completed!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Shipping modal debug failed: {e}")
        print(f"❌ Shipping modal debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_shipping_modal())
