#!/usr/bin/env python3
"""
Test script to verify Tin Skinz tables in Supabase
"""

import os
import sys
sys.path.append('backend')

from backend.database import db_manager

async def test_tin_skinz_tables():
    """Test if Tin Skinz tables exist and are accessible"""
    print("🔍 Testing Tin Skinz Tables in Supabase...")
    
    try:
        # Test database connection
        if not db_manager.is_connected():
            print("❌ Database not connected")
            return False
        
        print("✅ Database connected successfully")
        
        # Test tin_skinz_designs table
        print("\n📋 Testing tin_skinz_designs table...")
        try:
            result = db_manager.supabase.table("tin_skinz_designs").select("*").limit(1).execute()
            print(f"✅ tin_skinz_designs table exists - {len(result.data)} records found")
            if result.data:
                print(f"   Sample record: {result.data[0]}")
        except Exception as e:
            print(f"❌ tin_skinz_designs table error: {e}")
        
        # Test tin_skinz_candy_options table
        print("\n🍬 Testing tin_skinz_candy_options table...")
        try:
            result = db_manager.supabase.table("tin_skinz_candy_options").select("*").limit(5).execute()
            print(f"✅ tin_skinz_candy_options table exists - {len(result.data)} records found")
            if result.data:
                print(f"   Sample records:")
                for i, candy in enumerate(result.data[:3]):
                    print(f"   {i+1}. {candy.get('name', 'Unknown')} - ${candy.get('base_price', 0)}")
        except Exception as e:
            print(f"❌ tin_skinz_candy_options table error: {e}")
        
        # Test tin_skinz_orders table
        print("\n📦 Testing tin_skinz_orders table...")
        try:
            result = db_manager.supabase.table("tin_skinz_orders").select("*").limit(1).execute()
            print(f"✅ tin_skinz_orders table exists - {len(result.data)} records found")
        except Exception as e:
            print(f"❌ tin_skinz_orders table error: {e}")
        
        # Test pricing function
        print("\n💰 Testing pricing function...")
        try:
            result = db_manager.supabase.rpc("calculate_tin_skinz_price", {
                "p_quantity": 10,
                "p_has_candy": True,
                "p_has_custom_message": True
            }).execute()
            print(f"✅ calculate_tin_skinz_price function exists")
            if result.data:
                print(f"   Pricing result: {result.data[0]}")
        except Exception as e:
            print(f"❌ calculate_tin_skinz_price function error: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ General error: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_tin_skinz_tables())
