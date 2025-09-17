#!/usr/bin/env python3
"""
Migration script to add thumbnail_url column to banner_templates table
This replaces the base64 thumbnail storage with URL-based storage
"""

import asyncio
import os
from database import DatabaseManager

async def run_migration():
    """Run the thumbnail_url column migration"""
    try:
        # Initialize database connection
        db_manager = DatabaseManager()
        
        print("🔄 Running migration: add_thumbnail_url_column.sql")
        
        # Read the migration SQL
        migration_path = os.path.join(os.path.dirname(__file__), 'migrations', 'add_thumbnail_url_column.sql')
        with open(migration_path, 'r') as f:
            migration_sql = f.read()
        
        print("📄 Migration SQL:")
        print(migration_sql)
        print("\n" + "="*50 + "\n")
        
        # Execute the migration
        # Note: Supabase doesn't support direct SQL execution via the Python client
        # This migration needs to be run in the Supabase SQL Editor
        print("⚠️  IMPORTANT: This migration must be run manually in Supabase SQL Editor")
        print("📋 Steps:")
        print("1. Go to your Supabase project dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Create a new query")
        print("4. Copy and paste the SQL above")
        print("5. Run the query")
        print("\n🔗 Supabase Dashboard: https://supabase.com/dashboard/projects")
        
        # Check current schema to see if column exists
        try:
            # Try to query a template to see current schema
            response = db_manager.supabase.table("banner_templates").select("*").limit(1).execute()
            if response.data:
                print("\n📊 Current template schema columns:")
                if response.data:
                    columns = list(response.data[0].keys())
                    for col in sorted(columns):
                        print(f"  - {col}")
                    
                    if 'thumbnail_url' in columns:
                        print("\n✅ thumbnail_url column already exists!")
                    else:
                        print("\n❌ thumbnail_url column NOT found - migration needed")
                        
                    if 'thumbnail' in columns:
                        print("📝 Old thumbnail column still exists (base64 storage)")
                else:
                    print("  (No templates found to check schema)")
        except Exception as e:
            print(f"\n⚠️  Could not check current schema: {e}")
        
        print("\n🏁 Migration script completed")
        print("\n💡 After running the SQL migration:")
        print("   - New templates will use thumbnail_url for file-based storage")
        print("   - Old templates with base64 thumbnails will still work")
        print("   - Consider running a data migration script to convert old thumbnails")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(run_migration())
