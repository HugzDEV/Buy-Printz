#!/usr/bin/env python3
"""
Test auth endpoints with real user credentials
"""

import requests
import json

def test_real_auth():
    """Test with real user credentials"""
    base_url = "https://api.buyprintz.com"
    
    print("🔐 Testing Auth with Real User Credentials")
    print("=" * 60)
    
    # Test login with real credentials
    print("\n📋 Testing Login with brainboxjp@gmail.com")
    login_data = {
        "email": "brainboxjp@gmail.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.text}")
        
        if response.status_code == 200:
            print("  ✅ Login successful!")
            result = response.json()
            print(f"  User ID: {result.get('user_id', 'N/A')}")
            print(f"  Email: {result.get('email', 'N/A')}")
            return result.get('access_token')
        elif response.status_code == 401:
            print("  ❌ Invalid credentials")
        elif response.status_code == 500:
            print("  ❌ Server error")
        else:
            print(f"  ⚠️  Unexpected response: {response.status_code}")
            
    except Exception as e:
        print(f"  ❌ Request error: {e}")
    
    return None

def test_protected_endpoint_with_token(token):
    """Test a protected endpoint with the auth token"""
    if not token:
        print("\n❌ No token available for testing protected endpoints")
        return
    
    base_url = "https://api.buyprintz.com"
    
    print(f"\n📋 Testing Protected Endpoint with Token")
    print(f"  Token: {token[:50]}...")
    
    try:
        response = requests.get(
            f"{base_url}/api/user/profile",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            print("  ✅ Protected endpoint working!")
            result = response.json()
            print(f"  Response: {result}")
        else:
            print(f"  ❌ Protected endpoint failed: {response.status_code}")
            print(f"  Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"  ❌ Request error: {e}")

if __name__ == "__main__":
    token = test_real_auth()
    test_protected_endpoint_with_token(token)
