#!/usr/bin/env python3
"""
Test script for B2Sign mock order creation and shipping cost extraction
"""

import asyncio
import json
from b2sign_playwright_integration import get_shipping_costs_playwright

async def test_banner_mock_order():
    """Test creating a mock banner order and extracting shipping cost"""
    print("🧪 Testing Banner Mock Order Creation...")
    
    # Test order data for a banner
    test_order = {
        "product_type": "banner",
        "dimensions": {
            "width": 3,
            "height": 6
        },
        "quantity": 2,
        "print_options": {
            "sides": 2,  # Double-sided
            "grommets": "every-2-feet",
            "hem": "pole-pocket"
        },
        "accessories": [],
        "customer_info": {
            "zipCode": "90210"  # Beverly Hills for testing
        }
    }
    
    try:
        result = await get_shipping_costs_playwright(test_order)
        
        print("📊 Test Results:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print("✅ Mock order creation successful!")
            shipping_options = result.get('shipping_options', [])
            print(f"🚚 Found {len(shipping_options)} shipping options:")
            for i, option in enumerate(shipping_options, 1):
                print(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'N/A')}")
        else:
            print("❌ Mock order creation failed")
            print(f"Errors: {result.get('errors', [])}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

async def test_tent_mock_order():
    """Test creating a mock tent order and extracting shipping cost"""
    print("\n🧪 Testing Tent Mock Order Creation...")
    
    # Test order data for a tent
    test_order = {
        "product_type": "tent",
        "dimensions": {
            "width": 10,
            "height": 10
        },
        "quantity": 1,
        "print_options": {
            "tent_size": "10x10",
            "tent_design_option": "all-sides"
        },
        "accessories": ["side-walls", "lighting-kit"],
        "customer_info": {
            "zipCode": "10001"  # New York for testing
        }
    }
    
    try:
        result = await get_shipping_costs_playwright(test_order)
        
        print("📊 Test Results:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print("✅ Mock order creation successful!")
            shipping_options = result.get('shipping_options', [])
            print(f"🚚 Found {len(shipping_options)} shipping options:")
            for i, option in enumerate(shipping_options, 1):
                print(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'N/A')}")
        else:
            print("❌ Mock order creation failed")
            print(f"Errors: {result.get('errors', [])}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

async def test_simple_banner():
    """Test with minimal banner order"""
    print("\n🧪 Testing Simple Banner Order...")
    
    # Minimal test order
    test_order = {
        "product_type": "banner",
        "dimensions": {
            "width": 2,
            "height": 4
        },
        "quantity": 1,
        "print_options": {},
        "accessories": [],
        "customer_info": {
            "zipCode": "60601"  # Chicago for testing
        }
    }
    
    try:
        result = await get_shipping_costs_playwright(test_order)
        
        print("📊 Test Results:")
        print(json.dumps(result, indent=2))
        
        if result.get('success'):
            print("✅ Simple mock order creation successful!")
            print(f"🚚 Shipping cost: {result.get('total_shipping_cost', 'Not found')}")
        else:
            print("❌ Simple mock order creation failed")
            print(f"Errors: {result.get('errors', [])}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

async def main():
    """Run all tests"""
    print("🚀 Starting B2Sign Mock Order Tests...")
    print("=" * 50)
    
    # Test 1: Complex banner order
    await test_banner_mock_order()
    
    # Test 2: Tent order
    await test_tent_mock_order()
    
    # Test 3: Simple banner order
    await test_simple_banner()
    
    print("\n" + "=" * 50)
    print("🏁 All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
