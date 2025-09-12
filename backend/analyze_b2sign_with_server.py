#!/usr/bin/env python3
"""
Use the Overpass/BeautifulSoup server to analyze B2Sign's shipping section
"""

import asyncio
import httpx
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SERVER_URL = "http://localhost:8943"

async def query_html_via_server(query: str, url: str, output_format: str = "json"):
    """Query HTML using the Overpass/BeautifulSoup server"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{SERVER_URL}/execute",
                json={
                    "operation": "query_html",
                    "params": {
                        "source_type": "html",
                        "query": query,
                        "url": url,
                        "output_format": output_format
                    }
                }
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error querying server: {e}")
            return None

async def analyze_b2sign_shipping_section():
    """Analyze B2Sign's shipping section using the server"""
    logger.info("🔍 Analyzing B2Sign shipping section with Overpass/BeautifulSoup server...")
    
    # B2Sign banner page URL
    b2sign_url = "https://www.b2sign.com/13oz-vinyl-banner"
    
    # Test 1: Look for all buttons (potential pencil icons)
    logger.info("🔍 Test 1: Looking for all buttons...")
    buttons_result = await query_html_via_server(
        query="button",
        url=b2sign_url,
        output_format="json"
    )
    
    if buttons_result and buttons_result.get('success'):
        buttons = buttons_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(buttons)} buttons")
        
        # Look for buttons with edit-related attributes
        for i, button in enumerate(buttons[:10]):  # Show first 10
            logger.info(f"  Button {i+1}: {button[:200]}...")
    else:
        logger.warning("⚠️ No buttons found or server error")
    
    # Test 2: Look for edit-related elements
    logger.info("\n🔍 Test 2: Looking for edit-related elements...")
    edit_result = await query_html_via_server(
        query="button[aria-label*='edit'], button[title*='edit'], button[class*='edit'], .MuiIconButton",
        url=b2sign_url,
        output_format="json"
    )
    
    if edit_result and edit_result.get('success'):
        edit_elements = edit_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(edit_elements)} edit-related elements")
        for i, element in enumerate(edit_elements):
            logger.info(f"  Edit Element {i+1}: {element[:200]}...")
    else:
        logger.warning("⚠️ No edit elements found")
    
    # Test 3: Look for shipping-related elements
    logger.info("\n🔍 Test 3: Looking for shipping-related elements...")
    shipping_result = await query_html_via_server(
        query="*[class*='ship'], *[id*='ship'], *[class*='shipping'], *[id*='shipping']",
        url=b2sign_url,
        output_format="json"
    )
    
    if shipping_result and shipping_result.get('success'):
        shipping_elements = shipping_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(shipping_elements)} shipping-related elements")
        for i, element in enumerate(shipping_elements[:5]):  # Show first 5
            logger.info(f"  Shipping Element {i+1}: {element[:200]}...")
    else:
        logger.warning("⚠️ No shipping elements found")
    
    # Test 4: Look for dropdown/select elements
    logger.info("\n🔍 Test 4: Looking for dropdown/select elements...")
    dropdown_result = await query_html_via_server(
        query="select, [role='listbox'], .MuiSelect-root, button[aria-haspopup]",
        url=b2sign_url,
        output_format="json"
    )
    
    if dropdown_result and dropdown_result.get('success'):
        dropdown_elements = dropdown_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(dropdown_elements)} dropdown/select elements")
        for i, element in enumerate(dropdown_elements):
            logger.info(f"  Dropdown {i+1}: {element[:200]}...")
    else:
        logger.warning("⚠️ No dropdown elements found")
    
    # Test 5: Look for SVG elements (potential icons)
    logger.info("\n🔍 Test 5: Looking for SVG elements (potential icons)...")
    svg_result = await query_html_via_server(
        query="svg",
        url=b2sign_url,
        output_format="json"
    )
    
    if svg_result and svg_result.get('success'):
        svg_elements = svg_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(svg_elements)} SVG elements")
        for i, element in enumerate(svg_elements[:5]):  # Show first 5
            logger.info(f"  SVG {i+1}: {element[:200]}...")
    else:
        logger.warning("⚠️ No SVG elements found")
    
    # Test 6: Look for MUI components specifically
    logger.info("\n🔍 Test 6: Looking for MUI components...")
    mui_result = await query_html_via_server(
        query="[class*='Mui']",
        url=b2sign_url,
        output_format="json"
    )
    
    if mui_result and mui_result.get('success'):
        mui_elements = mui_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(mui_elements)} MUI elements")
        
        # Group by MUI component type
        mui_types = {}
        for element in mui_elements:
            if 'class=' in element:
                # Extract class names
                import re
                class_match = re.search(r'class="([^"]*)"', element)
                if class_match:
                    classes = class_match.group(1)
                    for cls in classes.split():
                        if cls.startswith('Mui'):
                            component_type = cls.split('-')[0] if '-' in cls else cls
                            if component_type not in mui_types:
                                mui_types[component_type] = 0
                            mui_types[component_type] += 1
        
        logger.info("📊 MUI Component Types Found:")
        for component_type, count in sorted(mui_types.items()):
            logger.info(f"  {component_type}: {count} elements")
    else:
        logger.warning("⚠️ No MUI elements found")
    
    logger.info("\n✅ B2Sign analysis complete!")

async def main():
    """Main function"""
    try:
        await analyze_b2sign_shipping_section()
    except Exception as e:
        logger.error(f"❌ Analysis failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
