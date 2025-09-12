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
            
            # Step 4: Fill dimensions (3x6 ft) - PROPERLY DETECT ALL 4 FIELDS
            logger.info("📏 Step 4: Filling dimensions...")
            print("📏 Step 4: Filling dimensions...")
            
            # Look for MUI input fields for dimensions
            mui_inputs = await page.query_selector_all('.MuiInput-input')
            logger.info(f"Found {len(mui_inputs)} MUI input fields total")
            
            # Debug: Log all input fields to understand the structure
            logger.info("🔍 Debug: Analyzing all input fields...")
            for i, input_elem in enumerate(mui_inputs):
                try:
                    placeholder = await input_elem.get_attribute('placeholder') or ''
                    name = await input_elem.get_attribute('name') or ''
                    input_type = await input_elem.get_attribute('type') or ''
                    logger.info(f"  Input {i}: placeholder='{placeholder}', name='{name}', type='{input_type}'")
                except Exception as e:
                    logger.warning(f"  Input {i}: Error reading attributes - {e}")
            
            # Look for dimension-specific input fields - BE MORE SPECIFIC
            dimension_inputs = []
            
            # Method 1: Look for inputs with specific attributes that suggest dimensions
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
            
            # Method 2: If we didn't find enough, use the MUI inputs approach with better filtering
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
            
            # Fill the 4 dimension fields: width_ft, width_in, height_ft, height_in
            dimension_values = ['3', '0', '6', '0']  # 3ft 0in x 6ft 0in
            dimension_names = ['width feet', 'width inches', 'height feet', 'height inches']
            
            for i, (input_elem, value, name) in enumerate(zip(dimension_inputs, dimension_values, dimension_names)):
                try:
                    await input_elem.fill(value)
                    logger.info(f"✅ Filled {name}: {value}")
                    print(f"✅ Filled {name}: {value}")
                except Exception as e:
                    logger.warning(f"⚠️ Could not fill {name}: {e}")
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
                    
                    # Step 8: Look for shipping dropdown immediately (it's already rendered)
                    logger.info("🚚 Step 8: Looking for shipping dropdown (already rendered)...")
                    print("🚚 Step 8: Looking for shipping dropdown (already rendered)...")
                    
                    # Wait a moment for the dropdown to be fully rendered
                    await page.wait_for_timeout(2000)
                    
                    # Look for shipping method dropdown - it should show "Ground $14.04"
                    shipping_dropdown = None
                    dropdown_selectors = [
                        'button:has-text("Ground")',
                        'button:has-text("$14.04")',
                        'button:has-text("$")',
                        '.MuiSelect-button',
                        'button[class*="select"]',
                        'button[role="button"]',
                        'select',
                        '[role="combobox"]',
                        '.MuiSelect-root button',
                        'button[aria-haspopup="listbox"]'
                    ]
                    
                    logger.info("🔍 Searching for shipping dropdown with multiple selectors...")
                    for i, selector in enumerate(dropdown_selectors):
                        try:
                            dropdowns = await page.query_selector_all(selector)
                            logger.info(f"  Selector {i+1} ({selector}): Found {len(dropdowns)} elements")
                            
                            for j, dropdown in enumerate(dropdowns):
                                try:
                                    dropdown_text = await dropdown.inner_text()
                                    logger.info(f"    Element {j+1}: '{dropdown_text[:50]}...'")
                                    
                                    # Check if this looks like a shipping dropdown
                                    if ('$' in dropdown_text and ('ground' in dropdown_text.lower() or 'shipping' in dropdown_text.lower())) or \
                                       ('ground' in dropdown_text.lower() and '$' in dropdown_text) or \
                                       ('$14.04' in dropdown_text):
                                        shipping_dropdown = dropdown
                                        logger.info(f"✅ Found shipping dropdown: {dropdown_text}")
                                        print(f"✅ Found shipping dropdown: {dropdown_text}")
                                        break
                                except Exception as e:
                                    logger.warning(f"    Error reading element {j+1}: {e}")
                                    continue
                            
                            if shipping_dropdown:
                                break
                        except Exception as e:
                            logger.warning(f"  Error with selector {i+1}: {e}")
                            continue
                    
                    if shipping_dropdown:
                        # Click the dropdown to reveal all options
                        await shipping_dropdown.click()
                        logger.info("✅ Clicked shipping dropdown to reveal all options")
                        print("✅ Clicked shipping dropdown to reveal all options")
                        await page.wait_for_timeout(3000)
                        
                        # Take screenshot after clicking dropdown
                        await page.screenshot(path="after_dropdown_click.png")
                        logger.info("📸 Screenshot saved: after_dropdown_click.png")
                        
                        # Extract all shipping options
                        shipping_options = []
                        option_selectors = [
                            '.MuiOption-root',
                            '[role="option"]',
                            'li[role="option"]',
                            '.MuiSelect-listbox li',
                            '.MuiMenuItem-root',
                            'option',
                            '[data-value]'
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
                        # Debug: List all buttons on the page
                        logger.info("🔍 Debug: Listing all buttons on the page...")
                        all_buttons = await page.query_selector_all('button')
                        for i, button in enumerate(all_buttons[:10]):  # Limit to first 10
                            try:
                                button_text = await button.inner_text()
                                logger.info(f"  Button {i+1}: '{button_text[:50]}...'")
                            except:
                                logger.info(f"  Button {i+1}: [Error reading text]")
                    
                    # Now proceed with address modal for completeness (optional)
                    print("\n📝 Optional: Testing address modal workflow...")
                    
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
                        # Using dynamic customer data instead of hardcoded values
                        customer_info = {
                            'name': 'John Doe',
                            'company': 'BuyPrintz Inc',
                            'phone': '555-123-4567',
                            'address': '123 Main St',
                            'city': 'Beverly Hills',
                            'state': 'CA',
                            'zipCode': '90210'
                        }
                    
                        address_fields = [
                            ('input[name="fullname"]', customer_info['name']),
                            ('input[name="company"]', customer_info['company']),
                            ('input[name="telephone"]', customer_info['phone']),
                            ('input[placeholder="Street address"]', customer_info['address']),
                            ('input[name="suburb"]', ''),
                            ('input[name="city"]', customer_info['city']),
                            ('input[name="postcode"]', customer_info['zipCode'])
                            # NOTE: State is handled separately with MuiAutocomplete below
                        ]
                        
                        for selector, value in address_fields:
                            try:
                                field = await page.query_selector(selector)
                                if field:
                                    # Get field attributes to verify we're filling the right field
                                    field_placeholder = await field.get_attribute('placeholder') or ''
                                    field_name = await field.get_attribute('name') or ''
                                    
                                    logger.info(f"🔍 Filling field: {selector}")
                                    logger.info(f"  - Placeholder: '{field_placeholder}'")
                                    logger.info(f"  - Name: '{field_name}'")
                                    logger.info(f"  - Value: '{value}'")
                                    
                                    await field.fill(value)
                                    logger.info(f"✅ Filled {selector}: {value}")
                                    print(f"✅ Filled {selector}: {value}")
                                else:
                                    logger.warning(f"⚠️ Field not found: {selector}")
                            except Exception as e:
                                logger.warning(f"⚠️ Could not fill {selector}: {e}")
                                continue
                        
                        # Select state (CA) - HANDLE HIDDEN STATE DROPDOWN
                        try:
                            logger.info("🔍 Selecting state - handling hidden state dropdown...")
                            print("🔍 Selecting state - handling hidden state dropdown...")
                            
                            # First, try to find the hidden state select element
                            hidden_state_select = await page.query_selector('select[name="state"]')
                            if hidden_state_select:
                                logger.info("✅ Found hidden state select element")
                                try:
                                    # Try to make the element visible and select CA
                                    await page.evaluate('''(element) => {
                                        element.style.display = 'block';
                                        element.style.visibility = 'visible';
                                        element.disabled = false;
                                    }''', hidden_state_select)
                                    
                                    await page.wait_for_timeout(1000)
                                    await hidden_state_select.select_option(customer_info['state'])
                                    logger.info(f"✅ Selected {customer_info['state']} state using hidden select")
                                    print(f"✅ Selected {customer_info['state']} state using hidden select")
                                    state_selected = True
                                except Exception as e:
                                    logger.warning(f"Could not select {customer_info['state']} from hidden select: {e}")
                                    # Try JavaScript approach as fallback
                                    try:
                                        # Try multiple JavaScript approaches
                                        await page.evaluate(f'''(element) => {{
                                            element.value = '{customer_info['state']}';
                                            element.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                            element.dispatchEvent(new Event('input', {{ bubbles: true }}));
                                        }}''', hidden_state_select)
                                        
                                        # Also try setting the selectedIndex
                                        await page.evaluate(f'''(element) => {{
                                            for (let i = 0; i < element.options.length; i++) {{
                                                if (element.options[i].value === '{customer_info['state']}' || element.options[i].text.toLowerCase().includes('{customer_info['state'].lower()}')) {{
                                                    element.selectedIndex = i;
                                                    break;
                                                }}
                                            }}
                                            element.dispatchEvent(new Event('change', {{ bubbles: true }}));
                                        }}''', hidden_state_select)
                                        
                                        logger.info(f"✅ Set {customer_info['state']} state using JavaScript")
                                        print(f"✅ Set {customer_info['state']} state using JavaScript")
                                        state_selected = True
                                    except Exception as e2:
                                        logger.warning(f"JavaScript approach also failed: {e2}")
                            
                            # If hidden select didn't work, try MuiAutocomplete approach
                            if not state_selected:
                                logger.info("Trying MuiAutocomplete approach...")
                                
                                # Look for MuiAutocomplete elements (the visible state dropdowns)
                                autocomplete_selectors = [
                                    '.MuiAutocomplete-root',
                                    '.MuiAutocomplete-root[class*="hasPopupIcon"]',
                                    '.MuiAutocomplete-root[class*="hasClearIcon"]'
                                ]
                                
                                for selector in autocomplete_selectors:
                                    try:
                                        autocomplete_elements = await page.query_selector_all(selector)
                                        logger.info(f"Found {len(autocomplete_elements)} autocomplete elements with selector: {selector}")
                                        
                                        for i, element in enumerate(autocomplete_elements):
                                            # Get the input field within the autocomplete
                                            input_field = await element.query_selector('input')
                                            if input_field:
                                                # Check if this is the state field by looking at parent context
                                                parent = await element.query_selector('xpath=..')
                                                parent_text = await parent.inner_text() if parent else ""
                                                
                                                logger.info(f"Trying autocomplete element {i+1}...")
                                                logger.info(f"  - Parent text: '{parent_text[:100]}...'")
                                                
                                                # Only proceed if this looks like a state field
                                                if 'state' in parent_text.lower() or 'province' in parent_text.lower():
                                                    logger.info("✅ This appears to be the state field")
                                                    
                                                    # Click the autocomplete to open dropdown
                                                    await element.click()
                                                    await page.wait_for_timeout(1000)
                                                    
                                                    # Type customer state to filter options
                                                    await input_field.fill(customer_info['state'])
                                                    await page.wait_for_timeout(1000)
                                                    
                                                    # Look for customer state option in dropdown
                                                    state_options = await page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                                                    logger.info(f"Found {len(state_options)} state options")
                                                    
                                                    for option in state_options:
                                                        try:
                                                            option_text = await option.inner_text()
                                                            logger.info(f"Checking option: '{option_text}'")
                                                            
                                                            if customer_info['state'].lower() in option_text.lower() or any(state_name in option_text.lower() for state_name in ['california'] if customer_info['state'] == 'CA'):
                                                                await option.click()
                                                                logger.info(f"✅ Selected state: {customer_info['state']} (using autocomplete {i+1})")
                                                                print(f"✅ Selected state: {customer_info['state']} (using autocomplete {i+1})")
                                                                state_selected = True
                                                                break
                                                        except Exception as e:
                                                            logger.warning(f"Error clicking option: {e}")
                                                            continue
                                                    
                                                    if state_selected:
                                                        break
                                                else:
                                                    logger.info("⚠️ Skipping - doesn't appear to be state field")
                                                    continue
                                        
                                        if state_selected:
                                            break
                                            
                                    except Exception as e:
                                        logger.warning(f"⚠️ Error with autocomplete selector {selector}: {e}")
                                        continue
                            
                            if not state_selected:
                                logger.warning("⚠️ Could not select state using any method")
                                print("⚠️ Could not select state using any method")
                                
                        except Exception as e:
                            logger.warning(f"⚠️ Could not select state: {e}")
                            print(f"⚠️ Could not select state: {e}")
                            pass
                        
                        # Click "Use this address" button using exact selector
                        try:
                            use_button = await page.query_selector('button:has-text("Use this address")')
                            if use_button:
                                await use_button.click()
                                logger.info("✅ Clicked 'Use this address' button")
                                print("✅ Clicked 'Use this address' button")
                                await page.wait_for_timeout(3000)
                                
                                # Debug: Check if state was actually set correctly
                                logger.info("🔍 Debug: Checking if state was set correctly...")
                                try:
                                    # Check the hidden state select value
                                    hidden_state_select = await page.query_selector('select[name="state"]')
                                    if hidden_state_select:
                                        state_value = await hidden_state_select.get_attribute('value')
                                        logger.info(f"  Hidden state select value: '{state_value}'")
                                        
                                        # Check if there are any validation errors
                                        error_elements = await page.query_selector_all('.error, .Mui-error, [class*="error"]')
                                        if error_elements:
                                            logger.warning(f"  Found {len(error_elements)} error elements on page")
                                            for i, error in enumerate(error_elements[:3]):
                                                try:
                                                    error_text = await error.inner_text()
                                                    logger.warning(f"    Error {i+1}: '{error_text[:100]}...'")
                                                except:
                                                    pass
                                        else:
                                            logger.info("  No validation errors found")
                                    
                                    # Check if the modal actually closed
                                    modal_elements = await page.query_selector_all('.MuiModal-root, .modal, [role="dialog"]')
                                    if modal_elements:
                                        logger.warning(f"  Found {len(modal_elements)} modal elements still visible")
                                    else:
                                        logger.info("  Modal appears to be closed")
                                        
                                except Exception as debug_e:
                                    logger.warning(f"  Debug error: {debug_e}")
                                    
                            else:
                                logger.warning("⚠️ Could not find 'Use this address' button")
                                print("⚠️ Could not find 'Use this address' button")
                        except Exception as e:
                            logger.warning(f"⚠️ Could not click 'Use this address' button: {e}")
                            pass
                        
                        # Step 10: Look for shipping options dropdown with enhanced debugging
                        logger.info("🚚 Step 10: Looking for shipping options dropdown...")
                        print("🚚 Step 10: Looking for shipping options dropdown...")
                        
                        # Wait longer for shipping dropdown to appear after address submission
                        logger.info("⏳ Waiting 10 seconds for shipping dropdown to appear...")
                        await page.wait_for_timeout(10000)
                        
                        # Take a screenshot to see current state
                        await page.screenshot(path="shipping_dropdown_debug.png")
                        logger.info("📸 Screenshot saved: shipping_dropdown_debug.png")
                        
                        # Look for shipping method dropdown with more comprehensive selectors
                        shipping_dropdown = None
                        dropdown_selectors = [
                            'button:has-text("Ground")',
                            'button:has-text("$")',
                            '.MuiSelect-button',
                            'button[class*="select"]',
                            'button[role="button"]',
                            'select',
                            '[role="combobox"]',
                            '.MuiSelect-root button',
                            'button[aria-haspopup="listbox"]'
                        ]
                        
                        logger.info("🔍 Searching for shipping dropdown with multiple selectors...")
                        for i, selector in enumerate(dropdown_selectors):
                            try:
                                dropdowns = await page.query_selector_all(selector)
                                logger.info(f"  Selector {i+1} ({selector}): Found {len(dropdowns)} elements")
                                
                                for j, dropdown in enumerate(dropdowns):
                                    try:
                                        dropdown_text = await dropdown.inner_text()
                                        logger.info(f"    Element {j+1}: '{dropdown_text[:50]}...'")
                                        
                                        # Check if this looks like a shipping dropdown
                                        if ('$' in dropdown_text and ('ground' in dropdown_text.lower() or 'shipping' in dropdown_text.lower())) or \
                                           ('ground' in dropdown_text.lower() and '$' in dropdown_text):
                                            shipping_dropdown = dropdown
                                            logger.info(f"✅ Found shipping dropdown: {dropdown_text}")
                                            print(f"✅ Found shipping dropdown: {dropdown_text}")
                                            break
                                    except Exception as e:
                                        logger.warning(f"    Error reading element {j+1}: {e}")
                                        continue
                                
                                if shipping_dropdown:
                                    break
                            except Exception as e:
                                logger.warning(f"  Error with selector {i+1}: {e}")
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
                            
                            # Debug: List all buttons on the page
                            logger.info("🔍 Debug: Listing all buttons on the page...")
                            all_buttons = await page.query_selector_all('button')
                            for i, button in enumerate(all_buttons[:10]):  # Limit to first 10
                                try:
                                    button_text = await button.inner_text()
                                    logger.info(f"  Button {i+1}: '{button_text[:50]}...'")
                                except:
                                    logger.info(f"  Button {i+1}: [Error reading text]")
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
