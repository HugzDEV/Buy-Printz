#!/usr/bin/env python3
"""
Debug script to test the sticker pricing function directly.
This will help identify what's causing the 400 Bad Request error.
"""

import requests
import json

# Test the API endpoint with sample data
BASE_URL = "https://api.buyprintz.com"

def test_pricing_endpoint():
    """Test the pricing endpoint with various data combinations."""
    
    print("🔍 Debugging Sticker Pricing API")
    print("=" * 50)
    
    # Test cases with different data formats
    test_cases = [
        {
            "name": "Basic Circle Sticker",
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
                "size_code": "custom"
            }
        },
        {
            "name": "Star with Premium Material",
            "data": {
                "quantity": 500,
                "material_code": "orajet-premium",
                "finish_code": "glossy",
                "shape_code": "star",
                "size_code": "4"
            }
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print(f"📤 Data: {json.dumps(test_case['data'], indent=2)}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/stickers/pricing",
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"📊 Status Code: {response.status_code}")
            print(f"📊 Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success: {json.dumps(result, indent=2)}")
            else:
                print(f"❌ Error: {response.text}")
                
                # Try to parse error details
                try:
                    error_data = response.json()
                    print(f"📋 Error Details: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"📋 Raw Error: {response.text}")
                    
        except Exception as e:
            print(f"💥 Exception: {e}")

def test_configuration_endpoints():
    """Test the configuration endpoints to see what data is available."""
    
    print("\n🔧 Testing Configuration Endpoints")
    print("=" * 50)
    
    endpoints = [
        "/api/stickers/materials",
        "/api/stickers/finishes",
        "/api/stickers/shapes", 
        "/api/stickers/sizes",
        "/api/stickers/quantity-tiers"
    ]
    
    for endpoint in endpoints:
        print(f"\n📡 Testing {endpoint}")
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Data: {len(data)} items")
                if data:
                    print(f"   📋 Sample: {json.dumps(data[0], indent=2)}")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except Exception as e:
            print(f"   💥 Exception: {e}")

def main():
    """Main debug function."""
    print("🎯 BuyPrintz Sticker Pricing Debug")
    print("=" * 60)
    
    # Test configuration endpoints first
    test_configuration_endpoints()
    
    # Test pricing endpoint
    test_pricing_endpoint()
    
    print("\n🎉 Debug completed!")
    print("\nNext steps:")
    print("1. Check if configuration endpoints return data")
    print("2. Check if pricing endpoint works with correct data format")
    print("3. Compare API data format with database schema")

if __name__ == "__main__":
    main()
