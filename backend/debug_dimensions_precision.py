#!/usr/bin/env python3
"""
Debug script to analyze the dimension fields with precision
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_dimensions_precision():
    """Debug the dimension fields with precision"""
    try:
        logger.info("🔍 Debugging dimension fields with precision...")
        print("🔍 Debugging dimension fields with precision...")
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
            
            # Step 3: Analyze all input fields on the page
            logger.info("🔍 Analyzing all input fields on the page...")
            print("\n📋 ALL INPUT FIELDS ANALYSIS:")
            print("-" * 40)
            
            # Get all input fields
            all_inputs = await page.query_selector_all('input')
            print(f"Found {len(all_inputs)} input fields on the page:")
            
            for i, input_elem in enumerate(all_inputs):
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
                    
                    # Check if this looks like a dimension field
                    if (placeholder and any(word in placeholder.lower() for word in ['width', 'height', 'feet', 'inches', 'ft', 'in'])) or \
                       (name and any(word in name.lower() for word in ['width', 'height', 'feet', 'inches', 'ft', 'in'])):
                        print(f"  🎯 POTENTIAL DIMENSION FIELD!")
                        
                except Exception as e:
                    print(f"  Error analyzing input {i+1}: {e}")
            
            # Step 4: Analyze MUI input fields specifically
            print(f"\n📋 MUI INPUT FIELDS ANALYSIS:")
            print("-" * 35)
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            print(f"Found {len(mui_inputs)} MUI input fields:")
            
            for i, input_elem in enumerate(mui_inputs):
                try:
                    # Get all attributes
                    name = await input_elem.get_attribute('name')
                    placeholder = await input_elem.get_attribute('placeholder')
                    type_attr = await input_elem.get_attribute('type')
                    id_attr = await input_elem.get_attribute('id')
                    class_attr = await input_elem.get_attribute('class')
                    
                    print(f"\nMUI Input {i+1}:")
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
                    
                    # Check if this looks like a dimension field
                    if (placeholder and any(word in placeholder.lower() for word in ['width', 'height', 'feet', 'inches', 'ft', 'in'])) or \
                       (name and any(word in name.lower() for word in ['width', 'height', 'feet', 'inches', 'ft', 'in'])):
                        print(f"  🎯 POTENTIAL DIMENSION FIELD!")
                        
                except Exception as e:
                    print(f"  Error analyzing MUI input {i+1}: {e}")
            
            # Step 5: Test filling dimensions with different values
            print(f"\n🧪 TESTING DIMENSION FILLING:")
            print("-" * 35)
            
            # Test with 3ft 6in x 4ft 8in
            test_dimensions = [
                (3, 6, 4, 8),  # 3ft 6in x 4ft 8in
                (2, 0, 3, 0),  # 2ft 0in x 3ft 0in
                (5, 3, 6, 9)   # 5ft 3in x 6ft 9in
            ]
            
            for test_idx, (w_ft, w_in, h_ft, h_in) in enumerate(test_dimensions):
                print(f"\nTest {test_idx + 1}: {w_ft}ft {w_in}in x {h_ft}ft {h_in}in")
                
                # Clear all inputs first
                for input_elem in mui_inputs:
                    try:
                        await input_elem.fill('')
                    except:
                        pass
                
                await page.wait_for_timeout(1000)
                
                # Fill dimension inputs (skip login inputs at index 0-1)
                for i, input_elem in enumerate(mui_inputs[2:6]):
                    try:
                        if i == 0: 
                            await input_elem.fill(str(w_ft))
                            print(f"  ✅ Filled width feet: {w_ft}")
                        elif i == 1: 
                            await input_elem.fill(str(w_in))
                            print(f"  ✅ Filled width inches: {w_in}")
                        elif i == 2: 
                            await input_elem.fill(str(h_ft))
                            print(f"  ✅ Filled height feet: {h_ft}")
                        elif i == 3: 
                            await input_elem.fill(str(h_in))
                            print(f"  ✅ Filled height inches: {h_in}")
                    except Exception as e:
                        print(f"  ⚠️ Could not fill dimension input {i}: {e}")
                        continue
                
                await page.wait_for_timeout(2000)
                
                # Take a screenshot
                await page.screenshot(path=f'dimensions_test_{test_idx + 1}.png')
                print(f"  📸 Screenshot saved: dimensions_test_{test_idx + 1}.png")
            
            # Take a final screenshot
            await page.screenshot(path='dimensions_precision_debug.png')
            logger.info("📸 Final screenshot saved: dimensions_precision_debug.png")
            
            print("\n" + "=" * 60)
            print("🏁 Dimensions precision debug completed!")
            print("Check the screenshots and field analysis above for accurate dimension mapping.")
            
            # Keep browser open for manual inspection
            input("\nPress Enter to close browser...")
            
    except Exception as e:
        logger.error(f"❌ Dimensions precision debug failed: {e}")
        print(f"❌ Dimensions precision debug failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_dimensions_precision())
