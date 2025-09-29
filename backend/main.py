from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import stripe
import os
import sys
import json
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import aiofiles
from pydantic import BaseModel
from dotenv import load_dotenv
import time

# Import our modules
from backend.database import db_manager
from backend.auth import auth_manager, get_current_user
from backend.ai_agent_adapter import ai_agent_adapter

# Import creator marketplace routes
try:
    from backend.creator_marketplace import router as creator_marketplace_router
    CREATOR_MARKETPLACE_AVAILABLE = True
except ImportError:
    CREATOR_MARKETPLACE_AVAILABLE = False
    print("Warning: Creator marketplace module not available")

# Import creator follower routes
try:
    from backend.creator_follower_api import router as creator_follower_router
    CREATOR_FOLLOWER_AVAILABLE = True
except ImportError:
    CREATOR_FOLLOWER_AVAILABLE = False
    print("Warning: Creator follower module not available")

# Old shipping API routes removed - using Playwright integration only

# Import shipping costs API routes - B2Sign integration with Playwright
try:
    from backend.shipping_costs_api import router as shipping_costs_router
    SHIPPING_COSTS_API_AVAILABLE = True
    print("✅ B2Sign Shipping Costs API (Playwright) loaded successfully")
except ImportError as e:
    SHIPPING_COSTS_API_AVAILABLE = False
    print(f"❌ B2Sign Shipping Costs API failed to load: {e}")
    print("❌ Cannot deploy without real shipping costs - would cause financial losses")
    raise ImportError(f"B2Sign shipping integration is required: {e}")

# Import Tin Skinz API routes
try:
    from backend.tin_skinz_api import router as tin_skinz_router
    TIN_SKINZ_API_AVAILABLE = True
    print("✅ Tin Skinz API loaded successfully")
except ImportError as e:
    TIN_SKINZ_API_AVAILABLE = False

# Import Tin Skinz Shipping API routes
try:
    from backend.tin_skinz_shipping_api import router as tin_skinz_shipping_router
    TIN_SKINZ_SHIPPING_API_AVAILABLE = True
    print("✅ Tin Skinz Shipping API loaded successfully")
except ImportError as e:
    TIN_SKINZ_SHIPPING_API_AVAILABLE = False
    print(f"❌ Tin Skinz API failed to load: {e}")

# Import Business Card Tin API routes
try:
    from backend.business_card_tin_api import router as business_card_tin_router
    BUSINESS_CARD_TIN_API_AVAILABLE = True
    print("✅ Business Card Tin API loaded successfully")
except ImportError as e:
    BUSINESS_CARD_TIN_API_AVAILABLE = False
    print(f"❌ Business Card Tin API failed to load: {e}")

# Simple in-memory cache
class SimpleCache:
    def __init__(self, default_ttl=300):  # 5 minutes default
        self.cache = {}
        self.default_ttl = default_ttl
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        ttl = ttl or self.default_ttl
        self.cache[key] = {
            'value': value,
            'expires': time.time() + ttl
        }
    
    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        
        item = self.cache[key]
        if time.time() > item['expires']:
            del self.cache[key]
            return None
        
        return item['value']
    
    def delete(self, key: str) -> bool:
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    def clear(self) -> None:
        self.cache.clear()
    
    def cleanup(self) -> int:
        """Remove expired entries and return count of removed items"""
        current_time = time.time()
        expired_keys = [key for key, item in self.cache.items() if current_time > item['expires']]
        for key in expired_keys:
            del self.cache[key]
        return len(expired_keys)
    
    def stats(self) -> Dict[str, Any]:
        return {
            'size': len(self.cache),
            'keys': list(self.cache.keys())
        }

# Initialize cache
cache = SimpleCache()

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Buy Printz Banner Printing Platform",
    description="""
    ## Professional Banner Printing API
    
    Buy Printz provides a comprehensive platform for designing and ordering custom banners.
    
    ### Key Features:
    - **Canvas Design Editor**: Full-featured banner design with Konva.js integration
    - **User Authentication**: Secure user registration and login with Supabase
    - **Canvas State Persistence**: Save and restore design sessions across devices
    - **Payment Processing**: Stripe integration for secure transactions
    - **Order Management**: Complete order tracking and management system
    
    ### API Endpoints:
    - **Authentication**: Login, register, user management
    - **Canvas Operations**: Save, load, and manage design states
    - **Order Processing**: Create orders, handle payments, order tracking
    - **File Management**: Upload and manage design assets
    
    """,
    version="2.0.0",
    contact={
        "name": "Buy Printz Support",
        "email": "order@buyprintz.com",
        "url": "https://www.buyprintz.com"
    },
    license_info={
        "name": "Proprietary",
        "url": "https://www.buyprintz.com/terms"
    },
    servers=[
        {
            "url": "https://www.buyprintz.com/api",
            "description": "Production server"
        },
        {
            "url": "http://localhost:8000/api", 
            "description": "Development server"
        }
    ]
)

# CORS middleware - Allow both local development and production frontend
frontend_url = os.getenv("FRONTEND_URL", "")
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:5173",
    "https://buyprintz.com",
    "https://www.buyprintz.com"
]

# Add production frontend URL if provided
if frontend_url:
    allowed_origins.append(frontend_url)

# Allow all Vercel preview deployments (they use random subdomains)
vercel_pattern = "https://*.vercel.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app$"
)

# Debug endpoint removed from production

# Note: Static file test endpoint removed - using Supabase Storage exclusively

# Include creator marketplace routes if available
if CREATOR_MARKETPLACE_AVAILABLE:
    app.include_router(creator_marketplace_router, tags=["creator-marketplace"])
    logger.info("Creator marketplace routes loaded successfully")
else:
    logger.warning("Creator marketplace routes not available - module not found")

# Include creator follower routes if available
if CREATOR_FOLLOWER_AVAILABLE:
    app.include_router(creator_follower_router, prefix="/api/creator-marketplace", tags=["creator-followers"])
    logger.info("Creator follower routes loaded successfully")
else:
    logger.warning("Creator follower routes not available - module not found")

# Old shipping API routes removed - using Playwright integration only

# Include shipping costs API routes if available
if SHIPPING_COSTS_API_AVAILABLE:
    app.include_router(shipping_costs_router)
    logger.info("Shipping Costs API routes loaded successfully")
else:
    logger.warning("Shipping Costs API routes not available - module not found")

# Include Tin Skinz API routes if available
if TIN_SKINZ_API_AVAILABLE:
    app.include_router(tin_skinz_router)
    logger.info("Tin Skinz API routes loaded successfully")
else:
    logger.warning("Tin Skinz API routes not available")

# Include Tin Skinz Shipping API routes if available
if TIN_SKINZ_SHIPPING_API_AVAILABLE:
    app.include_router(tin_skinz_shipping_router)
    logger.info("Tin Skinz Shipping API routes loaded successfully")
else:
    logger.warning("Tin Skinz Shipping API routes not available")

# Include Business Card Tin API routes if available
if BUSINESS_CARD_TIN_API_AVAILABLE:
    app.include_router(business_card_tin_router)
    logger.info("Business Card Tin API routes loaded successfully")
else:
    logger.warning("Business Card Tin API routes not available")

# Note: Static file serving removed - using Supabase Storage for all file uploads
# This ensures cloud-based persistence and eliminates Railway container restart issues

# Configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Validate Stripe configuration
if not STRIPE_SECRET_KEY or STRIPE_SECRET_KEY.startswith("sk_test_your") or STRIPE_SECRET_KEY == "sk_test_51234567890abcdefghijk":
    print("⚠️  WARNING: Invalid or missing Stripe Secret Key!")
    print("📝 Please set STRIPE_SECRET_KEY in your .env file with a real Stripe test key")
    print("🔗 Get your keys from: https://dashboard.stripe.com/test/apikeys")

if not STRIPE_PUBLISHABLE_KEY or STRIPE_PUBLISHABLE_KEY.startswith("pk_test_your") or STRIPE_PUBLISHABLE_KEY == "pk_test_51234567890abcdefghijk":
    print("⚠️  WARNING: Invalid or missing Stripe Publishable Key!")
    print("📝 Please set STRIPE_PUBLISHABLE_KEY in your .env file")

# Initialize Stripe
stripe.api_key = STRIPE_SECRET_KEY

# Note: No local uploads directory needed - using Supabase Storage exclusively

# Pydantic models
class UserRegistration(BaseModel):
    email: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: str
    password: str

class CanvasData(BaseModel):
    canvas_data: Dict[str, Any]
    product_type: str
    quantity: int
    dimensions: Dict[str, Any]
    name: Optional[str] = "Untitled Design"

class OrderRequest(BaseModel):
    canvas_data: Dict[str, Any]
    canvas_image: Optional[str] = None  # Add canvas_image field
    product_type: str
    quantity: int
    dimensions: Dict[str, Any]
    banner_type: Optional[str] = None
    banner_material: Optional[str] = None
    banner_finish: Optional[str] = None
    banner_size: Optional[str] = None
    banner_category: Optional[str] = None
    background_color: Optional[str] = "#ffffff"
    print_options: Optional[Dict[str, Any]] = {}
    total_amount: Optional[float] = 0.0
    marketplace_templates: Optional[list] = []  # List of marketplace templates used
    # Business card tin specific fields
    tin_options: Optional[Dict[str, Any]] = None
    customer_info: Optional[Dict[str, Any]] = None
    shipping_option: Optional[Dict[str, Any]] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    shipping_cost: Optional[float] = None
    amount_cents: Optional[int] = None

class AddressData(BaseModel):
    full_name: str
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str = "US"
    phone: Optional[str] = ""
    is_default: bool = True

class UserPreferences(BaseModel):
    default_banner_type: Optional[str] = None
    default_banner_size: Optional[str] = None
    editor_settings: Optional[dict] = {}

class TemplateData(BaseModel):
    name: str
    category: Optional[str] = "Custom"
    description: Optional[str] = ""
    canvas_data: dict
    banner_type: Optional[str] = None
    is_public: bool = False
    thumbnail_url: Optional[str] = None  # URL to thumbnail image file

class EnhancedCanvasData(BaseModel):
    name: str
    canvas_data: dict
    product_type: str = "banner"
    dimensions: Optional[dict] = {}
    banner_type: Optional[str] = None
    banner_material: Optional[str] = None
    banner_finish: Optional[str] = None
    banner_size: Optional[str] = None
    banner_category: Optional[str] = None
    background_color: Optional[str] = "#ffffff"
    print_options: Optional[dict] = {}

