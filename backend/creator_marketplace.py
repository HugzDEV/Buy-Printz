"""
BuyPrintz Creator Marketplace API Endpoints
Phase 1: Foundation - Creator registration and basic template management
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
import os
import stripe
from database import DatabaseManager
from auth import get_current_user
from generate_thumbnails import process_single_image, validate_image_file

# Initialize router
router = APIRouter(prefix="/api/creator-marketplace", tags=["creator-marketplace"])

# Initialize database manager
db_manager = DatabaseManager()

# =============================================
# PYDANTIC MODELS
# =============================================

class CreatorRegistration(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=200)
    social_links: Optional[Dict[str, str]] = Field(default_factory=dict)
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if not v.strip():
            raise ValueError('Display name cannot be empty')
        return v.strip()

class CreatorProfile(BaseModel):
    id: str
    user_id: str
    display_name: str
    bio: Optional[str]
    profile_image_url: Optional[str]
    website: Optional[str]
    social_links: Dict[str, str]
    is_verified: bool
    is_active: bool
    total_earnings: float
    templates_sold: int
    rating: float
    rating_count: int
    created_at: datetime
    updated_at: datetime

class TemplateUpload(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    category: str = Field(..., min_length=2, max_length=50)
    price: float = Field(..., ge=3.0, le=25.0)
    canvas_data: Dict[str, Any]
    tags: List[str] = Field(default_factory=list)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Template name cannot be empty')
        return v.strip()
    
    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Template description cannot be empty')
        return v.strip()
    
    @validator('price')
    def validate_price(cls, v):
        # Round to 2 decimal places
        return round(v, 2)

class TemplateInfo(BaseModel):
    id: str
    creator_id: str
    name: str
    description: str
    category: str
    price: float
    preview_image_url: Optional[str]
    tags: List[str]
    is_approved: bool
    is_featured: bool
    is_active: bool
    sales_count: int
    view_count: int
    rating: float
    rating_count: int
    created_at: datetime
    updated_at: datetime

class TemplatePurchase(BaseModel):
    template_id: str
    price_paid: float
    commission_amount: float
    creator_earnings: float
    stripe_payment_intent_id: Optional[str] = None

# =============================================
# CREATOR MANAGEMENT ENDPOINTS
# =============================================

@router.post("/creators/register")
async def register_creator(
    creator_data: CreatorRegistration,
    current_user: dict = Depends(get_current_user)
):
    """Register a new creator account"""
    try:
        user_id = current_user["user_id"]
        
        # Check if user is already a creator
        existing_creator = await db_manager.get_creator_by_user_id(user_id)
        if existing_creator:
            raise HTTPException(
                status_code=400, 
                detail="User is already registered as a creator"
            )
        
        # Create creator profile
        creator_id = str(uuid.uuid4())
        creator_profile = {
            "id": creator_id,
            "user_id": user_id,
            "display_name": creator_data.display_name,
            "bio": creator_data.bio,
            "website": creator_data.website,
            "social_links": creator_data.social_links or {},
            "is_verified": False,
            "is_active": True,
            "total_earnings": 0.00,
            "templates_sold": 0,
            "rating": 0.00,
            "rating_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        result = await db_manager.create_creator(creator_profile)
        
        if result:
            return {
                "success": True,
                "message": "Creator account created successfully",
                "creator_id": creator_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to create creator account"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error registering creator: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during creator registration"
        )

@router.get("/creators/profile")
async def get_creator_profile(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's creator profile"""
    try:
        user_id = current_user["user_id"]
        creator = await db_manager.get_creator_by_user_id(user_id)
        
        if not creator:
            raise HTTPException(
                status_code=404,
                detail="Creator profile not found"
            )
        
        return {
            "success": True,
            "creator": creator
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.put("/creators/profile")
async def update_creator_profile(
    creator_data: CreatorRegistration,
    current_user: dict = Depends(get_current_user)
):
    """Update creator profile"""
    try:
        user_id = current_user["user_id"]
        
        # Check if creator exists
        existing_creator = await db_manager.get_creator_by_user_id(user_id)
        if not existing_creator:
            raise HTTPException(
                status_code=404,
                detail="Creator profile not found"
            )
        
        # Update creator data
        update_data = {
            "display_name": creator_data.display_name,
            "bio": creator_data.bio,
            "website": creator_data.website,
            "social_links": creator_data.social_links or {},
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = await db_manager.update_creator(existing_creator["id"], update_data)
        
        if result:
            return {
                "success": True,
                "message": "Creator profile updated successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to update creator profile"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating creator profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/creators/{creator_id}")
async def get_creator_public_profile(creator_id: str):
    """Get public creator profile"""
    try:
        creator = await db_manager.get_creator_by_id(creator_id)
        
        if not creator or not creator.get("is_active", False):
            raise HTTPException(
                status_code=404,
                detail="Creator not found"
            )
        
        # Remove sensitive information for public view
        public_creator = {
            "id": creator["id"],
            "display_name": creator["display_name"],
            "bio": creator["bio"],
            "profile_image_url": creator.get("profile_image_url"),
            "website": creator.get("website"),
            "social_links": creator.get("social_links", {}),
            "is_verified": creator.get("is_verified", False),
            "templates_sold": creator.get("templates_sold", 0),
            "rating": creator.get("rating", 0.0),
            "rating_count": creator.get("rating_count", 0),
            "created_at": creator["created_at"]
        }
        
        return {
            "success": True,
            "creator": public_creator
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator public profile: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# =============================================
# TEMPLATE MANAGEMENT ENDPOINTS
# =============================================

@router.post("/templates/upload")
async def upload_template(
    template_data: TemplateUpload,
    current_user: dict = Depends(get_current_user)
):
    """Upload a new template to the marketplace"""
    try:
        user_id = current_user["user_id"]
        
        # Check if user is a creator
        creator = await db_manager.get_creator_by_user_id(user_id)
        if not creator:
            raise HTTPException(
                status_code=403,
                detail="User must be a registered creator to upload templates"
            )
        
        # Validate canvas data
        if not template_data.canvas_data or not isinstance(template_data.canvas_data, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid canvas data"
            )
        
        # Create template record
        template_id = str(uuid.uuid4())
        template_record = {
            "id": template_id,
            "creator_id": creator["id"],
            "name": template_data.name,
            "description": template_data.description,
            "category": template_data.category,
            "price": template_data.price,
            "canvas_data": json.dumps(template_data.canvas_data),
            "tags": template_data.tags,
            "is_approved": False,
            "is_featured": False,
            "is_active": True,
            "sales_count": 0,
            "view_count": 0,
            "rating": 0.0,
            "rating_count": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert into database
        result = await db_manager.create_creator_template(template_record)
        
        if result:
            return {
                "success": True,
                "message": "Template uploaded successfully and is pending review",
                "template_id": template_id
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to upload template"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading template: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error during template upload"
        )

@router.get("/templates/my-templates")
async def get_my_templates(
    current_user: dict = Depends(get_current_user)
):
    """Get current creator's templates"""
    try:
        user_id = current_user["user_id"]
        
        # Check if user is a creator
        creator = await db_manager.get_creator_by_user_id(user_id)
        if not creator:
            raise HTTPException(
                status_code=403,
                detail="User must be a registered creator"
            )
        
        # Get creator's templates
        templates = await db_manager.get_creator_templates(creator["id"])
        
        return {
            "success": True,
            "templates": templates
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator templates: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/templates/marketplace")
async def get_marketplace_templates(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """Get approved templates from the marketplace"""
    try:
        # Build filters
        filters = {
            "is_approved": True,
            "is_active": True
        }
        
        if category:
            filters["category"] = category
        
        if min_price is not None:
            filters["min_price"] = min_price
            
        if max_price is not None:
            filters["max_price"] = max_price
            
        if search:
            filters["search"] = search
        
        # Get templates
        templates = await db_manager.get_marketplace_templates(
            filters=filters,
            limit=limit,
            offset=offset
        )
        
        return {
            "success": True,
            "templates": templates,
            "count": len(templates)
        }
        
    except Exception as e:
        print(f"Error getting marketplace templates: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/templates/{template_id}")
async def get_template_details(template_id: str):
    """Get detailed template information"""
    try:
        template = await db_manager.get_creator_template(template_id)
        
        if not template:
            raise HTTPException(
                status_code=404,
                detail="Template not found"
            )
        
        # Check if template is approved and active
        if not template.get("is_approved", False) or not template.get("is_active", False):
            raise HTTPException(
                status_code=404,
                detail="Template not available"
            )
        
        # Increment view count
        await db_manager.increment_template_views(template_id)
        
        # Get creator information
        creator = await db_manager.get_creator_by_id(template["creator_id"])
        
        template_details = {
            "id": template["id"],
            "name": template["name"],
            "description": template["description"],
            "category": template["category"],
            "price": template["price"],
            "preview_image_url": template.get("preview_image_url"),
            "tags": template.get("tags", []),
            "sales_count": template.get("sales_count", 0),
            "view_count": template.get("view_count", 0),
            "rating": template.get("rating", 0.0),
            "rating_count": template.get("rating_count", 0),
            "created_at": template["created_at"],
            "creator": {
                "id": creator["id"],
                "display_name": creator["display_name"],
                "is_verified": creator.get("is_verified", False),
                "rating": creator.get("rating", 0.0),
                "templates_sold": creator.get("templates_sold", 0)
            } if creator else None
        }
        
        return {
            "success": True,
            "template": template_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting template details: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# =============================================
# ANALYTICS ENDPOINTS
# =============================================

@router.get("/creators/analytics")
async def get_creator_analytics(
    current_user: dict = Depends(get_current_user)
):
    """Get creator analytics and earnings"""
    try:
        user_id = current_user["user_id"]
        
        # Check if user is a creator
        creator = await db_manager.get_creator_by_user_id(user_id)
        if not creator:
            raise HTTPException(
                status_code=403,
                detail="User must be a registered creator"
            )
        
        # Get analytics data
        analytics = await db_manager.get_creator_analytics(creator["id"])
        
        return {
            "success": True,
            "analytics": analytics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator analytics: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# =============================================
# ADMIN ENDPOINTS (for template approval)
# =============================================

@router.get("/admin/pending-templates")
async def get_pending_templates(
    current_user: dict = Depends(get_current_user)
):
    """Get templates pending approval (admin only)"""
    try:
        # Check if user is admin (you'll need to implement admin check)
        # For now, we'll allow any authenticated user to see pending templates
        # In production, you should implement proper admin role checking
        
        pending_templates = await db_manager.get_pending_templates()
        
        return {
            "success": True,
            "templates": pending_templates
        }
        
    except Exception as e:
        print(f"Error getting pending templates: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.post("/admin/templates/{template_id}/approve")
async def approve_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve a template for marketplace (admin only)"""
    try:
        # Check if user is admin (implement proper admin check)
        
        # Get template
        template = await db_manager.get_creator_template(template_id)
        if not template:
            raise HTTPException(
                status_code=404,
                detail="Template not found"
            )
        
        # Approve template
        result = await db_manager.approve_template(
            template_id, 
            approved_by=current_user["user_id"]
        )
        
        if result:
            return {
                "success": True,
                "message": "Template approved successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to approve template"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error approving template: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.post("/admin/templates/{template_id}/reject")
async def reject_template(
    template_id: str,
    reason: str = Form(...),
    current_user: dict = Depends(get_current_user)
):
    """Reject a template (admin only)"""
    try:
        # Check if user is admin (implement proper admin check)
        
        # Get template
        template = await db_manager.get_creator_template(template_id)
        if not template:
            raise HTTPException(
                status_code=404,
                detail="Template not found"
            )
        
        # Reject template
        result = await db_manager.reject_template(
            template_id,
            reason=reason,
            rejected_by=current_user["user_id"]
        )
        
        if result:
            return {
                "success": True,
                "message": "Template rejected successfully"
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to reject template"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error rejecting template: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# =============================================
# PAYMENT PROCESSING ENDPOINTS
# =============================================

@router.post("/templates/{template_id}/purchase")
async def create_template_purchase_intent(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Create a payment intent for template purchase"""
    try:
        # Get template details
        template = await db_manager.get_creator_template(template_id)
        if not template:
            raise HTTPException(
                status_code=404,
                detail="Template not found"
            )
        
        # Check if template is approved and active
        if not template.get("is_approved", False) or not template.get("is_active", False):
            raise HTTPException(
                status_code=400,
                detail="Template is not available for purchase"
            )
        
        # Check if user already purchased this template
        user_purchases = await db_manager.get_user_purchases(current_user["user_id"])
        if any(purchase["template_id"] == template_id for purchase in user_purchases):
            raise HTTPException(
                status_code=400,
                detail="You have already purchased this template"
            )
        
        # Calculate commission and earnings
        price = float(template["price"])
        commission_amount = round(price * 0.20, 2)  # 20% commission
        creator_earnings = round(price * 0.80, 2)   # 80% creator earnings
        
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=int(price * 100),  # Convert to cents
            currency="usd",
            metadata={
                "template_id": template_id,
                "creator_id": template["creator_id"],
                "buyer_id": current_user["user_id"],
                "commission_amount": str(commission_amount),
                "creator_earnings": str(creator_earnings),
                "type": "template_purchase"
            }
        )
        
        return {
            "success": True,
            "client_secret": payment_intent.client_secret,
            "amount": price,
            "currency": "usd",
            "template": {
                "id": template["id"],
                "name": template["name"],
                "price": price,
                "creator_name": template.get("creator_name", "Unknown")
            }
        }
        
    except HTTPException:
        raise
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Payment processing error: {str(e)}"
        )
    except Exception as e:
        print(f"Error creating template purchase intent: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.post("/payments/webhook")
async def handle_template_purchase_webhook(request: Request):
    """Handle Stripe webhooks for template purchases"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="No signature header")
        
        # Get webhook secret from environment
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        if not webhook_secret:
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        
        # Handle payment success
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            
            # Check if this is a template purchase
            if payment_intent.get("metadata", {}).get("type") == "template_purchase":
                await process_template_purchase(payment_intent)
        
        return {"success": True}
        
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        print(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def process_template_purchase(payment_intent):
    """Process a successful template purchase"""
    try:
        metadata = payment_intent.get("metadata", {})
        
        template_id = metadata.get("template_id")
        creator_id = metadata.get("creator_id")
        buyer_id = metadata.get("buyer_id")
        commission_amount = float(metadata.get("commission_amount", 0))
        creator_earnings = float(metadata.get("creator_earnings", 0))
        
        if not all([template_id, creator_id, buyer_id]):
            print("Missing required metadata for template purchase")
            return
        
        # Create purchase record
        purchase_data = {
            "id": str(uuid.uuid4()),
            "template_id": template_id,
            "buyer_id": buyer_id,
            "creator_id": creator_id,
            "price_paid": payment_intent["amount"] / 100,  # Convert from cents
            "commission_amount": commission_amount,
            "creator_earnings": creator_earnings,
            "stripe_payment_intent_id": payment_intent["id"],
            "stripe_charge_id": payment_intent.get("charges", {}).get("data", [{}])[0].get("id"),
            "status": "completed",
            "purchased_at": datetime.utcnow().isoformat()
        }
        
        # Save purchase to database
        success = await db_manager.create_template_purchase(purchase_data)
        
        if success:
            print(f"Template purchase processed successfully: {template_id}")
        else:
            print(f"Failed to save template purchase: {template_id}")
            
    except Exception as e:
        print(f"Error processing template purchase: {e}")

@router.get("/purchases/my-purchases")
async def get_my_purchases(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's template purchases"""
    try:
        purchases = await db_manager.get_user_purchases(current_user["user_id"])
        
        return {
            "success": True,
            "purchases": purchases
        }
        
    except Exception as e:
        print(f"Error getting user purchases: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.get("/creators/{creator_id}/earnings")
async def get_creator_earnings(
    creator_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get creator's earnings from template sales"""
    try:
        # Check if user is the creator
        creator = await db_manager.get_creator_by_user_id(current_user["user_id"])
        if not creator or creator["id"] != creator_id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        
        earnings = await db_manager.get_creator_earnings(creator_id)
        
        return {
            "success": True,
            "earnings": earnings
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator earnings: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

@router.post("/templates/generate-thumbnail")
async def generate_template_thumbnail(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Generate a thumbnail for an uploaded template image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file to process
        temp_path = f"temp_{uuid.uuid4()}_{file.filename}"
        
        try:
            # Save uploaded file temporarily
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Validate the image
            is_valid, message = validate_image_file(temp_path)
            if not is_valid:
                raise HTTPException(status_code=400, detail=f"Invalid image: {message}")
            
            # Generate thumbnail
            result = process_single_image(temp_path)
            
            if result['success']:
                return {
                    "success": True,
                    "thumbnail_url": result['thumbnail_url'],
                    "file_size": result['file_size'],
                    "thumbnail_size": result['thumbnail_size'],
                    "message": "Thumbnail generated successfully"
                }
            else:
                raise HTTPException(status_code=500, detail=f"Failed to generate thumbnail: {result['error']}")
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating thumbnail: {str(e)}")

@router.post("/templates/validate-image")
async def validate_template_image(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Validate an uploaded template image"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file to validate
        temp_path = f"temp_{uuid.uuid4()}_{file.filename}"
        
        try:
            # Save uploaded file temporarily
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Validate the image
            is_valid, message = validate_image_file(temp_path)
            file_size = os.path.getsize(temp_path)
            
            return {
                "success": True,
                "valid": is_valid,
                "message": message,
                "file_size": file_size,
                "filename": file.filename,
                "content_type": file.content_type
            }
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating image: {str(e)}")
