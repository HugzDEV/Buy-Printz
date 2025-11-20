#!/usr/bin/env python3
"""
Test Tent Data Mapping
Test the data mapping from TentCheckout.jsx to B2Sign format
"""

import logging
from tent_shipping_service import TentShippingService

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_tent_data_mapping():
    """Test the data mapping functionality"""
    try:
        logger.info("🧪 Testing Tent Data Mapping from TentCheckout.jsx to B2Sign format...")
        
        # Create service instance
        service = TentShippingService()
        
        # Test data from TentCheckout.jsx
        test_cases = [
            {
                'name': 'Complete 10x10 Tent with Half Walls',
                'order_data': {
                    'tentSize': '10x10',
                    'tentPackage': 'complete-tent',
                    'reinforcedStripColor': 'white',
                    'wallOption': 'half-walls',
                    'selectedAccessories': ['carrying-bag-wheels'],
                    'quantity': 1
                },
                'customer_info': {
                    'name': 'John Doe',
                    'email': 'john.doe@example.com',
                    'phone': '555-123-4567',
                    'address': '816 Morton Street',
                    'city': 'Boston',
                    'state': 'MA',
                    'zipCode': '02124'
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
                },
                'customer_info': {
                    'name': 'Jane Smith',
                    'email': 'jane.smith@example.com',
                    'phone': '555-987-6543',
                    'address': '123 Main Street',
                    'city': 'Los Angeles',
                    'state': 'CA',
                    'zipCode': '90210'
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
                },
                'customer_info': {
                    'name': 'Bob Johnson',
                    'email': 'bob.johnson@example.com',
                    'phone': '555-456-7890',
                    'address': '456 Oak Avenue',
                    'city': 'Chicago',
                    'state': 'IL',
                    'zipCode': '60601'
                }
            }
        ]
        
        for test_case in test_cases:
            logger.info(f"\n🔍 Testing: {test_case['name']}")
            logger.info(f"📋 Input order data: {test_case['order_data']}")
            logger.info(f"👤 Input customer info: {test_case['customer_info']}")
            
            # Test the mapping
            try:
                b2sign_data = service._map_tent_data_to_b2sign(
                    test_case['order_data'], 
                    test_case['customer_info']
                )
                
                logger.info("✅ Mapping successful!")
                logger.info(f"📦 B2Sign order data: {b2sign_data}")
                
                # Validate the mapping
                assert b2sign_data['product_type'] == 'tent'
                assert b2sign_data['tent_size'] == test_case['order_data']['tentSize']
                assert b2sign_data['quantity'] == test_case['order_data']['quantity']
                assert 'print_options' in b2sign_data
                assert 'customer_info' in b2sign_data
                assert 'dimensions' in b2sign_data
                
                # Check tent design option mapping
                tent_package = test_case['order_data']['tentPackage']
                if tent_package == 'complete-tent':
                    expected_design = 'canopy-graphic-plus-frame'
                else:
                    expected_design = 'canopy-graphic-only'
                
                assert b2sign_data['print_options']['tent_design_option'] == expected_design
                
                logger.info(f"✅ Validation passed for {test_case['name']}")
                
            except Exception as e:
                logger.error(f"❌ Mapping failed for {test_case['name']}: {e}")
                return False
        
        logger.info("\n🎉 All tent data mapping tests passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_tent_data_mapping()
    if success:
        print("\n✅ Tent data mapping is working correctly!")
        print("📋 The service can properly map TentCheckout.jsx data to B2Sign format")
        print("🚀 Ready for production integration!")
    else:
        print("\n❌ Tent data mapping tests failed!")
        print("🔧 Please check the mapping logic")
