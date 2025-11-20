#!/usr/bin/env python3
"""
Test authentication flow by simulating frontend requests
Uses the same method as the frontend to test backend endpoints
"""

import requests
import json
import time
from typing import Dict, Any

class FrontendAuthTester:
    def __init__(self, base_url: str = "https://api.buyprintz.com"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_endpoint_with_token(self, method: str, path: str, token: str, data: Dict = None) -> Dict:
        """Test endpoint with a specific token"""
        url = f"{self.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        try:
            print(f"  📡 Testing {method} {path}")
            print(f"  Token: {token[:50]}...")
            
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=15)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=15)
            
            result = {
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "response_time": response.elapsed.total_seconds(),
                "error": None
            }
            
            # Try to parse response
            try:
                result["response_data"] = response.json()
            except:
                result["response_text"] = response.text[:200]
            
            # Analyze result
            if response.status_code == 200:
                print(f"    ✅ Success: {response.status_code} ({result['response_time']:.2f}s)")
            elif response.status_code in [401, 403]:
                print(f"    ❌ Auth error: {response.status_code}")
                if "response_data" in result:
                    print(f"    Error: {result['response_data']}")
            else:
                print(f"    ⚠️  Other error: {response.status_code}")
                if "response_data" in result:
                    print(f"    Error: {result['response_data']}")
            
            return result
            
        except requests.exceptions.Timeout:
            print(f"    ⏰ Timeout after 15s")
            return {"success": False, "error": "Request timeout", "status_code": 408}
        except Exception as e:
            print(f"    ❌ Request error: {e}")
            return {"success": False, "error": str(e), "status_code": 0}
    
    def test_backend_auth_validation(self):
        """Test how backend validates different types of tokens"""
        print("🔍 Testing Backend Token Validation")
        print("=" * 60)
        
        # Test with different token formats
        test_tokens = [
            {"name": "Empty token", "token": ""},
            {"name": "Invalid token", "token": "invalid_token_123"},
            {"name": "Malformed JWT", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid"},
            {"name": "Valid JWT format (but invalid)", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"},
        ]
        
        # Test endpoint
        test_path = "/api/user/profile"
        
        for test_token in test_tokens:
            print(f"\n🧪 Testing: {test_token['name']}")
            result = self.test_endpoint_with_token("GET", test_path, test_token['token'])
            
            # Expected: All should return 401/403
            if result.get('status_code') in [401, 403]:
                print(f"    ✅ Expected auth error: {result.get('status_code')}")
            else:
                print(f"    ❌ Unexpected response: {result.get('status_code')}")
    
    def test_public_endpoints(self):
        """Test public endpoints to ensure they work without auth"""
        print("\n🌐 Testing Public Endpoints")
        print("=" * 60)
        
        public_endpoints = [
            {"method": "GET", "path": "/health", "name": "Health Check"},
            {"method": "GET", "path": "/api/status", "name": "API Status"},
            {"method": "GET", "path": "/api/products", "name": "Products"},
            {"method": "GET", "path": "/api/config", "name": "Config"},
            {"method": "GET", "path": "/api/templates/public", "name": "Public Templates"},
        ]
        
        for endpoint in public_endpoints:
            print(f"\n📋 {endpoint['name']}")
            result = self.test_endpoint_with_token(endpoint['method'], endpoint['path'], "")
            
            if result.get('status_code') == 200:
                print(f"    ✅ Public endpoint working: {result.get('response_time', 0):.2f}s")
            else:
                print(f"    ❌ Public endpoint error: {result.get('status_code')}")
    
    def test_auth_endpoints(self):
        """Test authentication endpoints with proper data"""
        print("\n🔐 Testing Authentication Endpoints")
        print("=" * 60)
        
        # Test login endpoint with proper data structure
        login_data = {
            "email": "brainboxjp@gmail.com",
            "password": "test_password"
        }
        
        print("📋 Testing Login Endpoint")
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            print(f"  Status: {response.status_code}")
            if response.status_code == 422:
                print("  ✅ Expected validation error (missing proper data)")
            elif response.status_code == 401:
                print("  ✅ Expected auth error (invalid credentials)")
            else:
                print(f"  ⚠️  Unexpected response: {response.status_code}")
                try:
                    print(f"  Response: {response.json()}")
                except:
                    print(f"  Response: {response.text[:200]}")
                    
        except Exception as e:
            print(f"  ❌ Request error: {e}")

def main():
    """Main test function"""
    print("🚀 BuyPrintz Frontend Authentication Test")
    print("=" * 60)
    
    tester = FrontendAuthTester()
    
    # Test public endpoints
    tester.test_public_endpoints()
    
    # Test auth endpoints
    tester.test_auth_endpoints()
    
    # Test backend token validation
    tester.test_backend_auth_validation()
    
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print("This test shows how the backend handles different authentication scenarios.")
    print("The key issue is likely in the token validation logic in backend/auth.py")
    print("=" * 60)

if __name__ == "__main__":
    main()
