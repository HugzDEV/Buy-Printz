#!/usr/bin/env python3
"""
Shipping Cost Extractor
This system extracts only shipping costs from B2Sign by filling out their forms
with the correct product options, while using Supabase pricing for base costs.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio

from buyprintz_b2sign_mapper import BuyPrintzB2SignMapper
from b2sign_shipping_integration import B2SignShippingIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ShippingCostExtractor:
    def __init__(self):
        self.mapper = BuyPrintzB2SignMapper()
        self.b2sign_integration = None
        
    async def initialize(self):
        """Initialize B2Sign integration"""
        try:
            logger.info("🚀 Initializing shipping cost extractor...")
            
            self.b2sign_integration = B2SignShippingIntegration(headless=True)
            
            # Initialize with credentials
            username = 'order@buyprintz.com'
            password = '$AG@BuyPr!n1z'
            
            if self.b2sign_integration.initialize(username, password):
                logger.info("✅ Shipping cost extractor initialized successfully")
                return True
            else:
                logger.error("❌ Failed to initialize B2Sign integration")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing shipping cost extractor: {e}")
            return False
    
    async def get_shipping_costs(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get shipping costs from B2Sign by filling out their form with correct options
        
        Args:
            order_data: Dictionary containing:
                - product_type: 'banner', 'tent', 'tin'
                - material: banner material type
                - dimensions: width/height
                - quantity: number of items
                - print_options: all the print specifications
                - accessories: tent accessories
                - zip_code: customer zip code
                - customer_info: customer details
        
        Returns:
            Dictionary with shipping costs and options
        """
        try:
            logger.info(f"🚚 Getting shipping costs for {order_data.get('product_type')} to {order_data.get('zip_code')}")
            
            # Map BuyPrintz options to B2Sign form options
            b2sign_config = self.mapper.map_buyprintz_to_b2sign(order_data)
            
            # Create order mockup to get shipping costs
            quote_request = self.mapper.get_shipping_quote_request(order_data)
            
            # Get shipping quote (this fills out B2Sign form and extracts shipping costs)
            shipping_quote = await asyncio.get_event_loop().run_in_executor(
                None, self.b2sign_integration.get_shipping_quote, quote_request['product_details']
            )
            
            # Extract only shipping information
            shipping_info = {
                'success': shipping_quote.get('success', False),
                'shipping_options': shipping_quote.get('shipping_options', []),
                'total_shipping_cost': shipping_quote.get('total_cost'),
                'estimated_delivery': shipping_quote.get('estimated_delivery'),
                'errors': shipping_quote.get('errors', []),
                'b2sign_product_url': b2sign_config.get('product_url'),
                'extracted_at': datetime.now().isoformat()
            }
            
            if shipping_info['success']:
                logger.info(f"✅ Shipping costs extracted successfully")
                if shipping_info['shipping_options']:
                    logger.info(f"📦 Found {len(shipping_info['shipping_options'])} shipping options")
            else:
                logger.warning(f"⚠️ Failed to extract shipping costs: {shipping_info['errors']}")
            
            return shipping_info
            
        except Exception as e:
            logger.error(f"❌ Error getting shipping costs: {e}")
            return {
                'success': False,
                'errors': [f"Internal error: {str(e)}"],
                'shipping_options': [],
                'extracted_at': datetime.now().isoformat()
            }
    
    async def close(self):
        """Close the integration and cleanup resources"""
        if self.b2sign_integration:
            self.b2sign_integration.close()
            logger.info("🔒 Shipping cost extractor closed")

# Global instance for API use
shipping_extractor = None

async def get_shipping_extractor() -> ShippingCostExtractor:
    """Get or create global shipping extractor instance"""
    global shipping_extractor
    
    if shipping_extractor is None:
        shipping_extractor = ShippingCostExtractor()
        await shipping_extractor.initialize()
    
    return shipping_extractor

async def get_shipping_costs_api(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """API function to get shipping costs only"""
    try:
        # Get shipping extractor
        extractor = await get_shipping_extractor()
        
        # Get shipping costs
        shipping_info = await extractor.get_shipping_costs(request_data)
        
        return shipping_info
        
    except Exception as e:
        logger.error(f"❌ Error in shipping costs API: {e}")
        return {
            'success': False,
            'errors': [f"Internal error: {str(e)}"],
            'shipping_options': []
        }

async def main():
    """Test the shipping cost extractor"""
    logger.info("🚀 Testing shipping cost extractor...")
    
    extractor = ShippingCostExtractor()
    
    try:
        # Initialize system
        if not await extractor.initialize():
            logger.error("❌ Failed to initialize system")
            return
        
        # Test banner shipping costs
        banner_order = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {'width': 3, 'height': 6},
            'quantity': 1,
            'print_options': {
                'sides': 1,
                'grommets': 'every-2ft-all-sides',
                'hem': 'all-sides',
                'polePockets': 'none',
                'webbing': 'no-webbing',
                'corners': 'no-reinforcement',
                'rope': 'no-rope',
                'windslits': 'no-windslits',
                'turnaround': 'next-day'
            },
            'zip_code': '10001',
            'customer_info': {
                'zipCode': '10001',
                'city': 'New York',
                'state': 'NY'
            }
        }
        
        shipping_costs = await extractor.get_shipping_costs(banner_order)
        logger.info(f"Banner shipping result: {shipping_costs['success']}")
        if shipping_costs['shipping_options']:
            logger.info(f"Shipping options: {len(shipping_costs['shipping_options'])}")
            for option in shipping_costs['shipping_options'][:3]:  # Show first 3
                logger.info(f"  - {option.get('name', 'Unknown')}: {option.get('cost', 'N/A')}")
        
        # Test tent shipping costs
        tent_order = {
            'product_type': 'tent',
            'dimensions': {'width': 10, 'height': 10},
            'quantity': 1,
            'print_options': {
                'tent_size': '10x10',
                'tent_design_option': 'canopy-only'
            },
            'accessories': ['carrying-bag'],
            'zip_code': '90210',
            'customer_info': {
                'zipCode': '90210',
                'city': 'Beverly Hills',
                'state': 'CA'
            }
        }
        
        tent_shipping = await extractor.get_shipping_costs(tent_order)
        logger.info(f"Tent shipping result: {tent_shipping['success']}")
        if tent_shipping['shipping_options']:
            logger.info(f"Shipping options: {len(tent_shipping['shipping_options'])}")
        
    except Exception as e:
        logger.error(f"❌ Error in test: {e}")
    
    finally:
        await extractor.close()

if __name__ == "__main__":
    asyncio.run(main())
