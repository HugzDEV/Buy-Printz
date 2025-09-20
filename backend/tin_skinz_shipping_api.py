#!/usr/bin/env python3
"""
Tin Skinz Shipping API
Handles shipping costs for Tin Skinz orders using UPS API
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
router = APIRouter(prefix="/api/tin-skinz/shipping", tags=["tin-skinz-shipping"])

# Pydantic models
class TinSkinzShippingRequest(BaseModel):
    """Request model for Tin Skinz shipping costs"""
    selected_designs: List[Dict[str, Any]]
    total_quantity: int
    customer_info: Dict[str, Any]
    
    class Config:
        extra = "allow"

class TinSkinzShippingResponse(BaseModel):
    """Response model for Tin Skinz shipping costs"""
    success: bool
    shipping_options: List[Dict[str, Any]]
    carrier: str
    timestamp: str
    errors: Optional[List[str]] = None

@router.post("/get-rates", response_model=TinSkinzShippingResponse)
async def get_tin_skinz_shipping_rates(request: TinSkinzShippingRequest):
    """
    Get UPS shipping rates for Tin Skinz orders
    
    Args:
        request: Tin Skinz shipping request with order details and customer info
        
    Returns:
        Shipping rates from UPS API
    """
    try:
        logger.info(f"🚚 Getting Tin Skinz shipping rates for {request.total_quantity} tins to {request.customer_info.get('zipCode', 'unknown zip')}")
        
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
            'total_quantity': request.total_quantity,
            'selected_designs': request.selected_designs,
            'product_type': 'tin-skinz'
        }
        
        # Get UPS shipping rates
        result = await ups_shipping_service.get_multiple_service_rates(order_data, request.customer_info)
        
        if result['success']:
            logger.info(f"✅ Successfully retrieved {len(result['shipping_options'])} UPS shipping options")
            return TinSkinzShippingResponse(**result)
        else:
            logger.error(f"❌ Failed to get UPS shipping rates: {result.get('errors', [])}")
            raise HTTPException(status_code=500, detail=f"Failed to get shipping rates: {', '.join(result.get('errors', ['Unknown error']))}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting Tin Skinz shipping rates: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for Tin Skinz shipping service"""
    try:
        # Check if UPS credentials are configured
        has_credentials = all([
            ups_shipping_service.client_id,
            ups_shipping_service.client_secret,
            ups_shipping_service.shipper_number
        ])
        
        return {
            "status": "healthy" if has_credentials else "unhealthy",
            "service": "tin-skinz-shipping",
            "carrier": "UPS",
            "credentials_configured": has_credentials,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "tin-skinz-shipping",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/ups-callback")
async def ups_webhook_callback(request: Request):
    """
    Handle UPS webhook callbacks for shipping updates
    """
    try:
        # Get the raw request body
        body = await request.body()
        
        # Parse the webhook data
        webhook_data = json.loads(body)
        
        logger.info(f"📨 Received UPS webhook: {webhook_data}")
        
        # Handle different webhook types
        webhook_type = webhook_data.get('type', '')
        
        if webhook_type == 'shipping.rate.updated':
            # Handle rate updates
            await handle_shipping_rate_update(webhook_data)
        elif webhook_type == 'shipping.tracking.updated':
            # Handle tracking updates
            await handle_tracking_update(webhook_data)
        else:
            logger.warning(f"Unknown UPS webhook type: {webhook_type}")
        
        return {"status": "success", "message": "Webhook processed"}
        
    except Exception as e:
        logger.error(f"❌ Error processing UPS webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

async def handle_shipping_rate_update(webhook_data: Dict[str, Any]):
    """Handle shipping rate updates from UPS"""
    try:
        # Extract rate information
        rate_data = webhook_data.get('data', {})
        logger.info(f"📊 Processing rate update: {rate_data}")
        
        # Update cached rates or notify relevant orders
        # This could update a database or cache with new rates
        
    except Exception as e:
        logger.error(f"❌ Error handling rate update: {e}")

async def handle_tracking_update(webhook_data: Dict[str, Any]):
    """Handle tracking updates from UPS"""
    try:
        # Extract tracking information
        tracking_data = webhook_data.get('data', {})
        logger.info(f"📦 Processing tracking update: {tracking_data}")
        
        # Update order tracking status in database
        # This could update order status and notify customers
        
    except Exception as e:
        logger.error(f"❌ Error handling tracking update: {e}")

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
        
        logger.info(f"📦 Creating shipment for {order_data.get('total_quantity', 0)} tins...")
        
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

@router.post("/track")
async def track_shipment(request: Request):
    """Track a UPS shipment"""
    try:
        data = await request.json()
        tracking_number = data.get('tracking_number')
        
        if not tracking_number:
            return {
                "success": False,
                "message": "Tracking number is required",
                "errors": ["Missing tracking_number parameter"]
            }
        
        logger.info(f"📦 Tracking shipment: {tracking_number}")
        
        # Track the shipment
        result = await ups_shipping_service.track_shipment(tracking_number)
        
        if result['success']:
            return {
                "success": True,
                "message": "Tracking information retrieved successfully",
                "tracking_info": result.get('tracking_info'),
                "carrier": result.get('carrier'),
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "success": False,
                "message": "Failed to retrieve tracking information",
                "errors": result.get('errors', []),
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"❌ Error tracking shipment: {e}")
        return {
            "success": False,
            "message": "Error tracking shipment",
            "errors": [str(e)],
            "timestamp": datetime.now().isoformat()
        }

@router.post("/test")
async def test_ups_integration():
    """Test UPS integration with sample data"""
    try:
        logger.info("🧪 Testing UPS integration for Tin Skinz...")
        
        # Sample order data
        test_order_data = {
            'total_quantity': 3,
            'selected_designs': [
                {
                    'design_id': 'abstract-1',
                    'design_name': 'Abstract 1',
                    'quantity': 2,
                    'candy_id': 'jordan-almonds',
                    'candy_name': 'Jordan Almonds'
                },
                {
                    'design_id': 'abstract-2',
                    'design_name': 'Abstract 2',
                    'quantity': 1,
                    'candy_id': None,
                    'candy_name': None
                }
            ],
            'product_type': 'tin-skinz'
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
