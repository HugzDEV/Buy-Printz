#!/usr/bin/env python3
"""
Test authentication flow with real user account
Tests login and protected endpoints with valid authentication
"""

import requests
import json
import time
from typing import Dict, Any

class AuthFlowTester:
    def __init__(self, base_url: str = "https://api.buyprintz.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        
    def login_user(self, email: str, password: str) -> Dict:
        """Login user and get authentication token"""
        print(f"🔐 Attempting login for: {email}")
        
        # First, try to get Supabase auth token directly
        supabase_url = "https://hnsnwxlfhzwogptuevcj.supabase.co"
        supabase_anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhuc253eGxmaHp3b2dwdHVldmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Mjc1MzIsImV4cCI6MjA3MTEwMzUzMn0.SW5DuWmuXwar2ofTQc5I4i7T-ehoFCth6jEpe3Ima-s"
        
        # Try Supabase auth directly
        auth_url = f"{supabase_url}/auth/v1/token?grant_type=password"
        auth_headers = {
            "apikey": supabase_anon_key,
            "Content-Type": "application/json"
        }
        auth_data = {
            "email": email,
            "password": password
        }
        
        try:
            print("  📡 Attempting Supabase direct auth...")
            response = requests.post(auth_url, json=auth_data, headers=auth_headers, timeout=10)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                auth_result = response.json()
                self.auth_token = auth_result.get("access_token")
                self.user_id = auth_result.get("user", {}).get("id")
                print(f"  ✅ Login successful!")
                print(f"  User ID: {self.user_id}")
                print(f"  Token: {self.auth_token[:50]}...")
                return {"success": True, "token": self.auth_token, "user_id": self.user_id}
            else:
                print(f"  ❌ Supabase auth failed: {response.text}")
                return {"success": False, "error": response.text}
                
        except Exception as e:
            print(f"  ❌ Auth error: {e}")
            return {"success": False, "error": str(e)}
    
    def test_protected_endpoint(self, method: str, path: str, data: Dict = None) -> Dict:
        """Test a protected endpoint with authentication"""
        if not self.auth_token:
            return {"success": False, "error": "No auth token"}
        
        url = f"{self.base_url}{path}"
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }
        
        try:
            print(f"  📡 Testing {method} {path}")
            
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=15)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=15)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=15)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=15)
            
            result = {
                "status_code": response.status_code,
                "success": response.status_code < 400,
                "response_time": response.elapsed.total_seconds(),
                "content_type": response.headers.get("content-type", ""),
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
    
    def test_all_protected_endpoints(self):
        """Test all protected endpoints with authentication"""
        print("\n🔍 Testing Protected Endpoints with Authentication")
        print("=" * 60)
        
        # Test endpoints that should work with auth
        endpoints = [
            {"method": "GET", "path": "/api/user/profile", "name": "User Profile"},
            {"method": "GET", "path": "/api/designs", "name": "User Designs"},
            {"method": "GET", "path": "/api/orders", "name": "User Orders"},
            {"method": "GET", "path": "/api/templates/user", "name": "User Templates"},
            {"method": "GET", "path": "/api/user/preferences", "name": "User Preferences"},
            {"method": "GET", "path": "/api/user/stats", "name": "User Stats"},
            {"method": "POST", "path": "/api/designs/save", "name": "Save Design", 
             "data": {
                 "name": "Test Design",
                 "description": "Test design for auth flow",
                 "canvas_data": {
                     "version": "2.0",
                     "width": 800,
                     "height": 400,
                     "background": "#ffffff",
                     "objects": []
                 },
                 "banner_type": "vinyl-13oz"
             }},
            {"method": "POST", "path": "/api/templates/save", "name": "Save Template",
             "data": {
                 "name": "Test Template",
                 "description": "Test template for auth flow",
                 "category": "Test",
                 "canvas_data": {
                     "version": "2.0",
                     "width": 800,
                     "height": 400,
                     "background": "#ffffff",
                     "objects": []
                 },
                 "banner_type": "vinyl-13oz"
             }}
        ]
        
        results = {}
        for endpoint in endpoints:
            print(f"\n📋 {endpoint['name']}")
            result = self.test_protected_endpoint(
                method=endpoint['method'],
                path=endpoint['path'],
                data=endpoint.get('data')
            )
            results[endpoint['path']] = result
            
            # Small delay between requests
            time.sleep(0.5)
        
        return results
    
    def generate_auth_summary(self, results: Dict):
        """Generate authentication test summary"""
        print("\n" + "=" * 60)
        print("📊 AUTHENTICATION TEST SUMMARY")
        print("=" * 60)
        
        total = len(results)
        successful = sum(1 for r in results.values() if r.get('success', False))
        auth_errors = sum(1 for r in results.values() if r.get('status_code') in [401, 403])
        timeouts = sum(1 for r in results.values() if 'timeout' in str(r.get('error', '')).lower())
        other_errors = total - successful - auth_errors
        
        print(f"Total endpoints tested: {total}")
        print(f"Successful (200): {successful}")
        print(f"Authentication errors (401/403): {auth_errors}")
        print(f"Timeouts: {timeouts}")
        print(f"Other errors: {other_errors}")
        print(f"Success rate: {(successful / total * 100):.1f}%")
        
        if auth_errors > 0:
            print(f"\n❌ Authentication Issues:")
            for path, result in results.items():
                if result.get('status_code') in [401, 403]:
                    print(f"  - {path}: {result.get('status_code')}")
        
        if timeouts > 0:
            print(f"\n⏰ Timeout Issues:")
            for path, result in results.items():
                if 'timeout' in str(result.get('error', '')).lower():
                    print(f"  - {path}: {result.get('error')}")
        
        if successful > 0:
            print(f"\n✅ Working Endpoints:")
            for path, result in results.items():
                if result.get('success', False):
                    print(f"  - {path}: {result.get('response_time', 0):.2f}s")

def main():
    """Main test function"""
    print("🚀 BuyPrintz Authentication Flow Test")
    print("=" * 60)
    
    tester = AuthFlowTester()
    
    # Test login with known credentials
    login_result = tester.login_user("brainboxjp@gmail.com", "pasword123")
    
    if not login_result["success"]:
        print("❌ Login failed - cannot test protected endpoints")
        return
    
    # Test protected endpoints
    results = tester.test_all_protected_endpoints()
    
    # Generate summary
    tester.generate_auth_summary(results)

if __name__ == "__main__":
    main()
