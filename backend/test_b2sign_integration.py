#!/usr/bin/env python3
"""
Test script for B2Sign Playwright Integration
This script tests the complete workflow for extracting shipping costs from B2Sign.
"""

import asyncio
import logging
import sys
import json
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f'b2sign_test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log')
    ]
)
logger = logging.getLogger(__name__)

async def test_basic_initialization():
    """Test 1: Basic browser initialization"""
    try:
        logger.info("=" * 80)
        logger.info("TEST 1: Basic Browser Initialization")
        logger.info("=" * 80)
        
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        
        integration = B2SignPlaywrightIntegration()
        initialized = await integration.initialize()
        
        if initialized:
            logger.info("✅ TEST 1 PASSED: Browser initialized successfully")
            await integration.cleanup()
            return True
        else:
            logger.error("❌ TEST 1 FAILED: Browser initialization failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ TEST 1 FAILED with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_login():
    """Test 2: Login to B2Sign"""
    try:
        logger.info("=" * 80)
        logger.info("TEST 2: B2Sign Login")
        logger.info("=" * 80)
        
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        
        login_success = await integration.login()
        
        if login_success:
            logger.info("✅ TEST 2 PASSED: Login successful")
            await integration.cleanup()
            return True
        else:
            logger.error("❌ TEST 2 FAILED: Login failed")
            await integration.cleanup()
            return False
            
    except Exception as e:
        logger.error(f"❌ TEST 2 FAILED with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_banner_navigation():
    """Test 3: Navigate to banner product page"""
    try:
        logger.info("=" * 80)
        logger.info("TEST 3: Banner Product Page Navigation")
        logger.info("=" * 80)
        
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        await integration.login()
        
        # Navigate to 13oz vinyl banner page
        await integration.page.goto("https://www.b2sign.com/13oz-vinyl-banner", wait_until='networkidle')
        await integration.page.wait_for_timeout(3000)
        
        current_url = integration.page.url
        if '13oz-vinyl-banner' in current_url:
            logger.info(f"✅ TEST 3 PASSED: Navigated to banner page: {current_url}")
            await integration.cleanup()
            return True
        else:
            logger.error(f"❌ TEST 3 FAILED: Wrong URL: {current_url}")
            await integration.cleanup()
            return False
            
    except Exception as e:
        logger.error(f"❌ TEST 3 FAILED with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_banner_shipping_extraction():
    """Test 4: Complete banner workflow with shipping extraction"""
    try:
        logger.info("=" * 80)
        logger.info("TEST 4: Complete Banner Workflow with Shipping Extraction")
        logger.info("=" * 80)
        
        from b2sign_playwright_integration import B2SignPlaywrightIntegration
        
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        await integration.login()
        
        # Test order data
        order_data = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {
                'width': 3,
                'height': 6
            },
            'quantity': 1,
            'print_options': {
                'sides': 2,
                'pole_pockets': 'No Pole Pockets',
                'hem': 'All Sides',
                'grommets': "Every 2' All Sides"
            },
            'customer_info': {
                'name': 'Test Customer',
                'company': 'BuyPrintz Test',
                'phone': '617-505-0603',
                'address': '123 Test Street',
                'suburb': '',
                'city': 'Boston',
                'state': 'MA',
                'zipCode': '02108'
            }
        }
        
        logger.info(f"📋 Test order data: {json.dumps(order_data, indent=2)}")
        
        # Get shipping costs
        result = await integration.get_banner_shipping_costs(order_data)
        
        logger.info(f"📦 Result: {json.dumps(result, indent=2)}")
        
        if result.get('success') and result.get('shipping_options'):
            logger.info(f"✅ TEST 4 PASSED: Extracted {len(result['shipping_options'])} shipping options")
            for i, option in enumerate(result['shipping_options'], 1):
                logger.info(f"  {i}. {option['name']}: {option['cost']} (Tax: {option.get('tax', 'N/A')})")
            await integration.cleanup()
            return True
        else:
            logger.error(f"❌ TEST 4 FAILED: {result.get('errors', ['Unknown error'])}")
            await integration.cleanup()
            return False
            
    except Exception as e:
        logger.error(f"❌ TEST 4 FAILED with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def test_get_shipping_costs_function():
    """Test 5: Test the standalone get_shipping_costs_playwright function"""
    try:
        logger.info("=" * 80)
        logger.info("TEST 5: Standalone get_shipping_costs_playwright Function")
        logger.info("=" * 80)
        
        from b2sign_playwright_integration import get_shipping_costs_playwright
        
        # Test order data
        order_data = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {
                'width': 2,
                'height': 4
            },
            'quantity': 1,
            'print_options': {
                'sides': 2
            },
            'customer_info': {
                'name': 'Test Customer',
                'company': 'BuyPrintz Test',
                'phone': '617-505-0603',
                'address': '123 Test Street',
                'city': 'Boston',
                'state': 'MA',
                'zipCode': '02108'
            }
        }
        
        logger.info(f"📋 Test order data: {json.dumps(order_data, indent=2)}")
        
        # Get shipping costs
        result = await get_shipping_costs_playwright(order_data)
        
        logger.info(f"📦 Result: {json.dumps(result, indent=2)}")
        
        if result.get('success') and result.get('shipping_options'):
            logger.info(f"✅ TEST 5 PASSED: Extracted {len(result['shipping_options'])} shipping options")
            for i, option in enumerate(result['shipping_options'], 1):
                logger.info(f"  {i}. {option['name']}: {option['cost']}")
            return True
        else:
            logger.error(f"❌ TEST 5 FAILED: {result.get('errors', ['Unknown error'])}")
            return False
            
    except Exception as e:
        logger.error(f"❌ TEST 5 FAILED with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

async def run_all_tests():
    """Run all tests sequentially"""
    logger.info("🚀 Starting B2Sign Playwright Integration Tests")
    logger.info(f"⏰ Test started at: {datetime.now().isoformat()}")
    
    results = {
        'test_1_initialization': False,
        'test_2_login': False,
        'test_3_navigation': False,
        'test_4_shipping_extraction': False,
        'test_5_standalone_function': False
    }
    
    # Test 1: Basic initialization
    results['test_1_initialization'] = await test_basic_initialization()
    await asyncio.sleep(2)
    
    # Test 2: Login
    results['test_2_login'] = await test_login()
    await asyncio.sleep(2)
    
    # Test 3: Navigation
    results['test_3_navigation'] = await test_banner_navigation()
    await asyncio.sleep(2)
    
    # Test 4: Complete workflow
    results['test_4_shipping_extraction'] = await test_banner_shipping_extraction()
    await asyncio.sleep(2)
    
    # Test 5: Standalone function
    results['test_5_standalone_function'] = await test_get_shipping_costs_function()
    
    # Summary
    logger.info("=" * 80)
    logger.info("TEST SUMMARY")
    logger.info("=" * 80)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
    
    logger.info("=" * 80)
    logger.info(f"TOTAL: {passed}/{total} tests passed")
    logger.info(f"⏰ Test completed at: {datetime.now().isoformat()}")
    logger.info("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    try:
        success = asyncio.run(run_all_tests())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("\n⚠️ Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Test suite failed with exception: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)
