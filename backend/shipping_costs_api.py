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
    dimensions: Optional[Dict[str, Any]] = None
    quantity: int = 1
    print_options: Optional[Dict[str, Any]] = {}
    accessories: Optional[List[str]] = []
    customer_info: Optional[Dict[str, Any]] = {}
    zip_code: str
    job_name: Optional[str] = None
    
    class Config:
        # Allow extra fields to be more flexible
        extra = "allow"

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
    """Get shipping costs from B2Sign using our complete workflow
    
    Note: This endpoint can take 15-20 seconds to complete as it:
    1. Initializes a headless browser
    2. Logs into B2Sign
    3. Fills out the complete quote form
    4. Extracts shipping options
    
    Frontend should handle this with appropriate timeout and loading states.
    """
    try:
        logger.info(f"🚚 Getting shipping costs for {request.product_type} to {request.zip_code}")
        logger.info(f"📋 Request data: {request.dict()}")
        
        # Validate required fields
        if not request.zip_code:
            raise HTTPException(status_code=400, detail="Zip code is required for shipping costs")
        
        if not request.product_type:
            raise HTTPException(status_code=400, detail="Product type is required")
        
        # Validate customer info is provided
        if not request.customer_info:
            raise HTTPException(status_code=400, detail="Customer information is required for shipping costs")
        
        # Validate required customer fields
        required_fields = ['name', 'phone', 'address', 'city', 'state']
        missing_fields = [field for field in required_fields if not request.customer_info.get(field)]
        if missing_fields:
            raise HTTPException(status_code=400, detail=f"Missing required customer fields: {', '.join(missing_fields)}")
        
        # Initialize B2Sign integration
        integration = B2SignPlaywrightIntegration()
        init_success = await integration.initialize()
        if not init_success:
            raise HTTPException(status_code=500, detail="Failed to initialize browser for B2Sign integration")
        
        login_success = await integration.login()
        if not login_success:
            raise HTTPException(status_code=500, detail="Failed to login to B2Sign")
        
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
                    "name": request.customer_info.get("name") if request.customer_info else None,
                    "company": request.customer_info.get("company", "") if request.customer_info else "",
                    "phone": request.customer_info.get("phone") if request.customer_info else None,
                    "address": request.customer_info.get("address") if request.customer_info else None,
                    "city": request.customer_info.get("city") if request.customer_info else None,
                    "state": request.customer_info.get("state") if request.customer_info else None
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
        import traceback
        logger.error(f"❌ Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/validate")
async def validate_shipping_request(request_data: dict):
    """Validate shipping request data to help debug 422 errors"""
    try:
        # Try to create the request model
        request = ShippingCostsRequest(**request_data)
        return {
            "valid": True,
            "message": "Request data is valid",
            "parsed_data": request.dict()
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "error_type": type(e).__name__,
            "received_data": request_data
        }

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

@router.get("/playwright-status")
async def playwright_status():
    """Check Playwright browser installation status"""
    try:
        from playwright.async_api import async_playwright
        
        # Try to initialize Playwright
        playwright = await async_playwright().start()
        
        # Try to launch a browser
        browser = await playwright.chromium.launch(headless=True)
        
        # Clean up
        await browser.close()
        await playwright.stop()
        
        return {
            "status": "healthy",
            "playwright": "installed",
            "browsers": "available",
            "message": "Playwright browsers are properly installed and working"
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "playwright": "error",
            "browsers": "missing",
            "error": str(e),
            "message": "Playwright browsers are not properly installed. Run: python -m playwright install chromium"
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
        
        # Create request object and get shipping costs
        request = ShippingCostsRequest(**test_request)
        shipping_result = await get_shipping_costs(request)
        
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

@router.post("/debug")
async def debug_shipping_request(request_data: dict):
    """Debug endpoint to see exactly what data is being received"""
    try:
        logger.info(f"🔍 Debug request received: {request_data}")
        
        # Try to parse the request
        try:
            request = ShippingCostsRequest(**request_data)
            logger.info(f"✅ Request parsed successfully: {request.dict()}")
            return {
                "status": "success",
                "message": "Request parsed successfully",
                "parsed_data": request.dict(),
                "original_data": request_data
            }
        except Exception as parse_error:
            logger.error(f"❌ Request parsing failed: {parse_error}")
            return {
                "status": "parse_error",
                "error": str(parse_error),
                "error_type": type(parse_error).__name__,
                "original_data": request_data
            }
            
    except Exception as e:
        logger.error(f"❌ Debug endpoint error: {e}")
        return {
            "status": "error",
            "error": str(e),
            "original_data": request_data
        }

def _validate_address(address: str) -> str:
    """Validate address field - no hardcoded fallbacks"""
    if not address:
        raise ValueError("Address is required")
    
    # Check if address looks like an email (contains @)
    if "@" in address and "." in address:
        raise ValueError("Address field contains email instead of street address")
    
    # Check if address is too short to be a real address
    if len(address.strip()) < 5:
        raise ValueError("Address is too short to be valid")
    
    return address

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(router, host="0.0.0.0", port=8000)
