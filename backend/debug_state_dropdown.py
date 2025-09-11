#!/usr/bin/env python3
"""
Debug script to find and handle the state dropdown in the shipping modal
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_state_dropdown():
    """Debug script to find and handle the state dropdown"""
    try:
        logger.info("🔍 Debugging state dropdown in shipping modal...")
        print("🔍 Debugging state dropdown in shipping modal...")
        
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
            
            # Fill address fields first
            address_fields = [
                ('input[name="fullname"]', 'John Doe'),
                ('input[name="company"]', 'BuyPrintz Inc'),
                ('input[name="telephone"]', '555-123-4567'),
                ('input[placeholder="Street address"]', '123 Main St'),
                ('input[name="suburb"]', 'Suite 100'),
                ('input[name="city"]', 'Beverly Hills'),
                ('input[name="postcode"]', '90210')
            ]
            
            for selector, value in address_fields:
                try:
                    field = await page.query_selector(selector)
                    if field:
                        await field.fill(value)
                        logger.info(f"✅ Filled {selector}: {value}")
                except:
                    continue
            
            # Now debug the state dropdown specifically
            logger.info("🔍 Debugging state dropdown...")
            print("🔍 Debugging state dropdown...")
            
            # Take screenshot before state selection
            await page.screenshot(path='debug_before_state.png')
            logger.info("📸 Screenshot before state selection saved")
            
            # Look for all possible state dropdown elements
            state_selectors = [
                'select[name="state"]',
                'select[id="state"]',
                '.MuiSelect-root',
                '.MuiAutocomplete-root',
                'input[placeholder*="state"]',
                'input[placeholder*="State"]',
                'input[placeholder*="region"]',
                'input[placeholder*="province"]'
            ]
            
            for selector in state_selectors:
                try:
                    elements = await page.query_selector_all(selector)
                    if elements:
                        logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                        print(f"🔍 Found {len(elements)} elements with selector: {selector}")
                        
                        for i, element in enumerate(elements):
                            try:
                                element_type = await element.evaluate('el => el.tagName')
                                element_class = await element.get_attribute('class')
                                element_placeholder = await element.get_attribute('placeholder')
                                element_name = await element.get_attribute('name')
                                element_id = await element.get_attribute('id')
                                
                                # Get parent context
                                parent = await element.query_selector('xpath=..')
                                parent_text = await parent.inner_text() if parent else ""
                                
                                logger.info(f"  Element {i+1}:")
                                logger.info(f"    Tag: {element_type}")
                                logger.info(f"    Class: '{element_class}'")
                                logger.info(f"    Placeholder: '{element_placeholder}'")
                                logger.info(f"    Name: '{element_name}'")
                                logger.info(f"    ID: '{element_id}'")
                                logger.info(f"    Parent text: '{parent_text[:200]}...'")
                                print(f"    Element {i+1}: Tag={element_type}, Class='{element_class}', Placeholder='{element_placeholder}'")
                                print(f"      Parent: '{parent_text[:100]}...'")
                                
                                # Try to interact with this element
                                if element_type.lower() == 'select':
                                    logger.info(f"    🔍 Trying to select CA from select element {i+1}")
                                    try:
                                        await element.select_option('CA')
                                        logger.info(f"    ✅ Successfully selected CA from select element {i+1}")
                                        print(f"    ✅ Successfully selected CA from select element {i+1}")
                                    except Exception as e:
                                        logger.warning(f"    ⚠️ Could not select CA from select element {i+1}: {e}")
                                        
                                        # Try to get options
                                        try:
                                            options = await element.query_selector_all('option')
                                            logger.info(f"    🔍 Found {len(options)} options in select element {i+1}")
                                            for j, option in enumerate(options):
                                                option_text = await option.inner_text()
                                                option_value = await option.get_attribute('value')
                                                logger.info(f"      Option {j+1}: '{option_text}' (value: '{option_value}')")
                                        except:
                                            pass
                                            
                                elif element_type.lower() == 'input':
                                    logger.info(f"    🔍 Trying to interact with input element {i+1}")
                                    try:
                                        await element.click()
                                        await page.wait_for_timeout(1000)
                                        await element.fill('CA')
                                        await page.wait_for_timeout(1000)
                                        
                                        # Look for dropdown options
                                        dropdown_options = await page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                                        if dropdown_options:
                                            logger.info(f"    🔍 Found {len(dropdown_options)} dropdown options")
                                            for j, option in enumerate(dropdown_options):
                                                try:
                                                    option_text = await option.inner_text()
                                                    if 'california' in option_text.lower() or 'ca' in option_text.lower():
                                                        await option.click()
                                                        logger.info(f"    ✅ Clicked California option: '{option_text}'")
                                                        print(f"    ✅ Clicked California option: '{option_text}'")
                                                        break
                                                except:
                                                    continue
                                    except Exception as e:
                                        logger.warning(f"    ⚠️ Could not interact with input element {i+1}: {e}")
                                        
                            except Exception as e:
                                logger.warning(f"    ⚠️ Error analyzing element {i+1}: {e}")
                                continue
                                
                except Exception as e:
                    logger.warning(f"⚠️ Error with selector {selector}: {e}")
                    continue
            
            # Take screenshot after state selection attempts
            await page.screenshot(path='debug_after_state.png')
            logger.info("📸 Screenshot after state selection attempts saved")
            
            # Wait to see the result
            logger.info("⏳ Waiting 10 seconds to inspect the state dropdown...")
            print("⏳ Waiting 10 seconds to inspect the state dropdown...")
            await page.wait_for_timeout(10000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ State dropdown debug completed!")
            print("✅ State dropdown debug completed!")
            return True
            
    except Exception as e:
        logger.error(f"❌ State dropdown debug failed: {e}")
        print(f"❌ State dropdown debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(debug_state_dropdown())
