#!/usr/bin/env python3
"""
Tent Shipping Service
Production service for getting real-time shipping costs for tent products
using the proven B2Sign workflow.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from backend.tent_playwright_integration import TentPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TentShippingService:
    def __init__(self):
        self.b2sign_integration = None
        
    async def initialize(self):
        """Initialize the Tent integration"""
        try:
            self.tent_integration = TentPlaywrightIntegration()
            success = await self.tent_integration.initialize()
            if success:
                await self.tent_integration.login()
                logger.info("✅ TentShippingService initialized successfully")
                return True
            else:
                logger.error("❌ Failed to initialize Tent integration")
                return False
        except Exception as e:
            logger.error(f"❌ Error initializing TentShippingService: {e}")
            return False
    
    async def get_tent_shipping_costs(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get shipping costs for tent products using the proven B2Sign workflow
        
        Args:
            order_data: Order data from TentCheckout.jsx including:
                - tentSize: '10x10' or '10x20'
                - tentPackage: 'complete-tent' or 'canopy-graphic-only'
                - reinforcedStripColor: 'white' or 'black'
                - wallOption: 'no-walls', 'half-walls', or 'full-walls'
                - selectedAccessories: List of accessory IDs
                - quantity: Number of tents
            customer_info: Customer information from TentCheckout.jsx including:
                - name, email, phone, address, city, state, zipCode
        
        Returns:
            Dict with success status and shipping options
        """
        try:
            logger.info("🚚 Getting tent shipping costs using proven B2Sign workflow...")
            
            # Map TentCheckout.jsx data to B2Sign format
            b2sign_order_data = self._map_tent_data_to_b2sign(order_data, customer_info)
            
            # Use the proven tent integration (duplicated from working banner integration)
            tent_integration = TentPlaywrightIntegration()
            result = await tent_integration.get_tent_shipping_costs(b2sign_order_data)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Error getting tent shipping costs: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    def _map_tent_data_to_b2sign(self, order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map TentCheckout.jsx data to B2Sign order format
        
        Args:
            order_data: Data from TentCheckout.jsx
            customer_info: Customer info from TentCheckout.jsx
            
        Returns:
            B2Sign-compatible order data
        """
        try:
            # Extract tent specifications from order_data
            tent_size = order_data.get('tentSize', '10x10')
            tent_package = order_data.get('tentPackage', 'complete-tent')
            wall_option = order_data.get('wallOption', 'no-walls')
            selected_accessories = order_data.get('selectedAccessories', [])
            quantity = order_data.get('quantity', 1)
            
            # Map tent package to B2Sign design option
            if tent_package == 'complete-tent':
                design_option = 'canopy-graphic-plus-frame'
            else:  # canopy-graphic-only
                design_option = 'canopy-graphic-only'
            
            # Map wall options to B2Sign format
            wall_mapping = {
                'no-walls': 'no-walls',
                'half-walls': 'half-walls', 
                'full-walls': 'full-walls'
            }
            
            # Map accessories to B2Sign format
            accessory_mapping = {
                'carrying-bag-wheels': 'Carrying Bag w/ Wheels',
                'sandbags': 'Sandbags'
            }
            
            b2sign_accessories = []
            for accessory_id in selected_accessories:
                if accessory_id in accessory_mapping:
                    b2sign_accessories.append(accessory_mapping[accessory_id])
            
            # Create B2Sign-compatible order data
            b2sign_order_data = {
                'product_type': 'tent',
                'tent_size': tent_size,
                'quantity': quantity,
                'print_options': {
                    'tent_size': tent_size,
                    'tent_design_option': design_option,
                    'wall_option': wall_mapping.get(wall_option, 'no-walls'),
                    'reinforced_strip_color': order_data.get('reinforcedStripColor', 'white')
                },
                'accessories': b2sign_accessories,
                'customer_info': customer_info,
                'dimensions': {
                    'width': 10 if tent_size == '10x10' else 20,
                    'height': 10
                }
            }
            
            logger.info(f"📋 Mapped tent data: {tent_size}, {design_option}, {wall_option}, accessories: {b2sign_accessories}")
            return b2sign_order_data
            
        except Exception as e:
            logger.error(f"❌ Error mapping tent data: {e}")
            raise
    
    async def cleanup(self):
        """Clean up resources"""
        try:
            if self.tent_integration:
                await self.tent_integration.cleanup()
            logger.info("✅ TentShippingService cleaned up")
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {e}")

# Global instance
tent_shipping_service = None

async def get_tent_shipping_service():
    """Get or create TentShippingService instance"""
    global tent_shipping_service
    
    if tent_shipping_service is None:
        tent_shipping_service = TentShippingService()
        await tent_shipping_service.initialize()
    
    return tent_shipping_service

async def get_tent_shipping_costs(order_data: Dict[str, Any], customer_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Get shipping costs for tent products (production API)
    
    Args:
        order_data: Order data from TentCheckout.jsx
        customer_info: Customer information from TentCheckout.jsx
        
    Returns:
        Dict with success status and shipping options
    """
    try:
        logger.info("🏕️ Getting tent shipping costs from TentCheckout.jsx data...")
        logger.info(f"📋 Tent order data: {order_data}")
        
        # Map TentCheckout.jsx data to B2Sign format
        service = TentShippingService()
        b2sign_order_data = service._map_tent_data_to_b2sign(order_data, customer_info)
        
        # Create tent integration instance and initialize it
        tent_integration = TentPlaywrightIntegration()
        await tent_integration.initialize()
        await tent_integration.login()
        
        # Get shipping costs using the tent integration
        result = await tent_integration.get_tent_shipping_costs(b2sign_order_data)
        
        # Clean up
        await tent_integration.cleanup()
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in tent shipping endpoint: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }
