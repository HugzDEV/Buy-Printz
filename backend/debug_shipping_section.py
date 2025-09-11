#!/usr/bin/env python3
"""
Debug script to analyze the shipping section after Blind Drop Ship is selected
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_shipping_section():
    """Debug the shipping section to find the pencil icon"""
    logger.info("🔍 Debugging shipping section...")
    
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
        
        # Look for all buttons and analyze them
        logger.info("🔍 Analyzing all buttons on the page...")
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
                
                # Look for buttons near "Ship to" or with edit-related attributes
                if ('ship to' in parent_text.lower() or 
                    'edit' in (button_aria or '').lower() or 
                    'edit' in (button_title or '').lower() or
                    'pencil' in (button_aria or '').lower() or
                    button_text.strip() == ''):
                    
                    logger.info(f"🔍 Button {i}:")
                    logger.info(f"  Text: '{button_text}'")
                    logger.info(f"  Class: '{button_class}'")
                    logger.info(f"  Aria-label: '{button_aria}'")
                    logger.info(f"  Title: '{button_title}'")
                    logger.info(f"  Parent text: '{parent_text[:100]}...'")
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
        
        # Look for elements with "Ship to" text
        logger.info("🔍 Looking for 'Ship to' elements...")
        all_elements = await integration.page.query_selector_all('*')
        
        for element in all_elements:
            try:
                text = await element.inner_text()
                if 'ship to' in text.lower():
                    tag = await element.evaluate('el => el.tagName')
                    class_attr = await element.get_attribute('class')
                    logger.info(f"🔍 'Ship to' element: {tag}, class: '{class_attr}'")
                    logger.info(f"  Text: '{text[:200]}...'")
                    logger.info("  ---")
                    
            except Exception as e:
                continue
        
        logger.info("✅ Debug analysis complete!")
        
    except Exception as e:
        logger.error(f"❌ Error during debug: {e}")
    finally:
        if 'integration' in locals():
            await integration.close()

if __name__ == "__main__":
    asyncio.run(debug_shipping_section())
