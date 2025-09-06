#!/usr/bin/env python3
"""
Test script to verify Railway backend database connection and key usage
"""

import requests
import json

def test_railway_backend():
    """Test Railway backend database connection"""
    print("🔍 Testing Railway Backend Database Connection...")
    
    base_url = "https://api.buyprintz.com"
    
    # Test 1: Health endpoint (should show database status)
    print(f"\n1. Testing health endpoint: {base_url}/health")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            health_data = response.json()
            print(f"Database: {health_data.get('database', 'unknown')}")
            print(f"Supabase configured: {health_data.get('supabase_configured', 'unknown')}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
    
    # Test 2: Database test endpoint (should show actual key type)
    print(f"\n2. Testing database endpoint: {base_url}/api/database/test")
    try:
        response = requests.get(f"{base_url}/api/database/test", timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            db_data = response.json()
            print(f"Database test: {db_data}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Database test error: {e}")
    
    # Test 3: Try to save a test design (this will show if RLS is working)
    print(f"\n3. Testing design save (RLS test): {base_url}/api/designs/save")
    test_design = {
        "name": "Test Design",
        "description": "Test design for RLS verification",
        "canvas_data": {
            "version": "2.0",
            "width": 800,
            "height": 400,
            "background": "#ffffff",
            "objects": []
        },
        "banner_type": "vinyl-13oz"
    }
    
    try:
        # This should fail with 401 (not authenticated) but not 500 (RLS violation)
        response = requests.post(
            f"{base_url}/api/designs/save",
            json=test_design,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 401:
            print("✅ Expected 401 (not authenticated) - RLS is working correctly")
        elif response.status_code == 500:
            print("❌ 500 error - likely RLS policy violation")
            print(f"Response: {response.text}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Design save test error: {e}")
    
    # Test 4: Try to save a test template (this will show if RLS is working)
    print(f"\n4. Testing template save (RLS test): {base_url}/api/templates/save")
    test_template = {
        "name": "Test Template",
        "description": "Test template for RLS verification",
        "category": "Test",
        "canvas_data": {
            "version": "2.0",
            "width": 800,
            "height": 400,
            "background": "#ffffff",
            "objects": []
        },
        "banner_type": "vinyl-13oz"
    }
    
    try:
        # This should fail with 401 (not authenticated) but not 500 (RLS violation)
        response = requests.post(
            f"{base_url}/api/templates/save",
            json=test_template,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 401:
            print("✅ Expected 401 (not authenticated) - RLS is working correctly")
        elif response.status_code == 500:
            print("❌ 500 error - likely RLS policy violation")
            print(f"Response: {response.text}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Template save test error: {e}")
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print("✅ 401 errors = Good (RLS working, just need authentication)")
    print("❌ 500 errors = Bad (RLS policy violations)")
    print("="*60)

if __name__ == "__main__":
    test_railway_backend()
