#!/usr/bin/env python3
"""
Tent Playwright Integration - INHERITS FROM PROVEN BANNER INTEGRATION
This module uses Playwright to interact with B2Sign.com for TENT shipping cost extraction.
Uses the EXACT SAME proven methods as the banner workflow for shipping section.
Only overrides tent-specific methods (dimensions, options).
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

# Import the proven banner integration
from backend.b2sign_playwright_integration import B2SignPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TentPlaywrightIntegration(B2SignPlaywrightIntegration):
    def __init__(self):
        super().__init__()
        
        # Override with tent-specific product page mappings (all point to custom event tents page)
        self.product_pages.update({
            'tent_10x10': 'https://www.b2sign.com/custom-event-tents',
            'tent_10x15': 'https://www.b2sign.com/custom-event-tents',
            'tent_10x20': 'https://www.b2sign.com/custom-event-tents'
        })
    
    async def get_tent_shipping_costs(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping costs for tent products using the EXACT SAME proven banner workflow"""
        try:
            logger.info(f"🏕️ Getting tent shipping costs for {order_data.get('tent_size', 'tent')}")
            
            # Browser should be properly initialized by the calling service
            
            # Map BuyPrintz tent size to B2Sign product page
            tent_size = order_data.get('print_options', {}).get('tent_size', '10x10')
            tent_mapping = {
                '10x10': 'tent_10x10',
                '10x15': 'tent_10x15', 
                '10x20': 'tent_10x20'
            }
            
            product_key = tent_mapping.get(tent_size, 'tent_10x10')
            product_url = self.product_pages.get(product_key)
            
            if not product_url:
                return {
                    'success': False,
                    'errors': [f'No product page mapping found for tent size: {tent_size}'],
                    'shipping_options': []
                }
            
            # Navigate to tent product page
            logger.info(f"🌐 Navigating to {product_url}")
            await self.page.goto(product_url, wait_until='networkidle')
            await self.page.wait_for_timeout(3000)
            
            # Use the EXACT SAME proven banner workflow for shipping section only
            # Skip banner-specific form filling, go directly to shipping section
            shipping_options = await self._fill_tent_quote_form_shipping_only(order_data)
            
            return {
                'success': True,
                'shipping_options': shipping_options,
                'b2sign_product_url': product_url,
                'extracted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting tent shipping costs: {e}")
            return {
                'success': False,
                'errors': [str(e)],
                'shipping_options': []
            }
    
    # Uses parent's proven _fill_banner_quote_form method - no override needed
    
    async def _fill_tent_quote_form_shipping_only(self, order_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Fill tent form - skip banner-specific fields, use proven banner methods for shipping section only"""
        try:
            logger.info("🏕️ Starting tent workflow - using proven banner methods for shipping section only...")
            
            # Extract customer info for shipping
            customer_info = order_data.get('customer_info', {})
            zip_code = customer_info.get('zipCode', customer_info.get('zip_code', '90210'))
            
            logger.info(f"📋 Tent shipping workflow - zip: {zip_code}")
            
            # Skip banner-specific form filling (dimensions, job details, options)
            # Go directly to the shipping section which is identical for both
            
            # Step 1: Select Blind Drop Ship (USE PROVEN BANNER METHOD)
            await self._select_blind_drop_ship()
            
            # Step 2: Open address modal and fill customer address (USE PROVEN BANNER METHOD)
            await self._open_and_fill_address_modal(zip_code, customer_info)
            
            # Step 3: Extract all shipping options (USE PROVEN BANNER METHOD)
            shipping_options = await self._extract_all_shipping_options_workflow()
            
            return shipping_options
            
        except Exception as e:
            logger.error(f"❌ Error in tent shipping workflow: {e}")
            return []
    
    async def _fill_banner_options_workflow(self, print_options: Dict[str, Any]):
        """Override to use tent-specific options instead of banner options"""
        await self._fill_tent_options_workflow(print_options)
    
    async def _fill_tent_options_workflow(self, print_options: Dict[str, Any]):
        """Fill tent-specific design options (tent-specific method)"""
        try:
            logger.info("🏕️ Filling tent options...")
            
            # Get tent design option from order data
            tent_design_option = print_options.get('tent_design_option', 'canopy-only')
            
            # Map BuyPrintz options to B2Sign options
            if tent_design_option == 'canopy-only':
                target_option = 'Canopy Graphic Only'
            else:
                target_option = 'Canopy Graphic + Frame'
            
            logger.info(f"🎨 Selecting tent design option: {target_option}")
            
            # Find and select the tent design option
            all_elements = await self.page.query_selector_all('*')
            for element in all_elements:
                try:
                    text = await element.inner_text()
                    if target_option.lower() in text.lower():
                        await element.click()
                        logger.info(f"✅ Selected tent option: {target_option}")
                        await self.page.wait_for_timeout(1000)
                        break
                except:
                    continue
                        
        except Exception as e:
            logger.warning(f"⚠️ Error filling tent options: {e}")

# Global instance for reuse (like banner integration)
tent_playwright: Optional[TentPlaywrightIntegration] = None

async def get_tent_playwright():
    """Get or create the global tent playwright integration instance"""
    global tent_playwright
    
    if tent_playwright is None:
        tent_playwright = TentPlaywrightIntegration()
    
    return tent_playwright

async def get_shipping_costs_playwright(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Get shipping costs using Playwright with proper context management (like test_navigation.py)"""
    try:
        logger.info("🚀 Starting Playwright tent shipping costs extraction...")
        
        # Use the global tent integration instance
        integration = await get_tent_playwright()
        
        # Initialize if needed
        if not integration.page:
            init_success = await integration.initialize()
            if not init_success:
                return {
                    'success': False,
                    'errors': ['Failed to initialize browser'],
                    'shipping_options': []
                }
            
            login_success = await integration.login()
            if not login_success:
                return {
                    'success': False,
                    'errors': ['Failed to login to B2Sign'],
                    'shipping_options': []
                }
        
        # Get shipping costs
        result = await integration.get_tent_shipping_costs(order_data)
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in tent shipping costs extraction: {e}")
        return {
            'success': False,
            'errors': [str(e)],
            'shipping_options': []
        }

if __name__ == "__main__":
    # Test the tent integration
    test_order = {
        'product_type': 'tent',
        'dimensions': {'width': 10, 'height': 10},
        'quantity': 1,
        'print_options': {
            'tent_size': '10x10',
            'tent_design_option': 'canopy-only'
        },
        'customer_info': {
            'name': 'Test User',
            'phone': '555-1234',
            'address': '123 Test St',
            'city': 'Test City',
            'state': 'CA',
            'zipCode': '90210'
        }
    }
    
    async def test():
        result = await get_shipping_costs_playwright(test_order)
        print(json.dumps(result, indent=2))
    
    asyncio.run(test())
