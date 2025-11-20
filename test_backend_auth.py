#!/usr/bin/env python3
"""
Test script to check backend authentication and RLS policies
"""
import requests
import json

def test_backend_auth():
    """Test the backend auth endpoint on Railway"""
    try:
        print("Testing Railway backend at: https://api.buyprintz.com/api/auth/test")
        response = requests.get('https://api.buyprintz.com/api/auth/test', timeout=10)
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Check if it's using the right key type
        if data.get('supabase_key_type') == 'Anon Key':
            print("❌ PROBLEM: Railway is using Anon Key instead of Service Role Key!")
            print("   Need to add SUPABASE_SERVICE_ROLE_KEY to Railway environment variables")
        elif data.get('supabase_key_type') == 'Service Role':
            print("✅ Railway is using Service Role Key correctly")
        else:
            print(f"⚠️  Unknown key type: {data.get('supabase_key_type')}")
            
    except Exception as e:
        print(f"Error: {e}")

def test_templates_endpoint():
    """Test the templates test endpoint on Railway"""
    try:
        print("\nTesting Railway templates endpoint at: https://api.buyprintz.com/api/templates/test")
        response = requests.get('https://api.buyprintz.com/api/templates/test', timeout=10)
        print(f"Templates Test Status Code: {response.status_code}")
        data = response.json()
        print(f"Templates Test Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 403:
            print("❌ Templates endpoint requires authentication - this is expected")
        elif data.get('success'):
            print("✅ Templates endpoint working correctly")
        else:
            print(f"⚠️  Templates endpoint issue: {data.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"Templates Test Error: {e}")

def test_health_endpoint():
    """Test the health endpoint to see overall status"""
    try:
        print("\nTesting Railway health endpoint at: https://api.buyprintz.com/health")
        response = requests.get('https://api.buyprintz.com/health', timeout=10)
        print(f"Health Status Code: {response.status_code}")
        data = response.json()
        print(f"Health Response: {json.dumps(data, indent=2)}")
        
        if data.get('database') == 'connected':
            print("✅ Database connection working")
        else:
            print(f"❌ Database connection issue: {data.get('database')}")
            
    except Exception as e:
        print(f"Health Test Error: {e}")

if __name__ == "__main__":
    print("🔍 Testing Railway Backend Status...")
    test_backend_auth()
    test_templates_endpoint()
    test_health_endpoint()
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print("If you see 'Anon Key' above, you need to:")
    print("1. Go to Railway dashboard → Variables")
    print("2. Add SUPABASE_SERVICE_ROLE_KEY environment variable")
    print("3. Get the service role key from Supabase Settings → API")
    print("4. Railway will auto-redeploy after adding the variable")
    print("="*60)
