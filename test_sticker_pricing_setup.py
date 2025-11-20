#!/usr/bin/env python3
"""
Test script to verify the sticker pricing setup works correctly.
This script tests the API endpoints after the database has been set up.
"""

import requests
import json
import time

# API base URL (Railway deployment)
BASE_URL = "https://api.buyprintz.com"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an API endpoint."""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"🔗 {method} {endpoint}")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {len(result) if isinstance(result, list) else 'Object'} items")
            return True
        else:
            print(f"   ❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def test_pricing_calculation():
    """Test the pricing calculation endpoint."""
    print("\n🧮 Testing Pricing Calculation...")
    
    test_cases = [
        {
            "name": "Circle 3\" 100 count",
            "data": {
                "quantity": 100,
                "material_code": "vinyl",
                "finish_code": "matte",
                "shape_code": "circle",
                "size_code": "3"
            }
        },
        {
            "name": "Custom Gang Sheet",
            "data": {
                "quantity": 1,
                "material_code": "vinyl", 
                "finish_code": "matte",
                "shape_code": "custom",
                "size_code": "20"
            }
        },
        {
            "name": "Star 4\" 500 count with Orajet",
            "data": {
                "quantity": 500,
                "material_code": "orajet",
                "finish_code": "glossy", 
                "shape_code": "star",
                "size_code": "4"
            }
        }
    ]
    
    for test_case in test_cases:
        print(f"\n📊 Testing: {test_case['name']}")
        success = test_endpoint("/api/stickers/pricing", "POST", test_case["data"])
        if success:
            # Get the actual response to show pricing details
            try:
                response = requests.post(f"{BASE_URL}/api/stickers/pricing", json=test_case["data"], timeout=10)
                if response.status_code == 200:
                    pricing = response.json()
                    print(f"   💰 Base: ${pricing.get('base_price', 0):.2f}")
                    print(f"   💰 Subtotal: ${pricing.get('subtotal', 0):.2f}")
                    print(f"   💰 Total: ${pricing.get('total_amount', 0):.2f}")
            except:
                pass

def main():
    """Main test function."""
    print("🎯 BuyPrintz Sticker API Test")
    print("=" * 50)
    print(f"Testing API at: {BASE_URL}")
    
    # Test configuration endpoints
    endpoints = [
        "/api/stickers/materials",
        "/api/stickers/finishes", 
        "/api/stickers/shapes",
        "/api/stickers/sizes",
        "/api/stickers/quantity-tiers"
    ]
    
    print("\n📋 Testing Configuration Endpoints...")
    config_success = 0
    for endpoint in endpoints:
        if test_endpoint(endpoint):
            config_success += 1
    
    print(f"\n📊 Configuration Tests: {config_success}/{len(endpoints)} passed")
    
    # Test pricing calculation
    test_pricing_calculation()
    
    print("\n🎉 Test completed!")
    print("\nNext steps:")
    print("1. If all tests pass, the sticker pricing system is working!")
    print("2. If tests fail, check that the database setup was completed")
    print("3. The StickerCheckout.jsx component should now work correctly")

if __name__ == "__main__":
    main()
