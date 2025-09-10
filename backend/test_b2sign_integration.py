#!/usr/bin/env python3
"""
Test script for B2Sign integration.
This script tests the shipping integration with b2sign.com.
"""

import os
import sys
import asyncio
import logging
from dotenv import load_dotenv

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from shipping_service import ShippingService
from site_mapper import SiteMapper

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

async def test_b2sign_site_mapping():
    """Test B2Sign site mapping functionality."""
    logger.info("🔍 Testing B2Sign site mapping...")
    
    try:
        # Initialize site mapper
        mapper = SiteMapper('https://b2sign.com')
        
        # Test authentication and site mapping
        login_result = mapper.authenticate(
            'https://b2sign.com/login',
            'order@buyprintz.com',
            '$AG@BuyPr!n1z'
        )
        
        if login_result:
            logger.info("✅ B2Sign authentication successful")
            
            # Map quote form
            quote_form = mapper.map_quote_form('https://b2sign.com/quote')
            if quote_form:
                logger.info("✅ B2Sign quote form mapped successfully")
                logger.info(f"📋 Found {len(quote_form['fields'])} form fields")
                
                # Save site map
                mapper.save_site_map('b2sign_test_map.json')
                logger.info("💾 Site map saved successfully")
                
                return True
            else:
                logger.error("❌ Failed to map B2Sign quote form")
                return False
        else:
            logger.error("❌ B2Sign authentication failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ B2Sign site mapping failed: {e}")
        return False

async def test_b2sign_shipping_quote():
    """Test B2Sign shipping quote functionality."""
    logger.info("🚚 Testing B2Sign shipping quote...")
    
    try:
        # Initialize shipping service
        shipping_service = ShippingService()
        
        # Test product details
        product_details = {
            'width': 24,
            'height': 36,
            'material': 'vinyl',
            'quantity': 1,
            'zip_code': '10001',
            'product_type': 'banner'
        }
        
        # Get shipping quote
        result = shipping_service.get_shipping_quote(product_details, 'b2sign')
        
        if result.get('success'):
            logger.info("✅ B2Sign shipping quote successful")
            logger.info(f"💰 Shipping cost: ${result.get('shipping_cost', 'N/A')}")
            logger.info(f"🏢 Partner: {result.get('partner_name', 'N/A')}")
            return True
        else:
            logger.error(f"❌ B2Sign shipping quote failed: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        logger.error(f"❌ B2Sign shipping quote test failed: {e}")
        return False

async def test_b2sign_partner_status():
    """Test B2Sign partner status check."""
    logger.info("📊 Testing B2Sign partner status...")
    
    try:
        shipping_service = ShippingService()
        status = shipping_service.get_partner_status('b2sign')
        
        logger.info("📋 B2Sign Partner Status:")
        logger.info(f"  - Name: {status.get('partner_name', 'N/A')}")
        logger.info(f"  - Has Site Map: {status.get('has_site_map', False)}")
        logger.info(f"  - Has Credentials: {status.get('has_credentials', False)}")
        logger.info(f"  - Base URL: {status.get('base_url', 'N/A')}")
        
        if status.get('has_site_map'):
            logger.info(f"  - Site Map Age: {status.get('site_map_age_hours', 0):.1f} hours")
            logger.info(f"  - Needs Update: {status.get('site_map_needs_update', False)}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ B2Sign partner status test failed: {e}")
        return False

async def main():
    """Run all B2Sign integration tests."""
    logger.info("🚀 Starting B2Sign integration tests...")
    
    tests = [
        ("Site Mapping", test_b2sign_site_mapping),
        ("Partner Status", test_b2sign_partner_status),
        ("Shipping Quote", test_b2sign_shipping_quote)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        logger.info(f"\n{'='*50}")
        logger.info(f"Running test: {test_name}")
        logger.info(f"{'='*50}")
        
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(f"❌ Test {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    logger.info(f"\n{'='*50}")
    logger.info("TEST SUMMARY")
    logger.info(f"{'='*50}")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1
    
    logger.info(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        logger.info("🎉 All tests passed! B2Sign integration is working correctly.")
    else:
        logger.warning("⚠️  Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    # Run the tests
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