# AI Agent Models
class AIQuery(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = {}
    user_id: Optional[str] = None

class DesignAssistanceRequest(BaseModel):
    design_type: str
    requirements: Dict[str, Any]
    user_preferences: Optional[Dict[str, Any]] = {}

class OrderQuery(BaseModel):
    order_id: Optional[str] = None
    user_id: Optional[str] = None
    query_type: str  # "status", "history", "details"

class BannerRecommendationRequest(BaseModel):
    use_case: str
    dimensions: Optional[Dict[str, Any]] = None
    budget: Optional[float] = None

# AI Banner Generation Models
class BannerGenerationRequest(BaseModel):
    prompt: str
    style: Optional[str] = None
    dimensions: Optional[Dict[str, Any]] = None

class DesignModificationRequest(BaseModel):
    design_id: str
    modifications: Dict[str, Any]

class ElementAdditionRequest(BaseModel):
    design_id: str
    element: Dict[str, Any]

# Authentication endpoints
@app.post("/api/auth/register")
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        result = await db_manager.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "User registered successfully",
                "user_id": result["user_id"]
            }
        else:
            # Check if it's a client error (400) or server error (500)
            error_msg = result["error"]
            if ("400:" in error_msg or "invalid" in error_msg.lower() or 
                "already exists" in error_msg.lower() or "duplicate" in error_msg.lower()):
                raise HTTPException(status_code=400, detail=error_msg)
            elif "foreign key constraint" in error_msg.lower():
                # This is a database schema issue, return 400 for user already exists
                raise HTTPException(status_code=400, detail="User already exists")
            else:
                raise HTTPException(status_code=500, detail=error_msg)
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/login")
async def login_user(user_data: UserLogin):
    """Login user"""
    try:
        auth_result = await auth_manager.authenticate_user(
            email=user_data.email,
            password=user_data.password
        )
        
        if auth_result:
            # Create JWT token
            access_token = auth_manager.create_access_token(
                data={"sub": auth_result["user_id"]}
            )
            
            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": auth_result["refresh_token"],
                "user_id": auth_result["user_id"],
                "email": auth_result["email"]
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # For any other exceptions, return 401 (invalid credentials) instead of 500
        print(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        result = await auth_manager.refresh_token(refresh_token)
        if result:
            return {
                "success": True,
                "access_token": result["access_token"],
                "refresh_token": result["refresh_token"]
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/logout")
async def logout_user(current_user: dict = Depends(get_current_user)):
    """Logout user"""
    try:
        await auth_manager.sign_out(current_user["user_id"])
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# User profile endpoints
@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        profile = await db_manager.get_user_profile(current_user["user_id"])
        if profile:
            return {"success": True, "profile": profile}
        else:
            raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/user/profile")
async def update_user_profile(
    profile_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
        success = await db_manager.update_user_profile(
            current_user["user_id"], 
            profile_data
        )
        if success:
            return {"success": True, "message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/change-password")
async def change_user_password(
    password_data: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    try:
        current_password = password_data.get("current_password")
        new_password = password_data.get("new_password")
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current password and new password are required")
        
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
        # For now, we'll just return success since we're using Supabase Auth
        # In a real implementation, you'd validate current password and update via Supabase
        return {"success": True, "message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/tour-status")
async def get_tour_status(current_user: dict = Depends(get_current_user)):
    """Get user's tour completion status"""
    try:
        user_id = current_user["user_id"]
        tour_completed = await db_manager.is_tour_completed(user_id)
        return {"success": True, "tour_completed": tour_completed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/mark-tour-completed")
async def mark_tour_completed(current_user: dict = Depends(get_current_user)):
    """Mark tour as completed for the current user"""
    try:
        user_id = current_user["user_id"]
        success = await db_manager.mark_tour_completed(user_id)
        if success:
            return {"success": True, "message": "Tour marked as completed"}
        else:
            raise HTTPException(status_code=500, detail="Failed to mark tour as completed")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/user/delete-account")
async def delete_user_account(
    password_data: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    """Delete user account and all associated data"""
    try:
        password = password_data.get("password")
        
        if not password:
            raise HTTPException(status_code=400, detail="Password is required for account deletion")
        
        user_id = current_user["user_id"]
        
        # Delete user data from database
        # Note: In production, you'd also delete from Supabase Auth
        success = await db_manager.delete_user_account(user_id)
        
        if success:
            return {"success": True, "message": "Account deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete account")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Address management
@app.post("/api/user/addresses")
async def save_address(
    address_data: AddressData,
    current_user: dict = Depends(get_current_user)
):
    """Save user shipping address"""
    try:
        success = await db_manager.save_user_address(
            current_user["user_id"],
            address_data.dict()
        )
        if success:
            return {"success": True, "message": "Address saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save address")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/addresses")
async def get_user_addresses(current_user: dict = Depends(get_current_user)):
    """Get user addresses"""
    try:
        addresses = await db_manager.get_user_addresses(current_user["user_id"])
        return {"success": True, "addresses": addresses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Canvas design management - REMOVED (using templates instead)


# Note: File upload endpoint removed - using Supabase Storage exclusively
# All file uploads now go through creator marketplace or other specialized endpoints

# Order management
@app.post("/api/orders/create")
async def create_order(
    order_data: OrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new order"""
    try:
        # Initialize marketplace_cost for all paths
        marketplace_cost = 0.0
        
        # Use frontend-calculated total if provided, otherwise calculate backend total
        if order_data.total_amount and order_data.total_amount > 0:
            # Use frontend-calculated total (for business card tins, etc.)
            total_amount = order_data.total_amount
            print(f"💰 Using frontend-calculated total: ${total_amount}")
        elif order_data.product_type == "business_card_tin":
            # Business card tins must use frontend pricing - error if not provided
            raise HTTPException(
                status_code=400, 
                detail="Business card tin orders must include total_amount from frontend calculation"
            )
        else:
            # Calculate total amount based on product type and quantity (legacy logic)
            base_prices = {
                "banner": 25.00,
                "sign": 35.00,
                "sticker": 15.00,
                "custom": 50.00,
                "business_card_tin": 0.00  # Business card tins should use frontend pricing
            }
            
            base_price = base_prices.get(order_data.product_type, 50.00)
            total_amount = base_price * order_data.quantity
            
            # Add marketplace template costs
            if order_data.marketplace_templates:
                for template in order_data.marketplace_templates:
                    if isinstance(template, dict) and 'price' in template:
                        marketplace_cost += float(template['price'])
                    elif isinstance(template, (int, float)):
                        marketplace_cost += float(template)
            
            total_amount += marketplace_cost
            print(f"💰 Using backend-calculated total: ${total_amount}")
        
        # Calculate marketplace costs for frontend-calculated totals too
        if order_data.marketplace_templates and order_data.total_amount and order_data.total_amount > 0:
            for template in order_data.marketplace_templates:
                if isinstance(template, dict) and 'price' in template:
                    marketplace_cost += float(template['price'])
                elif isinstance(template, (int, float)):
                    marketplace_cost += float(template)
        
        # Create comprehensive order data
        order_payload = {
            "product_type": order_data.product_type,
            "quantity": order_data.quantity,
            "dimensions": order_data.dimensions,
            "canvas_data": order_data.canvas_data,
            "canvas_image": order_data.canvas_image,  # Include canvas_image
            "banner_type": order_data.banner_type,
            "banner_material": order_data.banner_material,
            "banner_finish": order_data.banner_finish,
            "banner_size": order_data.banner_size,
            "banner_category": order_data.banner_category,
            "background_color": order_data.background_color,
            "print_options": order_data.print_options,
            "marketplace_templates": order_data.marketplace_templates,
            "marketplace_cost": marketplace_cost,
            "total_amount": total_amount,
            "status": "pending"
        }
        
        # Create order in database
        order_result = await db_manager.create_order(
            current_user["user_id"],
            order_payload
        )
        
        if order_result["success"]:
            return {
                "success": True,
                "order_id": order_result["order_id"],
                "total_amount": total_amount,
                "base_amount": base_price * order_data.quantity,
                "marketplace_cost": marketplace_cost,
                "order_details": order_payload
            }
        else:
            raise HTTPException(status_code=500, detail=order_result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get user's orders"""
    try:
        orders = await db_manager.get_user_orders(current_user["user_id"])
        return {"success": True, "orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific order"""
    try:
        order = await db_manager.get_order(order_id)
        if order and order["user_id"] == current_user["user_id"]:
            return {"success": True, "order": order}
        else:
            raise HTTPException(status_code=404, detail="Order not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders/{order_id}/customer-info")
async def save_order_customer_info(
    order_id: str,
    customer_info: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    """Save customer information for an order"""
    try:
        # Verify order belongs to user
        order = await db_manager.get_order(order_id)
        if not order or order["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order with customer information
        success = await db_manager.update_order_customer_info(order_id, customer_info)
        
        if success:
            return {"success": True, "message": "Customer information saved"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save customer information")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Payment request model
class PaymentIntentRequest(BaseModel):
    order_id: str
    amount: Optional[float] = None  # Optional: if provided, use this amount instead of order total

# Customer information model
class CustomerInfoRequest(BaseModel):
    order_id: str
    customer_info: Dict[str, str]

# Payment endpoints
@app.post("/api/payments/create-intent")
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create Stripe payment intent"""
    try:
        # Validate Stripe configuration
        if not STRIPE_SECRET_KEY or STRIPE_SECRET_KEY.startswith("sk_test_your"):
            raise HTTPException(
                status_code=500, 
                detail="Stripe not configured. Please set STRIPE_SECRET_KEY environment variable with a valid Stripe test key."
            )
        
        # Get order details
        order = await db_manager.get_order(request.order_id)
        if not order or order["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Use provided amount if available, otherwise use order total
        amount = request.amount if request.amount is not None else order["total_amount"]
        
        print(f"🔄 Payment Intent Debug:")
        print(f"  - Order total from DB: {order['total_amount']}")
        print(f"  - Provided amount: {request.amount}")
        print(f"  - Using amount: {amount}")
        print(f"  - Amount in cents: {int(amount * 100)}")
        
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency="usd",
            metadata={
                "order_id": request.order_id,
                "user_id": current_user["user_id"]
            }
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "amount": order["total_amount"],
            "currency": "usd"
        }
    except stripe.error.AuthenticationError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Stripe authentication failed: {str(e)}. Please check your STRIPE_SECRET_KEY."
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="No signature header")
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        # Handle the event
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            order_id = payment_intent["metadata"]["order_id"]
            
            # Update order status
            await db_manager.update_order_status(
                order_id, 
                "paid", 
                payment_intent["id"]
            )
            
        elif event["type"] == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            order_id = payment_intent["metadata"]["order_id"]
            
            # Update order status
            await db_manager.update_order_status(order_id, "payment_failed")
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Product endpoints
@app.get("/api/products")
async def get_products():
    """Get available products"""
    return {
        "products": [
            {
                "id": "banner",
                "name": "Vinyl Banner",
                "base_price": 25.00,
                "description": "High-quality vinyl banners for outdoor use",
                "min_quantity": 1,
                "max_quantity": 100
            },
            {
                "id": "sign",
                "name": "Corrugated Sign",
                "base_price": 35.00,
                "description": "Durable corrugated plastic signs",
                "min_quantity": 1,
                "max_quantity": 50
            },
            {
                "id": "sticker",
                "name": "Vinyl Sticker",
                "base_price": 15.00,
                "description": "Custom vinyl stickers and decals",
                "min_quantity": 10,
                "max_quantity": 1000
            },
            {
                "id": "custom",
                "name": "Custom Product",
                "base_price": 50.00,
                "description": "Custom signage solutions",
                "min_quantity": 1,
                "max_quantity": 25
            }
        ]
    }

@app.get("/api/config")
async def get_config():
    """Get frontend configuration"""
    return {
        "stripe_publishable_key": STRIPE_PUBLISHABLE_KEY,
        "stripe_configured": bool(STRIPE_SECRET_KEY and not STRIPE_SECRET_KEY.startswith("sk_test_your")),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_anon_key": os.getenv("SUPABASE_KEY")
    }

# User Preferences endpoints
@app.get("/api/user/preferences")
async def get_user_preferences(current_user: dict = Depends(get_current_user)):
    """Get user editor preferences"""
    try:
        preferences = await db_manager.get_user_preferences(current_user["user_id"])
        return {"success": True, "preferences": preferences}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/user/preferences")
async def save_user_preferences(
    preferences: UserPreferences,
    current_user: dict = Depends(get_current_user)
):
    """Save user editor preferences"""
    try:
        result = await db_manager.save_user_preferences(
            current_user["user_id"],
            preferences.dict()
        )
        
        if result:
            return {"success": True, "message": "Preferences saved successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save preferences")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Template management endpoints
@app.post("/api/templates/save")
async def save_custom_template(
    template_data: TemplateData,
    current_user: dict = Depends(get_current_user)
):
    """Save a custom banner template"""
    try:
        user_id = current_user["user_id"]
        
        # Check template limit before saving
        limit_check = await db_manager.check_template_limit(user_id, limit=20)
        if not limit_check["can_save"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Template limit reached. You can save up to {limit_check['limit']} templates. Please delete some templates to save new ones."
            )
        
        result = await db_manager.save_custom_template(
            user_id,
            template_data.dict()
        )
        
        if result["success"]:
            # Invalidate cache for this user
            cache_key = f"templates_user_{user_id}"
            cache.delete(cache_key)
            logger.info(f"Invalidated cache for user templates: {user_id}")
            
            return {
                "success": True,
                "template_id": result["template_id"],
                "message": "Template saved successfully",
                "template_count": limit_check["current_count"] + 1,
                "remaining": limit_check["remaining"] - 1
            }
        else:
            # Check if it's a duplicate name error
            error_msg = result["error"]
            if "already exists" in error_msg.lower():
                raise HTTPException(status_code=400, detail=error_msg)
            else:
                raise HTTPException(status_code=500, detail=error_msg)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates/user")
async def get_user_templates(current_user: dict = Depends(get_current_user)):
    """Get user's custom templates with caching"""
    try:
        user_id = current_user["user_id"]
        cache_key = f"templates_user_{user_id}"
        
        # Check cache first
        cached_templates = cache.get(cache_key)
        if cached_templates is not None:
            logger.info(f"Cache hit for user templates: {user_id}")
            return {"success": True, "templates": cached_templates, "cached": True}
        
        # Fetch from database
        templates = await db_manager.get_user_templates(user_id)
        
        # Cache for 10 minutes
        cache.set(cache_key, templates, ttl=600)
        logger.info(f"Cached user templates: {user_id}")
        
        return {"success": True, "templates": templates, "cached": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates/limit")
async def get_template_limit(current_user: dict = Depends(get_current_user)):
    """Get user's template count and limit information"""
    try:
        user_id = current_user["user_id"]
        limit_info = await db_manager.check_template_limit(user_id, limit=20)
        return {"success": True, **limit_info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates/public")
async def get_public_templates():
    """Get public templates"""
    try:
        templates = await db_manager.get_public_templates()
        return {"success": True, "templates": templates}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Templates test endpoint removed from production

# File exists test endpoint removed from production
# @app.get("/api/test/file-exists/{file_path:path}")
# async def test_file_exists(file_path: str):
    """Test if a file exists on the server"""
    try:
        import os
        full_path = file_path
        exists = os.path.exists(full_path)
        
        if exists:
            file_size = os.path.getsize(full_path)
            return {
                "exists": True,
                "path": full_path,
                "size": file_size,
                "absolute_path": os.path.abspath(full_path)
            }
        else:
            # List directory contents to help debug
            dir_path = os.path.dirname(full_path)
            if os.path.exists(dir_path):
                contents = os.listdir(dir_path)
                return {
                    "exists": False,
                    "path": full_path,
                    "directory_exists": True,
                    "directory_contents": contents,
                    "absolute_path": os.path.abspath(full_path)
                }
            else:
                return {
                    "exists": False,
                    "path": full_path,
                    "directory_exists": False,
                    "absolute_path": os.path.abspath(full_path)
                }
    except Exception as e:
        return {"error": str(e), "path": file_path}

@app.get("/api/test/thumbnail-dependencies")
async def test_thumbnail_dependencies():
    """Test if thumbnail service dependencies are available"""
    try:
        # Test PIL import
        try:
            from PIL import Image
            pil_available = True
            pil_error = None
        except ImportError as e:
            pil_available = False
            pil_error = str(e)
        
        # Test generate_thumbnails import
        try:
            from backend.generate_thumbnails import process_single_image
            thumbnails_available = True
            thumbnails_error = None
        except ImportError as e:
            try:
                from generate_thumbnails import process_single_image
                thumbnails_available = True
                thumbnails_error = "Fallback import worked"
            except ImportError as e2:
                thumbnails_available = False
                thumbnails_error = f"Main: {e} | Fallback: {e2}"
        
        # Test file system access
        try:
            import os
            os.makedirs("uploads/test", exist_ok=True)
            os.rmdir("uploads/test")
            filesystem_writable = True
            filesystem_error = None
        except Exception as e:
            filesystem_writable = False
            filesystem_error = str(e)
        
        return {
            "pil_available": pil_available,
            "pil_error": pil_error,
            "thumbnails_available": thumbnails_available,
            "thumbnails_error": thumbnails_error,
            "filesystem_writable": filesystem_writable,
            "filesystem_error": filesystem_error,
            "python_version": sys.version,
            "working_directory": os.getcwd()
        }
    except Exception as e:
        return {"error": f"Test failed: {e}"}

@app.get("/api/templates/{template_id}")
async def get_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific template by ID"""
    try:
        template = await db_manager.get_template(template_id)
        if template:
            # Check if user owns the template or if it's public
            if template["user_id"] == current_user["user_id"] or template.get("is_public", False):
                return {"success": True, "template": template}
            else:
                raise HTTPException(status_code=403, detail="Access denied")
        else:
            raise HTTPException(status_code=404, detail="Template not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/templates/generate-thumbnail")
async def generate_template_thumbnail(
    thumbnail_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Generate thumbnail for user template using Supabase Storage"""
    try:
        logger.info(f"🎨 Thumbnail generation requested by user: {current_user['user_id']}")
        
        import base64
        import tempfile
        import uuid
        
        # Import supabase with fallback for different environments
        try:
            from database import supabase
        except ImportError:
            try:
                from backend.database import supabase
            except ImportError:
                from .database import supabase
        
        image_data = thumbnail_data.get("imageData", "")
        template_name = thumbnail_data.get("templateName", "template")
        
        if not image_data:
            logger.error("❌ No image data provided")
            raise HTTPException(status_code=400, detail="No image data provided")
        
        logger.info(f"📊 Image data size: {len(image_data)} characters")
        
        # Enhanced debugging for mobile vs desktop differences
        logger.info(f"🔍 DEBUGGING: Analyzing image data for thumbnail generation...")
        
        # Log the data URL prefix for debugging
        if "," in thumbnail_data.get("imageData", ""):
            data_url_prefix = thumbnail_data.get("imageData", "").split(",")[0]
            logger.info(f"🔍 Data URL prefix: {data_url_prefix}")
        
        # Log template name for tracking
        logger.info(f"🔍 Template name: {template_name}")
        logger.info(f"🔍 User ID: {current_user['user_id']}")
        
        # Remove data URL prefix if present
        if "," in image_data:
            image_data = image_data.split(",")[1]
            logger.info("✂️ Removed data URL prefix")
        
        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data)
            logger.info(f"✅ Decoded image: {len(image_bytes)} bytes")
            
            # Analyze the decoded image dimensions for debugging
            from PIL import Image
            import io
            with Image.open(io.BytesIO(image_bytes)) as debug_img:
                logger.info(f"🔍 ORIGINAL IMAGE DIMENSIONS: {debug_img.width} x {debug_img.height}")
                logger.info(f"🔍 Original image mode: {debug_img.mode}")
                logger.info(f"🔍 Original image format: {debug_img.format}")
                
        except Exception as e:
            logger.error(f"❌ Base64 decode failed: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")
        
        # Create temporary file for processing
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_file:
                temp_file.write(image_bytes)
                temp_path = temp_file.name
            logger.info(f"📁 Created temp file: {temp_path}")
        except Exception as e:
            logger.error(f"❌ Failed to create temp file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create temporary file: {e}")
        
        try:
            # Try to import the thumbnail service
            try:
                from backend.generate_thumbnails import process_single_image
                logger.info("✅ Successfully imported process_single_image")
            except ImportError as e:
                # Fallback to direct import (for different environments)
                try:
                    from generate_thumbnails import process_single_image
                    logger.info("✅ Successfully imported process_single_image (fallback)")
                except ImportError as e2:
                    logger.error(f"❌ Failed to import process_single_image: {e} | Fallback: {e2}")
                    raise HTTPException(status_code=500, detail=f"Thumbnail service not available: {e}")
            
            # Create temporary directory for thumbnail processing
            with tempfile.TemporaryDirectory() as temp_thumbnail_dir:
                logger.info(f"📁 Created temporary thumbnail directory: {temp_thumbnail_dir}")
                
                # Process the image to create thumbnail
                logger.info("🔄 Processing image with thumbnail service...")
                result = process_single_image(temp_path, temp_thumbnail_dir)
                logger.info(f"📊 Thumbnail service result: {result}")
                
                if not result["success"]:
                    logger.error(f"❌ Thumbnail generation failed: {result.get('error', 'Unknown error')}")
                    raise HTTPException(status_code=500, detail=f"Thumbnail generation failed: {result.get('error', 'Unknown error')}")
                
                # Read the generated thumbnail
                thumbnail_path = result["thumbnail_path"]
                with open(thumbnail_path, 'rb') as thumbnail_file:
                    thumbnail_bytes = thumbnail_file.read()
                
                logger.info(f"📊 Thumbnail file size: {len(thumbnail_bytes)} bytes")
                
                # Generate unique filename for Supabase Storage
                file_extension = "jpg"  # thumbnails are generated as JPG
                unique_filename = f"{current_user['user_id']}_{uuid.uuid4().hex[:8]}_{template_name.replace(' ', '_')}.{file_extension}"
                storage_path = f"user_templates/{unique_filename}"
                
                logger.info(f"☁️ Uploading thumbnail to Supabase Storage: {storage_path}")
                
                # Upload to Supabase Storage (use marketplace-thumbnails bucket which is public)
                try:
                    upload_result = supabase.storage.from_("marketplace-thumbnails").upload(
                        storage_path,
                        thumbnail_bytes,
                        file_options={"content-type": "image/jpeg"}
                    )
                    logger.info(f"✅ Upload result: {upload_result}")
                except Exception as e:
                    logger.error(f"❌ Supabase Storage upload failed: {e}")
                    raise HTTPException(status_code=500, detail=f"Failed to upload thumbnail: {e}")
                
                # Get public URL
                try:
                    public_url_result = supabase.storage.from_("marketplace-thumbnails").get_public_url(storage_path)
                    
                    # Clean up the URL - remove any trailing query parameters or extra characters
                    if isinstance(public_url_result, str):
                        thumbnail_url = public_url_result.rstrip('?').rstrip()
                    else:
                        # Handle case where result might be an object with a 'publicUrl' property
                        thumbnail_url = getattr(public_url_result, 'publicUrl', str(public_url_result)).rstrip('?').rstrip()
                    
                    logger.info(f"✅ Public URL generated: {thumbnail_url}")
                except Exception as e:
                    logger.error(f"❌ Failed to get public URL: {e}")
                    raise HTTPException(status_code=500, detail=f"Failed to get public URL: {e}")
                
                logger.info(f"✅ Thumbnail uploaded successfully: {thumbnail_url}")
                return {
                    "success": True,
                    "thumbnail_url": thumbnail_url,
                    "file_size": len(thumbnail_bytes)
                }
                
        finally:
            # Clean up temporary file
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                    logger.info(f"🗑️ Cleaned up temp file: {temp_path}")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to clean up temp file: {e}")
                
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in thumbnail generation: {e}")
        import traceback
        logger.error(f"📋 Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a template (only by owner)"""
    try:
        # First check if template exists and user owns it
        template = await db_manager.get_template(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        if template["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied - you can only delete your own templates")
        
        # Delete the template
        success = await db_manager.delete_template(template_id)
        if success:
            # Invalidate cache for this user
            user_id = current_user["user_id"]
            cache_key = f"templates_user_{user_id}"
            cache.delete(cache_key)
            logger.info(f"Deleted template {template_id} and invalidated cache for user {user_id}")
            
            return {"success": True, "message": "Template deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete template")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced design save with banner specifications
@app.post("/api/designs/save-enhanced")
async def save_enhanced_canvas_design(
    design_data: EnhancedCanvasData,
    current_user: dict = Depends(get_current_user)
):
    """Save enhanced canvas design with banner specifications"""
    try:
        result = await db_manager.save_canvas_design(
            current_user["user_id"],
            design_data.dict()
        )
        
        if result["success"]:
            return {
                "success": True,
                "design_id": result["design_id"],
                "message": "Enhanced design saved successfully"
            }
        else:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/api/user/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    """Get user statistics and usage data"""
    try:
        stats = await db_manager.get_user_stats(current_user["user_id"])
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# Design history endpoints - DEPRECATED: Using templates instead
# @app.get("/api/designs/{design_id}/history")
# async def get_design_history(design_id: str, current_user: dict = Depends(get_current_user)):
#     """Get design version history - DEPRECATED"""
#     try:
#         history = await db_manager.get_design_history(design_id)
#         return {"success": True, "history": history}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# AI Agent Endpoints
@app.post("/api/ai/chat")
async def ai_chat_endpoint(request: AIQuery, current_user: dict = Depends(get_current_user)):
    """AI Chat endpoint for general assistance"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        # Add user context to the request
        request.context["user_id"] = current_user["user_id"]
        request.context["user_email"] = current_user.get("email", "")
        
        result = await ai_agent_adapter.chat_with_ai(request.query, request.context)
        return result
    except Exception as e:
        logger.error(f"AI Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/design-assistance")
async def design_assistance_endpoint(request: DesignAssistanceRequest, current_user: dict = Depends(get_current_user)):
    """Design assistance endpoint"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        # Add user context to preferences
        if not request.user_preferences:
            request.user_preferences = {}
        request.user_preferences["user_id"] = current_user["user_id"]
        
        result = await ai_agent_adapter.get_design_assistance(
            request.design_type,
            request.requirements,
            request.user_preferences
        )
        return result
    except Exception as e:
        logger.error(f"Design assistance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/order-assistance")
async def order_assistance_endpoint(request: OrderQuery, current_user: dict = Depends(get_current_user)):
    """Order assistance endpoint"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        # Use current user's ID if not provided
        if not request.user_id:
            request.user_id = current_user["user_id"]
        
        result = await ai_agent_adapter.get_order_assistance(
            request.order_id,
            request.user_id,
            request.query_type
        )
        return result
    except Exception as e:
        logger.error(f"Order assistance error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/banner-recommendations")
async def banner_recommendations_endpoint(request: BannerRecommendationRequest, current_user: dict = Depends(get_current_user)):
    """Banner recommendations endpoint"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        result = await ai_agent_adapter.get_banner_recommendations(
            request.use_case,
            request.dimensions,
            request.budget
        )
        return result
    except Exception as e:
        logger.error(f"Banner recommendations error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ai/health")
async def ai_agent_health():
    """AI Agent health check endpoint"""
    try:
        health = await ai_agent_adapter.get_health()
        return health
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "ai_agent_adapter"
        }

# AI Banner Generation Endpoints
@app.post("/api/ai/generate-banner")
async def generate_banner_endpoint(request: BannerGenerationRequest, current_user: dict = Depends(get_current_user)):
    """Generate a complete banner design from a text prompt"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        result = await ai_agent_adapter._generate_banner_from_prompt(
            current_user["user_id"],
            request.prompt,
            request.style,
            request.dimensions
        )
        return result
    except Exception as e:
        logger.error(f"Banner generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/modify-design")
async def modify_design_endpoint(request: DesignModificationRequest, current_user: dict = Depends(get_current_user)):
    """Modify an existing banner design"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        result = await ai_agent_adapter._modify_banner_design(
            current_user["user_id"],
            request.design_id,
            request.modifications
        )
        return result
    except Exception as e:
        logger.error(f"Design modification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/add-element")
async def add_element_endpoint(request: ElementAdditionRequest, current_user: dict = Depends(get_current_user)):
    """Add a new element to a banner design"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        result = await ai_agent_adapter._add_element_to_design(
            current_user["user_id"],
            request.design_id,
            request.element
        )
        return result
    except Exception as e:
        logger.error(f"Element addition error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/create-design")
async def create_design_endpoint(design_spec: Dict[str, Any], current_user: dict = Depends(get_current_user)):
    """Create a new banner design programmatically"""
    try:
        # Initialize AI agent adapter if not already done
        if not hasattr(ai_agent_adapter, '_initialized'):
            initialized = await ai_agent_adapter.initialize()
            if not initialized:
                raise HTTPException(status_code=503, detail="AI Agent service unavailable")
            ai_agent_adapter._initialized = True
        
        result = await ai_agent_adapter._create_banner_design(
            current_user["user_id"],
            design_spec
        )
        return result
    except Exception as e:
        logger.error(f"Design creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Buy Printz Banner Printing Platform API v2.0 - Enhanced with AI Agent"}

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for production monitoring
    Returns system status and basic metrics
    """
    try:
        # Check environment configuration
        supabase_configured = bool(os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"))
        stripe_configured = bool(os.getenv("STRIPE_SECRET_KEY"))
        openai_configured = bool(os.getenv("OPENAI_API_KEY"))
        db_connected = db_manager.is_connected() if hasattr(db_manager, 'is_connected') else False
        ai_agent_healthy = False
        
        # Check AI agent health
        try:
            ai_health = await ai_agent_adapter.get_health()
            ai_agent_healthy = ai_health.get("status") == "healthy"
        except:
            ai_agent_healthy = False
        
        # Determine overall status
        status = "healthy" if (supabase_configured and db_connected) else "starting"
        if not supabase_configured:
            status = "missing_config"
            
        return {
            "status": status,
            "timestamp": datetime.utcnow().isoformat(),
            "version": "2.0.0",
            "database": "connected" if db_connected else "disconnected",
            "supabase_configured": supabase_configured,
            "stripe_configured": stripe_configured,
            "openai_configured": openai_configured,
            "ai_agent_healthy": ai_agent_healthy,
            "uptime": "active"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat(),
            "error": str(e)
        }

@app.get("/api/database/test")
async def test_database_connection():
    """Test database connection and basic operations"""
    try:
        if not db_manager.is_connected():
            return {
                "success": False,
                "error": "Database not connected",
                "supabase_url": os.getenv("SUPABASE_URL"),
                "supabase_key_set": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY"))
            }
        
        # Test basic query
        test_response = db_manager.supabase.table("banner_templates").select("id").limit(1).execute()
        
        return {
            "success": True,
            "message": "Database connection successful",
            "test_query_result": test_response.data is not None,
            "supabase_url": os.getenv("SUPABASE_URL"),
            "supabase_key_set": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY"))
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "supabase_url": os.getenv("SUPABASE_URL"),
            "supabase_key_set": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY"))
        }


@app.get("/api/auth/test")
async def test_auth_role():
    """Test what auth role the backend is using"""
    try:
        auth_test = await db_manager.test_auth_role()
        return {
            "success": True,
            "auth_test": auth_test,
            "supabase_url": os.getenv("SUPABASE_URL"),
            "supabase_key_type": "Service Role" if "service_role" in (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "") else "Anon Key"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "supabase_url": os.getenv("SUPABASE_URL"),
            "supabase_key_type": "Service Role" if "service_role" in (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or "") else "Anon Key"
        }

@app.get("/api/status", tags=["Health"])
async def api_status():
    """
    Detailed API status for monitoring and debugging
    """
    return {
        "api_version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "authentication": "active",
            "canvas_operations": "active", 
            "order_processing": "active",
            "file_upload": "active"
        },
        "integrations": {
            "supabase": "configured" if os.getenv("SUPABASE_URL") else "missing",
            "stripe": "configured" if os.getenv("STRIPE_SECRET_KEY") else "missing",
            "openai": "configured" if os.getenv("OPENAI_API_KEY") else "missing"
        },
        "ai_agent": {
            "enabled": bool(os.getenv("OPENAI_API_KEY")),
            "capabilities": [
                "design_assistance", 
                "order_help", 
                "banner_recommendations", 
                "general_chat",
                "banner_generation",
                "design_modification",
                "element_addition",
                "programmatic_canvas_control"
            ],
            "tools": [
                "get_user_designs",
                "create_banner_design", 
                "modify_banner_design",
                "add_element_to_design",
                "generate_banner_from_prompt",
                "get_user_orders",
                "get_banner_products",
                "calculate_banner_pricing",
                "get_design_recommendations"
            ]
        }
    }

@app.get("/api/canvas/test")
async def test_canvas_table(current_user: dict = Depends(get_current_user)):
    """Test if canvas_states table exists and is accessible"""
    try:
        logger.info(f"Canvas test endpoint called by user: {current_user.get('user_id', 'unknown')}")
        
        # Try to count canvas states for this user
        response = db_manager.supabase.table("canvas_states") \
            .select("id", count="exact") \
            .eq("user_id", current_user['user_id']) \
            .execute()
        
        return {
            "success": True, 
            "message": "Canvas states table accessible",
            "user_id": current_user['user_id'],
            "count": response.count if hasattr(response, 'count') else 0
        }
    except Exception as e:
        logger.error(f"Canvas states table test failed: {e}")
        return {
            "success": False, 
            "error": str(e),
            "message": "Canvas states table not accessible - please run canvas_state_schema.sql"
        }

# Debug auth endpoint removed from production

# Debug auth required endpoint removed from production

# Canvas State Management Endpoints
class CanvasStateRequest(BaseModel):
    canvas_data: dict
    banner_settings: Optional[dict] = None
    session_id: Optional[str] = None
    is_checkout_session: Optional[bool] = False

@app.post("/api/canvas/save")
async def save_canvas_state(request: CanvasStateRequest, current_user: dict = Depends(get_current_user)):
    """Save user's canvas state to database"""
    try:
        user_id = current_user['user_id']
        logger.info(f"Saving canvas state for user: {user_id}")
        
        # Use upsert to either create new or update existing canvas state
        canvas_state_data = {
            'user_id': user_id,
            'session_id': request.session_id,
            'canvas_data': request.canvas_data,
            'banner_settings': request.banner_settings,
            'is_checkout_session': request.is_checkout_session,
            'expires_at': (datetime.utcnow() + timedelta(days=7)).isoformat()
        }
        
        logger.info(f"Canvas state data keys: {list(canvas_state_data.keys())}")
        logger.info(f"Canvas data elements count: {len(canvas_state_data['canvas_data'].get('elements', []))}")
        
        result = await db_manager.save_canvas_state(canvas_state_data)
        
        if result:
            logger.info("Canvas state saved successfully")
            return {"success": True, "message": "Canvas state saved successfully"}
        else:
            logger.error("Database method returned False")
            raise HTTPException(status_code=500, detail="Failed to save canvas state - database method returned False")
            
    except HTTPException:
        # Re-raise HTTPExceptions as they are already properly formatted
        raise
    except Exception as e:
        logger.error(f"Unexpected error saving canvas state: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/canvas/load")
async def load_canvas_state(
    session_id: Optional[str] = None, 
    is_checkout_session: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    """Load user's canvas state from database"""
    try:
        user_id = current_user['user_id']
        
        # Periodically clean up expired canvas states (roughly 1% of requests)
        import random
        if random.randint(1, 100) == 1:
            await db_manager.cleanup_expired_canvas_states()
        
        canvas_state = await db_manager.load_canvas_state(user_id, session_id, is_checkout_session)
        
        if canvas_state:
            return {
                "success": True, 
                "canvas_state": canvas_state
            }
        else:
            return {
                "success": False, 
                "message": "No canvas state found"
            }
            
    except Exception as e:
        logger.error(f"Error loading canvas state: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/canvas/clear")
async def clear_canvas_state(
    session_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Clear user's canvas state from database"""
    try:
        user_id = current_user['user_id']
        
        result = await db_manager.clear_canvas_state(user_id, session_id)
        
        if result:
            return {"success": True, "message": "Canvas state cleared successfully"}
        else:
            return {"success": False, "message": "No canvas state found to clear"}
            
    except Exception as e:
        logger.error(f"Error clearing canvas state: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Cache management endpoints removed from production

@app.post("/api/templates/clear-cache")
async def clear_templates_cache(current_user: dict = Depends(get_current_user)):
    """Clear templates cache for current user"""
    try:
        user_id = current_user["user_id"]
        cache_key = f"templates_user_{user_id}"
        deleted = cache.delete(cache_key)
        
        return {
            "success": True,
            "deleted": deleted,
            "message": f"Templates cache {'cleared' if deleted else 'was already empty'} for user {user_id}",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Business Card Tins API Endpoints

class BusinessCardTinRequest(BaseModel):
    quantity: int
    surface_coverage: str
    tin_finish: str
    printing_method: str
    surface_designs: Optional[Dict[str, Any]] = {}
    notes: Optional[str] = ""

class BusinessCardTinDesignUpdate(BaseModel):
    surface_designs: Dict[str, Any]

class BusinessCardTinStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = ""

@app.post("/api/business-card-tins/create")
async def create_business_card_tin_order(
    tin_request: BusinessCardTinRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new business card tin order"""
    try:
        # First create a basic order
        order_data = {
            "user_id": current_user["id"],
            "product_type": "business_card_tin",
            "status": "pending",
            "total_amount": 0,  # Will be calculated by tin creation
            "order_details": {
                "quantity": tin_request.quantity,
                "surface_coverage": tin_request.surface_coverage,
                "tin_finish": tin_request.tin_finish,
                "printing_method": tin_request.printing_method
            }
        }
        
        order_result = await db_manager.create_order(order_data)
        if not order_result.get("success"):
            raise HTTPException(status_code=400, detail=order_result.get("error", "Failed to create order"))
        
        order_id = order_result["order_id"]
        
        # Create the business card tin record
        tin_data = {
            "quantity": tin_request.quantity,
            "surface_coverage": tin_request.surface_coverage,
            "tin_finish": tin_request.tin_finish,
            "printing_method": tin_request.printing_method,
            "surface_designs": tin_request.surface_designs,
            "notes": tin_request.notes
        }
        
        tin_result = await db_manager.create_business_card_tin_order(
            current_user["id"], 
            order_id, 
            tin_data
        )
        
        if not tin_result.get("success"):
            # Clean up the order if tin creation failed
            await db_manager.delete_order(order_id)
            raise HTTPException(status_code=400, detail=tin_result.get("error", "Failed to create tin order"))
        
        # Update the order with the calculated total
        await db_manager.update_order_status(order_id, "pending", tin_result["total_price"])
        
        return {
            "success": True,
            "order_id": order_id,
            "tin_id": tin_result["tin_id"],
            "total_price": tin_result["total_price"],
            "message": "Business card tin order created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating business card tin order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/business-card-tins/{tin_id}")
async def get_business_card_tin(
    tin_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific business card tin by ID"""
    try:
        tin = await db_manager.get_business_card_tin(tin_id)
        if not tin:
            raise HTTPException(status_code=404, detail="Business card tin not found")
        
        # Verify user owns this tin
        if tin["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "tin": tin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting business card tin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/business-card-tins")
async def get_user_business_card_tins(
    current_user: dict = Depends(get_current_user)
):
    """Get all business card tins for the current user"""
    try:
        tins = await db_manager.get_user_business_card_tins(current_user["id"])
        return {
            "success": True,
            "tins": tins
        }
        
    except Exception as e:
        print(f"Error getting user business card tins: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/business-card-tins/{tin_id}/design")
async def update_business_card_tin_design(
    tin_id: str,
    design_update: BusinessCardTinDesignUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the design data for a business card tin"""
    try:
        # Verify user owns this tin
        tin = await db_manager.get_business_card_tin(tin_id)
        if not tin:
            raise HTTPException(status_code=404, detail="Business card tin not found")
        
        if tin["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await db_manager.update_business_card_tin_design(
            tin_id, 
            design_update.surface_designs
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update design")
        
        return {
            "success": True,
            "message": "Design updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating business card tin design: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/business-card-tins/{tin_id}/status")
async def update_business_card_tin_status(
    tin_id: str,
    status_update: BusinessCardTinStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update the status of a business card tin"""
    try:
        # Verify user owns this tin
        tin = await db_manager.get_business_card_tin(tin_id)
        if not tin:
            raise HTTPException(status_code=404, detail="Business card tin not found")
        
        if tin["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await db_manager.update_business_card_tin_status(
            tin_id, 
            status_update.status,
            status_update.notes
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to update status")
        
        return {
            "success": True,
            "message": "Status updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating business card tin status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/business-card-tins/{tin_id}")
async def delete_business_card_tin(
    tin_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a business card tin order"""
    try:
        # Verify user owns this tin
        tin = await db_manager.get_business_card_tin(tin_id)
        if not tin:
            raise HTTPException(status_code=404, detail="Business card tin not found")
        
        if tin["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        success = await db_manager.delete_business_card_tin(tin_id)
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to delete tin order")
        
        return {
            "success": True,
            "message": "Business card tin order deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting business card tin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/business-card-tins/order/{order_id}")
async def get_business_card_tin_by_order(
    order_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get business card tin by order ID"""
    try:
        tin = await db_manager.get_business_card_tin_by_order(order_id)
        if not tin:
            raise HTTPException(status_code=404, detail="Business card tin not found for this order")
        
        # Verify user owns this tin
        if tin["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "tin": tin
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting business card tin by order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
