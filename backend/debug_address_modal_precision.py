#!/usr/bin/env python3
"""
Debug script to analyze the address modal fields with precision
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_address_modal_precision():
    """Debug the address modal fields with precision"""
    try:
        logger.info("🔍 Debugging address modal fields with precision...")
        print("🔍 Debugging address modal fields with precision...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=False,
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
            
            # Step 1: Navigate and login
            logger.info("🌐 Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Click Member Sign In
            logger.info("🔐 Logging in...")
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
                return
            
            # Step 2: Navigate to banner product page
            logger.info("🌐 Navigating to 13oz vinyl banner page...")
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Step 3: Fill dimensions (3x6 ft)
            logger.info("📏 Filling dimensions: 3ft x 6ft")
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            logger.info(f"Found {len(mui_inputs)} MUI input fields")
            
            # Fill dimension inputs (skip login inputs at index 0-1)
            for i, input_elem in enumerate(mui_inputs[2:6]):
                try:
                    if i == 0: 
                        await input_elem.fill('3')
                        logger.info(f"✅ Filled width feet: 3")
                    elif i == 1: 
                        await input_elem.fill('0')
                        logger.info(f"✅ Filled width inches: 0")
                    elif i == 2: 
                        await input_elem.fill('6')
                        logger.info(f"✅ Filled height feet: 6")
                    elif i == 3: 
                        await input_elem.fill('0')
                        logger.info(f"✅ Filled height inches: 0")
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill dimension input {i}: {e}")
                    continue
            
            # Step 4: Fill job name and quantity
            logger.info("📝 Filling job details...")
            job_name_input = await page.query_selector('input[placeholder*="Job Name"]')
            if job_name_input:
                await job_name_input.fill('BuyPrintz-Precision-Test')
                logger.info("✅ Filled job name")
            
            # Fill quantity
            inputs = await page.query_selector_all('input')
            for input_elem in inputs:
                try:
                    placeholder = await input_elem.get_attribute('placeholder')
                    if placeholder and 'qty' in placeholder.lower():
                        await input_elem.fill('1')
                        logger.info("✅ Filled quantity: 1")
                        break
                except:
                    continue
            
            # Step 5: Select 2 Sides
            logger.info("🎨 Selecting 2 Sides...")
            dropdowns = await page.query_selector_all('.MuiSelect-button')
            if len(dropdowns) > 0:
                await dropdowns[0].click()
                await page.wait_for_timeout(1000)
                two_sides_option = await page.query_selector('text="2 Sides"')
                if two_sides_option:
                    await two_sides_option.click()
                    logger.info("✅ Selected dropdown option: 2 Sides")
                    await page.wait_for_timeout(2000)
            
            # Step 6: Select Blind Drop Ship
            logger.info("🚚 Selecting Blind Drop Ship...")
            all_elements = await page.query_selector_all('*')
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if 'blind drop' in text.lower() and 'ship' in text.lower():
                        await element.click()
                        logger.info("✅ Clicked Blind Drop Ship")
                        await page.wait_for_timeout(3000)
                        break
                except:
                    continue
            
            # Step 7: Click pencil icon to open address modal
            logger.info("📝 Opening address modal...")
            svgs = await page.query_selector_all('svg')
            for i, svg in enumerate(svgs):
                try:
                    parent = await svg.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    if 'ship to different location' in parent_text.lower():
                        await svg.click()
                        logger.info("✅ Clicked pencil icon to open modal")
                        await page.wait_for_timeout(2000)
                        break
                except:
                    continue
            
            # Step 8: Analyze all input fields in the modal
            logger.info("🔍 Analyzing address modal fields...")
            print("\n📋 ADDRESS MODAL FIELD ANALYSIS:")
            print("-" * 50)
            
            # Get all input fields in the modal
            modal_inputs = await page.query_selector_all('input')
            print(f"Found {len(modal_inputs)} input fields in modal:")
            
            for i, input_elem in enumerate(modal_inputs):
                try:
                    # Get all attributes
                    name = await input_elem.get_attribute('name')
                    placeholder = await input_elem.get_attribute('placeholder')
                    type_attr = await input_elem.get_attribute('type')
                    id_attr = await input_elem.get_attribute('id')
                    class_attr = await input_elem.get_attribute('class')
                    
                    print(f"\nInput {i+1}:")
                    print(f"  Name: {name}")
                    print(f"  Placeholder: {placeholder}")
                    print(f"  Type: {type_attr}")
                    print(f"  ID: {id_attr}")
                    print(f"  Class: {class_attr}")
                    
                    # Try to get parent text for context
                    try:
                        parent = await input_elem.query_selector('xpath=..')
                        if parent:
                            parent_text = await parent.inner_text()
                            if parent_text.strip():
                                print(f"  Parent text: {parent_text.strip()[:100]}")
                    except:
                        pass
                        
                except Exception as e:
                    print(f"  Error analyzing input {i+1}: {e}")
            
            # Get all select fields
            print(f"\n📋 SELECT FIELDS:")
            print("-" * 30)
            select_fields = await page.query_selector_all('select')
            print(f"Found {len(select_fields)} select fields:")
            
            for i, select_elem in enumerate(select_fields):
                try:
                    name = await select_elem.get_attribute('name')
                    id_attr = await select_elem.get_attribute('id')
                    class_attr = await select_elem.get_attribute('class')
                    
                    print(f"\nSelect {i+1}:")
                    print(f"  Name: {name}")
                    print(f"  ID: {id_attr}")
                    print(f"  Class: {class_attr}")
                    
                    # Get options
                    options = await select_elem.query_selector_all('option')
                    if options:
                        print(f"  Options ({len(options)}):")
                        for j, option in enumerate(options[:10]):  # Show first 10 options
                            try:
                                option_text = await option.inner_text()
                                option_value = await option.get_attribute('value')
                                print(f"    {j+1}. {option_text} (value: {option_value})")
                            except:
                                pass
                        if len(options) > 10:
                            print(f"    ... and {len(options) - 10} more options")
                            
                except Exception as e:
                    print(f"  Error analyzing select {i+1}: {e}")
            
            # Get all MuiAutocomplete fields
            print(f"\n📋 MUI AUTOCOMPLETE FIELDS:")
            print("-" * 35)
            autocomplete_fields = await page.query_selector_all('.MuiAutocomplete-root')
            print(f"Found {len(autocomplete_fields)} MuiAutocomplete fields:")
            
            for i, autocomplete_elem in enumerate(autocomplete_fields):
                try:
                    class_attr = await autocomplete_elem.get_attribute('class')
                    print(f"\nAutocomplete {i+1}:")
                    print(f"  Class: {class_attr}")
                    
                    # Try to find input within autocomplete
                    input_elem = await autocomplete_elem.query_selector('input')
                    if input_elem:
                        input_name = await input_elem.get_attribute('name')
                        input_placeholder = await input_elem.get_attribute('placeholder')
                        print(f"  Input name: {input_name}")
                        print(f"  Input placeholder: {input_placeholder}")
                    
                    # Try to get parent text for context
                    try:
                        parent = await autocomplete_elem.query_selector('xpath=..')
                        if parent:
                            parent_text = await parent.inner_text()
                            if parent_text.strip():
                                print(f"  Parent text: {parent_text.strip()[:100]}")
                    except:
                        pass
                        
                except Exception as e:
                    print(f"  Error analyzing autocomplete {i+1}: {e}")
            
            # Take a screenshot
            await page.screenshot(path='address_modal_precision_debug.png')
            logger.info("📸 Screenshot saved: address_modal_precision_debug.png")
            
            print("\n" + "=" * 60)
            print("🏁 Address modal precision debug completed!")
            print("Check the screenshot and field analysis above for accurate field mapping.")
            
            # Keep browser open for manual inspection
            input("\nPress Enter to close browser...")
            
    except Exception as e:
        logger.error(f"❌ Address modal precision debug failed: {e}")
        print(f"❌ Address modal precision debug failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_address_modal_precision())
