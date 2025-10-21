#!/usr/bin/env python3
"""
Test Sticker API Endpoints
Quick test to verify the sticker API endpoints are working
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_sticker_api_endpoints():
    """Test the sticker API endpoints"""
    
    # Get the API base URL
    api_base = os.getenv("API_BASE_URL", "http://localhost:8000")
    
    print("🧪 Testing Sticker API Endpoints")
    print("=" * 60)
    print(f"API Base URL: {api_base}")
    
    # Test endpoints
    endpoints = [
        "/api/stickers/materials",
        "/api/stickers/finishes", 
        "/api/stickers/shapes",
        "/api/stickers/sizes",
        "/api/stickers/quantity-tiers"
    ]
    
    all_passed = True
    
    for endpoint in endpoints:
        try:
            url = f"{api_base}{endpoint}"
            print(f"\n📡 Testing: {endpoint}")
            
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ SUCCESS: {len(data)} items returned")
                if data:
                    print(f"   Sample item: {list(data[0].keys()) if data else 'No data'}")
            else:
                print(f"❌ FAILED: HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                all_passed = False
                
        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR: Could not connect to {url}")
            print("   Make sure the backend server is running on port 8000")
            all_passed = False
        except requests.exceptions.Timeout:
            print(f"❌ TIMEOUT: Request to {url} timed out")
            all_passed = False
        except Exception as e:
            print(f"❌ ERROR: {e}")
            all_passed = False
    
    # Test pricing endpoint
    print(f"\n📡 Testing: /api/stickers/pricing")
    try:
        url = f"{api_base}/api/stickers/pricing"
        pricing_data = {
            "quantity": 100,
            "material_code": "vinyl",
            "finish_code": "matte",
            "shape_code": "circle",
            "size_code": "3"
        }
        
        response = requests.post(url, json=pricing_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: Pricing calculated")
            print(f"   Subtotal: ${data.get('subtotal', 0):.2f}")
            print(f"   Total: ${data.get('total_amount', 0):.2f}")
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}...")
            all_passed = False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All sticker API endpoints are working!")
        print("✅ Database connection is working")
        print("✅ API endpoints are accessible")
    else:
        print("❌ Some sticker API endpoints failed!")
        print("⚠️  Please check:")
        print("   1. Backend server is running")
        print("   2. Database tables exist")
        print("   3. Supabase connection is working")
    
    return all_passed

if __name__ == "__main__":
    print("🎯 Sticker API Endpoint Test")
    print("=" * 60)
    
    if test_sticker_api_endpoints():
        print("\n🚀 Sticker API is ready for production!")
    else:
        print("\n⚠️  Sticker API needs fixes before production")
        print("\nNext steps:")
        print("1. Run the database setup scripts")
        print("2. Verify Supabase connection")
        print("3. Test the endpoints again")
