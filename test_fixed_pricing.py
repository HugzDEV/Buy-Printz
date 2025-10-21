#!/usr/bin/env python3
"""
Test the fixed sticker pricing function.
"""

import requests
import json

BASE_URL = "https://api.buyprintz.com"

def test_pricing_after_fix():
    """Test pricing after the function fix."""
    
    print("🔧 Testing Fixed Sticker Pricing")
    print("=" * 50)
    
    # Test cases that were failing before
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
            "name": "Star 4\" 500 count with Premium Material",
            "data": {
                "quantity": 500,
                "material_code": "orajet-premium",
                "finish_code": "glossy",
                "shape_code": "star",
                "size_code": "4"
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
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/api/stickers/pricing",
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(f"   💰 Base Price: ${result['base_price']:.2f}")
                print(f"   💰 Subtotal: ${result['subtotal']:.2f}")
                print(f"   💰 Total: ${result['total_amount']:.2f}")
            else:
                print(f"❌ Error: {response.text}")
                
        except Exception as e:
            print(f"💥 Exception: {e}")

if __name__ == "__main__":
    test_pricing_after_fix()
