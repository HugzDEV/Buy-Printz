#!/usr/bin/env python3
"""
Debug script to see what radio buttons are available on the B2Sign page
"""

import asyncio
from playwright.async_api import async_playwright

async def debug_radio_buttons():
    """Debug what radio buttons are available"""
    print("🔍 Debugging Radio Buttons on B2Sign...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # Run in visible mode for debugging
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            # Navigate to B2Sign and login
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Login
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            await page.fill('input[placeholder="Email"]', 'order@buyprintz.com')
            await page.fill('input[placeholder="Password"]', '$AG@BuyPr!n1z')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)
            
            # Navigate to banner page
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(5000)
            
            print("📋 All Radio Buttons Found:")
            print("=" * 50)
            
            # Find all radio buttons
            radio_buttons = await page.query_selector_all('input[type="radio"]')
            print(f"Found {len(radio_buttons)} radio buttons:")
            
            for i, radio in enumerate(radio_buttons):
                try:
                    # Get the parent element to see the text
                    parent = await radio.query_selector('xpath=..')
                    if parent:
                        text = await parent.inner_text()
                        print(f"  {i+1}. Radio button text: '{text.strip()}'")
                        
                        # Check if it contains "blind drop" or "store pickup"
                        if 'blind' in text.lower() or 'drop' in text.lower() or 'ship' in text.lower():
                            print(f"     ⭐ This looks like a shipping option!")
                        if 'store' in text.lower() or 'pickup' in text.lower():
                            print(f"     ⭐ This looks like a pickup option!")
                            
                except Exception as e:
                    print(f"  {i+1}. Could not read radio button: {e}")
            
            print("\n📋 All Buttons Found:")
            print("=" * 50)
            
            # Find all buttons
            buttons = await page.query_selector_all('button')
            print(f"Found {len(buttons)} buttons:")
            
            for i, button in enumerate(buttons):
                try:
                    text = await button.inner_text()
                    if text.strip():
                        print(f"  {i+1}. Button text: '{text.strip()}'")
                        
                        # Check if it's an edit button
                        if 'edit' in text.lower():
                            print(f"     ⭐ This looks like an edit button!")
                            
                except Exception as e:
                    print(f"  {i+1}. Could not read button: {e}")
            
            print("\n⏸️  Pausing for 30 seconds to inspect manually...")
            await page.wait_for_timeout(30000)
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_radio_buttons())
