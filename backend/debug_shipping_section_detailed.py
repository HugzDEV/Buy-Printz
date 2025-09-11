#!/usr/bin/env python3
"""
Detailed debug script to find the pencil icon and shipping options in B2Sign
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_shipping_section_detailed():
    """Detailed debug of shipping section to find pencil icon and all shipping options"""
    logger.info("🔍 Detailed shipping section debug...")
    
    try:
        # Use existing integration
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        await integration.login()
        
        # Navigate to banner page
        await integration.page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
        await integration.page.wait_for_timeout(3000)
        
        # Fill basic form data
        await integration._fill_dimensions(integration.page, 3, 6)
        await integration._fill_job_details(integration.page, "banner", 3, 6, 2)
        await integration._fill_banner_options(integration.page, {'sides': 2, 'grommets': 'every-2-feet', 'hem': 'pole-pocket'}, [])
        
        # Wait for shipping section
        await integration.page.wait_for_timeout(3000)
        
        # Select Blind Drop Ship
        logger.info("🔍 Looking for Blind Drop Ship radio button...")
        all_elements = await integration.page.query_selector_all('*')
        for element in all_elements:
            try:
                text = await element.inner_text()
                if 'blind drop' in text.lower() and 'ship' in text.lower():
                    await element.click()
                    logger.info("✅ Clicked Blind Drop Ship")
                    break
            except:
                continue
        
        # Wait for shipping section to appear
        logger.info("⏳ Waiting for shipping section to appear...")
        await integration.page.wait_for_timeout(5000)
        
        # Take a screenshot to see what's visible
        await integration.page.screenshot(path='after_blind_drop_selection.png')
        logger.info("📸 Screenshot saved as 'after_blind_drop_selection.png'")
        
        # Look for "Ship from" and "Ship to" text
        logger.info("🔍 Looking for 'Ship from' and 'Ship to' text...")
        all_elements = await integration.page.query_selector_all('*')
        ship_elements = []
        
        for element in all_elements:
            try:
                text = await element.inner_text()
                if 'ship from' in text.lower() or 'ship to' in text.lower():
                    tag = await element.evaluate('el => el.tagName')
                    class_attr = await element.get_attribute('class')
                    ship_elements.append({
                        'tag': tag,
                        'class': class_attr,
                        'text': text.strip()
                    })
            except:
                continue
        
        logger.info(f"🔍 Found {len(ship_elements)} elements with 'ship from/to' text:")
        for i, elem in enumerate(ship_elements):
            logger.info(f"  {i+1}. {elem['tag']} - '{elem['text'][:100]}...'")
        
        # Look for buttons near "Ship to" text
        logger.info("🔍 Looking for buttons near 'Ship to' text...")
        buttons = await integration.page.query_selector_all('button')
        
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
                    logger.info("  ---")
                    
            except Exception as e:
                continue
        
        # Look for SVG elements (pencil icons)
        logger.info("🔍 Looking for SVG elements (potential pencil icons)...")
        svgs = await integration.page.query_selector_all('svg')
        
        for i, svg in enumerate(svgs):
            try:
                parent = await svg.query_selector('xpath=..')
                parent_text = await parent.inner_text() if parent else ""
                
                if 'ship to' in parent_text.lower():
                    logger.info(f"🔍 SVG {i} near 'Ship to':")
                    logger.info(f"  Parent text: '{parent_text[:100]}...'")
                    logger.info(f"  Parent tag: {await parent.evaluate('el => el.tagName') if parent else 'None'}")
                    logger.info("  ---")
                    
            except Exception as e:
                continue
        
        # Look for any elements with edit-related attributes
        logger.info("🔍 Looking for elements with edit-related attributes...")
        edit_selectors = [
            '[aria-label*="edit"]',
            '[title*="edit"]',
            '[class*="edit"]',
            '[data-testid*="edit"]',
            '[data-testid*="pencil"]'
        ]
        
        for selector in edit_selectors:
            try:
                elements = await integration.page.query_selector_all(selector)
                if elements:
                    logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                    for i, element in enumerate(elements):
                        try:
                            text = await element.inner_text()
                            class_attr = await element.get_attribute('class')
                            parent = await element.query_selector('xpath=..')
                            parent_text = await parent.inner_text() if parent else ""
                            
                            logger.info(f"  Element {i+1}:")
                            logger.info(f"    Text: '{text}'")
                            logger.info(f"    Class: '{class_attr}'")
                            logger.info(f"    Parent text: '{parent_text[:100]}...'")
                        except:
                            continue
            except:
                continue
        
        # Look for dropdown elements that might contain shipping options
        logger.info("🔍 Looking for dropdown elements...")
        dropdown_selectors = [
            'select',
            '[role="listbox"]',
            '.MuiSelect-root',
            'button[aria-haspopup]',
            '[class*="select"]',
            '[class*="dropdown"]'
        ]
        
        for selector in dropdown_selectors:
            try:
                elements = await integration.page.query_selector_all(selector)
                if elements:
                    logger.info(f"🔍 Found {len(elements)} elements with selector: {selector}")
                    for i, element in enumerate(elements):
                        try:
                            text = await element.inner_text()
                            class_attr = await element.get_attribute('class')
                            logger.info(f"  Dropdown {i+1}: '{text[:50]}...' - Class: '{class_attr}'")
                        except:
                            continue
            except:
                continue
        
        # Look for any elements containing shipping-related text
        logger.info("🔍 Looking for elements with shipping-related text...")
        shipping_keywords = ['ground', 'express', 'overnight', 'shipping', 'delivery', 'fedex', 'ups', 'usps']
        
        for keyword in shipping_keywords:
            try:
                elements = await integration.page.query_selector_all(f'*:has-text("{keyword}")')
                if elements:
                    logger.info(f"🔍 Found {len(elements)} elements containing '{keyword}':")
                    for i, element in enumerate(elements[:3]):  # Show first 3
                        try:
                            text = await element.inner_text()
                            logger.info(f"  {i+1}. '{text[:100]}...'")
                        except:
                            continue
            except:
                continue
        
        logger.info("✅ Detailed debug analysis complete!")
        
    except Exception as e:
        logger.error(f"❌ Error during debug: {e}")
    finally:
        if 'integration' in locals():
            await integration.close()

if __name__ == "__main__":
    asyncio.run(debug_shipping_section_detailed())
