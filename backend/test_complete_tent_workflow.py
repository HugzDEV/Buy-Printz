#!/usr/bin/env python3
"""
Complete tent workflow test - EXACT COPY of production banner workflow with tent-specific adaptations
This uses the exact same proven methods that work in production for banners.
"""

import asyncio
import json
import logging
import re
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

def _parse_shipping_option_text(option_text):
    """Parse shipping option text to extract name, cost, and delivery date (EXACT COPY from production banner workflow)"""
    try:
        # Extract price (e.g., $14.04)
        price_matches = re.findall(r'\$[\d,]+\.?\d*', option_text)
        cost = price_matches[0] if price_matches else "Contact for Quote"
        
        # Extract delivery date (e.g., Sep 14)
        date_matches = re.findall(r'[A-Za-z]{3}\s+\d{1,2}', option_text)
        delivery_date = date_matches[0] if date_matches else None
        
        # Extract shipping method name (everything before the price)
        name_part = option_text.split('$')[0].strip()
        if not name_part:
            name_part = option_text.split('Sep')[0].strip() if 'Sep' in option_text else option_text.strip()
        
        # Clean up the name
        name = name_part.replace('\n', ' ').strip()
        
        # Determine estimated days based on shipping method
        estimated_days = _estimate_delivery_days(name)
        
        return {
            "name": name,
            "type": "standard",
            "cost": cost,
            "estimated_days": estimated_days,
            "delivery_date": delivery_date,
            "description": f"B2Sign {name.lower()}: {cost}" + (f" (delivery: {delivery_date})" if delivery_date else "")
        }
        
    except Exception as e:
        logger.warning(f"⚠️ Error parsing shipping option text '{option_text}': {e}")
        return None

def _estimate_delivery_days(shipping_name):
    """Estimate delivery days based on shipping method name (EXACT COPY from production banner workflow)"""
    name_lower = shipping_name.lower()
    
    if 'next day' in name_lower and 'early am' in name_lower:
        return 1
    elif 'next day' in name_lower:
        return 1
    elif '2nd day' in name_lower or 'second day' in name_lower:
        return 2
    elif '3 day' in name_lower or 'third day' in name_lower:
        return 3
    elif 'ground' in name_lower:
        return 5
    else:
        return 5  # Default

