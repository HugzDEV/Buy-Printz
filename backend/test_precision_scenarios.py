#!/usr/bin/env python3
"""
Precision test with different customer scenarios
Tests the complete B2Sign integration with various specifications
"""

import asyncio
import logging
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_precision_scenarios():
    """Test precision with different customer scenarios"""
    try:
        logger.info("🎯 Testing B2Sign Integration Precision...")
        print("🎯 Testing B2Sign Integration Precision...")
        print("=" * 60)
        
        # Create B2Sign integration instance
        integration = B2SignPlaywrightIntegration()
        
        # Initialize and login
        logger.info("🔧 Initializing B2Sign integration...")
        await integration.initialize()
        await integration.login()
        
        # Test scenarios with different specifications
        test_scenarios = [
            {
                "name": "Small Banner - 2x4ft, 1 Side, CA",
                "order_data": {
                    "product_type": "banner",
                    "material": "13oz-vinyl",
                    "dimensions": {"width": 2.0, "height": 4.0},
                    "quantity": 1,
                    "print_options": {
                        "sides": 1,
                        "pole_pockets": "No Pole Pockets",
                        "hem": "All Sides",
                        "grommets": "Every 2' All Sides"
                    },
                    "customer_info": {
                        "zipCode": "90210",
                        "name": "John Doe",
                        "company": "Test Company",
                        "phone": "555-123-4567",
                        "address": "123 Main St",
                        "city": "Beverly Hills",
                        "state": "CA"
                    }
                }
            },
            {
                "name": "Large Banner - 4x8ft, 2 Sides, NY",
                "order_data": {
                    "product_type": "banner",
                    "material": "13oz-vinyl",
                    "dimensions": {"width": 4.0, "height": 8.0},
                    "quantity": 2,
                    "print_options": {
                        "sides": 2,
                        "pole_pockets": "No Pole Pockets",
                        "hem": "All Sides",
                        "grommets": "Every 2' All Sides"
                    },
                    "customer_info": {
                        "zipCode": "10001",
                        "name": "Jane Smith",
                        "company": "Event Co",
                        "phone": "555-987-6543",
                        "address": "456 Broadway",
                        "city": "New York",
                        "state": "NY"
                    }
                }
            },
            {
                "name": "Custom Banner - 3.5x6.5ft, 2 Sides, TX",
                "order_data": {
                    "product_type": "banner",
                    "material": "13oz-vinyl",
                    "dimensions": {"width": 3.5, "height": 6.5},
                    "quantity": 1,
                    "print_options": {
                        "sides": 2,
                        "pole_pockets": "No Pole Pockets",
                        "hem": "All Sides",
                        "grommets": "Every 2' All Sides"
                    },
                    "customer_info": {
                        "zipCode": "75201",
                        "name": "Bob Johnson",
                        "company": "Texas Events",
                        "phone": "555-456-7890",
                        "address": "789 Oak St",
                        "city": "Dallas",
                        "state": "TX"
                    }
                }
            },
            {
                "name": "Fabric Banner - 5x10ft, 1 Side, FL",
                "order_data": {
                    "product_type": "banner",
                    "material": "fabric-9oz",
                    "dimensions": {"width": 5.0, "height": 10.0},
                    "quantity": 1,
                    "print_options": {
                        "sides": 1,
                        "pole_pockets": "No Pole Pockets",
                        "hem": "All Sides",
                        "grommets": "Every 2' All Sides"
                    },
                    "customer_info": {
                        "zipCode": "33101",
                        "name": "Alice Brown",
                        "company": "Florida Signs",
                        "phone": "555-321-0987",
                        "address": "321 Beach Ave",
                        "city": "Miami",
                        "state": "FL"
                    }
                }
            }
        ]
        
        results = []
        
        # Test each scenario
        for i, scenario in enumerate(test_scenarios, 1):
            print(f"\n🧪 Test Scenario {i}: {scenario['name']}")
            print("-" * 50)
            
            try:
                # Get shipping costs using our integration
                result = await integration.get_banner_shipping_costs(scenario['order_data'])
                
                if result["success"]:
                    print("✅ SUCCESS! Shipping costs retrieved")
                    print(f"📊 Found {len(result['shipping_options'])} shipping options:")
                    
                    for j, option in enumerate(result['shipping_options'], 1):
                        print(f"  {j}. {option['name']} - {option['cost']} ({option['estimated_days']} days)")
                        if option.get('delivery_date'):
                            print(f"     📅 Delivery: {option['delivery_date']}")
                    
                    # Store results for comparison
                    results.append({
                        "scenario": scenario['name'],
                        "success": True,
                        "shipping_options": result['shipping_options'],
                        "dimensions": scenario['order_data']['dimensions'],
                        "zip_code": scenario['order_data']['customer_info']['zipCode'],
                        "material": scenario['order_data']['material']
                    })
                    
                else:
                    print("❌ FAILED! No shipping options retrieved")
                    print(f"Errors: {result.get('errors', [])}")
                    
                    results.append({
                        "scenario": scenario['name'],
                        "success": False,
                        "errors": result.get('errors', [])
                    })
                    
            except Exception as e:
                print(f"❌ ERROR: {e}")
                results.append({
                    "scenario": scenario['name'],
                    "success": False,
                    "errors": [str(e)]
                })
        
        # Analyze results
        print("\n" + "=" * 60)
        print("📊 PRECISION TEST RESULTS ANALYSIS:")
        print("=" * 60)
        
        successful_tests = [r for r in results if r['success']]
        failed_tests = [r for r in results if not r['success']]
        
        print(f"✅ Successful tests: {len(successful_tests)}/{len(results)}")
        print(f"❌ Failed tests: {len(failed_tests)}/{len(results)}")
        
        if successful_tests:
            print(f"\n🎯 PRECISION ANALYSIS:")
            print("-" * 30)
            
            # Compare shipping costs across different scenarios
            for result in successful_tests:
                print(f"\n📋 {result['scenario']}:")
                print(f"  Dimensions: {result['dimensions']['width']}x{result['dimensions']['height']}ft")
                print(f"  Material: {result['material']}")
                print(f"  Zip Code: {result['zip_code']}")
                print(f"  Shipping Options: {len(result['shipping_options'])}")
                
                # Show first few shipping options
                for option in result['shipping_options'][:3]:
                    print(f"    - {option['name']}: {option['cost']}")
        
        if failed_tests:
            print(f"\n❌ FAILED TESTS:")
            print("-" * 20)
            for result in failed_tests:
                print(f"  - {result['scenario']}: {result.get('errors', ['Unknown error'])}")
        
        # Cleanup
        await integration.cleanup()
        
        print("\n" + "=" * 60)
        print("🏁 Precision test completed!")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Precision test failed: {e}")
        print(f"❌ Precision test failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_precision_scenarios())
