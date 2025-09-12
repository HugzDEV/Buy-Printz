#!/usr/bin/env python3
"""
Debug script to verify address modal field mapping
Specifically checks street vs state field confusion
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def debug_address_modal():
    """Debug address modal field mapping"""
    try:
        logger.info("🔍 Debugging Address Modal Field Mapping...")
        print("🔍 Debugging Address Modal Field Mapping...")
        print("=" * 60)
        
        # Create B2Sign integration instance
        integration = B2SignPlaywrightIntegration()
        
        # Initialize and login
        logger.info("🔧 Initializing B2Sign integration...")
        await integration.initialize()
        await integration.login()
        
        # Navigate to banner product page
        logger.info("🌐 Navigating to banner product page...")
        await integration.page.goto('https://www.b2sign.com/vinyl-banners')
        await integration.page.wait_for_timeout(3000)
        
        # Fill banner dimensions
        logger.info("📏 Filling banner dimensions...")
        await integration._fill_banner_dimensions(3.0, 6.0)
        await integration.page.wait_for_timeout(2000)
        
        # Fill job details
        logger.info("📝 Filling job details...")
        await integration._fill_banner_job_details(1)
        await integration.page.wait_for_timeout(2000)
        
        # Fill banner options
        logger.info("⚙️ Filling banner options...")
        await integration._fill_banner_options_workflow()
        await integration.page.wait_for_timeout(3000)
        
        # Select Blind Drop Ship
        logger.info("🚚 Selecting Blind Drop Ship...")
        await integration._select_blind_drop_ship()
        await integration.page.wait_for_timeout(3000)
        
        # Take screenshot before opening modal
        await integration.page.screenshot(path='address_modal_before.png')
        logger.info("📸 Screenshot taken: address_modal_before.png")
        
        # Open address modal and analyze fields
        logger.info("🔍 Opening address modal to analyze fields...")
        
        # Click pencil icon
        svgs = await integration.page.query_selector_all('svg')
        for i, svg in enumerate(svgs):
            try:
                parent = await svg.query_selector('xpath=..')
                parent_text = await parent.inner_text() if parent else ""
                
                if 'ship to different location' in parent_text.lower():
                    await svg.click()
                    logger.info("✅ Clicked pencil icon to open modal")
                    await integration.page.wait_for_timeout(2000)
                    break
            except:
                continue
        
        # Take screenshot after opening modal
        await integration.page.screenshot(path='address_modal_opened.png')
        logger.info("📸 Screenshot taken: address_modal_opened.png")
        
        # Analyze all input fields in the modal
        logger.info("🔍 Analyzing all input fields in the modal...")
        
        # Get all input fields
        all_inputs = await integration.page.query_selector_all('input')
        logger.info(f"Found {len(all_inputs)} input fields in modal")
        
        for i, input_elem in enumerate(all_inputs):
            try:
                # Get input attributes
                name = await input_elem.get_attribute('name')
                placeholder = await input_elem.get_attribute('placeholder')
                input_type = await input_elem.get_attribute('type')
                value = await input_elem.get_attribute('value')
                class_name = await input_elem.get_attribute('class')
                
                logger.info(f"Input {i+1}:")
                logger.info(f"  - name: {name}")
                logger.info(f"  - placeholder: {placeholder}")
                logger.info(f"  - type: {input_type}")
                logger.info(f"  - value: {value}")
                logger.info(f"  - class: {class_name}")
                logger.info("  ---")
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze input {i+1}: {e}")
        
        # Analyze MuiAutocomplete components
        logger.info("🔍 Analyzing MuiAutocomplete components...")
        autocomplete_elements = await integration.page.query_selector_all('.MuiAutocomplete-root')
        logger.info(f"Found {len(autocomplete_elements)} MuiAutocomplete components")
        
        for i, element in enumerate(autocomplete_elements):
            try:
                # Get autocomplete attributes
                class_name = await element.get_attribute('class')
                input_field = await element.query_selector('input')
                
                if input_field:
                    input_name = await input_field.get_attribute('name')
                    input_placeholder = await input_field.get_attribute('placeholder')
                    
                    logger.info(f"MuiAutocomplete {i+1}:")
                    logger.info(f"  - class: {class_name}")
                    logger.info(f"  - input name: {input_name}")
                    logger.info(f"  - input placeholder: {input_placeholder}")
                    logger.info("  ---")
                
            except Exception as e:
                logger.warning(f"⚠️ Could not analyze MuiAutocomplete {i+1}: {e}")
        
        # Test filling the fields with correct mapping
        logger.info("🧪 Testing field filling with correct mapping...")
        
        # Fill address fields with CORRECTED mapping
        address_fields = [
            ('input[name="fullname"]', 'John Doe'),
            ('input[name="company"]', 'BuyPrintz Inc'),
            ('input[name="telephone"]', '555-123-4567'),
            ('input[placeholder="Street address"]', '123 Main St'),  # STREET ADDRESS
            ('input[name="suburb"]', 'Suite 100'),
            ('input[name="city"]', 'Beverly Hills'),
            ('input[name="postcode"]', '90210')
        ]
        
        for selector, value in address_fields:
            try:
                field = await integration.page.query_selector(selector)
                if field:
                    await field.fill(value)
                    logger.info(f"✅ Filled {selector}: {value}")
                else:
                    logger.warning(f"⚠️ Field not found: {selector}")
            except Exception as e:
                logger.warning(f"⚠️ Error filling {selector}: {e}")
        
        # Test state selection with MuiAutocomplete
        logger.info("🧪 Testing state selection with MuiAutocomplete...")
        try:
            autocomplete_selectors = [
                '.MuiAutocomplete-root',
                '.MuiAutocomplete-root[class*="hasPopupIcon"]',
                '.MuiAutocomplete-root[class*="hasClearIcon"]'
            ]
            
            state_selected = False
            for selector in autocomplete_selectors:
                try:
                    autocomplete_elements = await integration.page.query_selector_all(selector)
                    for i, element in enumerate(autocomplete_elements):
                        input_field = await element.query_selector('input')
                        if input_field:
                            await element.click()
                            await integration.page.wait_for_timeout(1000)
                            await input_field.fill('CA')
                            await integration.page.wait_for_timeout(1000)
                            
                            ca_options = await integration.page.query_selector_all('[role="option"], .MuiOption-root, li[role="option"]')
                            for option in ca_options:
                                try:
                                    option_text = await option.inner_text()
                                    if 'california' in option_text.lower() or 'ca' in option_text.lower():
                                        await option.click()
                                        logger.info(f"✅ Selected state: CA (using autocomplete {i+1})")
                                        state_selected = True
                                        break
                                except:
                                    continue
                            
                            if state_selected:
                                break
                    
                    if state_selected:
                        break
                        
                except Exception as e:
                    logger.warning(f"⚠️ Error with autocomplete selector {selector}: {e}")
                    continue
            
            if not state_selected:
                logger.warning("⚠️ Could not select state")
                
        except Exception as e:
            logger.warning(f"⚠️ Error selecting state: {e}")
        
        # Take screenshot after filling fields
        await integration.page.screenshot(path='address_modal_filled.png')
        logger.info("📸 Screenshot taken: address_modal_filled.png")
        
        logger.info("✅ Address modal debugging completed!")
        print("✅ Address modal debugging completed!")
        print("📸 Check screenshots: address_modal_before.png, address_modal_opened.png, address_modal_filled.png")
        
    except Exception as e:
        logger.error(f"❌ Error in address modal debugging: {e}")
        print(f"❌ Error in address modal debugging: {e}")
    
    finally:
        # Cleanup
        try:
            await integration.cleanup()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(debug_address_modal())
