#!/usr/bin/env python3
"""
Test the production B2Sign Playwright Integration
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_production_banner_workflow():
    """Test the production banner workflow"""
    logger.info("🧪 Testing Production Banner Workflow...")
    print("🧪 Testing Production Banner Workflow...")
    print("=" * 60)
    
    try:
        # Create integration instance
        integration = B2SignPlaywrightIntegration()
        
        # Override the headless setting for testing
        logger.info("🚀 Initializing browser (non-headless for testing)...")
        print("🚀 Initializing browser (non-headless for testing)...")
        
        # Initialize browser with non-headless mode for testing
        import asyncio
        from playwright.async_api import async_playwright
        
        integration.playwright = await async_playwright().start()
        
        # Launch browser in non-headless mode for testing
        integration.browser = await integration.playwright.chromium.launch(
            headless=False,  # Non-headless for testing
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor'
            ]
        )
        
        # Create context
        integration.context = await integration.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            java_script_enabled=True,
            accept_downloads=False,
            ignore_https_errors=True
        )
        
        # Create page
        integration.page = await integration.context.new_page()
        
        logger.info("✅ Browser initialized successfully (non-headless mode)")
        print("✅ Browser initialized successfully (non-headless mode)")
        
        # Login
        logger.info("🔐 Logging in...")
        print("🔐 Logging in...")
        await integration.login()
        
        # Test banner shipping costs
        logger.info("🚚 Testing banner shipping costs...")
        print("🚚 Testing banner shipping costs...")
        
        # Mock order data for banner
        order_data = {
            'material': '13oz-vinyl',
            'dimensions': {
                'width': 3,
                'height': 6
            },
            'quantity': 2,
            'print_options': {
                'sides': 2,
                'pole_pockets': 'No Pole Pockets',
                'hem': 'All Sides',
                'grommets': 'Every 2\' All Sides'
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
        
        # Get shipping costs
        result = await integration.get_banner_shipping_costs(order_data)
        
        logger.info("📊 Production Banner Workflow Results:")
        print("📊 Production Banner Workflow Results:")
        print("=" * 60)
        
        if result['success']:
            logger.info(f"✅ Success! Found {len(result['shipping_options'])} shipping options")
            print(f"✅ Success! Found {len(result['shipping_options'])} shipping options")
            
            for i, option in enumerate(result['shipping_options'], 1):
                logger.info(f"  {i}. {option['name']} - {option['cost']}")
                print(f"  {i}. {option['name']} - {option['cost']}")
        else:
            logger.error(f"❌ Failed: {result['errors']}")
            print(f"❌ Failed: {result['errors']}")
        
        # Cleanup
        await integration.cleanup()
        
        logger.info("🎯 Production Banner Workflow Test Complete!")
        print("🎯 Production Banner Workflow Test Complete!")
        
    except Exception as e:
        logger.error(f"❌ Error in production test: {e}")
        print(f"❌ Error in production test: {e}")
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    asyncio.run(test_production_banner_workflow())
