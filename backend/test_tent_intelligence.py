#!/usr/bin/env python3
"""
Tent Intelligence Gathering - Step by step analysis of B2Sign tent options
Based on proven banner automation from test_complete_banner_workflow.py
"""

import asyncio
import json
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_tent_intelligence():
    """Gather intelligence on B2Sign tent options using proven navigation method"""
    try:
        logger.info("🧪 Tent Intelligence Gathering...")
        print("🧪 Tent Intelligence Gathering...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser (proven method from banner automation)
            browser = await p.chromium.launch(
                headless=False,  # Run in visible mode for intelligence gathering
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
            
            logger.info("✅ Login successful!")
            print("✅ Login successful!")
            
            # Step 3: Navigate to tent pages
            logger.info("🏕️ Step 3: Analyzing tent pages...")
            print("🏕️ Step 3: Analyzing tent pages...")
            
            # Navigate to main tent page
            logger.info("📄 Analyzing main tent page: https://www.b2sign.com/custom-event-tents")
            print("📄 Analyzing main tent page: https://www.b2sign.com/custom-event-tents")
            await page.goto("https://www.b2sign.com/custom-event-tents", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Take screenshot of main tent page
            await page.screenshot(path='tent_main_page.png')
            logger.info("📸 Screenshot saved: tent_main_page.png")
            print("📸 Screenshot saved: tent_main_page.png")
            
            # Navigate to tent options page
            logger.info("📄 Analyzing tent options page: https://www.b2sign.com/event-tent-canopy-graphic")
            print("📄 Analyzing tent options page: https://www.b2sign.com/event-tent-canopy-graphic")
            await page.goto("https://www.b2sign.com/event-tent-canopy-graphic", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Take screenshot of tent options page
            await page.screenshot(path='tent_options_page.png')
            logger.info("📸 Screenshot saved: tent_options_page.png")
            print("📸 Screenshot saved: tent_options_page.png")
            
            # Step 4: Analyze page structure and elements
            logger.info("🔍 Step 4: Analyzing page structure...")
            print("🔍 Step 4: Analyzing page structure...")
            
            # Get page title
            title = await page.title()
            logger.info(f"📄 Page title: {title}")
            print(f"📄 Page title: {title}")
            
            # Analyze form elements
            logger.info("🔍 Analyzing form elements...")
            print("🔍 Analyzing form elements...")
            
            # Look for input fields
            inputs = await page.query_selector_all('input')
            logger.info(f"📝 Found {len(inputs)} input fields")
            print(f"📝 Found {len(inputs)} input fields")
            
            for i, input_elem in enumerate(inputs):
                input_type = await input_elem.get_attribute('type')
                input_name = await input_elem.get_attribute('name')
                input_id = await input_elem.get_attribute('id')
                input_placeholder = await input_elem.get_attribute('placeholder')
                
                logger.info(f"  Input {i+1}: type='{input_type}', name='{input_name}', id='{input_id}', placeholder='{input_placeholder}'")
                print(f"  Input {i+1}: type='{input_type}', name='{input_name}', id='{input_id}', placeholder='{input_placeholder}'")
            
            # Look for select dropdowns
            selects = await page.query_selector_all('select')
            logger.info(f"📋 Found {len(selects)} select dropdowns")
            print(f"📋 Found {len(selects)} select dropdowns")
            
            for i, select_elem in enumerate(selects):
                select_name = await select_elem.get_attribute('name')
                select_id = await select_elem.get_attribute('id')
                
                # Get options
                options = await select_elem.query_selector_all('option')
                option_texts = []
                for option in options:
                    text = await option.inner_text()
                    value = await option.get_attribute('value')
                    option_texts.append(f"'{text}' (value: {value})")
                
                logger.info(f"  Select {i+1}: name='{select_name}', id='{select_id}'")
                logger.info(f"    Options: {', '.join(option_texts)}")
                print(f"  Select {i+1}: name='{select_name}', id='{select_id}'")
                print(f"    Options: {', '.join(option_texts)}")
            
            # Look for buttons
            buttons = await page.query_selector_all('button')
            logger.info(f"🔘 Found {len(buttons)} buttons")
            print(f"🔘 Found {len(buttons)} buttons")
            
            for i, button in enumerate(buttons):
                button_text = await button.inner_text()
                button_type = await button.get_attribute('type')
                button_class = await button.get_attribute('class')
                
                logger.info(f"  Button {i+1}: text='{button_text}', type='{button_type}', class='{button_class}'")
                print(f"  Button {i+1}: text='{button_text}', type='{button_type}', class='{button_class}'")
            
            # Step 5: Look for specific tent options mentioned
            logger.info("🏕️ Step 5: Looking for specific tent options...")
            print("🏕️ Step 5: Looking for specific tent options...")
            
            tent_options = ['Carry Bag', 'Sandbag', 'Full Wall', 'Half Wall']
            
            for option in tent_options:
                # Look for text containing the option
                elements = await page.query_selector_all(f'text={option}')
                if elements:
                    logger.info(f"✅ Found '{option}' option on page")
                    print(f"✅ Found '{option}' option on page")
                    
                    # Get parent element to understand context
                    for elem in elements:
                        parent = await elem.query_selector('xpath=..')
                        if parent:
                            parent_tag = await parent.evaluate('el => el.tagName')
                            parent_text = await parent.inner_text()
                            logger.info(f"  Parent: {parent_tag} - {parent_text[:100]}...")
                            print(f"  Parent: {parent_tag} - {parent_text[:100]}...")
                else:
                    logger.warning(f"❌ '{option}' option not found on page")
                    print(f"❌ '{option}' option not found on page")
            
            # Step 6: Save page HTML for analysis
            logger.info("💾 Step 6: Saving page HTML for analysis...")
            print("💾 Step 6: Saving page HTML for analysis...")
            
            html_content = await page.content()
            with open('tent_options_page.html', 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info("💾 HTML saved: tent_options_page.html")
            print("💾 HTML saved: tent_options_page.html")
            
            # Step 7: Summary
            logger.info("📊 Step 7: Intelligence Summary...")
            print("📊 Step 7: Intelligence Summary...")
            print("=" * 60)
            
            intelligence_summary = {
                'main_tent_page': 'https://www.b2sign.com/custom-event-tents',
                'tent_options_page': 'https://www.b2sign.com/event-tent-canopy-graphic',
                'page_title': title,
                'input_fields_count': len(inputs),
                'select_dropdowns_count': len(selects),
                'buttons_count': len(buttons),
                'tent_options_found': [opt for opt in tent_options if await page.query_selector(f'text={opt}')],
                'screenshots_taken': ['tent_main_page.png', 'tent_options_page.png'],
                'html_saved': 'tent_options_page.html'
            }
            
            # Save intelligence summary
            with open('tent_intelligence_summary.json', 'w') as f:
                json.dump(intelligence_summary, f, indent=2)
            
            logger.info("💾 Intelligence summary saved: tent_intelligence_summary.json")
            print("💾 Intelligence summary saved: tent_intelligence_summary.json")
            
            print("=" * 60)
            logger.info("🎯 Tent Intelligence Gathering Complete!")
            print("🎯 Tent Intelligence Gathering Complete!")
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
        logger.error(f"❌ Error during tent intelligence gathering: {str(e)}")
        print(f"❌ Error during tent intelligence gathering: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(test_tent_intelligence())
