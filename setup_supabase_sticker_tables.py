#!/usr/bin/env python3
"""
Setup script for Supabase sticker database tables and functions.
This script will create all necessary tables and pricing functions for the sticker system.
"""

import os
import sys
from supabase import create_client, Client
import json

def setup_supabase_connection():
    """Setup Supabase connection using environment variables."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    
    if not url or not key:
        print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
        print("Please set these in your Railway environment variables")
        return None
    
    try:
        supabase: Client = create_client(url, key)
        print("✅ Connected to Supabase successfully")
        return supabase
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {e}")
        return None

def execute_sql_file(supabase, filename):
    """Execute SQL file content in Supabase."""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"📄 Executing {filename}...")
        
        # Split by semicolon and execute each statement
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        for i, statement in enumerate(statements):
            if statement:
                try:
                    # Use the rpc function to execute SQL
                    result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                    print(f"  ✅ Statement {i+1} executed successfully")
                except Exception as e:
                    print(f"  ⚠️  Statement {i+1} failed: {e}")
                    # Continue with other statements
                    
    except Exception as e:
        print(f"❌ Error executing {filename}: {e}")

def setup_sticker_tables():
    """Setup all sticker-related tables and functions."""
    supabase = setup_supabase_connection()
    if not supabase:
        return False
    
    print("🚀 Setting up sticker database tables and functions...")
    
    # Execute SQL files in order
    sql_files = [
        'supabase_stickers_table.sql',
        'supabase_stickers_pricing_update.sql', 
        'supabase_all_shapes_pricing_update.sql',
        'supabase_custom_gang_sheet_pricing_update.sql'
    ]
    
    for sql_file in sql_files:
        if os.path.exists(sql_file):
            execute_sql_file(supabase, sql_file)
        else:
            print(f"⚠️  File {sql_file} not found, skipping...")
    
    print("✅ Database setup completed!")
    return True

def test_pricing_function(supabase):
    """Test the pricing function with sample data."""
    print("\n🧪 Testing pricing function...")
    
    try:
        # Test with a simple circle sticker
        result = supabase.rpc('calculate_sticker_price', {
            'p_quantity': 100,
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte', 
            'p_shape_code': 'circle',
            'p_size_code': '3'
        }).execute()
        
        print(f"✅ Pricing test successful: {result.data}")
        return True
        
    except Exception as e:
        print(f"❌ Pricing test failed: {e}")
        return False

def main():
    """Main setup function."""
    print("🎯 BuyPrintz Sticker Database Setup")
    print("=" * 50)
    
    # Setup tables and functions
    if setup_sticker_tables():
        print("\n🎉 Setup completed successfully!")
        
        # Test the pricing function
        supabase = setup_supabase_connection()
        if supabase:
            test_pricing_function(supabase)
    else:
        print("\n❌ Setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
