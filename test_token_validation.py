#!/usr/bin/env python3
"""
Test backend token validation by simulating frontend requests
Tests how the backend validates different token formats
"""

import requests
import json
import time
from typing import Dict, Any

class TokenValidationTester:
    def __init__(self, base_url: str = "https://api.buyprintz.com"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_token_validation(self, token: str, endpoint: str = "/api/user/profile") -> Dict:
        """Test how backend validates a specific token"""
        url = f"{self.base_url}{endpoint}"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        try:
            print(f"  📡 Testing token: {token[:50]}...")
            
            response = self.session.get(url, headers=headers, timeout=10)
            
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
            print(f"    ⏰ Timeout after 10s")
            return {"success": False, "error": "Request timeout", "status_code": 408}
        except Exception as e:
            print(f"    ❌ Request error: {e}")
            return {"success": False, "error": str(e), "status_code": 0}
    
    def test_different_token_formats(self):
        """Test how backend handles different token formats"""
        print("🔍 Testing Backend Token Validation")
        print("=" * 60)
        
        # Test with different token formats
        test_tokens = [
            {"name": "Empty token", "token": ""},
            {"name": "Invalid token", "token": "invalid_token_123"},
            {"name": "Malformed JWT", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid"},
            {"name": "Valid JWT format (but invalid signature)", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"},
            {"name": "Supabase-like JWT (invalid)", "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuc253eGxmaHp3b2dwdHVldmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc1MzIsImV4cCI6MjA3MTEwMzUzMn0.SW5DuWmuXwar2ofTQc5I4i7T-ehoFCth6jEpe3Ima-s"},
        ]
        
        results = {}
        for test_token in test_tokens:
            print(f"\n🧪 Testing: {test_token['name']}")
            result = self.test_token_validation(test_token['token'])
            results[test_token['name']] = result
            
            time.sleep(0.5)  # Small delay between requests
        
        return results
    
    def test_protected_endpoints_without_auth(self):
        """Test protected endpoints without authentication"""
        print("\n🔒 Testing Protected Endpoints Without Auth")
        print("=" * 60)
        
        protected_endpoints = [
            {"method": "GET", "path": "/api/user/profile", "name": "User Profile"},
            {"method": "GET", "path": "/api/designs", "name": "User Designs"},
            {"method": "GET", "path": "/api/orders", "name": "User Orders"},
            {"method": "GET", "path": "/api/templates/user", "name": "User Templates"},
            {"method": "GET", "path": "/api/user/preferences", "name": "User Preferences"},
            {"method": "GET", "path": "/api/user/stats", "name": "User Stats"},
        ]
        
        results = {}
        for endpoint in protected_endpoints:
            print(f"\n📋 {endpoint['name']}")
            result = self.test_token_validation("", endpoint['path'])
            results[endpoint['path']] = result
            
            time.sleep(0.5)  # Small delay between requests
        
        return results
    
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
        
        results = {}
        for endpoint in public_endpoints:
            print(f"\n📋 {endpoint['name']}")
            result = self.test_token_validation("", endpoint['path'])
            results[endpoint['path']] = result
            
            time.sleep(0.5)  # Small delay between requests
        
        return results

def main():
    """Main test function"""
    print("🚀 BuyPrintz Token Validation Test")
    print("=" * 60)
    
    tester = TokenValidationTester()
    
    # Test public endpoints
    public_results = tester.test_public_endpoints()
    
    # Test protected endpoints without auth
    protected_results = tester.test_protected_endpoints_without_auth()
    
    # Test different token formats
    token_results = tester.test_different_token_formats()
    
    # Generate summary
    print("\n" + "=" * 60)
    print("📊 TOKEN VALIDATION SUMMARY")
    print("=" * 60)
    
    # Public endpoints should work
    public_success = sum(1 for r in public_results.values() if r.get('status_code') == 200)
    print(f"Public endpoints working: {public_success}/{len(public_results)}")
    
    # Protected endpoints should return 401/403
    protected_auth_errors = sum(1 for r in protected_results.values() if r.get('status_code') in [401, 403])
    print(f"Protected endpoints properly secured: {protected_auth_errors}/{len(protected_results)}")
    
    # Token validation should reject invalid tokens
    token_rejections = sum(1 for r in token_results.values() if r.get('status_code') in [401, 403])
    print(f"Invalid tokens properly rejected: {token_rejections}/{len(token_results)}")
    
    print("\n🎯 Key Findings:")
    if public_success == len(public_results):
        print("✅ Public endpoints working correctly")
    else:
        print("❌ Some public endpoints have issues")
    
    if protected_auth_errors == len(protected_results):
        print("✅ Protected endpoints properly secured")
    else:
        print("❌ Some protected endpoints allow unauthorized access")
    
    if token_rejections == len(token_results):
        print("✅ Token validation working correctly")
    else:
        print("❌ Some invalid tokens are being accepted")

if __name__ == "__main__":
    main()
