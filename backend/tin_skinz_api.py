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
from supabase import create_client, Client
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

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
    design_id: str
    custom_message: Optional[str] = None
    candy_id: Optional[str] = None
    quantity: int
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
        query = supabase.table("tin_skinz_designs").select("*").eq("is_active", True)
        
        if category:
            query = query.eq("category", category)
        
        result = query.execute()
        
        designs = []
        for design in result.data:
            designs.append(TinSkinzDesign(
                id=design["design_id"],
                name=design["name"],
                category=design["category"],
                thumbnail_url=design["thumbnail_url"],
                back_thumbnail_url=design["back_thumbnail_url"],
                design_url=design["design_url"],
                base_price=float(design["base_price"])
            ))
        
        return designs
    except Exception as e:
        logger.error(f"Error fetching designs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch designs")

@router.get("/candy-options", response_model=List[TinSkinzCandyOption])
async def get_candy_options():
    """Get all available candy options"""
    try:
        result = supabase.table("tin_skinz_candy_options").select("*").eq("is_active", True).execute()
        
        candy_options = []
        for candy in result.data:
            candy_options.append(TinSkinzCandyOption(
                id=candy["candy_id"],
                name=candy["name"],
                price=float(candy["price"])
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
        
        # Calculate tax (assuming 8.5% tax rate)
        tax_rate = 0.085
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
        # Validate design exists
        design_result = supabase.table("tin_skinz_designs").select("*").eq("design_id", order_request.design_id).eq("is_active", True).execute()
        if not design_result.data:
            raise HTTPException(status_code=404, detail="Design not found")
        
        design = design_result.data[0]
        
        # Get candy option if provided
        candy_price = 0.0
        if order_request.candy_id:
            candy_result = supabase.table("tin_skinz_candy_options").select("*").eq("candy_id", order_request.candy_id).eq("is_active", True).execute()
            if not candy_result.data:
                raise HTTPException(status_code=404, detail="Candy option not found")
            candy_price = float(candy_result.data[0]["price"])
        
        # Calculate pricing
        has_candy = order_request.candy_id is not None
        has_custom_message = order_request.custom_message is not None and order_request.custom_message.strip() != ""
        
        pricing_result = supabase.rpc(
            "calculate_tin_skinz_price",
            {
                "p_quantity": order_request.quantity,
                "p_has_candy": has_candy,
                "p_has_custom_message": has_custom_message
            }
        ).execute()
        
        if not pricing_result.data:
            raise HTTPException(status_code=400, detail="Invalid quantity for pricing")
        
        pricing = pricing_result.data[0]
        
        # Calculate totals
        tax_rate = 0.085
        subtotal = float(pricing["total_price"])
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
                'design_id': order_request.design_id,
                'quantity': str(order_request.quantity)
            }
        )
        
        # Create order record in database
        order_data = {
            'order_id': order_id,
            'design_id': order_request.design_id,
            'custom_message': order_request.custom_message,
            'candy_id': order_request.candy_id,
            'quantity': order_request.quantity,
            'unit_price': float(pricing["unit_price"]),
            'candy_price': candy_price,
            'custom_message_price': float(pricing["custom_message_price"]),
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
        result = supabase.table("tin_skinz_orders").select("""
            *,
            tin_skinz_designs(name, category),
            tin_skinz_candy_options(name)
        """).eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")
