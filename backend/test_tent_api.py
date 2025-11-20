#!/usr/bin/env python3
"""
Test Tent API Endpoint
Test the production tent shipping API endpoint
"""

import asyncio
import logging
import json
from tent_shipping_service import get_tent_shipping_costs

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_tent_api_data():
    """Test the tent API with TentCheckout.jsx data format"""
    try:
        logger.info("🧪 Testing Tent API with TentCheckout.jsx data format...")
        
        # Simulate data from TentCheckout.jsx
        order_data = {
            'tentSize': '10x10',
            'tentPackage': 'complete-tent',
            'reinforcedStripColor': 'white',
            'wallOption': 'half-walls',
            'selectedAccessories': ['carrying-bag-wheels'],
            'quantity': 1
        }
        
        customer_info = {
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'phone': '555-123-4567',
            'address': '816 Morton Street',
            'city': 'Boston',
            'state': 'MA',
            'zipCode': '02124'
        }
        
        logger.info(f"📋 Testing with order data: {order_data}")
        logger.info(f"👤 Testing with customer info: {customer_info}")
        
        # Test the API data format (what would be sent to the endpoint)
        api_request = {
            'tentSize': order_data['tentSize'],
            'tentPackage': order_data['tentPackage'],
            'reinforcedStripColor': order_data['reinforcedStripColor'],
            'wallOption': order_data['wallOption'],
            'selectedAccessories': order_data['selectedAccessories'],
            'quantity': order_data['quantity'],
            'customer_info': customer_info
        }
        
        logger.info(f"🌐 API request format: {json.dumps(api_request, indent=2)}")
        
        # Test the service directly (simulating what the API endpoint would do)
        result = await get_tent_shipping_costs(order_data, customer_info)
        
        if result['success']:
            logger.info("🎉 SUCCESS! Tent API data format is working correctly")
            logger.info(f"📦 Found {len(result['shipping_options'])} shipping options:")
            
            for i, option in enumerate(result['shipping_options'], 1):
                logger.info(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'Unknown')}")
                if option.get('estimated_days'):
                    logger.info(f"     Est. {option['estimated_days']} days")
                if option.get('delivery_date'):
                    logger.info(f"     Delivery: {option['delivery_date']}")
            
            # Test API response format
            api_response = {
                'success': True,
                'shipping_options': result['shipping_options'],
                'errors': result.get('errors', []),
                'b2sign_product_url': result.get('b2sign_product_url'),
                'extracted_at': result.get('extracted_at')
            }
            
            logger.info(f"🌐 API response format: {json.dumps(api_response, indent=2, default=str)}")
            
            return True
        else:
            logger.error("❌ Tent API test failed")
            logger.error(f"Errors: {result.get('errors', [])}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False

async def test_different_tent_configurations():
    """Test different tent configurations for the API"""
    try:
        logger.info("🧪 Testing different tent configurations for API...")
        
        test_configs = [
            {
                'name': 'Complete 10x10 Tent with Half Walls',
                'order_data': {
                    'tentSize': '10x10',
                    'tentPackage': 'complete-tent',
                    'reinforcedStripColor': 'white',
                    'wallOption': 'half-walls',
                    'selectedAccessories': ['carrying-bag-wheels'],
                    'quantity': 1
                }
            },
            {
                'name': 'Canopy Only 10x20 Tent',
                'order_data': {
                    'tentSize': '10x20',
                    'tentPackage': 'canopy-graphic-only',
                    'reinforcedStripColor': 'black',
                    'wallOption': 'no-walls',
                    'selectedAccessories': ['sandbags'],
                    'quantity': 1
                }
            }
        ]
        
        customer_info = {
            'name': 'Jane Smith',
            'email': 'jane.smith@example.com',
            'phone': '555-987-6543',
            'address': '123 Main Street',
            'city': 'Los Angeles',
            'state': 'CA',
            'zipCode': '90210'
        }
        
        for config in test_configs:
            logger.info(f"\n🔍 Testing API config: {config['name']}")
            
            # Test data mapping only (no browser automation)
            from tent_shipping_service import TentShippingService
            service = TentShippingService()
            
            try:
                b2sign_data = service._map_tent_data_to_b2sign(config['order_data'], customer_info)
                logger.info(f"✅ API data mapping successful for {config['name']}")
                logger.info(f"📦 Mapped to B2Sign format: {b2sign_data}")
                
                # Test API request format
                api_request = {
                    'tentSize': config['order_data']['tentSize'],
                    'tentPackage': config['order_data']['tentPackage'],
                    'reinforcedStripColor': config['order_data']['reinforcedStripColor'],
                    'wallOption': config['order_data']['wallOption'],
                    'selectedAccessories': config['order_data']['selectedAccessories'],
                    'quantity': config['order_data']['quantity'],
                    'customer_info': customer_info
                }
                
                logger.info(f"🌐 API request for {config['name']}: {json.dumps(api_request, indent=2)}")
                
            except Exception as e:
                logger.error(f"❌ API data mapping failed for {config['name']}: {e}")
                return False
            
            # Wait between tests
            await asyncio.sleep(1)
            
    except Exception as e:
        logger.error(f"❌ Error testing different configurations: {e}")
        return False

if __name__ == "__main__":
    async def main():
        # Test basic API functionality
        success1 = await test_tent_api_data()
        
        # Test different configurations
        success2 = await test_different_tent_configurations()
        
        if success1 and success2:
            logger.info("🎯 All tent API tests passed!")
            print("\n✅ Tent API is ready for production!")
            print("📋 The API can accept TentCheckout.jsx data format")
            print("🚀 Ready to integrate with the frontend!")
        else:
            logger.error("❌ Some tent API tests failed!")
            print("\n❌ Tent API tests failed!")
            print("🔧 Please check the implementation")
    
    asyncio.run(main())
