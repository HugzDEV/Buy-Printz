#!/usr/bin/env python3
"""
Debug script to check user templates
"""

import sys
sys.path.append('backend')

from backend.database import db_manager

async def debug_user_templates():
    """Debug user templates"""
    print("🔍 Debugging User Templates...")
    
    try:
        # Test database connection
        if not db_manager.is_connected():
            print("❌ Database not connected")
            return False
        
        print("✅ Database connected successfully")
        
        # Get all templates for the user from the logs
        user_id = "7be0211e-34c8-4357-946a-60b835586a89"
        print(f"\n📋 Checking templates for user: {user_id}")
        
        try:
            result = db_manager.supabase.table("banner_templates").select("*").eq("user_id", user_id).execute()
            print(f"✅ Found {len(result.data)} templates for user")
            
            if result.data:
                print("\n📝 Template names:")
                for i, template in enumerate(result.data):
                    print(f"   {i+1}. '{template.get('name', 'Unknown')}' - {template.get('id', 'No ID')}")
                    
                # Check for "sample" specifically
                sample_templates = [t for t in result.data if t.get('name', '').lower() == 'sample']
                if sample_templates:
                    print(f"\n⚠️  Found {len(sample_templates)} template(s) named 'sample':")
                    for template in sample_templates:
                        print(f"   - ID: {template.get('id')}")
                        print(f"   - Created: {template.get('created_at')}")
                        print(f"   - Thumbnail: {template.get('thumbnail_url')}")
                else:
                    print("\n✅ No templates named 'sample' found")
                    
        except Exception as e:
            print(f"❌ Error querying templates: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ General error: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(debug_user_templates())
