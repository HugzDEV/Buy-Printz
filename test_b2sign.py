#!/usr/bin/env python3
"""
Test B2Sign Playwright integration
"""

import asyncio
import sys
import logging

# Add backend to path
sys.path.append('backend')

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_b2sign():
    """Test B2Sign integration"""
    try:
        from backend.b2sign_playwright_integration import get_shipping_costs_playwright
        
        order_data = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {'width': 2, 'height': 4, 'orientation': 'landscape'},
            'quantity': 1,
            'print_options': {
                'sides': 1,
                'grommets': 'every-2ft-all-sides',
                'hem': 'no-hem',
                'polePockets': 'none',
                'webbing': 'no-webbing',
                'corners': 'no-reinforcement',
                'rope': 'no-rope',
                'windslits': 'no-windslits',
                'turnaround': 'next-day'
            },
            'accessories': [],
            'customer_info': {
                'name': 'Test User',
                'email': 'test@buyprintz.com',
                'phone': '1234567890',
                'address': '123 Test St',
                'city': 'Boston',
                'state': 'MA',
                'zipCode': '02101'
            }
        }
        
        logger.info("🚀 Starting B2Sign integration test...")
        result = await get_shipping_costs_playwright(order_data)
        logger.info(f"✅ Test completed. Result: {result}")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_b2sign())
