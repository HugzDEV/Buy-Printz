#!/usr/bin/env python3
"""
Test script to check Supabase connection and setup database tables.
"""

import os
import sys
from supabase import create_client, Client

def test_supabase_connection():
    """Test Supabase connection and setup."""
    # These should be set in Railway environment variables
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    print(f"🔗 Supabase URL: {url}")
    print(f"🔑 Supabase Key: {key[:20]}..." if key else "❌ No key found")
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
        return False
    
    try:
        supabase: Client = create_client(url, key)
        print("✅ Connected to Supabase successfully")
        
        # Test if we can access the database
        result = supabase.table('sticker_materials').select('*').limit(1).execute()
        print("✅ Database access successful")
        
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return False

def check_existing_tables(supabase):
    """Check what tables already exist."""
    print("\n📋 Checking existing tables...")
    
    tables_to_check = [
        'sticker_materials',
        'sticker_finishes', 
        'sticker_shapes',
        'sticker_sizes',
        'sticker_quantity_tiers',
        'sticker_orders'
    ]
    
    for table in tables_to_check:
        try:
            result = supabase.table(table).select('*').limit(1).execute()
            print(f"  ✅ {table}: {len(result.data)} records")
        except Exception as e:
            print(f"  ❌ {table}: {e}")

def test_pricing_function(supabase):
    """Test if the pricing function exists."""
    print("\n🧪 Testing pricing function...")
    
    try:
        result = supabase.rpc('calculate_sticker_price', {
            'p_quantity': 100,
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte',
            'p_shape_code': 'circle', 
            'p_size_code': '3'
        }).execute()
        
        print(f"✅ Pricing function works: {result.data}")
        return True
        
    except Exception as e:
        print(f"❌ Pricing function failed: {e}")
        return False

def main():
    """Main test function."""
    print("🎯 BuyPrintz Supabase Connection Test")
    print("=" * 50)
    
    if test_supabase_connection():
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))
        check_existing_tables(supabase)
        test_pricing_function(supabase)
    else:
        print("❌ Connection failed!")

if __name__ == "__main__":
    main()
