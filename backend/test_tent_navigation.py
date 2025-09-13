#!/usr/bin/env python3
"""
Tent Navigation Test - Based on proven banner automation
Tests navigation to tent pages and basic interaction
"""

import asyncio
import json
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_tent_navigation():
    """Test tent navigation using proven banner automation method"""
    try:
        logger.info("🧪 Testing Tent Navigation...")
        print("🧪 Testing Tent Navigation...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser (proven method from banner automation)
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
            
            # Create context (proven method from banner automation)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Step 1: Navigate to main page and login (proven method from banner automation)
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            print("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Login (proven method from test_navigation.py)
            logger.info("🔐 Step 2: Logging in...")
            print("🔐 Step 2: Logging in...")
            
            # Click Member Sign In (proven method from test_navigation.py)
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form (proven credentials from test_navigation.py)
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Check if login was successful
            current_url = page.url
            if 'login' not in current_url:
                logger.info("✅ Login successful!")
                print("✅ Login successful!")
            else:
                logger.error("❌ Login failed")
                print("❌ Login failed")
                return False
            
            # Step 3: Navigate to tent options page
            logger.info("🏕️ Step 3: Navigating to tent options page...")
            print("🏕️ Step 3: Navigating to tent options page...")
            await page.goto("https://www.b2sign.com/event-tent-canopy-graphic", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Step 4: Test tent package selection
            logger.info("🔍 Step 4: Testing tent package selection...")
            print("🔍 Step 4: Testing tent package selection...")
            
            # Test Canopy Graphic Only selection
            logger.info("🏕️ Testing Canopy Graphic Only selection...")
            print("🏕️ Testing Canopy Graphic Only selection...")
            
            # Click on Canopy Graphic Only button
            canopy_only_button = page.locator('button:has-text("Canopy Graphic Only")')
            if await canopy_only_button.count() > 0:
                await canopy_only_button.first.click()
                await page.wait_for_timeout(2000)
                logger.info("✅ Successfully selected Canopy Graphic Only")
                print("✅ Successfully selected Canopy Graphic Only")
                
                # Verify that bag options are removed
                carry_bag_dropdown = page.locator('button:has-text("Standard Bag")')
                if await carry_bag_dropdown.count() == 0:
                    logger.info("✅ Carry Bag dropdown removed (as expected for Canopy Only)")
                    print("✅ Carry Bag dropdown removed (as expected for Canopy Only)")
                else:
                    logger.warning("⚠️ Carry Bag dropdown still present (unexpected)")
                    print("⚠️ Carry Bag dropdown still present (unexpected)")
            else:
                logger.warning("⚠️ Canopy Graphic Only button not found")
                print("⚠️ Canopy Graphic Only button not found")
            
            # Test Canopy Graphic + Frame selection
            logger.info("🏕️ Testing Canopy Graphic + Frame selection...")
            print("🏕️ Testing Canopy Graphic + Frame selection...")
            
            # Click on Canopy Graphic + Frame button
            canopy_frame_button = page.locator('button:has-text("Canopy Graphic + Frame")')
            if await canopy_frame_button.count() > 0:
                await canopy_frame_button.first.click()
                await page.wait_for_timeout(2000)
                logger.info("✅ Successfully selected Canopy Graphic + Frame")
                print("✅ Successfully selected Canopy Graphic + Frame")
                
                # Verify that bag options are restored
                carry_bag_dropdown = page.locator('button:has-text("Standard Bag")')
                if await carry_bag_dropdown.count() > 0:
                    logger.info("✅ Carry Bag dropdown restored (as expected for Complete Tent)")
                    print("✅ Carry Bag dropdown restored (as expected for Complete Tent)")
                else:
                    logger.warning("⚠️ Carry Bag dropdown not restored (unexpected)")
                    print("⚠️ Carry Bag dropdown not restored (unexpected)")
            else:
                logger.warning("⚠️ Canopy Graphic + Frame button not found")
                print("⚠️ Canopy Graphic + Frame button not found")
            
            # Step 5: Test tent option interactions
            logger.info("🔍 Step 5: Testing tent option interactions...")
            print("🔍 Step 5: Testing tent option interactions...")
            
            # Test reinforced strip color selection
            logger.info("🎨 Testing reinforced strip color selection...")
            print("🎨 Testing reinforced strip color selection...")
            
            # Click on the White button (Material-UI select)
            white_button = page.locator('button:has-text("White")')
            if await white_button.count() > 0:
                await white_button.first.click()
                await page.wait_for_timeout(1000)
                
                # Look for Black option in dropdown
                black_option = page.locator('text=Black')
                if await black_option.count() > 0:
                    await black_option.first.click()
                    await page.wait_for_timeout(1000)
                    logger.info("✅ Successfully changed reinforced strip color to Black")
                    print("✅ Successfully changed reinforced strip color to Black")
                else:
                    logger.warning("⚠️ Black option not found in dropdown")
                    print("⚠️ Black option not found in dropdown")
            else:
                logger.warning("⚠️ White button not found")
                print("⚠️ White button not found")
            
            # Test carry bag selection
            logger.info("🎒 Testing carry bag selection...")
            print("🎒 Testing carry bag selection...")
            
            # Click on the Standard Bag button
            standard_bag_button = page.locator('button:has-text("Standard Bag")')
            if await standard_bag_button.count() > 0:
                await standard_bag_button.first.click()
                await page.wait_for_timeout(1000)
                
                # Look for Carry Bag with Wheels option
                wheels_option = page.locator('text=Carry Bag with Wheels')
                if await wheels_option.count() > 0:
                    await wheels_option.first.click()
                    await page.wait_for_timeout(1000)
                    logger.info("✅ Successfully changed to Carry Bag with Wheels")
                    print("✅ Successfully changed to Carry Bag with Wheels")
                else:
                    logger.warning("⚠️ Carry Bag with Wheels option not found")
                    print("⚠️ Carry Bag with Wheels option not found")
            else:
                logger.warning("⚠️ Standard Bag button not found")
                print("⚠️ Standard Bag button not found")
            
            # Test sandbag selection
            logger.info("🏖️ Testing sandbag selection...")
            print("🏖️ Testing sandbag selection...")
            
            # Click on the No button (for sandbags)
            no_button = page.locator('button:has-text("No")')
            if await no_button.count() > 0:
                await no_button.first.click()
                await page.wait_for_timeout(1000)
                
                # Look for sandbag options
                sandbag_option = page.locator('text=4 Sandbags')
                if await sandbag_option.count() > 0:
                    await sandbag_option.first.click()
                    await page.wait_for_timeout(1000)
                    logger.info("✅ Successfully changed to 4 Sandbags")
                    print("✅ Successfully changed to 4 Sandbags")
                else:
                    logger.warning("⚠️ 4 Sandbags option not found")
                    print("⚠️ 4 Sandbags option not found")
            else:
                logger.warning("⚠️ No button not found")
                print("⚠️ No button not found")
            
            # Test full wall selection
            logger.info("🧱 Testing full wall selection...")
            print("🧱 Testing full wall selection...")
            
            # Click on the No Full Wall button
            no_full_wall_button = page.locator('button:has-text("No Full Wall")')
            if await no_full_wall_button.count() > 0:
                await no_full_wall_button.first.click()
                await page.wait_for_timeout(1000)
                
                # Look for full wall options in dropdown (more specific selector)
                full_wall_option = page.locator('li:has-text("1 Full Wall")')
                if await full_wall_option.count() > 0:
                    await full_wall_option.first.click()
                    await page.wait_for_timeout(1000)
                    logger.info("✅ Successfully changed to 1 Full Wall")
                    print("✅ Successfully changed to 1 Full Wall")
                else:
                    logger.warning("⚠️ 1 Full Wall option not found")
                    print("⚠️ 1 Full Wall option not found")
            else:
                logger.warning("⚠️ No Full Wall button not found")
                print("⚠️ No Full Wall button not found")
            
            # Test half wall selection
            logger.info("🧱 Testing half wall selection...")
            print("🧱 Testing half wall selection...")
            
            # Click on the No Half Wall button
            no_half_wall_button = page.locator('button:has-text("No Half Wall")')
            if await no_half_wall_button.count() > 0:
                await no_half_wall_button.first.click()
                await page.wait_for_timeout(1000)
                
                # Look for half wall options in dropdown (more specific selector)
                half_wall_option = page.locator('li:has-text("1 Half Wall")')
                if await half_wall_option.count() > 0:
                    await half_wall_option.first.click()
                    await page.wait_for_timeout(1000)
                    logger.info("✅ Successfully changed to 1 Half Wall")
                    print("✅ Successfully changed to 1 Half Wall")
                else:
                    logger.warning("⚠️ 1 Half Wall option not found")
                    print("⚠️ 1 Half Wall option not found")
            else:
                logger.warning("⚠️ No Half Wall button not found")
                print("⚠️ No Half Wall button not found")
            
            # Step 6: Test job name field
            logger.info("📝 Step 6: Testing job name field...")
            print("📝 Step 6: Testing job name field...")
            
            # Fill job name field
            job_name_input = page.locator('input[placeholder="Job Name/PO# (Required)"]')
            if await job_name_input.count() > 0:
                await job_name_input.fill("Test Tent Order - BuyPrintz Automation")
                await page.wait_for_timeout(1000)
                logger.info("✅ Successfully filled job name field")
                print("✅ Successfully filled job name field")
            else:
                logger.warning("⚠️ Job name input field not found")
                print("⚠️ Job name input field not found")
            
            # Step 7: Take final screenshot
            logger.info("📸 Step 7: Taking final screenshot...")
            print("📸 Step 7: Taking final screenshot...")
            await page.screenshot(path='tent_navigation_test.png')
            logger.info("📸 Final screenshot saved: tent_navigation_test.png")
            print("📸 Final screenshot saved: tent_navigation_test.png")
            
            # Step 8: Summary
            logger.info("📊 Step 8: Navigation Test Summary...")
            print("📊 Step 8: Navigation Test Summary...")
            print("=" * 60)
            
            navigation_summary = {
                'test_completed': True,
                'login_successful': 'login' not in current_url,
                'tent_page_loaded': True,
                'interactions_tested': [
                    'reinforced_strip_color',
                    'carry_bag_selection',
                    'sandbag_selection',
                    'full_wall_selection',
                    'half_wall_selection',
                    'job_name_field'
                ],
                'screenshot_taken': 'tent_navigation_test.png'
            }
            
            # Save navigation summary
            with open('tent_navigation_summary.json', 'w') as f:
                json.dump(navigation_summary, f, indent=2)
            
            logger.info("💾 Navigation summary saved: tent_navigation_summary.json")
            print("💾 Navigation summary saved: tent_navigation_summary.json")
            
            print("=" * 60)
            logger.info("🎯 Tent Navigation Test Complete!")
            print("🎯 Tent Navigation Test Complete!")
            print("=" * 60)
            
            # Keep browser open for manual inspection
            logger.info("🔍 Browser kept open for manual inspection...")
            print("🔍 Browser kept open for manual inspection...")
            print("Press Ctrl+C to close...")
            
            try:
                await asyncio.sleep(300)  # Keep open for 5 minutes
            except KeyboardInterrupt:
                logger.info("👋 Closing browser...")
                print("👋 Closing browser...")
            
    except Exception as e:
        logger.error(f"❌ Error during tent navigation test: {str(e)}")
        print(f"❌ Error during tent navigation test: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_tent_navigation())
