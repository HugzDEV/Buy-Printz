#!/usr/bin/env python3
"""
Complete banner workflow test - one test to verify the entire process
Uses the proven navigation method from test_navigation.py
"""

import asyncio
import json
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_complete_banner_workflow():
    """Test complete banner workflow using proven navigation method from test_navigation.py"""
    try:
        logger.info("🧪 Testing Complete Banner Workflow...")
        print("🧪 Testing Complete Banner Workflow...")
        print("=" * 60)
        
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
            
            # Create context (proven method from test_navigation.py)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Step 1: Navigate to main page and login (proven method from test_navigation.py)
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            print("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Click Member Sign In (proven method from test_navigation.py)
            logger.info("🔐 Step 2: Logging in...")
            print("🔐 Step 2: Logging in...")
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form (proven method from test_navigation.py)
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Check if login was successful (proven method from test_navigation.py)
            current_url = page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
                print("✅ Login successful!")
            else:
                logger.error("❌ Login failed")
                print("❌ Login failed")
                return False
            
            # Step 3: Navigate to specific banner product page
            logger.info("🌐 Step 3: Navigating to 13oz vinyl banner product page...")
            print("🌐 Step 3: Navigating to 13oz vinyl banner product page...")
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Take screenshot of banner page
            await page.screenshot(path='b2sign_banner_workflow.png')
            logger.info("📸 Screenshot of banner page saved")
            print("📸 Screenshot of banner page saved")
            
            # Step 4: Fill dimensions (3x6 ft)
            logger.info("📏 Step 4: Filling dimensions...")
            print("📏 Step 4: Filling dimensions...")
            
            # Look for MUI input fields for dimensions
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            logger.info(f"Found {len(mui_inputs)} MUI input fields for dimensions")
            
            # Fill dimension inputs using MUI selectors
            width_filled = False
            for i, input_elem in enumerate(mui_inputs[2:6]):  # Skip login inputs, use dimension inputs
                try:
                    # Try to fill width in feet
                    if i == 0:
                        await input_elem.fill('3')
                        logger.info("✅ Filled width feet: 3")
                    # Try to fill width in inches
                    elif i == 1:
                        await input_elem.fill('0')
                        logger.info("✅ Filled width inches: 0")
                        width_filled = True
                        break
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill width input {i}: {e}")
                    continue
            
            # Fill height inputs
            height_filled = False
            for i, input_elem in enumerate(mui_inputs[2:6]):  # Check mui_inputs 2-5
                try:
                    # Try to fill height in feet
                    if i == 2:
                        await input_elem.fill('6')
                        logger.info("✅ Filled height feet: 6")
                    # Try to fill height in inches
                    elif i == 3:
                        await input_elem.fill('0')
                        logger.info("✅ Filled height inches: 0")
                        height_filled = True
                        break
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill height input {i}: {e}")
                    continue
            
            # Step 5: Fill job details
            logger.info("📝 Step 5: Filling job details...")
            print("📝 Step 5: Filling job details...")
            
            # Fill job name
            job_name_inputs = await page.query_selector_all('input[placeholder*="Job"], input[placeholder*="Name"]')
            if job_name_inputs:
                await job_name_inputs[0].fill('BuyPrintz-banner-3x6')
                logger.info("✅ Filled job name: BuyPrintz-banner-3x6")
            
            # Fill quantity
            quantity_inputs = await page.query_selector_all('input[type="number"], input[placeholder*="Qty"]')
            if quantity_inputs:
                await quantity_inputs[0].fill('2')
                logger.info("✅ Filled quantity: 2")
            
            # Step 6: Fill banner options
            logger.info("🎨 Step 6: Filling banner options...")
            print("🎨 Step 6: Filling banner options...")
            
            # Select 2 Sides
            dropdowns = await page.query_selector_all('.MuiSelect-button')
            if len(dropdowns) > 0:
                await dropdowns[0].click()
                await page.wait_for_timeout(1000)
                # Look for "2 Sides" option
                two_sides_option = await page.query_selector('text="2 Sides"')
                if two_sides_option:
                    await two_sides_option.click()
                    logger.info("✅ Selected dropdown option: 2 Sides")
                    await page.wait_for_timeout(2000)
            
            # Step 7: Look for shipping section
            logger.info("🚚 Step 7: Looking for shipping section...")
            print("🚚 Step 7: Looking for shipping section...")
            
            # Wait for shipping section to appear
            await page.wait_for_timeout(3000)
            
            # Look for "Blind Drop Ship" radio button
            all_elements = await page.query_selector_all('*')
            blind_drop_found = False
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if 'blind drop' in text.lower() and 'ship' in text.lower():
                        await element.click()
                        logger.info("✅ Clicked Blind Drop Ship")
                        print("✅ Clicked Blind Drop Ship")
                        blind_drop_found = True
                        break
                except:
                    continue
            
            if blind_drop_found:
                # Wait for shipping section to appear
                await page.wait_for_timeout(5000)
                
                # Take screenshot after Blind Drop Ship selection
                await page.screenshot(path='after_blind_drop_workflow.png')
                logger.info("📸 Screenshot after Blind Drop Ship selection saved")
                print("📸 Screenshot after Blind Drop Ship selection saved")
                
                # Look for "Ship from" and "Ship to" text
                all_elements = await page.query_selector_all('*')
                ship_elements = []
                
                for element in all_elements:
                    try:
                        text = await element.inner_text()
                        if 'ship from' in text.lower() or 'ship to' in text.lower():
                            ship_elements.append(text.strip())
                    except:
                        continue
                
                logger.info(f"🔍 Found {len(ship_elements)} elements with 'ship from/to' text")
                print(f"🔍 Found {len(ship_elements)} elements with 'ship from/to' text")
                
                if ship_elements:
                    print("✅ SUCCESS! Found shipping section with Ship from/Ship to fields!")
                    print("🎉 Banner workflow is working - shipping section is accessible!")
                    
                    # Step 8: Look for pencil icon in Ship to section
                    logger.info("✏️ Step 8: Looking for pencil icon in Ship to section...")
                    print("✏️ Step 8: Looking for pencil icon in Ship to section...")
                    
                    # Look for the pencil icon (SVG) near "Ship to Different Location"
                    edit_button_found = False
                    
                    # Look for SVG elements (pencil icons) near "Ship to"
                    svgs = await page.query_selector_all('svg')
                    
                    for i, svg in enumerate(svgs):
                        try:
                            parent = await svg.query_selector('xpath=..')
                            parent_text = await parent.inner_text() if parent else ""
                            
                            # Look for SVG near "Ship to Different Location"
                            if 'ship to different location' in parent_text.lower():
                                logger.info(f"🔍 Found pencil icon SVG {i}:")
                                logger.info(f"  Parent text: '{parent_text}'")
                                
                                # Click the SVG (pencil icon)
                                await svg.click()
                                logger.info("✅ Clicked pencil icon in Ship to section")
                                print("✅ Clicked pencil icon in Ship to section")
                                edit_button_found = True
                                await page.wait_for_timeout(2000)
                                break
                                
                        except Exception as e:
                            continue
                    
                    # Fallback: Look for buttons with edit-related attributes near "Ship to"
                    if not edit_button_found:
                        buttons = await page.query_selector_all('button')
                        
                        for i, button in enumerate(buttons):
                            try:
                                button_text = await button.inner_text()
                                button_class = await button.get_attribute('class')
                                button_aria = await button.get_attribute('aria-label')
                                button_title = await button.get_attribute('title')
                                
                                # Get parent context
                                parent = await button.query_selector('xpath=..')
                                parent_text = await parent.inner_text() if parent else ""
                                
                                # Look for buttons near "Ship to" text
                                if 'ship to' in parent_text.lower():
                                    logger.info(f"🔍 Button {i} near 'Ship to':")
                                    logger.info(f"  Text: '{button_text}'")
                                    logger.info(f"  Class: '{button_class}'")
                                    logger.info(f"  Aria-label: '{button_aria}'")
                                    logger.info(f"  Title: '{button_title}'")
                                    logger.info(f"  Parent text: '{parent_text[:200]}...'")
                                    
                                    # If this looks like an edit button, click it
                                    if (button_text.strip() == '' or 
                                        'edit' in (button_aria or '').lower() or 
                                        'edit' in (button_title or '').lower() or
                                        'pencil' in (button_aria or '').lower()):
                                        
                                        await button.click()
                                        logger.info("✅ Clicked pencil icon in Ship to section")
                                        print("✅ Clicked pencil icon in Ship to section")
                                        edit_button_found = True
                                        await page.wait_for_timeout(2000)
                                        break
                                        
                            except Exception as e:
                                continue
                    
                    if edit_button_found:
                        # Step 9: Fill address modal
                        logger.info("📝 Step 9: Filling address modal...")
                        print("📝 Step 9: Filling address modal...")
                        
                        # Fill customer address fields using exact selectors from modal mapping
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
                                    print(f"✅ Filled {selector}: {value}")
                            except Exception as e:
                                logger.warning(f"⚠️ Could not fill {selector}: {e}")
                                continue
                        
                        # Select state (CA) using MuiAutocomplete
                        try:
                            # Look for MuiAutocomplete elements (the visible state dropdowns)
                            autocomplete_selectors = [
                                '.MuiAutocomplete-root',
                                '.MuiAutocomplete-root[class*="hasPopupIcon"]',
                                '.MuiAutocomplete-root[class*="hasClearIcon"]'
                            ]
                            
                            state_selected = False
                            for selector in autocomplete_selectors:
                                try:
                                    autocomplete_elements = await page.query_selector_all(selector)
                                    for i, element in enumerate(autocomplete_elements):
                                        # Get the input field within the autocomplete
                                        input_field = await element.query_selector('input')
                                        if input_field:
                                            # Click the autocomplete to open dropdown
                                            await element.click()
                                            await page.wait_for_timeout(1000)
                                            
                                            # Type "CA" to filter options
                                            await input_field.fill('CA')
                                            await page.wait_for_timeout(1000)
                                            
                                            # Look for California option in dropdown
                                            ca_options = await page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                                            for option in ca_options:
                                                try:
                                                    option_text = await option.inner_text()
                                                    if 'california' in option_text.lower() or 'ca' in option_text.lower():
                                                        await option.click()
                                                        logger.info(f"✅ Selected state: CA (using autocomplete {i+1})")
                                                        print(f"✅ Selected state: CA (using autocomplete {i+1})")
                                                        state_selected = True
                                                        break
                                                except:
                                                    continue
                                            
                                            if state_selected:
                                                break
                                    
                                    if state_selected:
                                        break
                                        
                                except Exception as e:
                                    logger.warning(f"⚠️ Error with autocomplete selector {selector}: {e}")
                                    continue
                            
                            if not state_selected:
                                logger.warning("⚠️ Could not select state using autocomplete")
                                print("⚠️ Could not select state using autocomplete")
                                
                        except Exception as e:
                            logger.warning(f"⚠️ Could not select state: {e}")
                            pass
                        
                        # Click "Use this address" button using exact selector
                        try:
                            use_button = await page.query_selector('button:has-text("Use this address")')
                            if use_button:
                                await use_button.click()
                                logger.info("✅ Clicked 'Use this address' button")
                                print("✅ Clicked 'Use this address' button")
                                await page.wait_for_timeout(3000)
                            else:
                                logger.warning("⚠️ Could not find 'Use this address' button")
                                print("⚠️ Could not find 'Use this address' button")
                        except Exception as e:
                            logger.warning(f"⚠️ Could not click 'Use this address' button: {e}")
                            pass
                        
                        # Step 10: Look for shipping options dropdown
                        logger.info("🚚 Step 10: Looking for shipping options dropdown...")
                        print("🚚 Step 10: Looking for shipping options dropdown...")
                        
                        # Wait for shipping dropdown to appear
                        await page.wait_for_timeout(3000)
                        
                        # Look for shipping method dropdown
                        shipping_dropdown = None
                        dropdown_selectors = [
                            'button:has-text("Ground")',
                            'button:has-text("$")',
                            '.MuiSelect-button',
                            'button[class*="select"]',
                            'button[role="button"]'
                        ]
                        
                        for selector in dropdown_selectors:
                            try:
                                dropdown = await page.query_selector(selector)
                                if dropdown:
                                    dropdown_text = await dropdown.inner_text()
                                    if '$' in dropdown_text and ('ground' in dropdown_text.lower() or 'shipping' in dropdown_text.lower()):
                                        shipping_dropdown = dropdown
                                        logger.info(f"✅ Found shipping dropdown: {dropdown_text}")
                                        print(f"✅ Found shipping dropdown: {dropdown_text}")
                                        break
                            except:
                                continue
                        
                        if shipping_dropdown:
                            # Click the dropdown to reveal all options
                            await shipping_dropdown.click()
                            logger.info("✅ Clicked shipping dropdown to reveal all options")
                            print("✅ Clicked shipping dropdown to reveal all options")
                            await page.wait_for_timeout(2000)
                            
                            # Extract all shipping options
                            shipping_options = []
                            option_selectors = [
                                '.MuiOption-root',
                                '[role="option"]',
                                'li[role="option"]',
                                '.MuiSelect-listbox li'
                            ]
                            
                            for selector in option_selectors:
                                try:
                                    options = await page.query_selector_all(selector)
                                    if options:
                                        logger.info(f"🔍 Found {len(options)} options with selector: {selector}")
                                        
                                        for i, option in enumerate(options):
                                            try:
                                                option_text = await option.inner_text()
                                                if option_text.strip() and '$' in option_text:
                                                    shipping_options.append(option_text.strip())
                                                    logger.info(f"  Option {i+1}: {option_text.strip()}")
                                            except:
                                                continue
                                        
                                        if shipping_options:
                                            break
                                except:
                                    continue
                            
                            if shipping_options:
                                print(f"🎉 SUCCESS! Found {len(shipping_options)} shipping options:")
                                for i, option in enumerate(shipping_options, 1):
                                    print(f"  {i}. {option}")
                                
                                if len(shipping_options) >= 7:
                                    print("✅ Perfect! Found all 7+ shipping options as expected!")
                                else:
                                    print(f"⚠️ Found {len(shipping_options)} options, expected 7")
                            else:
                                print("❌ No shipping options found in dropdown")
                        else:
                            print("❌ Could not find shipping dropdown")
                    else:
                        print("❌ Could not find pencil icon in Ship to section")
                else:
                    print("⚠️ Shipping section not found - may need more time to load")
            else:
                print("❌ Could not find Blind Drop Ship option")
            
            # Wait to see the result
            logger.info("⏳ Waiting 5 seconds to inspect the page...")
            print("⏳ Waiting 5 seconds to inspect the page...")
            await page.wait_for_timeout(5000)
            
            # Close browser
            await browser.close()
            
            logger.info("✅ Complete banner workflow test completed!")
            print("✅ Complete banner workflow test completed!")
            return True
            
    except Exception as e:
        logger.error(f"❌ Banner workflow test failed: {e}")
        print(f"❌ Banner workflow test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the complete workflow test"""
    await test_complete_banner_workflow()
    
    print("\n" + "=" * 60)
    print("🏁 Complete banner workflow test finished!")

if __name__ == "__main__":
    asyncio.run(main())
