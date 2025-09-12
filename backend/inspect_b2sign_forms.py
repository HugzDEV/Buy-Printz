#!/usr/bin/env python3
"""
Inspect B2Sign form structure to understand the actual field names and selectors
"""

import asyncio
from playwright.async_api import async_playwright

async def inspect_banner_form():
    """Inspect the banner form structure"""
    print("🔍 Inspecting Banner Form Structure...")
    
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
            
            print("📋 Banner Page Form Elements:")
            print("=" * 50)
            
            # Find all input fields
            inputs = await page.query_selector_all('input')
            print(f"Found {len(inputs)} input fields:")
            for i, input_elem in enumerate(inputs):
                try:
                    input_type = await input_elem.get_attribute('type')
                    input_name = await input_elem.get_attribute('name')
                    input_id = await input_elem.get_attribute('id')
                    input_placeholder = await input_elem.get_attribute('placeholder')
                    input_class = await input_elem.get_attribute('class')
                    
                    print(f"  {i+1}. Type: {input_type}, Name: {input_name}, ID: {input_id}")
                    print(f"     Placeholder: {input_placeholder}, Class: {input_class}")
                except:
                    print(f"  {i+1}. Could not read input attributes")
            
            # Find all select fields
            selects = await page.query_selector_all('select')
            print(f"\nFound {len(selects)} select fields:")
            for i, select_elem in enumerate(selects):
                try:
                    select_name = await select_elem.get_attribute('name')
                    select_id = await select_elem.get_attribute('id')
                    select_class = await select_elem.get_attribute('class')
                    
                    print(f"  {i+1}. Name: {select_name}, ID: {select_id}, Class: {select_class}")
                    
                    # Get options
                    options = await select_elem.query_selector_all('option')
                    print(f"     Options: {len(options)}")
                    for j, option in enumerate(options[:5]):  # Show first 5 options
                        option_text = await option.inner_text()
                        option_value = await option.get_attribute('value')
                        print(f"       {j+1}. Text: '{option_text}', Value: '{option_value}'")
                    if len(options) > 5:
                        print(f"       ... and {len(options) - 5} more options")
                        
                except:
                    print(f"  {i+1}. Could not read select attributes")
            
            # Find all buttons
            buttons = await page.query_selector_all('button')
            print(f"\nFound {len(buttons)} buttons:")
            for i, button_elem in enumerate(buttons):
                try:
                    button_text = await button_elem.inner_text()
                    button_type = await button_elem.get_attribute('type')
                    button_class = await button_elem.get_attribute('class')
                    
                    print(f"  {i+1}. Text: '{button_text}', Type: {button_type}, Class: {button_class}")
                except:
                    print(f"  {i+1}. Could not read button attributes")
            
            # Look for forms
            forms = await page.query_selector_all('form')
            print(f"\nFound {len(forms)} forms:")
            for i, form_elem in enumerate(forms):
                try:
                    form_action = await form_elem.get_attribute('action')
                    form_method = await form_elem.get_attribute('method')
                    form_class = await form_elem.get_attribute('class')
                    form_id = await form_elem.get_attribute('id')
                    
                    print(f"  {i+1}. Action: {form_action}, Method: {form_method}")
                    print(f"     Class: {form_class}, ID: {form_id}")
                except:
                    print(f"  {i+1}. Could not read form attributes")
            
            print("\n⏸️  Pausing for 30 seconds to inspect manually...")
            await page.wait_for_timeout(30000)
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            await browser.close()

async def inspect_tent_form():
    """Inspect the tent form structure"""
    print("\n🔍 Inspecting Tent Form Structure...")
    
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
            
            # Navigate to tent page
            await page.goto("https://www.b2sign.com/custom-event-tents", wait_until='networkidle')
            await page.wait_for_timeout(5000)
            
            print("📋 Tent Page Form Elements:")
            print("=" * 50)
            
            # Find all input fields
            inputs = await page.query_selector_all('input')
            print(f"Found {len(inputs)} input fields:")
            for i, input_elem in enumerate(inputs):
                try:
                    input_type = await input_elem.get_attribute('type')
                    input_name = await input_elem.get_attribute('name')
                    input_id = await input_elem.get_attribute('id')
                    input_placeholder = await input_elem.get_attribute('placeholder')
                    input_class = await input_elem.get_attribute('class')
                    
                    print(f"  {i+1}. Type: {input_type}, Name: {input_name}, ID: {input_id}")
                    print(f"     Placeholder: {input_placeholder}, Class: {input_class}")
                except:
                    print(f"  {i+1}. Could not read input attributes")
            
            # Find all select fields
            selects = await page.query_selector_all('select')
            print(f"\nFound {len(selects)} select fields:")
            for i, select_elem in enumerate(selects):
                try:
                    select_name = await select_elem.get_attribute('name')
                    select_id = await select_elem.get_attribute('id')
                    select_class = await select_elem.get_attribute('class')
                    
                    print(f"  {i+1}. Name: {select_name}, ID: {select_id}, Class: {select_class}")
                    
                    # Get options
                    options = await select_elem.query_selector_all('option')
                    print(f"     Options: {len(options)}")
                    for j, option in enumerate(options[:5]):  # Show first 5 options
                        option_text = await option.inner_text()
                        option_value = await option.get_attribute('value')
                        print(f"       {j+1}. Text: '{option_text}', Value: '{option_value}'")
                    if len(options) > 5:
                        print(f"       ... and {len(options) - 5} more options")
                        
                except:
                    print(f"  {i+1}. Could not read select attributes")
            
            print("\n⏸️  Pausing for 30 seconds to inspect manually...")
            await page.wait_for_timeout(30000)
            
        except Exception as e:
            print(f"❌ Error: {e}")
        finally:
            await browser.close()

async def main():
    """Run form inspection"""
    print("🚀 Starting B2Sign Form Structure Inspection...")
    print("=" * 60)
    
    await inspect_banner_form()
    await inspect_tent_form()
    
    print("\n" + "=" * 60)
    print("🏁 Form inspection completed!")

if __name__ == "__main__":
    asyncio.run(main())
