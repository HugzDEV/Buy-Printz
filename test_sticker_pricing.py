#!/usr/bin/env python3
"""
Test Sticker Pricing Calculations
Verifies the updated pricing structure matches the specifications
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_pricing_calculations():
    """Test the updated pricing calculations"""
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase configuration")
        return False
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🧪 Testing Sticker Pricing Calculations")
    print("=" * 60)
    
    # Test cases based on the specifications
    test_cases = [
        # Format: (quantity, size, expected_price_per_unit, description)
        (50, '1', 1.02, '50 count, 1x1'),
        (100, '1', 0.80, '100 count, 1x1'),
        (200, '1', 0.70, '200 count, 1x1'),
        (300, '1', 0.60, '300 count, 1x1'),
        (400, '1', 0.52, '400 count, 1x1'),
        (500, '1', 0.40, '500 count, 1x1'),
        (1000, '1', 0.25, '1000 count, 1x1'),
        (2000, '1', 0.22, '2000 count, 1x1'),
        (3000, '1', 0.19, '3000 count, 1x1'),
        (5000, '1', 0.17, '5000 count, 1x1'),
        (10000, '1', 0.15, '10000 count, 1x1'),
    ]
    
    print("📊 Testing Base Pricing (1x1 size):")
    print("-" * 40)
    
    all_passed = True
    
    for quantity, size, expected_per_unit, description in test_cases:
        try:
            # Calculate expected total price
            expected_total = expected_per_unit * quantity
            
            # Test the pricing function
            result = supabase.rpc('calculate_sticker_price', {
                'p_quantity': quantity,
                'p_material_code': 'vinyl',
                'p_finish_code': 'matte',
                'p_shape_code': 'circle',
                'p_size_code': size
            }).execute()
            
            if result.data:
                actual_subtotal = float(result.data[0]['subtotal'])
                actual_per_unit = actual_subtotal / quantity
                
                # Check if pricing is close (within 5% tolerance)
                tolerance = 0.05
                if abs(actual_per_unit - expected_per_unit) / expected_per_unit <= tolerance:
                    status = "✅ PASS"
                else:
                    status = "❌ FAIL"
                    all_passed = False
                
                print(f"{status} {description}: Expected ${expected_per_unit:.2f}/unit, Got ${actual_per_unit:.2f}/unit")
            else:
                print(f"❌ FAIL {description}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {description}: {e}")
            all_passed = False
    
    print("\n📊 Testing Size Modifiers:")
    print("-" * 40)
    
    # Test size modifiers for 50 count (base modifiers)
    size_tests_50 = [
        ('2', 0.15, '50 count, 2x2 (15% increase)'),
        ('3', 0.32, '50 count, 3x3 (32% increase)'),
        ('4', 0.50, '50 count, 4x4 (50% increase)'),
        ('5', 0.85, '50 count, 5x5 (85% increase)'),
    ]
    
    print("50 Count Tier (Base Modifiers):")
    for size, expected_modifier, description in size_tests_50:
        try:
            result = supabase.rpc('calculate_sticker_price', {
                'p_quantity': 50,
                'p_material_code': 'vinyl',
                'p_finish_code': 'matte',
                'p_shape_code': 'circle',
                'p_size_code': size
            }).execute()
            
            if result.data:
                # Get base price for 1x1
                base_result = supabase.rpc('calculate_sticker_price', {
                    'p_quantity': 50,
                    'p_material_code': 'vinyl',
                    'p_finish_code': 'matte',
                    'p_shape_code': 'circle',
                    'p_size_code': '1'
                }).execute()
                
                if base_result.data:
                    base_price = float(base_result.data[0]['subtotal'])
                    actual_price = float(result.data[0]['subtotal'])
                    actual_modifier = (actual_price - base_price) / base_price
                    
                    # Check if modifier is close (within 10% tolerance)
                    tolerance = 0.10
                    if abs(actual_modifier - expected_modifier) <= tolerance:
                        status = "✅ PASS"
                    else:
                        status = "❌ FAIL"
                        all_passed = False
                    
                    print(f"{status} {description}: Expected {expected_modifier:.0%}, Got {actual_modifier:.0%}")
                else:
                    print(f"❌ ERROR {description}: Could not get base price")
                    all_passed = False
            else:
                print(f"❌ FAIL {description}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {description}: {e}")
            all_passed = False
    
    # Test size modifiers for 100 count (higher modifiers)
    size_tests_100 = [
        ('2', 0.22, '100 count, 2x2 (22% increase)'),
        ('3', 0.40, '100 count, 3x3 (40% increase)'),
        ('4', 0.90, '100 count, 4x4 (90% increase)'),
        ('5', 1.32, '100 count, 5x5 (132% increase)'),
    ]
    
    print("\n100+ Count Tier (Higher Modifiers):")
    for size, expected_modifier, description in size_tests_100:
        try:
            result = supabase.rpc('calculate_sticker_price', {
                'p_quantity': 100,
                'p_material_code': 'vinyl',
                'p_finish_code': 'matte',
                'p_shape_code': 'circle',
                'p_size_code': size
            }).execute()
            
            if result.data:
                # Get base price for 1x1
                base_result = supabase.rpc('calculate_sticker_price', {
                    'p_quantity': 100,
                    'p_material_code': 'vinyl',
                    'p_finish_code': 'matte',
                    'p_shape_code': 'circle',
                    'p_size_code': '1'
                }).execute()
                
                if base_result.data:
                    base_price = float(base_result.data[0]['subtotal'])
                    actual_price = float(result.data[0]['subtotal'])
                    actual_modifier = (actual_price - base_price) / base_price
                    
                    # Check if modifier is close (within 10% tolerance)
                    tolerance = 0.10
                    if abs(actual_modifier - expected_modifier) <= tolerance:
                        status = "✅ PASS"
                    else:
                        status = "❌ FAIL"
                        all_passed = False
                    
                    print(f"{status} {description}: Expected {expected_modifier:.0%}, Got {actual_modifier:.0%}")
                else:
                    print(f"❌ ERROR {description}: Could not get base price")
                    all_passed = False
            else:
                print(f"❌ FAIL {description}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {description}: {e}")
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All pricing tests PASSED!")
        print("✅ Sticker pricing structure is working correctly")
    else:
        print("❌ Some pricing tests FAILED!")
        print("⚠️  Please check the database setup and pricing logic")
    
    return all_passed

if __name__ == "__main__":
    print("🎯 Sticker Pricing Test")
    print("=" * 60)
    
    if test_pricing_calculations():
        print("\n🚀 Sticker pricing is ready for production!")
    else:
        print("\n⚠️  Sticker pricing needs fixes before production")
        sys.exit(1)
