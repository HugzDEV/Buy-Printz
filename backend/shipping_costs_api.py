#!/usr/bin/env python3
"""
Shipping Costs API
This module provides API endpoints for getting shipping costs from B2Sign
while using Supabase pricing for base product costs.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import asyncio
from datetime import datetime

from backend.b2sign_playwright_integration import B2SignPlaywrightIntegration

# Setup logging
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(prefix="/api/shipping-costs", tags=["shipping-costs"])

# Pydantic models for API requests/responses
class ShippingCostsRequest(BaseModel):
    product_type: str
    material: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    quantity: int = 1
    print_options: Optional[Dict[str, Any]] = {}
    accessories: Optional[List[str]] = []
    customer_info: Optional[Dict[str, Any]] = {}
    zip_code: str
    job_name: Optional[str] = None

class ShippingCostsResponse(BaseModel):
    success: bool
    shipping_options: List[Dict[str, Any]]
    total_shipping_cost: Optional[str] = None
    estimated_delivery: Optional[str] = None
    errors: List[str]
    b2sign_product_url: Optional[str] = None
    extracted_at: Optional[str] = None

@router.post("/get", response_model=ShippingCostsResponse)
async def get_shipping_costs(request: ShippingCostsRequest):
    """Get shipping costs from B2Sign using our complete workflow"""
    try:
        logger.info(f"🚚 Getting shipping costs for {request.product_type} to {request.zip_code}")
        
        # Validate required fields
        if not request.zip_code:
            raise HTTPException(status_code=400, detail="Zip code is required for shipping costs")
        
        if not request.product_type:
            raise HTTPException(status_code=400, detail="Product type is required")
        
        # Initialize B2Sign integration
        integration = B2SignPlaywrightIntegration()
        await integration.initialize()
        await integration.login()
        
        try:
            # Convert request to order data format for our workflow
            order_data = {
                "product_type": request.product_type,
                "material": request.material or "13oz-vinyl",
                "dimensions": request.dimensions or {"width": 3.0, "height": 6.0},
                "quantity": request.quantity,
                "print_options": request.print_options or {
                    "sides": 2,
                    "pole_pockets": "No Pole Pockets",
                    "hem": "All Sides",
                    "grommets": "Every 2' All Sides"
                },
                "customer_info": {
                    "zipCode": request.zip_code,
                    "name": request.customer_info.get("name", "John Doe") if request.customer_info else "John Doe",
                    "company": request.customer_info.get("company", "BuyPrintz Inc") if request.customer_info else "BuyPrintz Inc",
                    "phone": request.customer_info.get("phone", "555-123-4567") if request.customer_info else "555-123-4567",
                    "address": request.customer_info.get("address", "123 Main St") if request.customer_info else "123 Main St",
                    "city": request.customer_info.get("city", "Beverly Hills") if request.customer_info else "Beverly Hills",
                    "state": request.customer_info.get("state", "CA") if request.customer_info else "CA"
                }
            }
            
            # Get shipping costs using our complete workflow
            if request.product_type in ['banner', 'banners']:
                result = await integration.get_banner_shipping_costs(order_data)
            elif request.product_type in ['tent', 'tents']:
                result = await integration.get_tent_shipping_costs(order_data)
            else:
                raise HTTPException(status_code=400, detail="Unsupported product type")
            
            # Create response
            response = ShippingCostsResponse(
                success=result.get('success', False),
                shipping_options=result.get('shipping_options', []),
                total_shipping_cost=result.get('total_shipping_cost'),
                estimated_delivery=result.get('estimated_delivery'),
                errors=result.get('errors', []),
                b2sign_product_url=result.get('b2sign_product_url'),
                extracted_at=result.get('extracted_at')
            )
            
            if response.success:
                logger.info(f"✅ B2Sign shipping costs extracted successfully: {len(response.shipping_options)} options")
            else:
                logger.warning(f"⚠️ Failed to extract B2Sign shipping costs: {response.errors}")
            
            return response
            
        finally:
            # Always cleanup the integration
            await integration.cleanup()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting B2Sign shipping costs: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for shipping costs system"""
    try:
        return {
            "status": "healthy",
            "b2sign_available": True,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test")
async def test_shipping_costs():
    """Test endpoint for shipping costs system"""
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
            'customer_info': {
                'zipCode': '10001',
                'city': 'New York',
                'state': 'NY'
            },
            'job_name': 'Test Shipping Costs'
        }
        
        # Get shipping costs
        shipping_result = await get_shipping_costs_playwright(test_request)
        
        return {
            "success": True,
            "test_result": shipping_result,
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
