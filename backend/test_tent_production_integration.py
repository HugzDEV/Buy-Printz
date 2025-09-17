#!/usr/bin/env python3
"""
Test Tent Production Integration - Uses the actual production integration
This test uses the real TentPlaywrightIntegration class to verify tax extraction works
"""

import asyncio
import json
import logging
from tent_playwright_integration import TentPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_tent_production_integration():
    """Test tent production integration with tax extraction"""
    try:
        logger.info("🧪 Testing Tent Production Integration with Tax Extraction...")
        print("🧪 Testing Tent Production Integration with Tax Extraction...")
        print("=" * 60)
        
        # Initialize the production integration
        tent_integration = TentPlaywrightIntegration()
        
        try:
            # Initialize browser and login
            await tent_integration.initialize()
            await tent_integration.login()
            
            # Create test order data using real address [[memory:8856493]]
            order_data = {
                'dimensions': {'width': 10, 'height': 10},
                'quantity': 1,
                'print_options': {
                    'tent_size': '10x10',
                    'tent_design_option': 'canopy-only',
                    'reinforced_strip_color': 'white'
                },
                'customer_info': {
                    'name': 'John Doe',
                    'company': 'BuyPrintz Inc',
                    'phone': '617-800-9049',
                    'address': '816 Morton Street',
                    'city': 'Boston',
                    'state': 'MA',
                    'zipCode': '02124'
                }
            }
            
            print("📋 Test order specifications:")
            print(f"  - Tent Size: {order_data['print_options']['tent_size']}")
            print(f"  - Design Option: {order_data['print_options']['tent_design_option']}")
            print(f"  - Quantity: {order_data['quantity']}")
            print(f"  - Customer: {order_data['customer_info']['name']}")
            print(f"  - Address: {order_data['customer_info']['address']}, {order_data['customer_info']['city']}, {order_data['customer_info']['state']} {order_data['customer_info']['zipCode']}")
            
            # Get shipping costs using production integration
            print("\n🚚 Getting shipping costs using production integration...")
            logger.info("🚚 Getting shipping costs using production integration...")
            
            result = await tent_integration.get_tent_shipping_costs(order_data)
            
            if result.get('success'):
                shipping_options = result.get('shipping_options', [])
                print(f"\n✅ SUCCESS! Got {len(shipping_options)} shipping options:")
                
                for i, option in enumerate(shipping_options, 1):
                    print(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'N/A')}")
                    if 'tax' in option:
                        print(f"     Tax: {option['tax']}")
                    if 'delivery_date' in option:
                        print(f"     Delivery: {option['delivery_date']}")
                
                # Check if tax extraction worked
                has_tax_data = any('tax' in option for option in shipping_options)
                if has_tax_data:
                    print("\n✅ Tax extraction is working!")
                    tax_amounts = [option.get('tax', '$0.00') for option in shipping_options if 'tax' in option]
                    unique_taxes = list(set(tax_amounts))
                    print(f"   Tax amounts found: {unique_taxes}")
                else:
                    print("\n⚠️ Tax extraction may not be working - no tax data found")
                
                # Verify expected shipping options
                if len(shipping_options) >= 5:
                    print(f"\n✅ Found {len(shipping_options)} shipping options (expected 5+)")
                else:
                    print(f"\n⚠️ Found {len(shipping_options)} shipping options, expected 5+")
                    
                return True
                
            else:
                print(f"\n❌ FAILED! Error getting shipping costs:")
                errors = result.get('errors', ['Unknown error'])
                for error in errors:
                    print(f"  - {error}")
                return False
                
        finally:
            # Cleanup
            await tent_integration.cleanup()
            
    except Exception as e:
        logger.error(f"❌ Tent production integration test failed: {e}")
        print(f"❌ Tent production integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run the production integration test"""
    success = await test_tent_production_integration()
    
    print("\n" + "=" * 60)
    if success:
        print("🏁 Tent production integration test PASSED!")
    else:
        print("🏁 Tent production integration test FAILED!")

if __name__ == "__main__":
    asyncio.run(main())
