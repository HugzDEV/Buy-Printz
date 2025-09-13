#!/usr/bin/env python3
"""
B2Sign API Endpoint
Production-ready API for B2Sign shipping cost integration
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from b2sign_playwright_integration import B2SignPlaywrightIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="B2Sign Integration API",
    description="API for extracting shipping costs from B2Sign.com",
    version="1.0.0"
)

# Global B2Sign integration instance
b2sign_integration = None

class Dimensions(BaseModel):
    width: float = Field(..., description="Width in feet", example=3.0)
    height: float = Field(..., description="Height in feet", example=6.0)

class PrintOptions(BaseModel):
    sides: int = Field(default=2, description="Number of sides to print", example=2)
    pole_pockets: str = Field(default="No Pole Pockets", description="Pole pocket configuration")
    hem: str = Field(default="All Sides", description="Hem configuration")
    grommets: str = Field(default="Every 2' All Sides", description="Grommet configuration")

class CustomerInfo(BaseModel):
    zipCode: str = Field(..., description="Customer zip code", example="90210")
    name: str = Field(..., description="Customer name")
    company: Optional[str] = Field(default=None, description="Company name")
    phone: str = Field(..., description="Phone number")
    address: str = Field(..., description="Street address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")

class BannerOrderRequest(BaseModel):
    product_type: str = Field(default="banner", description="Product type")
    material: str = Field(default="13oz-vinyl", description="Banner material type")
    dimensions: Dimensions = Field(..., description="Banner dimensions")
    quantity: int = Field(default=1, description="Quantity", example=1)
    print_options: PrintOptions = Field(default_factory=PrintOptions, description="Print options")
    customer_info: CustomerInfo = Field(..., description="Customer information")

class TentOrderRequest(BaseModel):
    product_type: str = Field(default="tent", description="Product type")
    tent_size: str = Field(default="10x10", description="Tent size", example="10x10")
    quantity: int = Field(default=1, description="Quantity", example=1)
    design_option: str = Field(default="canopy-only", description="Design option")
    customer_info: CustomerInfo = Field(..., description="Customer information")

class ShippingOption(BaseModel):
    name: str = Field(..., description="Shipping method name")
    type: str = Field(..., description="Shipping type (standard, expedited, overnight)")
    cost: str = Field(..., description="Shipping cost")
    estimated_days: int = Field(..., description="Estimated delivery days")
    delivery_date: Optional[str] = Field(None, description="Expected delivery date")
    description: str = Field(..., description="Full description")

class ShippingResponse(BaseModel):
    success: bool = Field(..., description="Whether the request was successful")
    shipping_options: List[ShippingOption] = Field(..., description="Available shipping options")
    b2sign_product_url: Optional[str] = Field(None, description="B2Sign product page URL")
    extracted_at: str = Field(..., description="Timestamp when data was extracted")
    errors: List[str] = Field(default_factory=list, description="Any errors encountered")

@app.on_event("startup")
async def startup_event():
    """Initialize B2Sign integration on startup"""
    global b2sign_integration
    try:
        logger.info("🚀 Initializing B2Sign integration...")
        b2sign_integration = B2SignPlaywrightIntegration()
        await b2sign_integration.initialize()
        await b2sign_integration.login()
        logger.info("✅ B2Sign integration initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize B2Sign integration: {e}")
        b2sign_integration = None

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup B2Sign integration on shutdown"""
    global b2sign_integration
    if b2sign_integration:
        try:
            await b2sign_integration.cleanup()
            logger.info("✅ B2Sign integration cleaned up")
        except Exception as e:
            logger.error(f"❌ Error during cleanup: {e}")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "B2Sign Integration API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "banner_shipping": "/api/v1/banner/shipping",
            "tent_shipping": "/api/v1/tent/shipping",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global b2sign_integration
    return {
        "status": "healthy" if b2sign_integration else "unhealthy",
        "b2sign_integration": "initialized" if b2sign_integration else "not_initialized",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/banner/shipping", response_model=ShippingResponse)
async def get_banner_shipping_costs(request: BannerOrderRequest):
    """
    Get shipping costs for banner products
    
    This endpoint creates a mock order on B2Sign with the customer's specifications
    and extracts all available shipping options.
    """
    global b2sign_integration
    
    if not b2sign_integration:
        raise HTTPException(
            status_code=503, 
            detail="B2Sign integration not initialized"
        )
    
    try:
        logger.info(f"🚚 Processing banner shipping request for {request.material}")
        
        # Convert request to order data format
        order_data = {
            "product_type": request.product_type,
            "material": request.material,
            "dimensions": {
                "width": request.dimensions.width,
                "height": request.dimensions.height
            },
            "quantity": request.quantity,
            "print_options": {
                "sides": request.print_options.sides,
                "pole_pockets": request.print_options.pole_pockets,
                "hem": request.print_options.hem,
                "grommets": request.print_options.grommets
            },
            "customer_info": {
                "zipCode": request.customer_info.zipCode,
                "name": request.customer_info.name,
                "company": request.customer_info.company,
                "phone": request.customer_info.phone,
                "address": request.customer_info.address,
                "city": request.customer_info.city,
                "state": request.customer_info.state
            }
        }
        
        # Get shipping costs using the complete banner workflow
        result = await b2sign_integration.get_banner_shipping_costs(order_data)
        
        if result["success"]:
            # Convert shipping options to response format
            shipping_options = []
            for option in result["shipping_options"]:
                shipping_options.append(ShippingOption(
                    name=option["name"],
                    type=option["type"],
                    cost=option["cost"],
                    estimated_days=option["estimated_days"],
                    delivery_date=option.get("delivery_date"),
                    description=option["description"]
                ))
            
            return ShippingResponse(
                success=True,
                shipping_options=shipping_options,
                b2sign_product_url=result.get("b2sign_product_url"),
                extracted_at=result["extracted_at"],
                errors=[]
            )
        else:
            return ShippingResponse(
                success=False,
                shipping_options=[],
                extracted_at=datetime.now().isoformat(),
                errors=result["errors"]
            )
            
    except Exception as e:
        logger.error(f"❌ Error processing banner shipping request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/v1/tent/shipping", response_model=ShippingResponse)
async def get_tent_shipping_costs(request: TentOrderRequest):
    """
    Get shipping costs for tent products
    
    This endpoint creates a mock order on B2Sign with the customer's specifications
    and extracts all available shipping options.
    """
    global b2sign_integration
    
    if not b2sign_integration:
        raise HTTPException(
            status_code=503, 
            detail="B2Sign integration not initialized"
        )
    
    try:
        logger.info(f"🚚 Processing tent shipping request for {request.tent_size}")
        
        # Convert request to order data format
        order_data = {
            "product_type": request.product_type,
            "tent_size": request.tent_size,
            "quantity": request.quantity,
            "print_options": {
                "tent_design_option": request.design_option
            },
            "customer_info": {
                "zipCode": request.customer_info.zipCode,
                "name": request.customer_info.name,
                "company": request.customer_info.company,
                "phone": request.customer_info.phone,
                "address": request.customer_info.address,
                "city": request.customer_info.city,
                "state": request.customer_info.state
            }
        }
        
        # Get shipping costs using tent workflow
        result = await b2sign_integration.get_tent_shipping_costs(order_data)
        
        if result["success"]:
            # Convert shipping options to response format
            shipping_options = []
            for option in result["shipping_options"]:
                shipping_options.append(ShippingOption(
                    name=option["name"],
                    type=option["type"],
                    cost=option["cost"],
                    estimated_days=option["estimated_days"],
                    delivery_date=option.get("delivery_date"),
                    description=option["description"]
                ))
            
            return ShippingResponse(
                success=True,
                shipping_options=shipping_options,
                b2sign_product_url=result.get("b2sign_product_url"),
                extracted_at=result["extracted_at"],
                errors=[]
            )
        else:
            return ShippingResponse(
                success=False,
                shipping_options=[],
                extracted_at=datetime.now().isoformat(),
                errors=result["errors"]
            )
            
    except Exception as e:
        logger.error(f"❌ Error processing tent shipping request: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/v1/materials")
async def get_available_materials():
    """Get list of available banner materials"""
    return {
        "banner_materials": [
            {"id": "13oz-vinyl", "name": "13oz Vinyl Banner", "url": "https://www.b2sign.com/13oz-vinyl-banner"},
            {"id": "fabric-9oz", "name": "9oz Fabric Banner", "url": "https://www.b2sign.com/fabric-banner-9oz-wrinkle-free"},
            {"id": "mesh", "name": "Mesh Banner", "url": "https://www.b2sign.com/mesh-banners"},
            {"id": "backlit", "name": "Backlit Banner", "url": "https://www.b2sign.com/vinyl-banner-backlit"},
            {"id": "blockout", "name": "Blockout Banner", "url": "https://www.b2sign.com/vinyl-banner-18oz-blockout"},
            {"id": "indoor", "name": "Indoor Banner", "url": "https://www.b2sign.com/super-smooth-indoor-banner"},
            {"id": "pole", "name": "Pole Banner", "url": "https://www.b2sign.com/pole-banner-set"},
            {"id": "hand", "name": "Hand Banner", "url": "https://www.b2sign.com/hand-banner"}
        ],
        "tent_sizes": [
            {"id": "10x10", "name": "10x10 Custom Event Tent"},
            {"id": "10x15", "name": "10x15 Custom Event Tent"},
            {"id": "10x20", "name": "10x20 Custom Event Tent"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
