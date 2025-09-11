#!/usr/bin/env python3
"""
Comprehensive debug script to find shipping section elements
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_shipping_comprehensive():
    """Comprehensive debug of shipping section"""
    logger.info("🔍 Comprehensive shipping section debug...")
    
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
        
        # Wait longer and scroll to find shipping section
        logger.info("⏳ Waiting longer for shipping section to appear...")
        await integration.page.wait_for_timeout(10000)
        
        # Scroll down to look for shipping section
        logger.info("📜 Scrolling down to look for shipping section...")
        await integration.page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
        await integration.page.wait_for_timeout(3000)
        
        # Scroll back up
        await integration.page.evaluate('window.scrollTo(0, 0)')
        await integration.page.wait_for_timeout(2000)
        
        # Look for any elements containing shipping-related keywords
        logger.info("🔍 Looking for shipping-related elements...")
        shipping_keywords = ['ship', 'shipping', 'delivery', 'address', 'from', 'to', 'ground', 'express']
        
        all_elements = await integration.page.query_selector_all('*')
        shipping_elements = []
        
        for element in all_elements:
            try:
                text = await element.inner_text()
                if text and any(keyword in text.lower() for keyword in shipping_keywords):
                    tag = await element.evaluate('el => el.tagName')
                    class_attr = await element.get_attribute('class')
                    shipping_elements.append({
                        'tag': tag,
                        'class': class_attr,
                        'text': text.strip()
                    })
            except:
                continue
        
        # Remove duplicates and sort by relevance
        unique_elements = []
        seen_texts = set()
        for elem in shipping_elements:
            if elem['text'] not in seen_texts and len(elem['text']) < 200:  # Avoid very long texts
                seen_texts.add(elem['text'])
                unique_elements.append(elem)
        
        logger.info(f"🔍 Found {len(unique_elements)} unique shipping-related elements:")
        for i, elem in enumerate(unique_elements[:20]):  # Show first 20
            logger.info(f"  {i+1}. {elem['tag']} - '{elem['text'][:100]}...'")
        
        # Look for any buttons with empty text (potential icons)
        logger.info("🔍 Looking for buttons with empty text (potential icons)...")
        buttons = await integration.page.query_selector_all('button')
        
        empty_buttons = []
        for button in buttons:
            try:
                button_text = await button.inner_text()
                if button_text.strip() == '':
                    button_class = await button.get_attribute('class')
                    parent = await button.query_selector('xpath=..')
                    parent_text = await parent.inner_text() if parent else ""
                    
                    empty_buttons.append({
                        'class': button_class,
                        'parent_text': parent_text[:100]
                    })
            except:
                continue
        
        logger.info(f"🔍 Found {len(empty_buttons)} empty buttons (potential icons):")
        for i, btn in enumerate(empty_buttons[:10]):  # Show first 10
            logger.info(f"  {i+1}. Class: '{btn['class']}', Parent: '{btn['parent_text']}...'")
        
        # Look for any dropdowns or select elements
        logger.info("🔍 Looking for dropdowns and select elements...")
        dropdowns = await integration.page.query_selector_all('select, [role="listbox"], .MuiSelect-root, button[aria-haspopup]')
        
        logger.info(f"🔍 Found {len(dropdowns)} dropdown/select elements:")
        for i, dropdown in enumerate(dropdowns):
            try:
                dropdown_text = await dropdown.inner_text()
                dropdown_class = await dropdown.get_attribute('class')
                logger.info(f"  {i+1}. '{dropdown_text[:50]}...' - Class: '{dropdown_class}'")
            except:
                continue
        
        # Take a screenshot for visual debugging
        logger.info("📸 Taking screenshot for visual debugging...")
        await integration.page.screenshot(path='shipping_section_debug.png')
        logger.info("✅ Screenshot saved as 'shipping_section_debug.png'")
        
        logger.info("✅ Comprehensive debug analysis complete!")
        
    except Exception as e:
        logger.error(f"❌ Error during debug: {e}")
    finally:
        if 'integration' in locals():
            await integration.close()

if __name__ == "__main__":
    asyncio.run(debug_shipping_comprehensive())
