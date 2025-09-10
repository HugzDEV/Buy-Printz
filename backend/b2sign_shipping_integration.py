#!/usr/bin/env python3
"""
B2Sign Shipping Integration
This module integrates the B2Sign order mockup system with the BuyPrintz shipping service.
"""

import logging
from typing import Dict, List, Optional, Any
from b2sign_order_mockup import B2SignOrderMockup

logger = logging.getLogger(__name__)

class B2SignShippingIntegration:
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.mockup_system = None
        self.authenticated = False
    
    def initialize(self, username: str, password: str) -> bool:
        """Initialize the B2Sign integration with authentication"""
        try:
            logger.info("🚀 Initializing B2Sign shipping integration...")
            
            self.mockup_system = B2SignOrderMockup(headless=self.headless)
            
            # Login to B2Sign
            if self.mockup_system.login(username, password):
                self.authenticated = True
                logger.info("✅ B2Sign shipping integration initialized successfully")
                return True
            else:
                logger.error("❌ Failed to authenticate with B2Sign")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing B2Sign integration: {e}")
            return False
    
    def get_shipping_quote(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """Get shipping quote from B2Sign for a product"""
        if not self.authenticated or not self.mockup_system:
            return {
                'error': 'B2Sign integration not initialized or authenticated',
                'success': False
            }
        
        try:
            logger.info(f"🚚 Getting B2Sign shipping quote for {product_details.get('product_type', 'unknown')} product...")
            
            # Get shipping quote from B2Sign
            shipping_quote = self.mockup_system.get_shipping_quote(product_details)
            
            # Format the response for BuyPrintz
            formatted_quote = self.format_shipping_quote(shipping_quote)
            
            return formatted_quote
            
        except Exception as e:
            logger.error(f"❌ Error getting B2Sign shipping quote: {e}")
            return {
                'error': str(e),
                'success': False
            }
    
    def format_shipping_quote(self, raw_quote: Dict[str, Any]) -> Dict[str, Any]:
        """Format B2Sign shipping quote for BuyPrintz consumption"""
        try:
            formatted_quote = {
                'partner': 'b2sign',
                'partner_name': 'B2Sign',
                'success': raw_quote.get('success', False),
                'product_type': raw_quote.get('product_type'),
                'shipping_options': [],
                'total_cost': None,
                'errors': raw_quote.get('errors', [])
            }
            
            # Extract shipping options
            shipping_costs = raw_quote.get('shipping_costs', {})
            shipping_options = shipping_costs.get('shipping_options', [])
            
            for option in shipping_options:
                option_text = option.get('text', '')
                
                # Parse shipping option
                shipping_option = {
                    'name': option_text,
                    'type': self.categorize_shipping_type(option_text),
                    'cost': self.extract_shipping_cost(option_text),
                    'estimated_days': self.estimate_delivery_days(option_text),
                    'description': option_text
                }
                
                formatted_quote['shipping_options'].append(shipping_option)
            
            # Set total cost if available
            total_costs = raw_quote.get('total_costs', {})
            if total_costs.get('total_price'):
                formatted_quote['total_cost'] = total_costs['total_price']
            elif total_costs.get('product_price'):
                formatted_quote['total_cost'] = total_costs['product_price']
            
            return formatted_quote
            
        except Exception as e:
            logger.error(f"❌ Error formatting shipping quote: {e}")
            return {
                'error': f'Error formatting quote: {str(e)}',
                'success': False
            }
    
    def categorize_shipping_type(self, option_text: str) -> str:
        """Categorize shipping option type"""
        option_lower = option_text.lower()
        
        if 'standard' in option_lower or 'ground' in option_lower:
            return 'standard'
        elif 'expedited' in option_lower or 'express' in option_lower:
            return 'expedited'
        elif 'overnight' in option_lower:
            return 'overnight'
        elif 'pickup' in option_lower:
            return 'pickup'
        elif 'drop ship' in option_lower:
            return 'dropship'
        else:
            return 'standard'  # Default fallback
    
    def extract_shipping_cost(self, option_text: str) -> Optional[str]:
        """Extract shipping cost from option text"""
        import re
        
        # Look for price patterns
        price_patterns = [
            r'\$[\d,]+\.?\d*',
            r'[\d,]+\.?\d*\s*\$',
            r'free',
            r'included'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, option_text, re.IGNORECASE)
            if match:
                return match.group(0)
        
        return None
    
    def estimate_delivery_days(self, option_text: str) -> Optional[int]:
        """Estimate delivery days from shipping option"""
        option_lower = option_text.lower()
        
        if 'overnight' in option_lower or 'next day' in option_lower:
            return 1
        elif 'expedited' in option_lower or 'express' in option_lower:
            return 2
        elif 'standard' in option_lower or 'ground' in option_lower:
            return 5
        elif 'pickup' in option_lower:
            return 0  # Same day pickup
        else:
            return 5  # Default estimate
    
    def get_multiple_shipping_quotes(self, product_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get shipping quotes for multiple products"""
        quotes = []
        
        for product in product_list:
            try:
                quote = self.get_shipping_quote(product)
                quotes.append(quote)
            except Exception as e:
                logger.error(f"❌ Error getting quote for product {product.get('product_type', 'unknown')}: {e}")
                quotes.append({
                    'error': str(e),
                    'success': False,
                    'product_type': product.get('product_type', 'unknown')
                })
        
        return quotes
    
    def close(self):
        """Close the integration and cleanup resources"""
        if self.mockup_system:
            self.mockup_system.close()
            self.mockup_system = None
            self.authenticated = False
            logger.info("🔒 B2Sign shipping integration closed")

# Integration with existing shipping service
def integrate_b2sign_with_shipping_service(shipping_service, username: str, password: str) -> bool:
    """Integrate B2Sign with the existing shipping service"""
    try:
        logger.info("🔗 Integrating B2Sign with shipping service...")
        
        # Create B2Sign integration
        b2sign_integration = B2SignShippingIntegration(headless=True)
        
        # Initialize with credentials
        if b2sign_integration.initialize(username, password):
            # Add B2Sign to shipping service
            shipping_service.b2sign_integration = b2sign_integration
            
            # Override the get_shipping_quote method for B2Sign
            def b2sign_get_quote(product_details):
                return b2sign_integration.get_shipping_quote(product_details)
            
            # Add B2Sign quote method to shipping service
            shipping_service.get_b2sign_quote = b2sign_get_quote
            
            logger.info("✅ B2Sign successfully integrated with shipping service")
            return True
        else:
            logger.error("❌ Failed to initialize B2Sign integration")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error integrating B2Sign with shipping service: {e}")
        return False

def main():
    """Test the B2Sign shipping integration"""
    logger.info("🚀 Testing B2Sign shipping integration...")
    
    integration = B2SignShippingIntegration(headless=False)
    
    try:
        # Initialize with credentials
        username = 'order@buyprintz.com'
        password = '$AG@BuyPr!n1z'
        
        if integration.initialize(username, password):
            # Test with sample product
            sample_product = {
                'product_type': 'banner',
                'material': 'vinyl',
                'width': 24,
                'height': 36,
                'quantity': 1,
                'zip_code': '10001',
                'job_name': 'BuyPrintz Integration Test'
            }
            
            # Get shipping quote
            quote = integration.get_shipping_quote(sample_product)
            
            # Print results
            logger.info(f"\n📋 B2SIGN SHIPPING INTEGRATION TEST")
            logger.info(f"{'='*50}")
            logger.info(f"Success: {quote.get('success', False)}")
            logger.info(f"Partner: {quote.get('partner_name', 'Unknown')}")
            logger.info(f"Product: {quote.get('product_type', 'Unknown')}")
            logger.info(f"Shipping Options: {len(quote.get('shipping_options', []))}")
            logger.info(f"Total Cost: {quote.get('total_cost', 'Not available')}")
            logger.info(f"Errors: {len(quote.get('errors', []))}")
            
            if quote.get('shipping_options'):
                logger.info(f"\n🚚 SHIPPING OPTIONS:")
                for i, option in enumerate(quote['shipping_options']):
                    logger.info(f"  {i+1}. {option['name']}")
                    logger.info(f"     Type: {option['type']}")
                    logger.info(f"     Cost: {option['cost'] or 'Not specified'}")
                    logger.info(f"     Est. Days: {option['estimated_days'] or 'Unknown'}")
            
            return quote
        else:
            logger.error("❌ Failed to initialize B2Sign integration")
            return None
    
    finally:
        integration.close()

if __name__ == "__main__":
    main()
