#!/usr/bin/env python3
"""
Banner Shipping API
Handles shipping costs for Banner orders using UPS API
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
router = APIRouter(prefix="/api/banners/shipping", tags=["banner-shipping"])

# Pydantic models
class BannerShippingRequest(BaseModel):
    """Request model for Banner shipping costs"""
    dimensions: Dict[str, Any]
    quantity: int
    material: Optional[str] = None
    print_options: Optional[Dict[str, Any]] = None
    customer_info: Dict[str, Any]
    
    class Config:
        extra = "allow"

class BannerShippingResponse(BaseModel):
    """Response model for Banner shipping costs"""
    success: bool
    shipping_options: List[Dict[str, Any]]
    carrier: str
    timestamp: str
    errors: Optional[List[str]] = None

@router.post("/get-rates", response_model=BannerShippingResponse)
async def get_banner_shipping_rates(request: BannerShippingRequest):
    """
    Get UPS shipping rates for Banner orders
    
    Args:
        request: Banner shipping request with order details and customer info
        
    Returns:
        Shipping rates from UPS API
    """
    try:
        logger.info(f"🚚 Getting Banner shipping rates for {request.quantity} banner(s) to {request.customer_info.get('zipCode', 'unknown zip')}")
        
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
        order_data = {
            'total_quantity': request.quantity,
            'product_type': 'banner',
            'dimensions': request.dimensions,
            'material': request.material,
            'print_options': request.print_options or {}
        }
        
        # Get UPS shipping rates - using multiple services method
        result = await ups_shipping_service.get_multiple_service_rates(order_data, request.customer_info)
        
        if result['success']:
            logger.info(f"✅ Successfully retrieved {len(result['shipping_options'])} UPS shipping options")
            return BannerShippingResponse(**result)
        else:
            logger.error(f"❌ Failed to get UPS shipping rates: {result.get('errors', [])}")
            raise HTTPException(status_code=500, detail=f"Failed to get shipping rates: {', '.join(result.get('errors', ['Unknown error']))}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting Banner shipping rates: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for Banner shipping service"""
    try:
        # Check if UPS credentials are configured
        has_credentials = all([
            ups_shipping_service.client_id,
            ups_shipping_service.client_secret,
            ups_shipping_service.shipper_number
        ])
        
        return {
            "status": "healthy" if has_credentials else "unhealthy",
            "service": "banner-shipping",
            "carrier": "UPS",
            "credentials_configured": has_credentials,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "banner-shipping",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/create-shipment")
async def create_shipment(request: Request):
    """Create a UPS shipment and get tracking number"""
    try:
        data = await request.json()
        
        # Extract required data
        order_data = data.get('order_data', {})
        customer_info = data.get('customer_info', {})
        service_code = data.get('service_code', '03')  # Default to Ground
        
        if not order_data or not customer_info:
            return {
                "success": False,
                "message": "Order data and customer info are required",
                "errors": ["Missing order_data or customer_info"]
            }
        
        logger.info(f"📦 Creating shipment for {order_data.get('total_quantity', 0)} banner(s)...")
        
        # Create the shipment
        result = await ups_shipping_service.create_shipment(order_data, customer_info, service_code)
        
        if result['success']:
            return {
                "success": True,
                "message": "Shipment created successfully",
                "shipment_info": result.get('shipment_info'),
                "carrier": result.get('carrier'),
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "message": "Failed to create shipment",
                "errors": result.get('errors', []),
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"❌ Error creating shipment: {e}")
        return {
            "success": False,
            "message": "Error creating shipment",
            "errors": [str(e)],
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test")
async def test_ups_integration():
    """Test UPS integration with sample data"""
    try:
        logger.info("🧪 Testing UPS integration for Banners...")
        
        # Sample order data
        test_order_data = {
            'total_quantity': 1,
            'product_type': 'banner',
            'dimensions': {'width': 3.0, 'height': 6.0},
            'material': '13oz-vinyl',
            'print_options': {
                'sides': 2,
                'grommets': 'every-2ft-all-sides'
            }
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

