#!/usr/bin/env python3
"""
Basic test of B2Sign page with the server
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

async def test_b2sign_basic():
    """Basic test of B2Sign page"""
    logger.info("🔍 Basic B2Sign page test...")
    
    # Test with a very basic selector first
    logger.info("🔍 Test 1: Looking for any HTML elements...")
    basic_result = await query_html_via_server(
        query="*",
        url="https://www.b2sign.com/13oz-vinyl-banner",
        output_format="json"
    )
    
    if basic_result:
        logger.info(f"✅ Server response: {json.dumps(basic_result, indent=2)[:500]}...")
        
        if basic_result.get('success'):
            data = basic_result.get('data', {})
            result = data.get('result', [])
            logger.info(f"✅ Found {len(result)} total elements")
            
            # Show first few elements
            for i, element in enumerate(result[:3]):
                logger.info(f"  Element {i+1}: {element[:100]}...")
        else:
            logger.warning(f"⚠️ Server returned error: {basic_result.get('error')}")
    else:
        logger.error("❌ No response from server")
    
    # Test with a simple selector
    logger.info("\n🔍 Test 2: Looking for title tag...")
    title_result = await query_html_via_server(
        query="title",
        url="https://www.b2sign.com/13oz-vinyl-banner",
        output_format="json"
    )
    
    if title_result and title_result.get('success'):
        title_elements = title_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(title_elements)} title elements")
        for element in title_elements:
            logger.info(f"  Title: {element}")
    else:
        logger.warning("⚠️ No title found")
    
    # Test with body tag
    logger.info("\n🔍 Test 3: Looking for body content...")
    body_result = await query_html_via_server(
        query="body",
        url="https://www.b2sign.com/13oz-vinyl-banner",
        output_format="json"
    )
    
    if body_result and body_result.get('success'):
        body_elements = body_result.get('data', {}).get('result', [])
        logger.info(f"✅ Found {len(body_elements)} body elements")
        if body_elements:
            body_content = body_elements[0]
            logger.info(f"  Body content length: {len(body_content)} characters")
            logger.info(f"  Body preview: {body_content[:200]}...")
    else:
        logger.warning("⚠️ No body found")

async def main():
    """Main function"""
    try:
        await test_b2sign_basic()
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
