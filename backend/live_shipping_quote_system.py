#!/usr/bin/env python3
"""
Live Shipping Quote System
This system waits for user shipping information and generates real-time shipping quotes
from B2Sign based on the user's specific location and product configuration.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass

from buyprintz_b2sign_mapper import BuyPrintzB2SignMapper
from b2sign_shipping_integration import B2SignShippingIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ShippingQuoteRequest:
    """Data class for shipping quote requests"""
    product_type: str
    material: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    quantity: int = 1
    print_options: Optional[Dict[str, Any]] = None
    accessories: Optional[List[str]] = None
    customer_info: Optional[Dict[str, Any]] = None
    zip_code: Optional[str] = None
    job_name: Optional[str] = None

@dataclass
class ShippingQuoteResponse:
    """Data class for shipping quote responses"""
    success: bool
    partner: str = 'b2sign'
    shipping_options: List[Dict[str, Any]] = None
    total_cost: Optional[str] = None
    estimated_delivery: Optional[str] = None
    errors: List[str] = None
    quote_timestamp: datetime = None
    cache_hit: bool = False

class LiveShippingQuoteSystem:
    def __init__(self):
        self.mapper = BuyPrintzB2SignMapper()
        self.b2sign_integration = None
        self.quote_cache = {}
        self.cache_timeout = timedelta(minutes=10)  # Cache quotes for 10 minutes
        
    async def initialize(self):
        """Initialize B2Sign integration"""
        try:
            logger.info("🚀 Initializing live shipping quote system...")
            
            self.b2sign_integration = B2SignShippingIntegration(headless=True)
            
            # Initialize with credentials
            username = 'order@buyprintz.com'
            password = '$AG@BuyPr!n1z'
            
            if self.b2sign_integration.initialize(username, password):
                logger.info("✅ Live shipping quote system initialized successfully")
                return True
            else:
                logger.error("❌ Failed to initialize B2Sign integration")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing live shipping quote system: {e}")
            return False
    
    async def get_live_shipping_quote(self, request: ShippingQuoteRequest) -> ShippingQuoteResponse:
        """Get a live shipping quote based on user's shipping information"""
        try:
            logger.info(f"🚚 Getting live shipping quote for {request.product_type} to {request.zip_code}")
            
            # Validate request
            if not request.zip_code:
                return ShippingQuoteResponse(
                    success=False,
                    errors=["Zip code is required for shipping quotes"]
                )
            
            # Check cache first
            cache_key = self._generate_cache_key(request)
            cached_quote = self._get_cached_quote(cache_key)
            if cached_quote:
                logger.info("📦 Using cached shipping quote")
                cached_quote.cache_hit = True
                return cached_quote
            
            # Prepare order data for B2Sign
            order_data = self._prepare_order_data(request)
            
            # Get shipping quote from B2Sign
            shipping_quote = await asyncio.get_event_loop().run_in_executor(
                None, self.b2sign_integration.get_shipping_quote, order_data
            )
            
            # Format response
            response = ShippingQuoteResponse(
                success=shipping_quote.get('success', False),
                partner='b2sign',
                shipping_options=shipping_quote.get('shipping_options', []),
                total_cost=shipping_quote.get('total_cost'),
                estimated_delivery=shipping_quote.get('estimated_delivery'),
                errors=shipping_quote.get('errors', []),
                quote_timestamp=datetime.now(),
                cache_hit=False
            )
            
            # Cache the response
            self._cache_quote(cache_key, response)
            
            if response.success:
                logger.info(f"✅ Live shipping quote generated successfully")
            else:
                logger.warning(f"⚠️ Live shipping quote failed: {response.errors}")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Error getting live shipping quote: {e}")
            return ShippingQuoteResponse(
                success=False,
                errors=[f"Internal error: {str(e)}"]
            )
    
    def _prepare_order_data(self, request: ShippingQuoteRequest) -> Dict[str, Any]:
        """Prepare order data for B2Sign"""
        order_data = {
            'product_type': request.product_type,
            'quantity': request.quantity,
            'zip_code': request.zip_code,
            'job_name': request.job_name or f'Live Quote {datetime.now().strftime("%Y%m%d_%H%M%S")}',
            'print_options': request.print_options or {},
            'customer_info': request.customer_info or {}
        }
        
        # Add product-specific data
        if request.product_type == 'banner':
            order_data.update({
                'material': request.material or '13oz-vinyl',
                'dimensions': request.dimensions or {'width': 3, 'height': 6}
            })
        elif request.product_type in ['tent', 'tradeshow_tent']:
            order_data.update({
                'dimensions': {'width': 10, 'height': 10},  # Tent dimensions
                'accessories': request.accessories or []
            })
        
        return order_data
    
    def _generate_cache_key(self, request: ShippingQuoteRequest) -> str:
        """Generate cache key for request"""
        key_data = {
            'product_type': request.product_type,
            'material': request.material,
            'dimensions': request.dimensions,
            'quantity': request.quantity,
            'print_options': request.print_options,
            'accessories': request.accessories,
            'zip_code': request.zip_code
        }
        return json.dumps(key_data, sort_keys=True)
    
    def _get_cached_quote(self, cache_key: str) -> Optional[ShippingQuoteResponse]:
        """Get cached quote if available and not expired"""
        if cache_key in self.quote_cache:
            cached_data = self.quote_cache[cache_key]
            if datetime.now() - cached_data['timestamp'] < self.cache_timeout:
                return cached_data['quote']
            else:
                # Remove expired cache entry
                del self.quote_cache[cache_key]
        return None
    
    def _cache_quote(self, cache_key: str, quote: ShippingQuoteResponse):
        """Cache shipping quote"""
        self.quote_cache[cache_key] = {
            'quote': quote,
            'timestamp': datetime.now()
        }
    
    def clear_cache(self):
        """Clear all cached quotes"""
        self.quote_cache.clear()
        logger.info("🗑️ Shipping quote cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'cache_size': len(self.quote_cache),
            'cache_timeout_minutes': self.cache_timeout.total_seconds() / 60,
            'cache_keys': list(self.quote_cache.keys())
        }
    
    async def close(self):
        """Close the system and cleanup resources"""
        if self.b2sign_integration:
            self.b2sign_integration.close()
            logger.info("🔒 Live shipping quote system closed")

# Global instance for API use
live_shipping_system = None

async def get_live_shipping_system() -> LiveShippingQuoteSystem:
    """Get or create global live shipping system instance"""
    global live_shipping_system
    
    if live_shipping_system is None:
        live_shipping_system = LiveShippingQuoteSystem()
        await live_shipping_system.initialize()
    
    return live_shipping_system

async def get_live_shipping_quote_api(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """API function to get live shipping quote"""
    try:
        # Create request object
        request = ShippingQuoteRequest(
            product_type=request_data.get('product_type'),
            material=request_data.get('material'),
            dimensions=request_data.get('dimensions'),
            quantity=request_data.get('quantity', 1),
            print_options=request_data.get('print_options', {}),
            accessories=request_data.get('accessories', []),
            customer_info=request_data.get('customer_info', {}),
            zip_code=request_data.get('zip_code'),
            job_name=request_data.get('job_name')
        )
        
        # Get live shipping system
        system = await get_live_shipping_system()
        
        # Get quote
        response = await system.get_live_shipping_quote(request)
        
        # Convert to dict for API response
        return {
            'success': response.success,
            'partner': response.partner,
            'shipping_options': response.shipping_options or [],
            'total_cost': response.total_cost,
            'estimated_delivery': response.estimated_delivery,
            'errors': response.errors or [],
            'quote_timestamp': response.quote_timestamp.isoformat() if response.quote_timestamp else None,
            'cache_hit': response.cache_hit
        }
        
    except Exception as e:
        logger.error(f"❌ Error in live shipping quote API: {e}")
        return {
            'success': False,
            'errors': [f"Internal error: {str(e)}"]
        }

async def main():
    """Test the live shipping quote system"""
    logger.info("🚀 Testing live shipping quote system...")
    
    system = LiveShippingQuoteSystem()
    
    try:
        # Initialize system
        if not await system.initialize():
            logger.error("❌ Failed to initialize system")
            return
        
        # Test banner quote
        banner_request = ShippingQuoteRequest(
            product_type='banner',
            material='13oz-vinyl',
            dimensions={'width': 3, 'height': 6},
            quantity=1,
            print_options={
                'sides': 1,
                'grommets': 'every-2ft-all-sides',
                'hem': 'all-sides'
            },
            zip_code='10001',
            job_name='Test Banner Quote'
        )
        
        banner_quote = await system.get_live_shipping_quote(banner_request)
        logger.info(f"Banner quote result: {banner_quote.success}")
        if banner_quote.shipping_options:
            logger.info(f"Shipping options: {len(banner_quote.shipping_options)}")
        
        # Test tent quote
        tent_request = ShippingQuoteRequest(
            product_type='tent',
            dimensions={'width': 10, 'height': 10},
            quantity=1,
            print_options={
                'tent_size': '10x10',
                'tent_design_option': 'canopy-only'
            },
            accessories=['carrying-bag'],
            zip_code='90210',
            job_name='Test Tent Quote'
        )
        
        tent_quote = await system.get_live_shipping_quote(tent_request)
        logger.info(f"Tent quote result: {tent_quote.success}")
        if tent_quote.shipping_options:
            logger.info(f"Shipping options: {len(tent_quote.shipping_options)}")
        
        # Test cache
        logger.info("Testing cache...")
        cached_quote = await system.get_live_shipping_quote(banner_request)
        logger.info(f"Cached quote hit: {cached_quote.cache_hit}")
        
        # Print cache stats
        cache_stats = system.get_cache_stats()
        logger.info(f"Cache stats: {cache_stats}")
        
    except Exception as e:
        logger.error(f"❌ Error in test: {e}")
    
    finally:
        await system.close()

if __name__ == "__main__":
    asyncio.run(main())
