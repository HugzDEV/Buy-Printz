"""
Tin Skinz API endpoints
Handles Tin Skinz product data, pricing calculations, and order processing
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import stripe
import os
from datetime import datetime
import uuid
import logging
from backend.database import db_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter(prefix="/api/tin-skinz", tags=["tin-skinz"])

# Pydantic models
class TinSkinzDesign(BaseModel):
    id: str
    name: str
    category: str
    thumbnail_url: str
    back_thumbnail_url: str
    design_url: str
    base_price: float

class TinSkinzCandyOption(BaseModel):
    id: str
    name: str
    price: float

class PricingCalculation(BaseModel):
    quantity: int
    has_candy: bool
    has_custom_message: bool
    unit_price: float
    candy_price: float
    custom_message_price: float
    subtotal: float
    tax_amount: float
    total_amount: float

class TinSkinzOrderRequest(BaseModel):
    selected_designs: List[dict]  # Array of designs with quantities and candy
    total_quantity: int
    pricing: Optional[dict] = None  # Dynamic pricing data from frontend
    shipping_address: dict
    billing_address: dict

class TinSkinzOrderResponse(BaseModel):
    order_id: str
    payment_intent_id: str
    client_secret: str
    total_amount: float

@router.get("/designs", response_model=List[TinSkinzDesign])
async def get_designs(category: Optional[str] = None):
    """Get all Tin Skinz designs, optionally filtered by category"""
    try:
        supabase = db_manager.supabase
        query = supabase.table("tin_skinz_designs").select("*")
        
        if category:
            query = query.eq("category", category)
        
        result = query.execute()
        
        designs = []
        for design in result.data:
            designs.append(TinSkinzDesign(
                id=design["id"],
                name=design["name"],
                category=design["category"],
                thumbnail_url=design["thumbnail_url"],
                back_thumbnail_url=design["back_thumbnail_url"],
                design_url=design["design_url"],
                base_price=float(design["price"])
            ))
        
        return designs
    except Exception as e:
        logger.error(f"Error fetching designs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch designs")

@router.get("/candy-options", response_model=List[TinSkinzCandyOption])
async def get_candy_options():
    """Get all available candy options"""
    try:
        supabase = db_manager.supabase
        result = supabase.table("tin_skinz_candy_options").select("*").execute()
        
        candy_options = []
        for candy in result.data:
            candy_options.append(TinSkinzCandyOption(
                id=candy["id"],
                name=candy["name"],
                price=float(candy["base_price"])
            ))
        
        return candy_options
    except Exception as e:
        logger.error(f"Error fetching candy options: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch candy options")

@router.post("/calculate-price", response_model=PricingCalculation)
async def calculate_price(
    quantity: int,
    has_candy: bool = False,
    has_custom_message: bool = False
):
    """Calculate pricing for Tin Skinz order"""
    try:
        supabase = db_manager.supabase
        # Call the database function to calculate pricing
        result = supabase.rpc(
            "calculate_tin_skinz_price",
            {
                "p_quantity": quantity,
                "p_has_candy": has_candy,
                "p_has_custom_message": has_custom_message
            }
        ).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Invalid quantity for pricing")
        
        pricing = result.data[0]
        
        # Calculate tax (6.25% Massachusetts state tax)
        tax_rate = 0.0625
        subtotal = float(pricing["total_price"])
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount
        
        return PricingCalculation(
            quantity=quantity,
            has_candy=has_candy,
            has_custom_message=has_custom_message,
            unit_price=float(pricing["unit_price"]),
            candy_price=float(pricing["candy_price"]),
            custom_message_price=float(pricing["custom_message_price"]),
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount
        )
    except Exception as e:
        logger.error(f"Error calculating price: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to calculate pricing")

@router.post("/create-order", response_model=TinSkinzOrderResponse)
async def create_order(order_request: TinSkinzOrderRequest):
    """Create a new Tin Skinz order and Stripe payment intent"""
    try:
        supabase = db_manager.supabase
        # Validate all designs exist
        design_ids = [design['design_id'] for design in order_request.selected_designs]
        design_result = supabase.table("tin_skinz_designs").select("*").in_("id", design_ids).execute()
        
        if len(design_result.data) != len(design_ids):
            raise HTTPException(status_code=404, detail="One or more designs not found")
        
        # Use dynamic pricing from frontend if provided
        if order_request.pricing:
            pricing_data = order_request.pricing
            subtotal = float(pricing_data.get("subtotal", 0))
            tax_amount = float(pricing_data.get("tax_amount", 0))
            total_amount = float(pricing_data.get("total_amount", 0))
        else:
            # Fallback to backend calculation (simplified for multi-design)
            tax_rate = 0.0625  # 6.25% MA state tax
            subtotal = 0.0
            
            for design_item in order_request.selected_designs:
                # Calculate base price for this design
                design_id = design_item['design_id']
                quantity = design_item['quantity']
                
                # Get design price
                design = next(d for d in design_result.data if d['id'] == design_id)
                base_price = float(design['price'])
                
                # Add candy cost if specified
                candy_cost = 0.0
                if design_item.get('candy_id'):
                    candy_result = supabase.table("tin_skinz_candy_options").select("*").eq("id", design_item['candy_id']).execute()
                    if candy_result.data:
                        candy_cost = float(candy_result.data[0]["base_price"])
                
                # Add custom message cost if specified
                message_cost = 0.0
                if design_item.get('custom_message') and design_item['custom_message'].strip():
                    message_cost = 0.99  # $0.99 per tin for custom message
                
                # Calculate total for this design
                design_total = (base_price + candy_cost + message_cost) * quantity
                subtotal += design_total
            
            tax_amount = subtotal * tax_rate
            total_amount = subtotal + tax_amount
        
        # Generate order ID
        order_id = f"TS-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        # Create Stripe payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Convert to cents
            currency='usd',
            metadata={
                'order_id': order_id,
                'product_type': 'tin_skinz',
                'total_quantity': str(order_request.total_quantity),
                'design_count': str(len(order_request.selected_designs))
            }
        )
        
        # Create order record in database
        order_data = {
            'order_id': order_id,
            'selected_designs': order_request.selected_designs,
            'total_quantity': order_request.total_quantity,
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'total_amount': total_amount,
            'stripe_payment_intent_id': payment_intent.id,
            'payment_status': 'pending',
            'order_status': 'pending',
            'shipping_address': order_request.shipping_address,
            'billing_address': order_request.billing_address
        }
        
        supabase.table("tin_skinz_orders").insert(order_data).execute()
        
        return TinSkinzOrderResponse(
            order_id=order_id,
            payment_intent_id=payment_intent.id,
            client_secret=payment_intent.client_secret,
            total_amount=total_amount
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment processing error: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.post("/confirm-payment")
async def confirm_payment(payment_intent_id: str):
    """Confirm payment and update order status"""
    try:
        supabase = db_manager.supabase
        # Retrieve payment intent from Stripe
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_intent.status == 'succeeded':
            # Update order status in database
            supabase.table("tin_skinz_orders").update({
                'payment_status': 'completed',
                'order_status': 'confirmed',
                'updated_at': datetime.now().isoformat()
            }).eq('stripe_payment_intent_id', payment_intent_id).execute()
            
            return {"status": "success", "message": "Payment confirmed"}
        else:
            return {"status": "pending", "message": "Payment not yet completed"}
            
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment verification error: {str(e)}")
    except Exception as e:
        logger.error(f"Error confirming payment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to confirm payment")

@router.get("/orders/{user_id}")
async def get_user_orders(user_id: str):
    """Get orders for a specific user"""
    try:
        supabase = db_manager.supabase
        result = supabase.table("tin_skinz_orders").select("""
            *,
            tin_skinz_designs(name, category),
            tin_skinz_candy_options(name)
        """).eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")
