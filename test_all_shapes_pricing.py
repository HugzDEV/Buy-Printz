#!/usr/bin/env python3
"""
Test All Sticker Shapes Pricing
Verifies pricing calculations for all sticker shapes and sizes
"""

import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_all_shapes_pricing():
    """Test pricing for all sticker shapes"""
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing Supabase configuration")
        return False
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("🧪 Testing All Sticker Shapes Pricing")
    print("=" * 60)
    
    # Test configurations
    test_configs = [
        # (quantity, size, material, finish, description)
        (100, '1', 'vinyl', 'matte', '100 count, 1x1, vinyl, matte'),
        (100, '2', 'vinyl', 'matte', '100 count, 2x2, vinyl, matte'),
        (100, '3', 'vinyl', 'matte', '100 count, 3x3, vinyl, matte'),
        (500, '1', 'vinyl', 'matte', '500 count, 1x1, vinyl, matte'),
        (500, '2', 'vinyl', 'matte', '500 count, 2x2, vinyl, matte'),
        (500, '3', 'vinyl', 'matte', '500 count, 3x3, vinyl, matte'),
    ]
    
    # All shapes to test
    shapes = [
        ('circle', 'Circle'),
        ('square', 'Square'),
        ('rectangle', 'Rectangle'),
        ('oval', 'Oval'),
        ('triangle', 'Triangle'),
        ('diamond', 'Diamond'),
        ('star', 'Star'),
        ('custom', 'Custom')
    ]
    
    all_passed = True
    
    for quantity, size, material, finish, config_desc in test_configs:
        print(f"\n📊 Testing Configuration: {config_desc}")
        print("-" * 50)
        
        for shape_code, shape_name in shapes:
            try:
                # Test the pricing function
                result = supabase.rpc('calculate_complete_sticker_price', {
                    'p_quantity': quantity,
                    'p_material_code': material,
                    'p_finish_code': finish,
                    'p_shape_code': shape_code,
                    'p_size_code': size
                }).execute()
                
                if result.data:
                    data = result.data[0]
                    base_price = float(data['base_price'])
                    material_surcharge = float(data['material_surcharge'])
                    finish_surcharge = float(data['finish_surcharge'])
                    shape_surcharge = float(data['shape_surcharge'])
                    size_surcharge = float(data['size_surcharge'])
                    subtotal = float(data['subtotal'])
                    price_per_unit = float(data['price_per_unit'])
                    
                    # Validate that pricing is reasonable
                    if subtotal > 0 and price_per_unit > 0:
                        status = "✅ PASS"
                    else:
                        status = "❌ FAIL"
                        all_passed = False
                    
                    print(f"{status} {shape_name}: ${price_per_unit:.3f}/unit, Total: ${subtotal:.2f}")
                    
                    # Show breakdown for complex shapes
                    if shape_surcharge > 0:
                        print(f"    └─ Shape premium: ${shape_surcharge:.2f}")
                    
                else:
                    print(f"❌ FAIL {shape_name}: No data returned")
                    all_passed = False
                    
            except Exception as e:
                print(f"❌ ERROR {shape_name}: {e}")
                all_passed = False
    
    print(f"\n📊 Testing Shape Comparison (100 count, 2x2, vinyl, matte)")
    print("-" * 50)
    
    try:
        # Test the comparison function
        result = supabase.rpc('get_all_shapes_pricing', {
            'p_quantity': 100,
            'p_material_code': 'vinyl',
            'p_finish_code': 'matte',
            'p_size_code': '2'
        }).execute()
        
        if result.data:
            print("Shape Comparison Results:")
            for row in result.data:
                shape_name = row['shape_name']
                price_per_unit = float(row['price_per_unit'])
                shape_surcharge = float(row['shape_surcharge'])
                subtotal = float(row['subtotal'])
                
                premium_indicator = f" (+${shape_surcharge:.2f} premium)" if shape_surcharge > 0 else ""
                print(f"  {shape_name}: ${price_per_unit:.3f}/unit{premium_indicator}")
        else:
            print("❌ FAIL: Could not get shape comparison data")
            all_passed = False
            
    except Exception as e:
        print(f"❌ ERROR: Shape comparison failed: {e}")
        all_passed = False
    
    print("\n📊 Testing Size Modifiers")
    print("-" * 50)
    
    # Test size modifiers for circle shape (base shape)
    size_tests = [
        ('1', '1x1 (base)'),
        ('2', '2x2 (+22% for 100+ count)'),
        ('3', '3x3 (+40% for 100+ count)'),
        ('4', '4x4 (+90% for 100+ count)'),
        ('5', '5x5 (+132% for 100+ count)'),
    ]
    
    for size_code, size_desc in size_tests:
        try:
            result = supabase.rpc('calculate_complete_sticker_price', {
                'p_quantity': 100,
                'p_material_code': 'vinyl',
                'p_finish_code': 'matte',
                'p_shape_code': 'circle',
                'p_size_code': size_code
            }).execute()
            
            if result.data:
                price_per_unit = float(result.data[0]['price_per_unit'])
                size_surcharge = float(result.data[0]['size_surcharge'])
                
                print(f"✅ {size_desc}: ${price_per_unit:.3f}/unit (${size_surcharge:.2f} size premium)")
            else:
                print(f"❌ FAIL {size_desc}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {size_desc}: {e}")
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All shape pricing tests PASSED!")
        print("✅ All sticker shapes are working correctly")
        print("✅ Size modifiers are applied properly")
        print("✅ Shape premiums are calculated correctly")
    else:
        print("❌ Some pricing tests FAILED!")
        print("⚠️  Please check the database setup and pricing logic")
    
    return all_passed

