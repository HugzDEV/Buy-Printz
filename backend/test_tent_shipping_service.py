#!/usr/bin/env python3
"""
Test Tent Shipping Service
Test the production tent shipping service with TentCheckout.jsx data format
"""

import asyncio
import logging
from tent_shipping_service import get_tent_shipping_costs

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_tent_shipping_service():
    """Test the production tent shipping service"""
    try:
        logger.info("🧪 Testing Tent Shipping Service with TentCheckout.jsx data format...")
        
        # Simulate data from TentCheckout.jsx
        order_data = {
            'tentSize': '10x10',
            'tentPackage': 'complete-tent',  # complete-tent or canopy-graphic-only
            'reinforcedStripColor': 'white',  # white or black
            'wallOption': 'no-walls',  # no-walls, half-walls, full-walls
            'selectedAccessories': ['carrying-bag-wheels'],  # List of accessory IDs
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
        
        # Get shipping costs using the production service
        result = await get_tent_shipping_costs(order_data, customer_info)
        
        if result['success']:
            logger.info("🎉 SUCCESS! Tent shipping service working correctly")
            logger.info(f"📦 Found {len(result['shipping_options'])} shipping options:")
            
            for i, option in enumerate(result['shipping_options'], 1):
                logger.info(f"  {i}. {option.get('name', 'Unknown')} - {option.get('cost', 'Unknown')}")
                if option.get('estimated_days'):
                    logger.info(f"     Est. {option['estimated_days']} days")
                if option.get('delivery_date'):
                    logger.info(f"     Delivery: {option['delivery_date']}")
            
            return result
        else:
            logger.error("❌ Tent shipping service failed")
            logger.error(f"Errors: {result.get('errors', [])}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return None

async def test_different_tent_configurations():
    """Test different tent configurations"""
    try:
        logger.info("🧪 Testing different tent configurations...")
        
        # Test configurations
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
            },
            {
                'name': 'Complete 10x10 Tent with Full Walls',
                'order_data': {
                    'tentSize': '10x10',
                    'tentPackage': 'complete-tent',
                    'reinforcedStripColor': 'white',
                    'wallOption': 'full-walls',
                    'selectedAccessories': [],
                    'quantity': 2
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
            logger.info(f"\n🔍 Testing: {config['name']}")
            logger.info(f"📋 Config: {config['order_data']}")
            
            result = await get_tent_shipping_costs(config['order_data'], customer_info)
            
            if result['success']:
                logger.info(f"✅ {config['name']} - SUCCESS")
                logger.info(f"📦 Found {len(result['shipping_options'])} shipping options")
                for option in result['shipping_options']:
                    logger.info(f"  - {option.get('name', 'Unknown')}: {option.get('cost', 'Unknown')}")
            else:
                logger.error(f"❌ {config['name']} - FAILED")
                logger.error(f"Errors: {result.get('errors', [])}")
            
            # Wait between tests
            await asyncio.sleep(2)
            
    except Exception as e:
        logger.error(f"❌ Error testing different configurations: {e}")

if __name__ == "__main__":
    async def main():
        # Test basic functionality
        await test_tent_shipping_service()
        
        # Test different configurations
        await test_different_tent_configurations()
        
        logger.info("🎯 Tent Shipping Service tests complete!")
    
    asyncio.run(main())
