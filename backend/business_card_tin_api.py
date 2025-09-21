"""
Business Card Tin API
Handles business card tin orders with candy selection and volume discounts
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from decimal import Decimal
import uuid
from datetime import datetime
import logging

from .database import db_manager
from .auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/business-card-tin", tags=["business-card-tin"])

# Pydantic models
class CandyOption(BaseModel):
    id: str
    name: str
    base_price: float
    category: Optional[str] = None
    is_available: bool = True

class CandyVolumeDiscount(BaseModel):
    min_quantity: int
    max_quantity: Optional[int] = None
    discount_percentage: float
    description: Optional[str] = None

class BusinessCardTinVolumeDiscount(BaseModel):
    quantity: int
    base_price: float
    tin_finish_modifier: float = 0.0
    printing_method_modifier: float = 0.0
    surface_coverage_modifier: float = 0.0
    description: Optional[str] = None

class BusinessCardTinOrderRequest(BaseModel):
    # Tin Configuration
    quantity: int = Field(..., description="Must be 100, 250, or 500 units")
    tin_finish: str = Field(..., pattern="^(silver|black|gold)$")
    printing_method: str = Field(..., pattern="^(premium-vinyl|premium-clear-vinyl)$")
    surface_coverage: str = Field(..., pattern="^(front-back|all-sides)$")
    job_name: Optional[str] = None
    
    # Candy Selection
    candy_id: Optional[str] = None
    candy_quantity: int = Field(0, ge=0)
    
    # Custom Message
    custom_message: Optional[str] = None
    
    # Customer Information
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    billing_address: Dict[str, Any]
    shipping_address: Dict[str, Any]
    
    # Shipping Information
    shipping_method: Optional[str] = None
    shipping_service_code: Optional[str] = None

class BusinessCardTinOrderResponse(BaseModel):
    success: bool
    order_id: str
    order_number: str
    total_amount: float
    message: str

class BusinessCardTinPricingRequest(BaseModel):
    quantity: int = Field(..., description="Must be 100, 250, or 500 units")
    tin_finish: str = Field(..., pattern="^(silver|black|gold)$")
    printing_method: str = Field(..., pattern="^(premium-vinyl|premium-clear-vinyl)$")
    surface_coverage: str = Field(..., pattern="^(front-back|all-sides)$")
    candy_id: Optional[str] = None
    candy_quantity: int = Field(0, ge=0)
    custom_message: Optional[str] = None

class BusinessCardTinPricingResponse(BaseModel):
    success: bool
    pricing: Dict[str, Any]
    message: str

# Helper functions
def get_candy_pricing(candy_id: str, quantity: int) -> Dict[str, Any]:
    """Calculate candy pricing with volume discounts"""
    if not candy_id or quantity == 0:
        return {
            "unit_price": 0.0,
            "total_price": 0.0,
            "discount_percentage": 0.0,
            "original_price": 0.0
        }
    
    # This would typically query the database for candy options and discounts
    # For now, using the same logic as TinSkinzMarketplace
    candy_options = {
        'strawberry-hard-candy': {'name': 'Strawberry Filled Hard Candy', 'price': 0.66},
        'candy-blocks': {'name': 'Candy Blocks', 'price': 0.83},
        'jolly-ranchers': {'name': 'Jolly Ranchers', 'price': 0.83},
        'jawbreakers': {'name': 'Jawbreakers', 'price': 0.95},
        'peppermint-star-lights': {'name': 'Peppermint Star Lights', 'price': 0.66},
        'soft-peppermint-puffs': {'name': 'Soft Peppermint Puffs', 'price': 0.87},
        'cream-savers-strawberry': {'name': 'Cream Savers Strawberry', 'price': 1.32},
        'fruit-flavored-buttons': {'name': 'Fruit Flavored Buttons', 'price': 0.66},
        'werthers-original': {'name': "Werther's Original Hard Candy", 'price': 2.15},
        'hopes-coffee': {'name': "Hope's Coffee", 'price': 2.40},
        'assorted-starlights': {'name': 'Assorted Starlights', 'price': 0.66},
        'sour-lemon-balls': {'name': 'Sour Lemon Balls', 'price': 1.20},
        'spearmint-balls': {'name': 'Spearmint Balls', 'price': 0.66},
        'fruit-barrels': {'name': 'Fruit Barrels', 'price': 0.66},
        'bananarama': {'name': 'Bananarama', 'price': 0.92},
        'hersheys': {'name': "Hershey's", 'price': 1.65},
        'jordan-almonds': {'name': 'Jordan Almonds', 'price': 2.25},
        'blue-mms': {'name': 'Blue M&Ms', 'price': 3.00},
        'hersheys-kisses-pink': {'name': "Hershey's Kisses Pink", 'price': 3.00},
        'pink-mms': {'name': 'Pink M&Ms', 'price': 3.00}
    }
    
    candy_discount_tiers = [
        {'min': 1, 'max': 19, 'discount': 0.0},
        {'min': 20, 'max': 49, 'discount': 0.10},
        {'min': 50, 'max': 74, 'discount': 0.15},
        {'min': 75, 'max': 99, 'discount': 0.175},
        {'min': 100, 'max': 149, 'discount': 0.20},
        {'min': 150, 'max': 499, 'discount': 0.225},
        {'min': 500, 'max': 1000, 'discount': 0.30}
    ]
    
    if candy_id not in candy_options:
        return {
            "unit_price": 0.0,
            "total_price": 0.0,
            "discount_percentage": 0.0,
            "original_price": 0.0
        }
    
    candy = candy_options[candy_id]
    original_price = candy['price']
    
    # Find discount tier
    discount = 0.0
    for tier in candy_discount_tiers:
        if quantity >= tier['min'] and (tier['max'] is None or quantity <= tier['max']):
            discount = tier['discount']
            break
    
    unit_price = original_price * (1 - discount)
    total_price = unit_price * quantity
    
    return {
        "unit_price": round(unit_price, 2),
        "total_price": round(total_price, 2),
        "discount_percentage": round(discount * 100, 1),
        "original_price": original_price
    }

def get_business_card_tin_pricing(quantity: int, tin_finish: str, printing_method: str, surface_coverage: str) -> Dict[str, Any]:
    """Calculate business card tin pricing based on volume discounts"""
    
    # Volume discount tiers for business card tins (only 100, 250, 500 units supported)
    volume_discounts = {
        100: {'base_price': 399.99, 'description': '100 Units - Standard Pack'},
        250: {'base_price': 749.99, 'description': '250 Units - Medium Pack'},
        500: {'base_price': 1000.00, 'description': '500 Units - Large Pack'}
    }
    
    # Validate quantity is one of the supported tiers
    if quantity not in volume_discounts:
        raise ValueError(f"Invalid quantity: {quantity}. Only 100, 250, and 500 units are supported.")
    
    # Get pricing for the exact quantity
    base_price = volume_discounts[quantity]['base_price']
    description = volume_discounts[quantity]['description']
    
    # Calculate modifiers
    tin_finish_modifiers = {
        'silver': 0.0,
        'black': 0.25,
        'gold': 0.50
    }
    
    printing_method_modifiers = {
        'premium-vinyl': 0.0,
        'premium-clear-vinyl': 25.0
    }
    
    surface_coverage_modifiers = {
        'front-back': 0.0,
        'all-sides': 100.0
    }
    
    tin_finish_modifier = tin_finish_modifiers.get(tin_finish, 0.0) * quantity
    printing_method_modifier = printing_method_modifiers.get(printing_method, 0.0)
    surface_coverage_modifier = surface_coverage_modifiers.get(surface_coverage, 0.0)
    
    # Calculate subtotal
    subtotal = base_price + tin_finish_modifier + printing_method_modifier + surface_coverage_modifier
    
    return {
        "base_price": base_price,
        "tin_finish_modifier": tin_finish_modifier,
        "printing_method_modifier": printing_method_modifier,
        "surface_coverage_modifier": surface_coverage_modifier,
        "subtotal": round(subtotal, 2),
        "description": description
    }

# API Endpoints
@router.get("/candy-options", response_model=List[CandyOption])
async def get_candy_options():
    """Get all available candy options"""
    try:
        # This would typically query the database
        # For now, returning the same options as TinSkinzMarketplace
        candy_options = [
            CandyOption(id='strawberry-hard-candy', name='Strawberry Filled Hard Candy', base_price=0.66, category='hard-candy'),
            CandyOption(id='candy-blocks', name='Candy Blocks', base_price=0.83, category='hard-candy'),
            CandyOption(id='jolly-ranchers', name='Jolly Ranchers', base_price=0.83, category='hard-candy'),
            CandyOption(id='jawbreakers', name='Jawbreakers', base_price=0.95, category='hard-candy'),
            CandyOption(id='peppermint-star-lights', name='Peppermint Star Lights', base_price=0.66, category='mint'),
            CandyOption(id='soft-peppermint-puffs', name='Soft Peppermint Puffs', base_price=0.87, category='mint'),
            CandyOption(id='cream-savers-strawberry', name='Cream Savers Strawberry', base_price=1.32, category='cream'),
            CandyOption(id='fruit-flavored-buttons', name='Fruit Flavored Buttons', base_price=0.66, category='fruit'),
            CandyOption(id='werthers-original', name="Werther's Original Hard Candy", base_price=2.15, category='premium'),
            CandyOption(id='hopes-coffee', name="Hope's Coffee", base_price=2.40, category='premium'),
            CandyOption(id='assorted-starlights', name='Assorted Starlights', base_price=0.66, category='assorted'),
            CandyOption(id='sour-lemon-balls', name='Sour Lemon Balls', base_price=1.20, category='sour'),
            CandyOption(id='spearmint-balls', name='Spearmint Balls', base_price=0.66, category='mint'),
            CandyOption(id='fruit-barrels', name='Fruit Barrels', base_price=0.66, category='fruit'),
            CandyOption(id='bananarama', name='Bananarama', base_price=0.92, category='fruit'),
            CandyOption(id='hersheys', name="Hershey's", base_price=1.65, category='chocolate'),
            CandyOption(id='jordan-almonds', name='Jordan Almonds', base_price=2.25, category='premium'),
            CandyOption(id='blue-mms', name='Blue M&Ms', base_price=3.00, category='chocolate'),
            CandyOption(id='hersheys-kisses-pink', name="Hershey's Kisses Pink", base_price=3.00, category='chocolate'),
            CandyOption(id='pink-mms', name='Pink M&Ms', base_price=3.00, category='chocolate')
        ]
        
        return candy_options
    except Exception as e:
        logger.error(f"Error getting candy options: {e}")
        raise HTTPException(status_code=500, detail="Failed to get candy options")

@router.post("/calculate-pricing", response_model=BusinessCardTinPricingResponse)
async def calculate_pricing(request: BusinessCardTinPricingRequest):
    """Calculate pricing for business card tin order"""
    try:
        # Calculate tin pricing
        tin_pricing = get_business_card_tin_pricing(
            request.quantity,
            request.tin_finish,
            request.printing_method,
            request.surface_coverage
        )
        
        # Calculate candy pricing
        candy_pricing = get_candy_pricing(request.candy_id, request.candy_quantity)
        
        # Calculate custom message pricing ($0.99 per unit, free for orders 100+)
        custom_message_price = 0.0
        if request.custom_message and request.custom_message.strip():
            if request.quantity >= 100:
                custom_message_price = 0.0  # Free for large orders
            else:
                custom_message_price = 0.99 * request.quantity
        
        # Calculate totals
        subtotal = tin_pricing['subtotal'] + candy_pricing['total_price'] + custom_message_price
        tax_amount = subtotal * 0.0625  # 6.25% MA tax
        total_amount = subtotal + tax_amount
        
        pricing = {
            "tin_pricing": tin_pricing,
            "candy_pricing": candy_pricing,
            "custom_message_price": round(custom_message_price, 2),
            "subtotal": round(subtotal, 2),
            "tax_amount": round(tax_amount, 2),
            "total_amount": round(total_amount, 2),
            "quantity": request.quantity,
            "tin_finish": request.tin_finish,
            "printing_method": request.printing_method,
            "surface_coverage": request.surface_coverage,
            "candy_id": request.candy_id,
            "candy_quantity": request.candy_quantity,
            "custom_message": request.custom_message
        }
        
        return BusinessCardTinPricingResponse(
            success=True,
            pricing=pricing,
            message="Pricing calculated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error calculating pricing: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate pricing")

@router.post("/create-order", response_model=BusinessCardTinOrderResponse)
async def create_order(request: BusinessCardTinOrderRequest, current_user: dict = Depends(get_current_user)):
    """Create a new business card tin order"""
    try:
        # Calculate pricing
        tin_pricing = get_business_card_tin_pricing(
            request.quantity,
            request.tin_finish,
            request.printing_method,
            request.surface_coverage
        )
        
        candy_pricing = get_candy_pricing(request.candy_id, request.candy_quantity)
        
        custom_message_price = 0.0
        if request.custom_message and request.custom_message.strip():
            if request.quantity >= 100:
                custom_message_price = 0.0
            else:
                custom_message_price = 0.99 * request.quantity
        
        subtotal = tin_pricing['subtotal'] + candy_pricing['total_price'] + custom_message_price
        tax_amount = subtotal * 0.0625
        total_amount = subtotal + tax_amount
        
        # Generate order number
        order_number = f"BCT-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create order in database
        # This would typically insert into the business_card_tin_orders table
        order_id = str(uuid.uuid4())
        
        logger.info(f"Created business card tin order: {order_id} for user: {current_user.get('id')}")
        
        return BusinessCardTinOrderResponse(
            success=True,
            order_id=order_id,
            order_number=order_number,
            total_amount=round(total_amount, 2),
            message="Order created successfully"
        )
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.get("/volume-discounts", response_model=List[BusinessCardTinVolumeDiscount])
async def get_volume_discounts():
    """Get available volume discount tiers"""
    try:
        discounts = [
            BusinessCardTinVolumeDiscount(
                quantity=100,
                base_price=399.99,
                description="100 Units - Standard Pack"
            ),
            BusinessCardTinVolumeDiscount(
                quantity=250,
                base_price=749.99,
                description="250 Units - Medium Pack"
            ),
            BusinessCardTinVolumeDiscount(
                quantity=500,
                base_price=1000.00,
                description="500 Units - Large Pack"
            )
        ]
        
        return discounts
    except Exception as e:
        logger.error(f"Error getting volume discounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get volume discounts")
