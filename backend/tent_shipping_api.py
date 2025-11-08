#!/usr/bin/env python3
"""
Tent Shipping API
Handles shipping costs for Tent orders using UPS API
"""

import logging
import json
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

from backend.ups_shipping_service import ups_shipping_service

# Setup logging
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(prefix="/api/tents/shipping", tags=["tent-shipping"])

# Pydantic models
class TentShippingRequest(BaseModel):
    """Request model for Tent shipping costs"""
    tentSize: Optional[str] = None
    tentPackage: Optional[str] = None
    quantity: int
    selectedAccessories: Optional[List[str]] = None
    customer_info: Dict[str, Any]
    
    class Config:
        extra = "allow"

class TentShippingResponse(BaseModel):
    """Response model for Tent shipping costs"""
    success: bool
    shipping_options: List[Dict[str, Any]]
    carrier: str
    timestamp: str
    errors: Optional[List[str]] = None

@router.post("/get-rates", response_model=TentShippingResponse)
async def get_tent_shipping_rates(request: TentShippingRequest):
    """
    Get UPS shipping rates for Tent orders
    
    Args:
        request: Tent shipping request with order details and customer info
        
    Returns:
        Shipping rates from UPS API
    """
    try:
        logger.info(f"🚚 Getting Tent shipping rates for {request.quantity} tent(s) to {request.customer_info.get('zipCode', 'unknown zip')}")
        
        # Validate required fields
        if not request.customer_info.get('zipCode'):
            raise HTTPException(status_code=400, detail="Zip code is required for shipping rates")
        
        if not request.customer_info.get('address'):
            raise HTTPException(status_code=400, detail="Address is required for shipping rates")
        
        if not request.customer_info.get('city'):
            raise HTTPException(status_code=400, detail="City is required for shipping rates")
        
        if not request.customer_info.get('state'):
            raise HTTPException(status_code=400, detail="State is required for shipping rates")
        
        # Prepare order data for UPS
        # Tents are large and heavy - calculate dimensions based on tent size
        tent_size = request.tentSize or '10x10'
        tent_dimensions = _calculate_tent_dimensions(tent_size)
        
        order_data = {
            'total_quantity': request.quantity,
            'product_type': 'tent',
            'tent_size': tent_size,
            'tent_package': request.tentPackage or 'canopy-graphic-only',
            'accessories': request.selectedAccessories or [],
            'dimensions': tent_dimensions
        }
        
        # Get UPS shipping rates - using multiple services method
        result = await ups_shipping_service.get_multiple_service_rates(order_data, request.customer_info)
        
        if result['success']:
            logger.info(f"✅ Successfully retrieved {len(result['shipping_options'])} UPS shipping options")
            return TentShippingResponse(**result)
        else:
            logger.error(f"❌ Failed to get UPS shipping rates: {result.get('errors', [])}")
            raise HTTPException(status_code=500, detail=f"Failed to get shipping rates: {', '.join(result.get('errors', ['Unknown error']))}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting Tent shipping rates: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

def _calculate_tent_dimensions(tent_size: str) -> Dict[str, float]:
    """Calculate tent package dimensions based on tent size"""
    # Tent sizes are typically 10x10, 10x20, 20x20, etc.
    # For shipping, we need to calculate the package dimensions
    # Tents are typically folded and shipped in boxes
    
    # Parse tent size (e.g., "10x10" -> 10x10 feet)
    try:
        parts = tent_size.lower().replace('x', ' ').split()
        if len(parts) >= 2:
            width_ft = float(parts[0])
            height_ft = float(parts[1])
        else:
            # Default to 10x10 if parsing fails
            width_ft = 10.0
            height_ft = 10.0
    except:
        width_ft = 10.0
        height_ft = 10.0
    
    # Tent packages are typically:
    # - Canopy graphic only: Smaller box (24" x 24" x 6")
    # - Complete tent: Larger box (36" x 36" x 12")
    # For now, use average dimensions for tent packages
    # These are approximate - actual dimensions may vary
    
    if width_ft <= 10 and height_ft <= 10:
        # Small tent (10x10)
        return {
            'width': 24.0,  # inches
            'height': 24.0,  # inches
            'length': 6.0   # inches (depth)
        }
    elif width_ft <= 20 and height_ft <= 20:
        # Medium tent (10x20, 20x20)
        return {
            'width': 36.0,  # inches
            'height': 36.0,  # inches
            'length': 12.0  # inches (depth)
        }
    else:
        # Large tent (20x30, etc.)
        return {
            'width': 48.0,  # inches
            'height': 48.0,  # inches
            'length': 18.0  # inches (depth)
        }

@router.get("/health")
async def health_check():
    """Health check for Tent shipping service"""
    try:
        # Check if UPS credentials are configured
        has_credentials = all([
            ups_shipping_service.client_id,
            ups_shipping_service.client_secret,
            ups_shipping_service.shipper_number
        ])
        
        return {
            "status": "healthy" if has_credentials else "unhealthy",
            "service": "tent-shipping",
            "carrier": "UPS",
            "credentials_configured": has_credentials,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "tent-shipping",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test")
async def test_ups_integration():
    """Test UPS integration with sample data"""
    try:
        logger.info("🧪 Testing UPS integration for Tents...")
        
        # Sample order data
        test_order_data = {
            'total_quantity': 1,
            'product_type': 'tent',
            'tent_size': '10x10',
            'tent_package': 'canopy-graphic-only',
            'accessories': [],
            'dimensions': {'width': 24.0, 'height': 24.0, 'length': 6.0}
        }
        
        # Sample customer info
        test_customer_info = {
            'name': 'Test Customer',
            'email': 'test@example.com',
            'phone': '555-123-4567',
            'address': '123 Test Street',
            'city': 'Boston',
            'state': 'MA',
            'zipCode': '02101'
        }
        
        # Test UPS integration with single service first
        result = await ups_shipping_service.get_single_service_rate(test_order_data, test_customer_info)
        
        if result['success']:
            logger.info(f"✅ UPS integration test successful: {len(result['shipping_options'])} options")
            return {
                "success": True,
                "message": "UPS integration test successful",
                "shipping_options_count": len(result['shipping_options']),
                "shipping_options": result['shipping_options'],
                "timestamp": datetime.now().isoformat()
            }
        else:
            logger.error(f"❌ UPS integration test failed: {result.get('errors', [])}")
            return {
                "success": False,
                "message": "UPS integration test failed",
                "errors": result.get('errors', []),
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"❌ UPS integration test error: {e}")
        return {
            "success": False,
            "message": f"UPS integration test error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

