from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import logging
from shipping_service import ShippingService

logger = logging.getLogger(__name__)

# Initialize shipping service
shipping_service = ShippingService()

# Create router
router = APIRouter(prefix="/api/shipping", tags=["shipping"])

# Pydantic models
class ProductDetails(BaseModel):
    width: Optional[float] = None
    height: Optional[float] = None
    material: Optional[str] = None
    quantity: Optional[int] = None
    zip_code: Optional[str] = None
    weight: Optional[float] = None
    product_type: Optional[str] = None
    dimensions: Optional[str] = None

class ShippingQuoteRequest(BaseModel):
    product_details: ProductDetails
    partner_id: Optional[str] = "b2sign"

class UpdateSiteMapRequest(BaseModel):
    partner_id: str

@router.post("/quote")
async def get_shipping_quote(request: ShippingQuoteRequest):
    """
    Get shipping quote from specified print partner.
    """
    try:
        # Convert Pydantic model to dict
        product_details = request.product_details.dict()
        
        # Remove None values
        product_details = {k: v for k, v in product_details.items() if v is not None}
        
        if not product_details:
            raise HTTPException(status_code=400, detail="No product details provided")
        
        # Get shipping quote
        result = shipping_service.get_shipping_quote(
            product_details, 
            request.partner_id
        )
        
        if result.get('success'):
            return {
                "success": True,
                "shipping_cost": result.get('shipping_cost'),
                "partner_id": result.get('partner_id'),
                "partner_name": result.get('partner_name'),
                "timestamp": result.get('timestamp'),
                "raw_data": result.get('raw_text', ''),
                "method": result.get('method', 'unknown')
            }
        else:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to get shipping quote: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        logger.error(f"Shipping quote API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/quote/all")
async def get_all_partner_quotes(request: ShippingQuoteRequest):
    """
    Get shipping quotes from all available print partners.
    """
    try:
        # Convert Pydantic model to dict
        product_details = request.product_details.dict()
        
        # Remove None values
        product_details = {k: v for k, v in product_details.items() if v is not None}
        
        if not product_details:
            raise HTTPException(status_code=400, detail="No product details provided")
        
        # Get quotes from all partners
        result = shipping_service.get_all_partner_quotes(product_details)
        
        return result
        
    except Exception as e:
        logger.error(f"All partner quotes API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sitemap/update")
async def update_site_map(request: UpdateSiteMapRequest, background_tasks: BackgroundTasks):
    """
    Update site map for a print partner (background task).
    """
    try:
        # Add to background tasks to avoid timeout
        background_tasks.add_task(
            shipping_service.update_site_map,
            request.partner_id
        )
        
        return {
            "success": True,
            "message": f"Site map update initiated for partner {request.partner_id}",
            "status": "processing"
        }
        
    except Exception as e:
        logger.error(f"Site map update API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/partners/status")
async def get_partner_status():
    """
    Get status of all print partners.
    """
    try:
        result = shipping_service.get_all_partner_status()
        return result
        
    except Exception as e:
        logger.error(f"Partner status API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/partners/{partner_id}/status")
async def get_single_partner_status(partner_id: str):
    """
    Get status of a specific print partner.
    """
    try:
        result = shipping_service.get_partner_status(partner_id)
        
        if not result.get('success', True):  # Default to True if no success field
            raise HTTPException(status_code=404, detail=result.get('error'))
        
        return result
        
    except Exception as e:
        logger.error(f"Single partner status API error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """
    Health check endpoint for shipping service.
    """
    try:
        # Check if shipping service is properly initialized
        partner_status = shipping_service.get_all_partner_status()
        
        return {
            "status": "healthy",
            "service": "shipping",
            "partners_configured": len(partner_status.get('partners', {})),
            "timestamp": partner_status.get('timestamp')
        }
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "service": "shipping",
            "error": str(e)
        }

# Example usage endpoints for testing
@router.post("/test/quote")
async def test_shipping_quote():
    """
    Test endpoint with sample product details.
    """
    sample_product = {
        "width": 24,
        "height": 36,
        "material": "vinyl",
        "quantity": 1,
        "zip_code": "10001",
        "product_type": "banner"
    }
    
    try:
        result = shipping_service.get_shipping_quote(sample_product, "b2sign")
        return {
            "test": True,
            "sample_product": sample_product,
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Test quote error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
