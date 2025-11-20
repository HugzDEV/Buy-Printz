#!/usr/bin/env python3
"""
Simple Tax Extraction Test - Tests just the tax extraction function
This test uses a working browser session and tests the tax extraction method directly
"""

import asyncio
import logging
from playwright.async_api import async_playwright

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def extract_tax_from_subtotal_box(page):
    """Extract tax amount from the subtotal box at the bottom of the page"""
    try:
        logger.info("💰 Extracting tax from subtotal box...")
        
        # Look for tax-related elements in the subtotal section
        tax_selectors = [
            # Direct tax field selectors
            'input[name*="tax"]',
            'input[placeholder*="tax"]',
            '[data-testid*="tax"]',
            # Text elements containing tax
            'text*="Tax"',
            'text*="tax"',
            # Elements near "Tax" or "Sales Tax" text
            '*:has-text("Tax") + *',
            '*:has-text("Sales Tax") + *',
            '*:has-text("tax") + *',
            # Generic subtotal area elements
            '.subtotal *',
            '.total-box *',
            '.summary *',
            '[class*="subtotal"] *',
            '[class*="total"] *'
        ]
        
        tax_amount = None
        
        # Try each selector to find tax amount
        for selector in tax_selectors:
            try:
                elements = await page.query_selector_all(selector)
                for element in elements:
                    try:
                        # Check if it's an input field
                        tag_name = await element.evaluate('el => el.tagName.toLowerCase()')
                        
                        if tag_name == 'input':
                            # Get value from input field
                            value = await element.get_attribute('value')
                            if value and ('$' in value or value.replace('.', '').replace(',', '').isdigit()):
                                logger.info(f"🔍 Found tax input field with value: {value}")
                                tax_amount = value
                                break
                        else:
                            # Get text content
                            text = await element.inner_text()
                            if text and text.strip():
                                # Look for price patterns like $12.34
                                import re
                                price_matches = re.findall(r'\$[\d,]+\.?\d*', text)
                                if price_matches:
                                    # Check if this element is related to tax
                                    parent_text = ""
                                    try:
                                        parent = await element.query_selector('xpath=..')
                                        if parent:
                                            parent_text = await parent.inner_text()
                                    except:
                                        pass
                                    
                                    combined_text = (text + " " + parent_text).lower()
                                    if any(tax_keyword in combined_text for tax_keyword in ['tax', 'sales tax', 'state tax']):
                                        tax_amount = price_matches[0]
                                        logger.info(f"🔍 Found tax in text element: {tax_amount} (context: {text})")
                                        break
                    except:
                        continue
                
                if tax_amount:
                    break
                    
            except Exception as e:
                logger.debug(f"Selector {selector} failed: {e}")
                continue
        
        # If still not found, look for any element containing both "tax" and a dollar amount
        if not tax_amount:
            logger.info("🔍 Fallback: Looking for any element with 'tax' and dollar amount...")
            all_elements = await page.query_selector_all('*')
            
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if text and 'tax' in text.lower():
                        import re
                        price_matches = re.findall(r'\$[\d,]+\.?\d*', text)
                        if price_matches:
                            tax_amount = price_matches[0]
                            logger.info(f"🔍 Found tax in fallback search: {tax_amount} (text: {text})")
                            break
                except:
                    continue
        
        if tax_amount:
            # Clean up the tax amount
            clean_tax = tax_amount.replace('$', '').replace(',', '').strip()
            try:
                float(clean_tax)  # Validate it's a number
                logger.info(f"✅ Successfully extracted tax amount: {tax_amount}")
                return tax_amount
            except ValueError:
                logger.warning(f"⚠️ Invalid tax amount format: {tax_amount}")
                return "$0.00"
        else:
            logger.warning("⚠️ Could not find tax amount, defaulting to $0.00")
            return "$0.00"
            
    except Exception as e:
        logger.warning(f"⚠️ Error extracting tax: {e}")
        return "$0.00"

async def test_tax_extraction_simple():
    """Simple test to verify tax extraction works on B2Sign pages"""
    try:
        logger.info("🧪 Testing Tax Extraction on B2Sign...")
        print("🧪 Testing Tax Extraction on B2Sign...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(
                headless=False,  # Run in visible mode
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            
            page = await context.new_page()
            
            # Navigate to B2Sign and login
            logger.info("🌐 Navigating to B2Sign and logging in...")
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
            logger.info("🌐 Navigating to banner product page...")
            await page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Fill basic form to get to shipping section
            logger.info("📝 Filling basic form...")
            
            # Fill dimensions (3x6)
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            if len(mui_inputs) >= 4:
                await mui_inputs[1].fill('3')  # width feet
                await mui_inputs[2].fill('0')  # width inches  
                await mui_inputs[3].fill('6')  # height feet
                await mui_inputs[4].fill('0')  # height inches
                
            # Fill job name
            job_inputs = await page.query_selector_all('input[placeholder*="Job"]')
            if job_inputs:
                await job_inputs[0].fill('Tax Test Job')
                
            # Select 2 Sides
            dropdowns = await page.query_selector_all('.MuiSelect-button')
            if dropdowns:
                await dropdowns[0].click()
                await page.wait_for_timeout(1000)
                two_sides = await page.query_selector('text="2 Sides"')
                if two_sides:
                    await two_sides.click()
                    await page.wait_for_timeout(2000)
            
            # Select Blind Drop Ship
            all_elements = await page.query_selector_all('*')
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if 'blind drop' in text.lower() and 'ship' in text.lower():
                        await element.click()
                        logger.info("✅ Selected Blind Drop Ship")
                        await page.wait_for_timeout(5000)
                        break
                except:
                    continue
            
            # Now test tax extraction
            print("\n💰 Testing tax extraction...")
            logger.info("💰 Testing tax extraction...")
            
            tax_amount = await extract_tax_from_subtotal_box(page)
            
            if tax_amount and tax_amount != "$0.00":
                print(f"✅ SUCCESS! Tax extraction found: {tax_amount}")
                logger.info(f"✅ Tax extraction successful: {tax_amount}")
                return True
            else:
                print(f"⚠️ Tax extraction returned: {tax_amount}")
                logger.info(f"⚠️ Tax extraction returned: {tax_amount}")
                
                # Take screenshot for debugging
                await page.screenshot(path='tax_extraction_debug.png')
                logger.info("📸 Debug screenshot saved: tax_extraction_debug.png")
                return False
            
    except Exception as e:
        logger.error(f"❌ Tax extraction test failed: {e}")
        print(f"❌ Tax extraction test failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        try:
            await browser.close()
        except:
            pass

async def main():
    """Run the tax extraction test"""
    success = await test_tax_extraction_simple()
    
    print("\n" + "=" * 60)
    if success:
        print("🏁 Tax extraction test PASSED!")
    else:
        print("🏁 Tax extraction test FAILED!")

if __name__ == "__main__":
    asyncio.run(main())
