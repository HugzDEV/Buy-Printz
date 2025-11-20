#!/usr/bin/env python3
"""
Test Custom Gang Sheet Pricing
Verifies that custom gang sheets are priced per sheet, not per sticker
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_custom_gang_sheet_pricing():
    """Test custom gang sheet pricing logic"""
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase configuration")
        return False
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🧪 Testing Custom Gang Sheet Pricing")
    print("=" * 60)
    
    # Test configurations for custom gang sheets
    test_configs = [
        {
            'description': 'Custom Gang Sheet - Vinyl, Matte',
            'params': {'p_material_code': 'vinyl', 'p_finish_code': 'matte'},
            'expected_base': 19.99,
            'expected_range': (19.99, 25.00)
        },
        {
            'description': 'Custom Gang Sheet - Vinyl, Glossy',
            'params': {'p_material_code': 'vinyl', 'p_finish_code': 'glossy'},
            'expected_base': 19.99,
            'expected_range': (20.99, 26.00)  # +5% for glossy
        },
        {
            'description': 'Custom Gang Sheet - Clear Vinyl, Matte',
            'params': {'p_material_code': 'clear-vinyl', 'p_finish_code': 'matte'},
            'expected_base': 19.99,
            'expected_range': (22.99, 28.00)  # +15% for clear vinyl
        },
        {
            'description': 'Custom Gang Sheet - Clear Vinyl, Glossy',
            'params': {'p_material_code': 'clear-vinyl', 'p_finish_code': 'glossy'},
            'expected_base': 19.99,
            'expected_range': (24.00, 30.00)  # +15% material + 5% finish
        }
    ]
    
    all_passed = True
    
    print("📊 Testing Custom Gang Sheet Pricing (Per Sheet)")
    print("-" * 50)
    
    for config in test_configs:
        try:
            # Test the custom gang sheet pricing function
            result = supabase.rpc('calculate_custom_gang_sheet_price', config['params']).execute()
            
            if result.data:
                data = result.data[0]
                base_price = float(data['base_price'])
                material_surcharge = float(data['material_surcharge'])
                finish_surcharge = float(data['finish_surcharge'])
                subtotal = float(data['subtotal'])
                price_per_sheet = float(data['price_per_sheet'])
                
                min_expected, max_expected = config['expected_range']
                
                # Validate pricing
                if (base_price == config['expected_base'] and 
                    min_expected <= subtotal <= max_expected and
                    subtotal == price_per_sheet):
                    status = "✅ PASS"
                else:
                    status = "❌ FAIL"
                    all_passed = False
                
                print(f"{status} {config['description']}")
                print(f"    Base price: ${base_price:.2f}")
                print(f"    Material surcharge: ${material_surcharge:.2f}")
                print(f"    Finish surcharge: ${finish_surcharge:.2f}")
                print(f"    Total per sheet: ${subtotal:.2f}")
                
            else:
                print(f"❌ FAIL {config['description']}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {config['description']}: {e}")
            all_passed = False
    
    print(f"\n📊 Testing Quantity Independence")
    print("-" * 50)
    
    # Test that quantity doesn't affect custom gang sheet pricing
    quantities = [1, 5, 10, 50, 100]
    
    try:
        # Get base pricing for comparison
        base_result = supabase.rpc('calculate_custom_gang_sheet_price', {
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte'
        }).execute()
        
        if base_result.data:
            base_price = float(base_result.data[0]['subtotal'])
            
            for quantity in quantities:
                # Test with different quantities - should all be the same price
                result = supabase.rpc('calculate_sticker_price', {
                    'p_quantity': quantity,
                    'p_material_code': 'vinyl',
                    'p_finish_code': 'matte',
                    'p_shape_code': 'custom',
                    'p_size_code': 'custom'
                }).execute()
                
                if result.data:
                    subtotal = float(result.data[0]['subtotal'])
                    
                    if abs(subtotal - base_price) < 0.01:  # Should be identical
                        status = "✅ PASS"
                    else:
                        status = "❌ FAIL"
                        all_passed = False
                    
                    print(f"{status} Quantity {quantity}: ${subtotal:.2f} (expected: ${base_price:.2f})")
                else:
                    print(f"❌ FAIL Quantity {quantity}: No data returned")
                    all_passed = False
        else:
            print("❌ FAIL: Could not get base pricing for comparison")
            all_passed = False
            
    except Exception as e:
        print(f"❌ ERROR: Quantity independence test failed: {e}")
        all_passed = False
    
    print(f"\n📊 Testing Gang Sheet Details")
    print("-" * 50)
    
    try:
        # Test the gang sheet details function
        result = supabase.rpc('get_gang_sheet_pricing', {
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte'
        }).execute()
        
        if result.data:
            data = result.data[0]
            sheet_size = data['sheet_size']
            printable_area = data['printable_area']
            total_price = float(data['total_price'])
            
            if sheet_size == '20" x 20"' and printable_area == '17" x 17"':
                status = "✅ PASS"
            else:
                status = "❌ FAIL"
                all_passed = False
            
            print(f"{status} Gang Sheet Details:")
            print(f"    Sheet size: {sheet_size}")
            print(f"    Printable area: {printable_area}")
            print(f"    Total price: ${total_price:.2f}")
            
        else:
            print("❌ FAIL: Could not get gang sheet details")
            all_passed = False
            
    except Exception as e:
        print(f"❌ ERROR: Gang sheet details test failed: {e}")
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All custom gang sheet pricing tests PASSED!")
        print("✅ Custom gang sheets priced per sheet ($19.99 base)")
        print("✅ Quantity doesn't affect pricing")
        print("✅ Material and finish surcharges applied correctly")
        print("✅ Sheet size and printable area correctly specified")
    else:
        print("❌ Some custom gang sheet pricing tests FAILED!")
        print("⚠️  Please check the database setup and pricing logic")
    
    return all_passed

if __name__ == "__main__":
    print("🎯 Custom Gang Sheet Pricing Test")
    print("=" * 60)
    
    if test_custom_gang_sheet_pricing():
        print("\n🚀 Custom gang sheet pricing is ready for production!")
        print("✅ $19.99 per sheet (20\" x 20\" with 17\" x 17\" printable)")
        print("✅ Quantity independent pricing")
        print("✅ Material and finish surcharges applied")
    else:
        print("\n⚠️  Custom gang sheet pricing needs fixes before production")
        sys.exit(1)
