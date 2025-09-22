#!/usr/bin/env python3
"""
Test script to debug creator template upload issues
"""

import sys
sys.path.append('backend')

from backend.database import db_manager

async def test_creator_upload_components():
    """Test components needed for creator template upload"""
    print("🔍 Testing Creator Template Upload Components...")
    
    try:
        # Test database connection
        if not db_manager.is_connected():
            print("❌ Database not connected")
            return False
        
        print("✅ Database connected successfully")
        
        # Test if user is a creator (using test user ID from logs)
        user_id = "7be0211e-34c8-4357-946a-60b835586a89"
        print(f"\n👤 Testing creator status for user: {user_id}")
        
        try:
            creator = await db_manager.get_creator_by_user_id(user_id)
            if creator:
                print(f"✅ User is a creator: {creator.get('display_name', 'Unknown')}")
                print(f"   Creator ID: {creator.get('id')}")
            else:
                print("❌ User is not a creator")
                return False
        except Exception as e:
            print(f"❌ Error checking creator status: {e}")
            return False
        
        # Test Supabase Storage bucket
        print(f"\n📦 Testing Supabase Storage bucket: marketplace-thumbnails")
        try:
            # Try to list files in the bucket
            result = db_manager.supabase.storage.from_("marketplace-thumbnails").list()
            print(f"✅ Storage bucket accessible: {len(result)} files found")
        except Exception as e:
            print(f"❌ Storage bucket error: {e}")
            return False
        
        # Test creator_templates table
        print(f"\n📋 Testing creator_templates table")
        try:
            result = db_manager.supabase.table("creator_templates").select("*").limit(1).execute()
            print(f"✅ creator_templates table accessible: {len(result.data)} records found")
        except Exception as e:
            print(f"❌ creator_templates table error: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ General error: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_creator_upload_components())
