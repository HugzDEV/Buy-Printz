#!/usr/bin/env python3
"""
Comprehensive endpoint audit for BuyPrintz API
Tests all endpoints and their Supabase integration
"""

import requests
import json
from typing import Dict, List, Any

class EndpointAuditor:
    def __init__(self, base_url: str = "https://api.buyprintz.com"):
        self.base_url = base_url
        self.results = {}
        
    def test_endpoint(self, method: str, path: str, requires_auth: bool = False, 
                     data: Dict = None, headers: Dict = None) -> Dict:
        """Test a single endpoint"""
        url = f"{self.base_url}{path}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            
            # Special handling for register endpoint - 400 is acceptable (user already exists)
            is_success = response.status_code < 400
            if path == "/api/auth/register" and response.status_code == 400:
                is_success = True
            
            return {
                "status_code": response.status_code,
                "success": is_success,
                "response_time": response.elapsed.total_seconds(),
                "content_type": response.headers.get("content-type", ""),
                "error": None
            }
            
        except requests.exceptions.Timeout:
            return {
                "status_code": 408,
                "success": False,
                "response_time": 10.0,
                "content_type": "",
                "error": "Request timeout"
            }
        except Exception as e:
            return {
                "status_code": 0,
                "success": False,
                "response_time": 0.0,
                "content_type": "",
                "error": str(e)
            }
    
    def audit_all_endpoints(self):
        """Audit all API endpoints"""
        print("🔍 BuyPrintz API Endpoint Audit")
        print("=" * 60)
        
        # Define all endpoints
        endpoints = [
            # Health & Status
            {"method": "GET", "path": "/health", "requires_auth": False, "category": "Health"},
            {"method": "GET", "path": "/api/status", "requires_auth": False, "category": "Health"},
            {"method": "GET", "path": "/api/database/test", "requires_auth": False, "category": "Health"},
            {"method": "GET", "path": "/api/templates/test", "requires_auth": False, "category": "Health"},
            {"method": "GET", "path": "/api/auth/test", "requires_auth": False, "category": "Health"},
            {"method": "GET", "path": "/api/ai/health", "requires_auth": False, "category": "Health"},
            
            # Authentication (should work without auth)
            {"method": "POST", "path": "/api/auth/register", "requires_auth": False, "category": "Auth", 
             "data": {"email": "brainboxjp@gmail.com", "password": "password123", "full_name": "Test User"}},
            {"method": "POST", "path": "/api/auth/login", "requires_auth": False, "category": "Auth",
             "data": {"email": "brainboxjp@gmail.com", "password": "password123"}},
            
            # Public endpoints (should work without auth)
            {"method": "GET", "path": "/api/products", "requires_auth": False, "category": "Public"},
            {"method": "GET", "path": "/api/config", "requires_auth": False, "category": "Public"},
            {"method": "GET", "path": "/api/templates/public", "requires_auth": False, "category": "Public"},
            
            # Protected endpoints (should return 401/403 without auth)
            {"method": "GET", "path": "/api/user/profile", "requires_auth": True, "category": "User"},
            {"method": "GET", "path": "/api/designs", "requires_auth": True, "category": "Designs"},
            {"method": "GET", "path": "/api/orders", "requires_auth": True, "category": "Orders"},
            {"method": "GET", "path": "/api/templates/user", "requires_auth": True, "category": "Templates"},
            {"method": "GET", "path": "/api/user/preferences", "requires_auth": True, "category": "User"},
            {"method": "GET", "path": "/api/user/stats", "requires_auth": True, "category": "User"},
            
            # POST endpoints (should return 401/403 without auth)
            {"method": "POST", "path": "/api/designs/save", "requires_auth": True, "category": "Designs", 
             "data": {"name": "test", "canvas_data": {"version": "2.0", "width": 800, "height": 400, "background": "#ffffff", "objects": []}}},
            {"method": "POST", "path": "/api/templates/save", "requires_auth": True, "category": "Templates",
             "data": {"name": "test", "description": "test", "category": "test", "canvas_data": {"version": "2.0", "width": 800, "height": 400, "background": "#ffffff", "objects": []}}},
        ]
        
        # Test each endpoint
        for endpoint in endpoints:
            print(f"\n📡 Testing {endpoint['method']} {endpoint['path']}")
            print(f"   Category: {endpoint['category']}")
            print(f"   Requires Auth: {endpoint['requires_auth']}")
            
            result = self.test_endpoint(
                method=endpoint['method'],
                path=endpoint['path'],
                requires_auth=endpoint['requires_auth'],
                data=endpoint.get('data'),
                headers={"Content-Type": "application/json"}
            )
            
            # Analyze result
            if endpoint['requires_auth']:
                if result['status_code'] in [401, 403]:
                    print(f"   ✅ Expected auth error: {result['status_code']}")
                elif result['status_code'] == 200:
                    print(f"   ⚠️  Unexpected success: {result['status_code']} (should require auth)")
                else:
                    print(f"   ❌ Unexpected error: {result['status_code']} - {result['error']}")
            else:
                if result['status_code'] == 200:
                    print(f"   ✅ Success: {result['status_code']} ({result['response_time']:.2f}s)")
                elif endpoint['path'] == "/api/auth/register" and result['status_code'] == 400:
                    print(f"   ✅ Success: {result['status_code']} (user already exists) ({result['response_time']:.2f}s)")
                else:
                    print(f"   ❌ Error: {result['status_code']} - {result['error']}")
            
            # Store result
            key = f"{endpoint['method']} {endpoint['path']}"
            self.results[key] = {
                **result,
                "category": endpoint['category'],
                "requires_auth": endpoint['requires_auth']
            }
    
    def generate_summary(self):
        """Generate audit summary"""
        print("\n" + "=" * 60)
        print("📊 AUDIT SUMMARY")
        print("=" * 60)
        
        categories = {}
        for result in self.results.values():
            cat = result['category']
            if cat not in categories:
                categories[cat] = {'total': 0, 'success': 0, 'auth_errors': 0, 'other_errors': 0}
            
            categories[cat]['total'] += 1
            if result['success']:
                categories[cat]['success'] += 1
            elif result['status_code'] in [401, 403]:
                categories[cat]['auth_errors'] += 1
            else:
                categories[cat]['other_errors'] += 1
        
        for category, stats in categories.items():
            print(f"\n{category.upper()}:")
            print(f"  Total endpoints: {stats['total']}")
            print(f"  Successful: {stats['success']}")
            print(f"  Auth errors: {stats['auth_errors']}")
            print(f"  Other errors: {stats['other_errors']}")
        
        # Overall health
        total_endpoints = len(self.results)
        successful = sum(1 for r in self.results.values() if r['success'])
        auth_errors = sum(1 for r in self.results.values() if r['status_code'] in [401, 403])
        other_errors = total_endpoints - successful - auth_errors
        
        print(f"\n🎯 OVERALL HEALTH:")
        print(f"  Total endpoints: {total_endpoints}")
        print(f"  Working correctly: {successful + auth_errors}")
        print(f"  Actual errors: {other_errors}")
        print(f"  Health score: {((successful + auth_errors) / total_endpoints * 100):.1f}%")

if __name__ == "__main__":
    auditor = EndpointAuditor()
    auditor.audit_all_endpoints()
    auditor.generate_summary()
