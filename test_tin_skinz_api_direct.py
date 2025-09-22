#!/usr/bin/env python3
"""
Test Tin Skinz API functions directly
"""

import sys
sys.path.append('backend')

from backend.tin_skinz_api import get_designs, get_candy_options
from backend.database import db_manager

async def test_api_functions():
    """Test Tin Skinz API functions directly"""
    print("🔍 Testing Tin Skinz API Functions...")
    
    try:
        # Test get_candy_options function
        print("\n🍬 Testing get_candy_options function...")
        try:
            result = await get_candy_options()
            print(f"✅ get_candy_options successful - {len(result)} candy options")
            for i, candy in enumerate(result[:3]):
                print(f"   {i+1}. {candy.name} - ${candy.base_price}")
        except Exception as e:
            print(f"❌ get_candy_options error: {e}")
            import traceback
            traceback.print_exc()
        
        # Test get_designs function
        print("\n📋 Testing get_designs function...")
        try:
            result = await get_designs()
            print(f"✅ get_designs successful - {len(result)} designs")
        except Exception as e:
            print(f"❌ get_designs error: {e}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        print(f"❌ General error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_api_functions())
