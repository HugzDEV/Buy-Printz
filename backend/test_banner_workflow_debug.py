#!/usr/bin/env python3
"""
Test Banner Workflow Debug
Debug the banner workflow to see why shipping dropdown isn't appearing
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_banner_workflow_debug():
    """Test banner workflow with detailed debugging"""
    try:
        logger.info("🧪 Testing Banner Workflow Debug...")
        print("🧪 Testing Banner Workflow Debug...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=False,  # Keep visible for debugging
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
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            print("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            logger.info("🔐 Step 2: Logging in...")
            print("🔐 Step 2: Logging in...")
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            current_url = page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
                print("✅ Login successful!")
            else:
                logger.error("❌ Login failed")
                print("❌ Login failed")
                return
            
            # Step 3: Navigate to banner page
            logger.info("🌐 Step 3: Navigating to banner product page...")
            print("🌐 Step 3: Navigating to banner product page...")
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Step 4: Fill form with test data
            logger.info("📝 Step 4: Filling banner form...")
            print("📝 Step 4: Filling banner form...")
            
            # Test data matching the production request
            order_data = {
                'dimensions': {'width': 2, 'height': 4},
                'quantity': 1,
                'print_options': {'sides': 1},
                'customer_info': {
                    'name': 'Huggens Lafond',
                    'email': 'brainboxjp@gmail.com',
                    'phone': '6175057762',
                    'address': '181 Chestnut Street',
                    'city': 'Chelsea',
                    'state': 'MA',
                    'zipCode': '02150'
                }
            }
            
            # Import the banner integration
            from b2sign_playwright_integration import B2SignPlaywrightIntegration
            integration = B2SignPlaywrightIntegration()
            integration.page = page
            
            # Fill dimensions
            await integration._fill_banner_dimensions(2, 4)
            
            # Fill job details
            await integration._fill_banner_job_details(2, 4, 1)
            
            # Fill banner options
            await integration._fill_banner_options_workflow({'sides': 1})
            
            # Select Blind Drop Ship
            await integration._select_blind_drop_ship()
            
            # Open and fill address modal
            await integration._open_and_fill_address_modal('02150', order_data['customer_info'])
            
            # Step 5: Debug shipping dropdown detection
            logger.info("🔍 Step 5: Debugging shipping dropdown detection...")
            print("🔍 Step 5: Debugging shipping dropdown detection...")
            
            # Wait longer for shipping dropdown to appear
            await page.wait_for_timeout(5000)
            
            # Take screenshot before looking for dropdown
            await page.screenshot(path="banner_before_shipping_debug.png")
            logger.info("📸 Screenshot saved: banner_before_shipping_debug.png")
            print("📸 Screenshot saved: banner_before_shipping_debug.png")
            
            # Look for ALL possible shipping-related elements
            logger.info("🔍 Looking for ALL shipping-related elements...")
            print("🔍 Looking for ALL shipping-related elements...")
            
            # Check all buttons
            buttons = await page.query_selector_all('button')
            logger.info(f"Found {len(buttons)} buttons total")
            print(f"Found {len(buttons)} buttons total")
            
            for i, button in enumerate(buttons):
                try:
                    button_text = await button.inner_text()
                    if button_text and ('$' in button_text or 'ground' in button_text.lower() or 'shipping' in button_text.lower()):
                        logger.info(f"  Button {i+1}: '{button_text}'")
                        print(f"  Button {i+1}: '{button_text}'")
                except:
                    continue
            
            # Check all dropdowns
            dropdowns = await page.query_selector_all('.MuiSelect-button, [role="button"], select')
            logger.info(f"Found {len(dropdowns)} dropdowns total")
            print(f"Found {len(dropdowns)} dropdowns total")
            
            for i, dropdown in enumerate(dropdowns):
                try:
                    dropdown_text = await dropdown.inner_text()
                    if dropdown_text:
                        logger.info(f"  Dropdown {i+1}: '{dropdown_text}'")
                        print(f"  Dropdown {i+1}: '{dropdown_text}'")
                except:
                    continue
            
            # Check for any element containing shipping-related text
            all_elements = await page.query_selector_all('*')
            shipping_elements = []
            
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if text and ('ground' in text.lower() or 'shipping' in text.lower()) and '$' in text:
                        shipping_elements.append((element, text))
                except:
                    continue
            
            logger.info(f"Found {len(shipping_elements)} elements with shipping text and $")
            print(f"Found {len(shipping_elements)} elements with shipping text and $")
            
            for i, (element, text) in enumerate(shipping_elements[:10]):  # Show first 10
                logger.info(f"  Shipping element {i+1}: '{text.strip()}'")
                print(f"  Shipping element {i+1}: '{text.strip()}'")
            
            # Try to extract shipping options using the banner method
            logger.info("🚚 Step 6: Trying to extract shipping options...")
            print("🚚 Step 6: Trying to extract shipping options...")
            
            shipping_options = await integration._extract_all_shipping_options_workflow()
            
            if shipping_options:
                logger.info(f"✅ SUCCESS! Found {len(shipping_options)} shipping options")
                print(f"✅ SUCCESS! Found {len(shipping_options)} shipping options")
                for i, option in enumerate(shipping_options):
                    logger.info(f"  Option {i+1}: {option}")
                    print(f"  Option {i+1}: {option}")
            else:
                logger.warning("❌ No shipping options found")
                print("❌ No shipping options found")
            
            # Take final screenshot
            await page.screenshot(path="banner_after_shipping_debug.png")
            logger.info("📸 Final screenshot saved: banner_after_shipping_debug.png")
            print("📸 Final screenshot saved: banner_after_shipping_debug.png")
            
            # Keep browser open for manual inspection
            logger.info("🔍 Browser kept open for manual inspection...")
            print("🔍 Browser kept open for manual inspection...")
            print("Press Ctrl+C to close...")
            
            try:
                await asyncio.sleep(300)  # Keep open for 5 minutes
            except asyncio.CancelledError:
                pass
            
    except Exception as e:
        logger.error(f"❌ Error in banner workflow debug: {e}")
        print(f"❌ Error in banner workflow debug: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        print(f"❌ Full traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_banner_workflow_debug())