async def test_complete_tent_workflow():
    """Test complete tent workflow using EXACT COPY of production banner workflow"""
    try:
        logger.info("🧪 Testing Complete Tent Workflow - EXACT COPY of Production Banner Workflow...")
        print("🧪 Testing Complete Tent Workflow - EXACT COPY of Production Banner Workflow...")
        print("=" * 60)
        
        async with async_playwright() as p:
            # Launch browser (EXACT COPY of production method)
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
            
            # Create context (EXACT COPY of production method)
            context = await browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            )
            
            # Create page
            page = await context.new_page()
            
            # Step 1: Navigate to main page and login (EXACT COPY of production method)
            logger.info("🌐 Step 1: Navigating to B2Sign main page...")
            print("🌐 Step 1: Navigating to B2Sign main page...")
            await page.goto("https://www.b2sign.com", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Login (EXACT COPY of production method)
            logger.info("🔐 Step 2: Logging in...")
            print("🔐 Step 2: Logging in...")
            
            # Click Member Sign In (EXACT COPY of production method)
            await page.click('button:has-text("Member Sign In")')
            await page.wait_for_timeout(2000)
            
            # Fill login form (EXACT COPY of production method)
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
            
            # Step 3: Navigate to tent product page (TENT-SPECIFIC URL CHANGE)
            logger.info("🏕️ Step 3: Navigating to tent product page...")
            print("🏕️ Step 3: Navigating to tent product page...")
            await page.goto("https://www.b2sign.com/event-tent-canopy-graphic", wait_until='networkidle')
            await page.wait_for_timeout(3000)
            
            # Step 4: Use EXACT COPY of production banner workflow with tent-specific data
            logger.info("🎨 Step 4: Starting complete tent workflow (EXACT COPY of production banner workflow)...")
            print("🎨 Step 4: Starting complete tent workflow (EXACT COPY of production banner workflow)...")
            
            # Mock tent order data (TENT-SPECIFIC DATA)
            order_data = {
                'dimensions': {'width': 10, 'height': 10},  # Tent size
                'quantity': 1,
                'print_options': {
                    'tent_size': '10x10',
                    'tent_design_option': 'canopy-only'
                },
                'customer_info': {
                    'name': 'John Doe',
                    'company': 'BuyPrintz Test',
                    'phone': '555-123-4567',
                    'address': '816 Morton Street',
                    'suburb': 'Unit 1',
                    'city': 'Boston',
                    'state': 'MA',
                    'zipCode': '02124'
                }
            }
            
            # Extract order specifications (EXACT COPY of production banner workflow)
            dimensions = order_data.get('dimensions', {})
            width = dimensions.get('width', 10)
            height = dimensions.get('height', 10)
            quantity = order_data.get('quantity', 1)
            print_options = order_data.get('print_options', {})
            customer_info = order_data.get('customer_info', {})
            zip_code = customer_info.get('zipCode', customer_info.get('zip_code', '02124'))
            
            logger.info(f"📋 Tent specs: {width}x{height}, qty: {quantity}, zip: {zip_code}")
            print(f"📋 Tent specs: {width}x{height}, qty: {quantity}, zip: {zip_code}")
            
            # Use the proven tent integration (duplicated from working banner integration)
            from tent_playwright_integration import TentPlaywrightIntegration
            tent_integration = TentPlaywrightIntegration()
            tent_integration.page = page
            
            # Use the EXACT SAME proven banner workflow methods
            shipping_options = await tent_integration._fill_banner_quote_form(order_data)
            
            # Step 7: Take final screenshot and save results
            logger.info("📸 Step 7: Taking final screenshot and saving results...")
            print("📸 Step 7: Taking final screenshot and saving results...")
            
            await page.screenshot(path='tent_workflow_final.png')
            logger.info("📸 Final screenshot saved: tent_workflow_final.png")
            print("📸 Final screenshot saved: tent_workflow_final.png")
            
            # Step 8: Summary
            logger.info("📊 Step 8: Workflow Summary...")
            print("📊 Step 8: Workflow Summary...")
            print("=" * 60)
            
            # Extract tax from subtotal box
            print("\n💰 Extracting tax from subtotal box...")
            logger.info("💰 Extracting tax from subtotal box...")
            
            # Wait for subtotal box to update
            await tent_integration.page.wait_for_timeout(2000)
            
            tax_amount = await extract_tax_from_subtotal_box(tent_integration.page)
            if tax_amount and tax_amount != "$0.00":
                print(f"✅ Tax extracted: {tax_amount}")
                logger.info(f"✅ Tax extracted: {tax_amount}")
            else:
                print(f"⚠️ Tax amount: {tax_amount} (may be zero or not found)")
                logger.info(f"⚠️ Tax amount: {tax_amount}")
            
            workflow_summary = {
                'test_completed': True,
                'login_successful': 'login' not in current_url,
                'tent_specs_configured': order_data,
                'shipping_options_found': len(shipping_options),
                'shipping_options': shipping_options,
                'tax_amount': tax_amount,
                'screenshots_taken': ['tent_workflow_final.png']
            }
            
            # Save workflow summary
            with open('tent_workflow_summary.json', 'w') as f:
                json.dump(workflow_summary, f, indent=2)
            
            logger.info("💾 Workflow summary saved: tent_workflow_summary.json")
            print("💾 Workflow summary saved: tent_workflow_summary.json")
            
            print("=" * 60)
            logger.info("🎯 Complete Tent Workflow Test Complete!")
            print("🎯 Complete Tent Workflow Test Complete!")
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
        logger.error(f"❌ Error during complete tent workflow test: {str(e)}")
        print(f"❌ Error during complete tent workflow test: {str(e)}")
        raise

# EXACT COPIES of production banner workflow methods with tent-specific adaptations

async def _fill_tent_dimensions(page, width, height):
    """Fill tent dimensions (ADAPTED from production banner dimensions method)"""
    try:
        logger.info(f"📏 Filling tent dimensions: {width}ft x {height}ft")
        print(f"📏 Filling tent dimensions: {width}ft x {height}ft")
        
        # For tents, we might need to select tent size rather than fill dimensions
        # Try to find tent size selector first
        try:
            # Look for tent size buttons or selectors
            tent_size_buttons = await page.query_selector_all('button, div')
            for button in tent_size_buttons:
                try:
                    button_text = await button.inner_text()
                    if f'{width}x{height}' in button_text or '10x10' in button_text:
                        await button.click()
                        logger.info(f"✅ Selected tent size: {button_text}")
                        print(f"✅ Selected tent size: {button_text}")
                        await page.wait_for_timeout(2000)
                        return
                except:
                    continue
        except:
            pass
        
        # If no tent size selector found, try to fill dimensions like banners
        # Convert to feet and inches
        width_ft = int(width)
        width_in = int((width - width_ft) * 12) if width > width_ft else 0
        
        height_ft = int(height)
        height_in = int((height - height_ft) * 12) if height > height_ft else 0
        
        # Look for MUI input fields for dimensions (EXACT COPY of production banner method)
        mui_inputs = await page.query_selector_all('.MuiInput-input')
        logger.info(f"Found {len(mui_inputs)} MUI input fields total")
        
        # Look for dimension-specific input fields - BE MORE SPECIFIC (EXACT COPY of production banner method)
        dimension_inputs = []
        
        # Method 1: Look for inputs with specific attributes that suggest dimensions (EXACT COPY of production banner method)
        all_inputs = await page.query_selector_all('input')
        logger.info(f"🔍 Found {len(all_inputs)} total input elements")
        
        for i, input_elem in enumerate(all_inputs):
            try:
                # Check if this input is visible and editable
                is_visible = await input_elem.is_visible()
                is_editable = await input_elem.is_editable()
                
                if is_visible and is_editable:
                    # Get input attributes
                    placeholder = await input_elem.get_attribute('placeholder') or ''
                    name = await input_elem.get_attribute('name') or ''
                    input_type = await input_elem.get_attribute('type') or ''
                    value = await input_elem.get_attribute('value') or ''
                    
                    # Look for dimension-related attributes
                    if (input_type in ['number', 'text'] and 
                        (any(keyword in (placeholder + name + value).lower() for keyword in ['width', 'height', 'feet', 'inches', 'dimension']) or
                         placeholder == '' or value == '0')):
                        
                        dimension_inputs.append(input_elem)
                        logger.info(f"🔍 Found potential dimension input {len(dimension_inputs)}: placeholder='{placeholder}', name='{name}', type='{input_type}', value='{value}'")
                        
                        # Stop when we have 4 dimension inputs
                        if len(dimension_inputs) >= 4:
                            break
            except Exception as e:
                logger.warning(f"  Error checking input {i}: {e}")
                continue
        
        # Method 2: If we didn't find enough, use the MUI inputs approach with better filtering (EXACT COPY of production banner method)
        if len(dimension_inputs) < 4:
            logger.info("🔍 Using MUI inputs approach for dimensions...")
            # Look for MUI inputs that are visible and editable
            for input_elem in mui_inputs:
                try:
                    is_visible = await input_elem.is_visible()
                    is_editable = await input_elem.is_editable()
                    
                    if is_visible and is_editable and input_elem not in dimension_inputs:
                        dimension_inputs.append(input_elem)
                        logger.info(f"🔍 Added MUI input {len(dimension_inputs)} to dimensions")
                        
                        if len(dimension_inputs) >= 4:
                            break
                except:
                    continue
        
        logger.info(f"🔍 Using {len(dimension_inputs)} inputs for dimensions")
        
        # Fill the 4 dimension fields: width_ft, width_in, height_ft, height_in (EXACT COPY of production banner method)
        dimension_values = [str(width_ft), str(width_in), str(height_ft), str(height_in)]
        dimension_names = ['width feet', 'width inches', 'height feet', 'height inches']
        
        for i, (input_elem, value, name) in enumerate(zip(dimension_inputs, dimension_values, dimension_names)):
            try:
                await input_elem.fill(value)
                logger.info(f"✅ Filled {name}: {value}")
                print(f"✅ Filled {name}: {value}")
            except Exception as e:
                logger.warning(f"⚠️ Could not fill {name}: {e}")
                continue
                
    except Exception as e:
        logger.warning(f"⚠️ Error filling tent dimensions: {e}")
        print(f"⚠️ Error filling tent dimensions: {e}")

async def _fill_tent_job_details(page, width, height, quantity):
    """Fill job name and quantity (EXACT COPY of production banner workflow)"""
    try:
        logger.info("📝 Filling tent job details...")
        print("📝 Filling tent job details...")
        
        # Fill job name (EXACT COPY of production banner method)
        job_name_input = await page.query_selector('input[placeholder*="Job Name"]')
        if job_name_input:
            job_name = f"BuyPrintz-Tent-{width}x{height}"
            await job_name_input.fill(job_name)
            logger.info(f"✅ Filled job name: {job_name}")
            print(f"✅ Filled job name: {job_name}")
        
        # Fill quantity (EXACT COPY of production banner method)
        inputs = await page.query_selector_all('input')
        for input_elem in inputs:
            try:
                placeholder = await input_elem.get_attribute('placeholder')
                if placeholder and 'qty' in placeholder.lower():
                    await input_elem.fill(str(quantity))
                    logger.info(f"✅ Filled quantity: {quantity}")
                    print(f"✅ Filled quantity: {quantity}")
                    break
            except:
                continue
                
    except Exception as e:
        logger.warning(f"⚠️ Error filling tent job details: {e}")
        print(f"⚠️ Error filling tent job details: {e}")

async def _fill_tent_options_workflow(page, print_options):
    """Fill tent options (ADAPTED from production banner options workflow)"""
    try:
        logger.info("🎨 Filling tent options...")
        print("🎨 Filling tent options...")
        
        # For tents, we might need to select different options than banners
        # This is where we adapt the banner workflow for tent-specific options
        
        # Select tent design option if available
        tent_design_option = print_options.get('tent_design_option', 'canopy-only')
        if tent_design_option == 'canopy-only':
            try:
                await page.click('div:has-text("Canopy Graphic Only")')
                logger.info("✅ Selected Canopy Graphic Only")
                print("✅ Selected Canopy Graphic Only")
                await page.wait_for_timeout(2000)
            except:
                try:
                    await page.click('button:has-text("Canopy Graphic Only")')
                    logger.info("✅ Selected Canopy Graphic Only")
                    print("✅ Selected Canopy Graphic Only")
                    await page.wait_for_timeout(2000)
                except:
                    logger.warning("⚠️ Could not find Canopy Graphic Only option")
                    print("⚠️ Could not find Canopy Graphic Only option")
        
        # Add other tent-specific options here as needed
                        
    except Exception as e:
        logger.warning(f"⚠️ Error filling tent options: {e}")
        print(f"⚠️ Error filling tent options: {e}")

async def _select_blind_drop_ship(page):
    """Select Blind Drop Ship (EXACT COPY of production banner workflow)"""
    try:
        logger.info("🚚 Selecting Blind Drop Ship...")
        print("🚚 Selecting Blind Drop Ship...")
        
        # Use proven method from test_complete_banner_workflow.py (EXACT COPY)
        all_elements = await page.query_selector_all('*')
        for element in all_elements:
            try:
                text = await element.inner_text()
                if 'blind drop' in text.lower() and 'ship' in text.lower():
                    await element.click()
                    logger.info("✅ Clicked Blind Drop Ship")
                    print("✅ Clicked Blind Drop Ship")
                    await page.wait_for_timeout(3000)
                    break
            except:
                continue
                
    except Exception as e:
        logger.warning(f"⚠️ Error selecting Blind Drop Ship: {e}")
        print(f"⚠️ Error selecting Blind Drop Ship: {e}")

# Removed custom implementations - now using actual production methods from b2sign_playwright_integration.py

if __name__ == "__main__":
    asyncio.run(test_complete_tent_workflow())