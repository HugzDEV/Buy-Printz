#!/usr/bin/env python3
"""
Focused test script for B2Sign banner shipping options extraction
"""

import asyncio
import json
from b2sign_playwright_integration import get_shipping_costs_playwright

async def test_banner_shipping():
    """Test banner shipping options extraction"""
    print("🧪 Testing Banner Shipping Options...")
    
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
            print("✅ Banner shipping extraction successful!")
            shipping_options = result.get('shipping_options', [])
            print(f"🚚 Found {len(shipping_options)} shipping options:")
            for i, option in enumerate(shipping_options, 1):
                print(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'N/A')}")
                print(f"     Description: {option.get('description', 'N/A')}")
                print(f"     Estimated days: {option.get('estimated_days', 'N/A')}")
        else:
            print("❌ Banner shipping extraction failed")
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
            print("✅ Simple banner shipping extraction successful!")
            shipping_options = result.get('shipping_options', [])
            print(f"🚚 Found {len(shipping_options)} shipping options:")
            for i, option in enumerate(shipping_options, 1):
                print(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'N/A')}")
                print(f"     Description: {option.get('description', 'N/A')}")
                print(f"     Estimated days: {option.get('estimated_days', 'N/A')}")
        else:
            print("❌ Simple banner shipping extraction failed")
            print(f"Errors: {result.get('errors', [])}")
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

async def test_different_sizes():
    """Test different banner sizes to see shipping cost variations"""
    print("\n🧪 Testing Different Banner Sizes...")
    
    sizes = [
        {"width": 1, "height": 2, "name": "Small (1x2)"},
        {"width": 3, "height": 6, "name": "Medium (3x6)"},
        {"width": 4, "height": 8, "name": "Large (4x8)"},
    ]
    
    for size in sizes:
        print(f"\n📏 Testing {size['name']} banner...")
        
        test_order = {
            "product_type": "banner",
            "dimensions": {
                "width": size["width"],
                "height": size["height"]
            },
            "quantity": 1,
            "print_options": {},
            "accessories": [],
            "customer_info": {
                "zipCode": "10001"  # New York for testing
            }
        }
        
        try:
            result = await get_shipping_costs_playwright(test_order)
            
            if result.get('success'):
                shipping_options = result.get('shipping_options', [])
                print(f"✅ {size['name']}: Found {len(shipping_options)} shipping options")
                for option in shipping_options:
                    print(f"   - {option.get('name', 'Unknown')}: {option.get('cost', 'N/A')}")
            else:
                print(f"❌ {size['name']}: Failed - {result.get('errors', [])}")
                
        except Exception as e:
            print(f"❌ {size['name']}: Error - {e}")

async def main():
    """Run banner shipping tests"""
    print("🚀 Starting B2Sign Banner Shipping Tests...")
    print("=" * 60)
    
    # Test 1: Complex banner order
    await test_banner_shipping()
    
    # Test 2: Simple banner order
    await test_simple_banner()
    
    # Test 3: Different sizes
    await test_different_sizes()
    
    print("\n" + "=" * 60)
    print("🏁 Banner shipping tests completed!")

if __name__ == "__main__":
    asyncio.run(main())
