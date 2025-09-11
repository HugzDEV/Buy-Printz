#!/usr/bin/env python3
"""
Live Shipping API
This module provides API endpoints for getting live shipping quotes from B2Sign
based on user's shipping information and product configuration.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime

from live_shipping_quote_system import get_live_shipping_quote_api, get_live_shipping_system

# Setup logging
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(prefix="/api/live-shipping", tags=["live-shipping"])

# Pydantic models for API requests/responses
class LiveShippingQuoteRequest(BaseModel):
    product_type: str
    material: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    quantity: int = 1
    print_options: Optional[Dict[str, Any]] = {}
    accessories: Optional[List[str]] = []
    customer_info: Optional[Dict[str, Any]] = {}
    zip_code: str
    job_name: Optional[str] = None

class LiveShippingQuoteResponse(BaseModel):
    success: bool
    partner: str
    shipping_options: List[Dict[str, Any]]
    total_cost: Optional[str] = None
    estimated_delivery: Optional[str] = None
    errors: List[str]
    quote_timestamp: Optional[str] = None
    cache_hit: bool = False

@router.post("/quote", response_model=LiveShippingQuoteResponse)
async def get_live_shipping_quote(request: LiveShippingQuoteRequest):
    """Get live shipping quote based on user's shipping information"""
    try:
        logger.info(f"🚚 Getting live shipping quote for {request.product_type} to {request.zip_code}")
        
        # Validate required fields
        if not request.zip_code:
            raise HTTPException(status_code=400, detail="Zip code is required for shipping quotes")
        
        if not request.product_type:
            raise HTTPException(status_code=400, detail="Product type is required")
        
        # Convert request to dict
        request_data = request.dict()
        
        # Get live shipping quote
        quote_result = await get_live_shipping_quote_api(request_data)
        
        # Create response
        response = LiveShippingQuoteResponse(
            success=quote_result.get('success', False),
            partner=quote_result.get('partner', 'b2sign'),
            shipping_options=quote_result.get('shipping_options', []),
            total_cost=quote_result.get('total_cost'),
            estimated_delivery=quote_result.get('estimated_delivery'),
            errors=quote_result.get('errors', []),
            quote_timestamp=quote_result.get('quote_timestamp'),
            cache_hit=quote_result.get('cache_hit', False)
        )
        
        if response.success:
            logger.info(f"✅ Live shipping quote generated successfully")
        else:
            logger.warning(f"⚠️ Live shipping quote failed: {response.errors}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting live shipping quote: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for live shipping system"""
    try:
        system = await get_live_shipping_system()
        cache_stats = system.get_cache_stats()
        
        return {
            "status": "healthy",
            "b2sign_available": True,
            "cache_stats": cache_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/cache/clear")
async def clear_cache():
    """Clear shipping quote cache"""
    try:
        system = await get_live_shipping_system()
        system.clear_cache()
        
        return {
            "success": True,
            "message": "Cache cleared successfully",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Error clearing cache: {e}")
        raise HTTPException(status_code=500, detail=f"Error clearing cache: {str(e)}")

@router.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    try:
        system = await get_live_shipping_system()
        cache_stats = system.get_cache_stats()
        
        return {
            "success": True,
            "cache_stats": cache_stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Error getting cache stats: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting cache stats: {str(e)}")

@router.post("/test")
async def test_live_shipping():
    """Test endpoint for live shipping system"""
    try:
        # Test with sample banner request
        test_request = {
            'product_type': 'banner',
            'material': '13oz-vinyl',
            'dimensions': {'width': 3, 'height': 6},
            'quantity': 1,
            'print_options': {
                'sides': 1,
                'grommets': 'every-2ft-all-sides',
                'hem': 'all-sides'
            },
            'zip_code': '10001',
            'job_name': 'Test Live Shipping Quote'
        }
        
        # Get quote
        quote_result = await get_live_shipping_quote_api(test_request)
        
        return {
            "success": True,
            "test_result": quote_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Test error: {e}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)
