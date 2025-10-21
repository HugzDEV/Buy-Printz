"""
Sticker Pricing API
Handles sticker product pricing, specifications, and order management
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from decimal import Decimal
import json
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

router = APIRouter(prefix="/api/stickers", tags=["stickers"])

# Pydantic models
class StickerPricingRequest(BaseModel):
    quantity: int
    material_code: str
    finish_code: str
    shape_code: str
    size_code: str

class StickerPricingResponse(BaseModel):
    base_price: float
    material_surcharge: float
    finish_surcharge: float
    shape_surcharge: float
    size_surcharge: float
    subtotal: float
    tax_amount: float
    total_amount: float

class StickerProductDetails(BaseModel):
    product_code: str
    product_name: str
    category: str
    base_price: float
    materials: List[Dict[str, Any]]
    finishes: List[Dict[str, Any]]
    shapes: List[Dict[str, Any]]
    sizes: List[Dict[str, Any]]
    quantity_tiers: List[Dict[str, Any]]

class StickerOrderRequest(BaseModel):
    order_id: str
    user_id: str
    product_code: str
    material_code: str
    finish_code: str
    shape_code: str
    size_code: str
    orientation: str = "landscape"
    quantity: int
    canvas_data: Dict[str, Any]
    surface_elements: Dict[str, Any]
    marketplace_templates: List[Dict[str, Any]] = []
    job_name: Optional[str] = None
    special_instructions: Optional[str] = None

@router.get("/products", response_model=List[StickerProductDetails])
async def get_sticker_products():
    """Get all available sticker products with their specifications"""
    try:
        result = supabase.rpc('get_sticker_product_details').execute()
        
        if result.data:
            return result.data
        else:
            return []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sticker products: {str(e)}")

@router.post("/pricing", response_model=StickerPricingResponse)
async def calculate_sticker_pricing(request: StickerPricingRequest):
    """Calculate pricing for sticker order"""
    try:
        # Call the pricing function
        result = supabase.rpc('calculate_sticker_price', {
            'p_quantity': request.quantity,
            'p_material_code': request.material_code,
            'p_finish_code': request.finish_code,
            'p_shape_code': request.shape_code,
            'p_size_code': request.size_code
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Invalid pricing parameters")
        
        pricing_data = result.data[0]
        
        # Calculate tax (6.25% for Massachusetts)
        tax_rate = 0.0625
        tax_amount = float(pricing_data['subtotal']) * tax_rate
        
        # Calculate total
        total_amount = float(pricing_data['subtotal']) + tax_amount
        
        return StickerPricingResponse(
            base_price=float(pricing_data['base_price']),
            material_surcharge=float(pricing_data['material_surcharge']),
            finish_surcharge=float(pricing_data['finish_surcharge']),
            shape_surcharge=float(pricing_data['shape_surcharge']),
            size_surcharge=float(pricing_data['size_surcharge']),
            subtotal=float(pricing_data['subtotal']),
            tax_amount=tax_amount,
            total_amount=total_amount
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate pricing: {str(e)}")

@router.post("/orders")
async def create_sticker_order(request: StickerOrderRequest):
    """Create a new sticker order"""
    try:
        # Calculate pricing first
        pricing_result = supabase.rpc('calculate_sticker_price', {
            'p_quantity': request.quantity,
            'p_material_code': request.material_code,
            'p_finish_code': request.finish_code,
            'p_shape_code': request.shape_code,
            'p_size_code': request.size_code
        }).execute()
        
        if not pricing_result.data:
            raise HTTPException(status_code=400, detail="Invalid pricing parameters")
        
        pricing_data = pricing_result.data[0]
        tax_rate = 0.0625
        tax_amount = float(pricing_data['subtotal']) * tax_rate
        total_amount = float(pricing_data['subtotal']) + tax_amount
        
        # Create sticker order record
        sticker_order_data = {
            'order_id': request.order_id,
            'user_id': request.user_id,
            'product_code': request.product_code,
            'material_code': request.material_code,
            'finish_code': request.finish_code,
            'shape_code': request.shape_code,
            'size_code': request.size_code,
            'orientation': request.orientation,
            'quantity': request.quantity,
            'base_price': float(pricing_data['base_price']),
            'material_surcharge': float(pricing_data['material_surcharge']),
            'finish_surcharge': float(pricing_data['finish_surcharge']),
            'shape_surcharge': float(pricing_data['shape_surcharge']),
            'size_surcharge': float(pricing_data['size_surcharge']),
            'subtotal': float(pricing_data['subtotal']),
            'tax_amount': tax_amount,
            'shipping_cost': 0.00,  # Will be updated when shipping is calculated
            'total_amount': total_amount,
            'canvas_data': request.canvas_data,
            'surface_elements': request.surface_elements,
            'marketplace_templates': request.marketplace_templates,
            'job_name': request.job_name,
            'special_instructions': request.special_instructions
        }
        
        result = supabase.table('sticker_orders').insert(sticker_order_data).execute()
        
        if result.data:
            return {
                "success": True,
                "sticker_order_id": result.data[0]['id'],
                "pricing": {
                    "base_price": float(pricing_data['base_price']),
                    "material_surcharge": float(pricing_data['material_surcharge']),
                    "finish_surcharge": float(pricing_data['finish_surcharge']),
                    "shape_surcharge": float(pricing_data['shape_surcharge']),
                    "size_surcharge": float(pricing_data['size_surcharge']),
                    "subtotal": float(pricing_data['subtotal']),
                    "tax_amount": tax_amount,
                    "total_amount": total_amount
                }
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create sticker order")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create sticker order: {str(e)}")

@router.get("/orders/{order_id}")
async def get_sticker_order(order_id: str):
    """Get sticker order details"""
    try:
        result = supabase.table('sticker_orders').select('*').eq('order_id', order_id).execute()
        
        if result.data:
            return result.data[0]
        else:
            raise HTTPException(status_code=404, detail="Sticker order not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sticker order: {str(e)}")

@router.put("/orders/{order_id}/status")
async def update_sticker_order_status(order_id: str, status: str):
    """Update sticker order status"""
    try:
        valid_statuses = ['pending', 'designing', 'ready_for_production', 'in_production', 'completed', 'shipped', 'cancelled']
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        result = supabase.table('sticker_orders').update({'status': status}).eq('order_id', order_id).execute()
        
        if result.data:
            return {"success": True, "status": status}
        else:
            raise HTTPException(status_code=404, detail="Sticker order not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update sticker order status: {str(e)}")

@router.get("/materials")
async def get_sticker_materials():
    """Get all available sticker materials"""
    try:
        result = supabase.table('sticker_materials').select('*').eq('is_active', True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch materials: {str(e)}")

@router.get("/finishes")
async def get_sticker_finishes():
    """Get all available sticker finishes"""
    try:
        result = supabase.table('sticker_finishes').select('*').eq('is_active', True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch finishes: {str(e)}")

@router.get("/shapes")
async def get_sticker_shapes():
    """Get all available sticker shapes"""
    try:
        result = supabase.table('sticker_shapes').select('*').eq('is_active', True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch shapes: {str(e)}")

@router.get("/sizes")
async def get_sticker_sizes():
    """Get all available sticker sizes"""
    try:
        result = supabase.table('sticker_sizes').select('*').eq('is_active', True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sizes: {str(e)}")

@router.get("/quantity-tiers")
async def get_sticker_quantity_tiers():
    """Get all available quantity tiers"""
    try:
        result = supabase.table('sticker_quantity_tiers').select('*').eq('is_active', True).order('quantity').execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quantity tiers: {str(e)}")