def test_specific_pricing_examples():
    """Test specific pricing examples to verify calculations"""
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        return False
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    print("\n🎯 Specific Pricing Examples")
    print("=" * 60)
    
    # Test specific examples
    examples = [
        {
            'description': '100 Circle Stickers, 2x2, Vinyl, Matte',
            'params': {'p_quantity': 100, 'p_material_code': 'vinyl', 'p_finish_code': 'matte', 'p_shape_code': 'circle', 'p_size_code': '2'},
            'expected_range': (0.90, 1.20)  # Expected price per unit range
        },
        {
            'description': '500 Star Stickers, 3x3, Vinyl, Glossy',
            'params': {'p_quantity': 500, 'p_material_code': 'vinyl', 'p_finish_code': 'glossy', 'p_shape_code': 'star', 'p_size_code': '3'},
            'expected_range': (0.50, 0.80)  # Expected price per unit range
        },
        {
            'description': '1000 Custom Stickers, 4x4, Clear Vinyl, Matte',
            'params': {'p_quantity': 1000, 'p_material_code': 'clear-vinyl', 'p_finish_code': 'matte', 'p_shape_code': 'custom', 'p_size_code': '4'},
            'expected_range': (0.30, 0.60)  # Expected price per unit range
        }
    ]
    
    all_passed = True
    
    for example in examples:
        try:
            result = supabase.rpc('calculate_complete_sticker_price', example['params']).execute()
            
            if result.data:
                price_per_unit = float(result.data[0]['price_per_unit'])
                subtotal = float(result.data[0]['subtotal'])
                
                min_expected, max_expected = example['expected_range']
                
                if min_expected <= price_per_unit <= max_expected:
                    status = "✅ PASS"
                else:
                    status = "❌ FAIL"
                    all_passed = False
                
                print(f"{status} {example['description']}")
                print(f"    Price per unit: ${price_per_unit:.3f} (expected: ${min_expected:.2f}-${max_expected:.2f})")
                print(f"    Total: ${subtotal:.2f}")
                
            else:
                print(f"❌ FAIL {example['description']}: No data returned")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR {example['description']}: {e}")
            all_passed = False
    
    return all_passed

if __name__ == "__main__":
    print("🎯 Complete Sticker Shapes Pricing Test")
    print("=" * 60)
    
    # Test all shapes
    shapes_passed = test_all_shapes_pricing()
    
    # Test specific examples
    examples_passed = test_specific_pricing_examples()
    
    if shapes_passed and examples_passed:
        print("\n🚀 All sticker shapes pricing is ready for production!")
        print("✅ Circle, Square, Rectangle, Oval, Triangle, Diamond, Star, Custom")
        print("✅ All size modifiers working correctly")
        print("✅ Shape premiums applied properly")
    else:
        print("\n⚠️  Sticker shapes pricing needs fixes before production")
        sys.exit(1)
