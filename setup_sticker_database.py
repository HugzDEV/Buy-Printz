#!/usr/bin/env python3
"""
Sticker Database Setup Script
Sets up the complete sticker database structure with pricing logic
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def setup_sticker_database():
    """Set up the complete sticker database structure"""
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase configuration")
        print("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file")
        return False
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        print("🎯 Setting up Sticker Database...")
        
        # Read and execute the SQL file
        with open('supabase_stickers_table.sql', 'r') as f:
            sql_content = f.read()
        
        # Split the SQL into individual statements
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        print(f"📝 Executing {len(statements)} SQL statements...")
        
        for i, statement in enumerate(statements, 1):
            if statement and not statement.startswith('--'):
                try:
                    print(f"  [{i}/{len(statements)}] Executing statement...")
                    result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                    print(f"  ✅ Statement {i} executed successfully")
                except Exception as e:
                    print(f"  ⚠️  Statement {i} failed (may already exist): {e}")
                    # Continue with other statements even if one fails
        
        print("✅ Sticker database setup completed!")
        
        # Verify the setup by checking if tables exist
        print("\n🔍 Verifying database setup...")
        
        # Check if sticker_products table exists
        try:
            result = supabase.table('sticker_products').select('id').limit(1).execute()
            print("✅ sticker_products table exists")
        except Exception as e:
            print(f"❌ sticker_products table not found: {e}")
            return False
        
        # Check if sticker_materials table exists
        try:
            result = supabase.table('sticker_materials').select('id').limit(1).execute()
            print("✅ sticker_materials table exists")
        except Exception as e:
            print(f"❌ sticker_materials table not found: {e}")
            return False
        
        # Check if sticker_finishes table exists
        try:
            result = supabase.table('sticker_finishes').select('id').limit(1).execute()
            print("✅ sticker_finishes table exists")
        except Exception as e:
            print(f"❌ sticker_finishes table not found: {e}")
            return False
        
        # Check if sticker_shapes table exists
        try:
            result = supabase.table('sticker_shapes').select('id').limit(1).execute()
            print("✅ sticker_shapes table exists")
        except Exception as e:
            print(f"❌ sticker_shapes table not found: {e}")
            return False
        
        # Check if sticker_sizes table exists
        try:
            result = supabase.table('sticker_sizes').select('id').limit(1).execute()
            print("✅ sticker_sizes table exists")
        except Exception as e:
            print(f"❌ sticker_sizes table not found: {e}")
            return False
        
        # Check if sticker_quantity_tiers table exists
        try:
            result = supabase.table('sticker_quantity_tiers').select('id').limit(1).execute()
            print("✅ sticker_quantity_tiers table exists")
        except Exception as e:
            print(f"❌ sticker_quantity_tiers table not found: {e}")
            return False
        
        # Check if sticker_orders table exists
        try:
            result = supabase.table('sticker_orders').select('id').limit(1).execute()
            print("✅ sticker_orders table exists")
        except Exception as e:
            print(f"❌ sticker_orders table not found: {e}")
            return False
        
        print("\n🎉 All sticker database tables created successfully!")
        print("🚀 Ready to implement Google Merchant Center API integration!")
        
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

def test_pricing_function():
    """Test the pricing function"""
    print("\n🧪 Testing pricing function...")
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
    
    try:
        # Test pricing calculation
        result = supabase.rpc('calculate_sticker_price', {
            'p_quantity': 100,
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte',
            'p_shape_code': 'circle',
            'p_size_code': '3'
        }).execute()
        
        if result.data:
            print("✅ Pricing function working correctly")
            print(f"   Base Price: ${result.data[0]['base_price']}")
            print(f"   Subtotal: ${result.data[0]['subtotal']}")
            return True
        else:
            print("❌ Pricing function returned no data")
            return False
            
    except Exception as e:
        print(f"❌ Pricing function test failed: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Sticker Database Setup")
    print("=" * 50)
    
    # Check if SQL file exists
    if not os.path.exists('supabase_stickers_table.sql'):
        print("❌ supabase_stickers_table.sql not found")
        print("Please run this script from the project root directory")
        sys.exit(1)
    
    # Setup database
    if setup_sticker_database():
        # Test pricing function
        if test_pricing_function():
            print("\n🎉 Sticker database setup completed successfully!")
            print("✅ All tables created")
            print("✅ Pricing function working")
            print("✅ Ready for Google Merchant Center integration!")
        else:
            print("\n⚠️  Database setup completed but pricing function test failed")
            print("You may need to manually run the SQL statements in Supabase")
    else:
        print("\n❌ Database setup failed")
        print("Please check your Supabase configuration and try again")
        sys.exit(1)
