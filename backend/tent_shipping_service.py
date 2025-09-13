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
from b2sign_playwright_integration import B2SignPlaywrightIntegration
from tent_workflow import TentWorkflow

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TentShippingService:
    def __init__(self):
        self.b2sign_integration = None
        
    async def initialize(self):
        """Initialize the B2Sign integration"""
        try:
            self.b2sign_integration = B2SignPlaywrightIntegration()
            success = await self.b2sign_integration.initialize()
            if success:
                await self.b2sign_integration.login()
                logger.info("✅ TentShippingService initialized successfully")
                return True
            else:
                logger.error("❌ Failed to initialize B2Sign integration")
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
            
            # Create a fresh B2Sign integration instance for each request
            b2sign_integration = B2SignPlaywrightIntegration()
            # Override headless mode for testing (production should use headless=True)
            b2sign_integration.headless_mode = False
            success = await b2sign_integration.initialize()
            
            if not success:
                return {
                    'success': False,
                    'errors': ['Failed to initialize B2Sign integration'],
                    'shipping_options': []
                }
            
            # Login
            login_success = await b2sign_integration.login()
            if not login_success:
                await b2sign_integration.cleanup()
                return {
                    'success': False,
                    'errors': ['Failed to login to B2Sign'],
                    'shipping_options': []
                }
            
            # Map TentCheckout.jsx data to B2Sign format
            b2sign_order_data = self._map_tent_data_to_b2sign(order_data, customer_info)
            
            # Navigate to tent product page
            tent_url = b2sign_integration.product_pages.get('tent_10x10')
            logger.info(f"🌐 Navigating to {tent_url}")
            await b2sign_integration.page.goto(tent_url, wait_until='networkidle')
            await b2sign_integration.page.wait_for_timeout(3000)
            
            # Use the modular tent workflow that follows the exact same structure as the banner workflow
            tent_workflow = TentWorkflow(b2sign_integration.page)
            shipping_options = await tent_workflow.fill_tent_quote_form_workflow(b2sign_order_data)
            
            # Clean up
            await b2sign_integration.cleanup()
            
            return shipping_options
            
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
            if self.b2sign_integration:
                await self.b2sign_integration.cleanup()
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
        # Create a fresh service instance for each request
        service = TentShippingService()
        return await service.get_tent_shipping_costs(order_data, customer_info)
    except Exception as e:
        logger.error(f"❌ Error in get_tent_shipping_costs: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }
