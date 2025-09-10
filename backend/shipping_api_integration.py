#!/usr/bin/env python3
"""
Shipping API Integration
This module provides API endpoints for getting real-time shipping quotes from B2Sign
and integrates with the BuyPrintz checkout process.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime, timedelta

from buyprintz_b2sign_mapper import BuyPrintzB2SignMapper
from b2sign_shipping_integration import B2SignShippingIntegration
from shipping_service import ShippingService

logger = logging.getLogger(__name__)

# API Router
router = APIRouter(prefix="/api/shipping", tags=["shipping"])

# Global instances
mapper = BuyPrintzB2SignMapper()
shipping_service = None
b2sign_integration = None

# Pydantic models for API requests/responses
class ShippingQuoteRequest(BaseModel):
    product_type: str
    material: Optional[str] = None
    dimensions: Dict[str, float]
    quantity: int = 1
    zip_code: str
    job_name: Optional[str] = None
    print_options: Dict[str, Any] = {}
    customer_info: Optional[Dict[str, Any]] = {}
    accessories: Optional[List[str]] = []

class ShippingQuoteResponse(BaseModel):
    success: bool
    partner: str
    product_type: str
    shipping_options: List[Dict[str, Any]]
    total_cost: Optional[str] = None
    estimated_delivery: Optional[str] = None
    errors: List[str] = []
    quote_timestamp: datetime
    cache_hit: bool = False

class BulkShippingQuoteRequest(BaseModel):
    orders: List[ShippingQuoteRequest]

class BulkShippingQuoteResponse(BaseModel):
    success: bool
    quotes: List[ShippingQuoteResponse]
    total_quotes: int
    successful_quotes: int
    failed_quotes: int
    errors: List[str] = []

# Initialize shipping service
async def get_shipping_service():
    global shipping_service, b2sign_integration
    
    if shipping_service is None:
        try:
            shipping_service = ShippingService()
            b2sign_integration = B2SignShippingIntegration(headless=True)
            
            # Initialize B2Sign integration
            username = 'order@buyprintz.com'
            password = '$AG@BuyPr!n1z'
            
            if await asyncio.get_event_loop().run_in_executor(
                None, b2sign_integration.initialize, username, password
            ):
                logger.info("✅ B2Sign shipping integration initialized")
            else:
                logger.error("❌ Failed to initialize B2Sign integration")
                b2sign_integration = None
                
        except Exception as e:
            logger.error(f"❌ Error initializing shipping service: {e}")
            shipping_service = None
            b2sign_integration = None
    
    return shipping_service, b2sign_integration

@router.post("/quote", response_model=ShippingQuoteResponse)
async def get_shipping_quote(request: ShippingQuoteRequest):
    """Get shipping quote for a single product order"""
    try:
        logger.info(f"🚚 Getting shipping quote for {request.product_type} product...")
        
        # Validate the request
        order_data = request.dict()
        is_valid, errors = mapper.validate_buyprintz_order(order_data)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=f"Invalid order data: {errors}")
        
        # Get shipping service
        shipping_service, b2sign_integration = await get_shipping_service()
        
        if not b2sign_integration:
            raise HTTPException(status_code=503, detail="B2Sign shipping service unavailable")
        
        # Generate shipping quote request
        quote_request = mapper.get_shipping_quote_request(order_data)
        
        # Get shipping quote from B2Sign
        shipping_quote = await asyncio.get_event_loop().run_in_executor(
            None, b2sign_integration.get_shipping_quote, quote_request['product_details']
        )
        
        # Format response
        response = ShippingQuoteResponse(
            success=shipping_quote.get('success', False),
            partner='b2sign',
            product_type=request.product_type,
            shipping_options=shipping_quote.get('shipping_options', []),
            total_cost=shipping_quote.get('total_cost'),
            estimated_delivery=shipping_quote.get('estimated_delivery'),
            errors=shipping_quote.get('errors', []),
            quote_timestamp=datetime.now(),
            cache_hit=False  # TODO: Implement caching
        )
        
        logger.info(f"✅ Shipping quote generated successfully")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting shipping quote: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/quote/bulk", response_model=BulkShippingQuoteResponse)
async def get_bulk_shipping_quotes(request: BulkShippingQuoteRequest):
    """Get shipping quotes for multiple product orders"""
    try:
        logger.info(f"🚚 Getting bulk shipping quotes for {len(request.orders)} orders...")
        
        quotes = []
        successful_quotes = 0
        failed_quotes = 0
        errors = []
        
        # Get shipping service
        shipping_service, b2sign_integration = await get_shipping_service()
        
        if not b2sign_integration:
            raise HTTPException(status_code=503, detail="B2Sign shipping service unavailable")
        
        # Process each order
        for i, order_request in enumerate(request.orders):
            try:
                # Validate the request
                order_data = order_request.dict()
                is_valid, validation_errors = mapper.validate_buyprintz_order(order_data)
                
                if not is_valid:
                    quote_response = ShippingQuoteResponse(
                        success=False,
                        partner='b2sign',
                        product_type=order_request.product_type,
                        shipping_options=[],
                        errors=validation_errors,
                        quote_timestamp=datetime.now()
                    )
                    quotes.append(quote_response)
                    failed_quotes += 1
                    continue
                
                # Generate shipping quote request
                quote_request = mapper.get_shipping_quote_request(order_data)
                
                # Get shipping quote from B2Sign
                shipping_quote = await asyncio.get_event_loop().run_in_executor(
                    None, b2sign_integration.get_shipping_quote, quote_request['product_details']
                )
                
                # Format response
                quote_response = ShippingQuoteResponse(
                    success=shipping_quote.get('success', False),
                    partner='b2sign',
                    product_type=order_request.product_type,
                    shipping_options=shipping_quote.get('shipping_options', []),
                    total_cost=shipping_quote.get('total_cost'),
                    estimated_delivery=shipping_quote.get('estimated_delivery'),
                    errors=shipping_quote.get('errors', []),
                    quote_timestamp=datetime.now()
                )
                
                quotes.append(quote_response)
                if quote_response.success:
                    successful_quotes += 1
                else:
                    failed_quotes += 1
                    
            except Exception as e:
                logger.error(f"❌ Error processing order {i}: {e}")
                quote_response = ShippingQuoteResponse(
                    success=False,
                    partner='b2sign',
                    product_type=order_request.product_type,
                    shipping_options=[],
                    errors=[str(e)],
                    quote_timestamp=datetime.now()
                )
                quotes.append(quote_response)
                failed_quotes += 1
        
        response = BulkShippingQuoteResponse(
            success=successful_quotes > 0,
            quotes=quotes,
            total_quotes=len(request.orders),
            successful_quotes=successful_quotes,
            failed_quotes=failed_quotes,
            errors=errors
        )
        
        logger.info(f"✅ Bulk shipping quotes completed: {successful_quotes}/{len(request.orders)} successful")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting bulk shipping quotes: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/partners")
async def get_shipping_partners():
    """Get list of available shipping partners"""
    return {
        "partners": [
            {
                "id": "b2sign",
                "name": "B2Sign",
                "status": "active",
                "supported_products": ["banner", "tent"],
                "features": ["real_time_quotes", "instant_pricing", "shipping_options"]
            }
        ]
    }

@router.get("/health")
async def health_check():
    """Health check for shipping service"""
    try:
        shipping_service, b2sign_integration = await get_shipping_service()
        
        return {
            "status": "healthy" if b2sign_integration else "degraded",
            "b2sign_available": b2sign_integration is not None,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test")
async def test_shipping_integration():
    """Test endpoint for shipping integration"""
    try:
        # Test with sample banner order
        test_order = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {'width': 3, 'height': 6},
            'quantity': 1,
            'zip_code': '10001',
            'job_name': 'Test Order',
            'print_options': {
                'sides': 1,
                'grommets': 'every-2ft-all-sides',
                'hem': 'all-sides'
            }
        }
        
        # Validate mapping
        is_valid, errors = mapper.validate_buyprintz_order(test_order)
        if not is_valid:
            return {"success": False, "error": f"Validation failed: {errors}"}
        
        # Test mapping
        b2sign_config = mapper.map_buyprintz_to_b2sign(test_order)
        quote_request = mapper.get_shipping_quote_request(test_order)
        
        return {
            "success": True,
            "mapping_test": {
                "b2sign_product": b2sign_config['product_key'],
                "product_url": b2sign_config['product_url'],
                "estimated_price": b2sign_config['estimated_base_price']
            },
            "quote_request": {
                "product_type": quote_request['product_details']['product_type'],
                "dimensions": f"{quote_request['product_details']['width']}x{quote_request['product_details']['height']}",
                "zip_code": quote_request['product_details']['zip_code']
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Test error: {e}")
        return {"success": False, "error": str(e)}

# Cleanup function
async def cleanup_shipping_service():
    """Cleanup shipping service resources"""
    global b2sign_integration
    if b2sign_integration:
        try:
            b2sign_integration.close()
            logger.info("🔒 B2Sign shipping integration closed")
        except Exception as e:
            logger.error(f"❌ Error closing B2Sign integration: {e}")
        finally:
            b2sign_integration = None

# Register cleanup
import atexit
atexit.register(lambda: asyncio.run(cleanup_shipping_service()))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)
