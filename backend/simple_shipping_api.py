#!/usr/bin/env python3
"""
Simple Shipping API (without B2Sign dependencies)
This provides basic shipping endpoints when B2Sign integration is not available.
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime

# Setup logging
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(prefix="/api/shipping", tags=["shipping"])

# Pydantic models for API requests/responses
class ShippingQuoteRequest(BaseModel):
    product_type: str
    material: Optional[str] = None
    dimensions: Optional[Dict[str, float]] = None
    quantity: int = 1
    print_options: Optional[Dict[str, Any]] = {}
    accessories: Optional[List[str]] = []
    customer_info: Optional[Dict[str, Any]] = {}
    zip_code: str
    job_name: Optional[str] = None

class ShippingQuoteResponse(BaseModel):
    success: bool
    shipping_options: List[Dict[str, Any]]
    total_shipping_cost: Optional[str] = None
    estimated_delivery: Optional[str] = None
    errors: List[str]
    message: Optional[str] = None

@router.post("/quote", response_model=ShippingQuoteResponse)
async def get_shipping_quote(request: ShippingQuoteRequest):
    """Get shipping quote (placeholder when B2Sign is not available)"""
    try:
        logger.info(f"🚚 Getting shipping quote for {request.product_type} to {request.zip_code}")
        
        # Validate required fields
        if not request.zip_code:
            raise HTTPException(status_code=400, detail="Zip code is required for shipping quotes")
        
        if not request.product_type:
            raise HTTPException(status_code=400, detail="Product type is required")
        
        # Return placeholder shipping options
        # NOTE: These are NOT real costs - manual handling required
        placeholder_options = [
            {
                "name": "Standard Shipping (5-7 days)",
                "type": "standard",
                "cost": "Contact for Quote",
                "estimated_days": 5,
                "description": "Standard ground shipping - manual quote required"
            },
            {
                "name": "Express Shipping (2-3 days)",
                "type": "expedited", 
                "cost": "Contact for Quote",
                "estimated_days": 2,
                "description": "Express shipping - manual quote required"
            },
            {
                "name": "Overnight Shipping (1 day)",
                "type": "overnight",
                "cost": "Contact for Quote", 
                "estimated_days": 1,
                "description": "Overnight delivery - manual quote required"
            }
        ]
        
        response = ShippingQuoteResponse(
            success=True,
            shipping_options=placeholder_options,
            total_shipping_cost="Contact for Quote",
            estimated_delivery="5-7 business days",
            errors=[],
            message="B2Sign integration not available - manual shipping quotes required"
        )
        
        logger.info(f"⚠️ Placeholder shipping quote provided - manual handling required")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error getting shipping quote: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check for shipping system"""
    return {
        "status": "healthy",
        "mode": "placeholder",
        "b2sign_available": False,
        "message": "B2Sign integration not available - manual shipping quotes required",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/test")
async def test_shipping():
    """Test endpoint for shipping system"""
    return {
        "success": True,
        "message": "Simple shipping API is working (B2Sign integration not available)",
        "timestamp": datetime.now().isoformat()
    }
