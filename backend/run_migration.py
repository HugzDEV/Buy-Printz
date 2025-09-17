#!/usr/bin/env python3
"""
Migration script to add thumbnail column to banner_templates table
"""

import asyncio
import os
from database import DatabaseManager

async def run_migration():
    """Run the thumbnail column migration"""
    try:
        # Initialize database connection
        db_manager = DatabaseManager()
        await db_manager.initialize()
        
        print("🔄 Running migration: add_thumbnail_column.sql")
        
        # Read the migration SQL
        migration_path = os.path.join(os.path.dirname(__file__), 'migrations', 'add_thumbnail_column.sql')
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
                    
                    if 'thumbnail' in columns:
                        print("\n✅ thumbnail column already exists!")
                    else:
                        print("\n❌ thumbnail column NOT found - migration needed")
                else:
                    print("  (No templates found to check schema)")
        except Exception as e:
            print(f"\n⚠️  Could not check current schema: {e}")
        
        print("\n🏁 Migration script completed")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(run_migration())
