from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.database import db_manager
from backend.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AdminStats(BaseModel):
    total_users: int
    total_creators: int
    total_templates: int
    pending_templates: int
    total_orders: int
    total_revenue: float
    recent_signups: int
    active_creators: int

class UserManagement(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str]
    created_at: str
    is_creator: bool
    is_active: bool
    last_login: Optional[str]

# =============================================
# ADMIN ACCESS CONTROL
# =============================================

async def verify_admin_access(current_user: dict) -> bool:
    """Verify if the current user has admin privileges"""
    user_id = current_user["user_id"]
    
    # TODO: Implement proper admin check - for now using hardcoded list
    admin_users = [
        "7be0211e-34c8-4357-946a-60b835586a89",  # Brainboxjp - for testing
        # Add other admin user IDs here
    ]
    
    return user_id in admin_users

# =============================================
# PLATFORM STATISTICS
# =============================================

@router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    """Get comprehensive platform statistics for admin dashboard"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get total users count from users table
        try:
            users_response = db_manager.supabase.table("users").select("id", count="exact").execute()
            total_users = users_response.count or 0
            print(f"✅ Total users: {total_users}")
        except Exception as e:
            print(f"⚠️ Error getting users count: {e}")
            total_users = 0
        
        # Get total creators count
        creators_response = db_manager.supabase.table("creators").select("id", count="exact").execute()
        total_creators = creators_response.count or 0
        
        # Get total templates count - both user templates and creator templates
        try:
            # Get creator templates count
            creator_templates_response = db_manager.supabase.table("creator_templates").select("id", count="exact").execute()
            creator_templates_count = creator_templates_response.count or 0
            
            # Get user templates count (banner_templates table)
            user_templates_response = db_manager.supabase.table("banner_templates").select("id", count="exact").execute()
            user_templates_count = user_templates_response.count or 0
            
            total_templates = creator_templates_count + user_templates_count
            print(f"✅ Total templates: {total_templates} (creator: {creator_templates_count}, user: {user_templates_count})")
        except Exception as e:
            print(f"⚠️ Error getting templates count: {e}")
            total_templates = 0
        
        # Get pending templates count
        pending_response = db_manager.supabase.table("creator_templates").select("id", count="exact").eq("is_approved", False).execute()
        pending_templates = pending_response.count or 0
        
        # Get total orders count - filter out test orders
        try:
            # First, let's see what status values exist
            status_response = db_manager.supabase.table("orders").select("status").execute()
            status_counts = {}
            for order in status_response.data or []:
                status = order.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1
            print(f"🔍 Order status breakdown: {status_counts}")
            
            orders_response = db_manager.supabase.table("orders").select("id", count="exact").neq("status", "test").execute()
            total_orders = orders_response.count or 0
            print(f"✅ Total orders (excluding test): {total_orders}")
        except Exception as e:
            print(f"⚠️ Error getting orders count: {e}")
            # Try without filter if the above fails
            try:
                orders_response = db_manager.supabase.table("orders").select("id", count="exact").execute()
                total_orders = orders_response.count or 0
                print(f"✅ Total orders (all): {total_orders}")
            except Exception as e2:
                print(f"⚠️ Error getting orders count (fallback): {e2}")
                total_orders = 0
        
        # Get total revenue
        revenue_response = db_manager.supabase.table("orders").select("total_amount").eq("status", "completed").execute()
        total_revenue = sum(order.get("total_amount", 0) for order in revenue_response.data or [])
        
        # Get recent signups (last 7 days) - estimate from creators table
        week_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        recent_signups_response = db_manager.supabase.table("creators").select("id", count="exact").gte("created_at", week_ago).execute()
        recent_signups = recent_signups_response.count or 0
        
        # Get active creators (creators with approved templates)
        active_creators_response = db_manager.supabase.table("creators").select("id", count="exact").eq("is_active", True).execute()
        active_creators = active_creators_response.count or 0
        
        return AdminStats(
            total_users=total_users,
            total_creators=total_creators,
            total_templates=total_templates,
            pending_templates=pending_templates,
            total_orders=total_orders,
            total_revenue=total_revenue,
            recent_signups=recent_signups,
            active_creators=active_creators
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# =============================================
# USER MANAGEMENT
# =============================================

@router.get("/admin/users", response_model=List[UserManagement])
async def get_all_users(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all users for admin management"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get real users from the users table
        users_response = db_manager.supabase.table("users").select(
            "user_id, email, full_name, created_at, is_creator, is_active, last_login"
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        users = []
        for user in users_response.data or []:
            users.append(UserManagement(
                user_id=user["user_id"],
                email=user.get("email", f"user_{user['user_id'][:8]}@buyprintz.com"),
                full_name=user.get("full_name"),
                created_at=user["created_at"],
                is_creator=user.get("is_creator", False),
                is_active=user.get("is_active", True),
                last_login=user.get("last_login")
            ))
        
        return users
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: str,
    reason: str = "Platform abuse",
    current_user: dict = Depends(get_current_user)
):
    """Ban a user from the platform"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Since we can't access auth.users directly, we'll mark the creator as inactive
        # This is a workaround - in a real implementation, you'd need proper user management
        ban_response = db_manager.supabase.table("creators").update({
            "is_active": False,
            "ban_reason": reason,
            "banned_at": datetime.utcnow().isoformat(),
            "banned_by": current_user["user_id"]
        }).eq("user_id", user_id).execute()
        
        if ban_response.data:
            print(f"✅ User {user_id} banned by admin {current_user['user_id']} - Reason: {reason}")
            return {
                "success": True,
                "message": f"User {user_id} has been banned"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error banning user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.put("/admin/users/{user_id}/unban")
async def unban_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unban a user from the platform"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Since we can't access auth.users directly, we'll mark the creator as active
        unban_response = db_manager.supabase.table("creators").update({
            "is_active": True,
            "unbanned_at": datetime.utcnow().isoformat(),
            "unbanned_by": current_user["user_id"]
        }).eq("user_id", user_id).execute()
        
        if unban_response.data:
            print(f"✅ User {user_id} unbanned by admin {current_user['user_id']}")
            return {
                "success": True,
                "message": f"User {user_id} has been unbanned"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error unbanning user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# =============================================
# TEMPLATE MANAGEMENT
# =============================================

@router.get("/admin/templates/pending")
async def get_pending_templates(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all pending templates for admin review"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get pending templates with creator info
        templates_response = db_manager.supabase.table("creator_templates").select(
            "*, creators(display_name, profile_image_url)"
        ).eq("is_approved", False).eq("is_active", True).order(
            "created_at", desc=True
        ).range(offset, offset + limit - 1).execute()
        
        return {
            "success": True,
            "templates": templates_response.data or [],
            "total": len(templates_response.data or [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting pending templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/admin/templates/all")
async def get_all_templates(
    limit: int = 100,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all templates for admin management"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get all templates with creator info
        templates_response = db_manager.supabase.table("creator_templates").select(
            "*, creators(display_name, profile_image_url)"
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return {
            "success": True,
            "templates": templates_response.data or [],
            "total": len(templates_response.data or [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting all templates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/admin/templates/{template_id}/approve")
async def approve_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve a pending template"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Update template to approved - only update fields that exist
        approve_response = db_manager.supabase.table("creator_templates").update({
            "is_approved": True
        }).eq("id", template_id).execute()
        
        if approve_response.data:
            print(f"✅ Template {template_id} approved by admin {current_user['user_id']}")
            return {
                "success": True,
                "message": "Template approved successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error approving template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.post("/admin/templates/{template_id}/reject")
async def reject_template(
    template_id: str,
    reason: str = "Does not meet platform standards",
    current_user: dict = Depends(get_current_user)
):
    """Reject a pending template"""
    try:
        print(f"🔍 Reject template request: {template_id} by user: {current_user['user_id']}")
        
        # Verify admin access
        if not await verify_admin_access(current_user):
            print(f"❌ Admin access denied for user: {current_user['user_id']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        print(f"✅ Admin access verified for user: {current_user['user_id']}")
        
        # First, check if template exists
        check_response = db_manager.supabase.table("creator_templates").select("id, is_approved, is_active").eq("id", template_id).execute()
        print(f"🔍 Template check response: {check_response.data}")
        
        if not check_response.data:
            print(f"❌ Template not found: {template_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Update template to rejected - only update fields that exist
        print(f"🔄 Updating template {template_id} to rejected...")
        reject_response = db_manager.supabase.table("creator_templates").update({
            "is_approved": False,
            "is_active": False
        }).eq("id", template_id).execute()
        
        print(f"🔍 Reject response: {reject_response.data}")
        
        if reject_response.data:
            print(f"✅ Template {template_id} rejected by admin {current_user['user_id']} - Reason: {reason}")
            return {
                "success": True,
                "message": "Template rejected successfully"
            }
        else:
            print(f"❌ No data returned from reject update for template: {template_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or update failed"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error rejecting template: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/admin/templates/{template_id}/delete")
async def delete_template(
    template_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Permanently delete a template (admin only)"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        print(f"🗑️ Deleting template: {template_id}")
        
        # Check if template exists
        template_result = db_manager.supabase.table("creator_templates").select("id, name").eq("id", template_id).execute()
        
        if not template_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found"
            )
        
        # Check if template has any sales (optional safety check)
        sales_result = db_manager.supabase.table("template_purchases").select("id").eq("template_id", template_id).execute()
        
        if sales_result.data:
            print(f"⚠️ Template {template_id} has {len(sales_result.data)} sales, but proceeding with deletion")
        
        # Delete the template
        delete_result = db_manager.supabase.table("creator_templates").delete().eq("id", template_id).execute()
        
        print(f"🗑️ Delete result: {delete_result}")
        
        if not delete_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Template not found or already deleted"
            )
        
        return {"success": True, "message": "Template deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting template: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

# =============================================
# PLATFORM ANALYTICS
# =============================================

@router.get("/admin/analytics/revenue")
async def get_revenue_analytics(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get revenue analytics for the specified period"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get revenue data for the specified period
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        revenue_response = db_manager.supabase.table("orders").select(
            "total_amount, created_at, status"
        ).gte("created_at", start_date).eq("status", "completed").execute()
        
        # Process revenue data by day
        daily_revenue = {}
        for order in revenue_response.data or []:
            date = order["created_at"][:10]  # Get YYYY-MM-DD
            if date not in daily_revenue:
                daily_revenue[date] = 0
            daily_revenue[date] += order.get("total_amount", 0)
        
        return {
            "success": True,
            "period_days": days,
            "total_revenue": sum(daily_revenue.values()),
            "daily_revenue": daily_revenue,
            "average_daily": sum(daily_revenue.values()) / len(daily_revenue) if daily_revenue else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting revenue analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/admin/analytics/users")
async def get_user_analytics(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get user analytics for the specified period"""
    try:
        # Verify admin access
        if not await verify_admin_access(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Get user signup data for the specified period
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        users_response = db_manager.supabase.table("creators").select(
            "created_at"
        ).gte("created_at", start_date).execute()
        
        # Process signup data by day
        daily_signups = {}
        for user in users_response.data or []:
            date = user["created_at"][:10]  # Get YYYY-MM-DD
            if date not in daily_signups:
                daily_signups[date] = 0
            daily_signups[date] += 1
        
        return {
            "success": True,
            "period_days": days,
            "total_signups": sum(daily_signups.values()),
            "daily_signups": daily_signups,
            "average_daily": sum(daily_signups.values()) / len(daily_signups) if daily_signups else 0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting user analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# Admin Notes Endpoints
@router.get("/admin/notes/{user_id}")
async def get_admin_notes(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get admin notes for a specific user"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = supabase.table("admin_notes").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
        
        return {"notes": result.data}
        
    except Exception as e:
        logger.error(f"Error getting admin notes for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get admin notes")


@router.post("/admin/notes/{user_id}")
async def create_or_update_admin_note(
    user_id: str, 
    note_data: dict, 
    current_user: dict = Depends(get_current_user)
):
    """Create or update admin note for a user"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        note_text = note_data.get("note", "").strip()
        if not note_text:
            raise HTTPException(status_code=400, detail="Note cannot be empty")
        
        # Check if note already exists for this user
        existing_note = supabase.table("admin_notes").select("id").eq("user_id", user_id).execute()
        
        if existing_note.data:
            # Update existing note
            result = supabase.table("admin_notes").update({
                "note": note_text,
                "updated_by": current_user["id"]
            }).eq("user_id", user_id).execute()
        else:
            # Create new note
            result = supabase.table("admin_notes").insert({
                "user_id": user_id,
                "note": note_text,
                "created_by": current_user["id"],
                "updated_by": current_user["id"]
            }).execute()
        
        return {"message": "Admin note saved successfully", "note": result.data[0] if result.data else None}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving admin note for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save admin note")


@router.delete("/admin/notes/{user_id}")
async def delete_admin_note(user_id: str, current_user: dict = Depends(get_current_user)):
    """Delete admin note for a user"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        result = supabase.table("admin_notes").delete().eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="No admin note found for this user")
        
        return {"message": "Admin note deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting admin note for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete admin note")


# Analytics Endpoints
@router.get("/admin/analytics/product-types")
async def get_product_type_analytics(current_user: dict = Depends(get_current_user)):
    """Get sales analytics by product type"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get orders with product type information
        orders_result = supabase.table("orders").select("product_type, status, total_amount").execute()
        
        # Process the data
        product_stats = {}
        total_revenue = 0
        
        for order in orders_result.data:
            if order["status"] == "completed":
                product_type = order["product_type"] or "Unknown"
                amount = float(order["total_amount"] or 0)
                
                if product_type not in product_stats:
                    product_stats[product_type] = {
                        "count": 0,
                        "revenue": 0,
                        "percentage": 0
                    }
                
                product_stats[product_type]["count"] += 1
                product_stats[product_type]["revenue"] += amount
                total_revenue += amount
        
        # Calculate percentages
        for product_type in product_stats:
            if total_revenue > 0:
                product_stats[product_type]["percentage"] = round(
                    (product_stats[product_type]["revenue"] / total_revenue) * 100, 2
                )
        
        return {
            "product_types": product_stats,
            "total_revenue": total_revenue,
            "total_orders": sum(stats["count"] for stats in product_stats.values())
        }
        
    except Exception as e:
        logger.error(f"Error getting product type analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get product type analytics")


@router.get("/admin/analytics/best-selling-designs")
async def get_best_selling_designs(current_user: dict = Depends(get_current_user)):
    """Get best selling designs/templates"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get template purchases with template details
        purchases_result = supabase.table("template_purchases").select(
            "template_id, created_at, creators(display_name, profile_image_url)"
        ).execute()
        
        # Get creator templates for template details
        templates_result = supabase.table("creator_templates").select(
            "id, title, category, product_type, thumbnail_url, is_approved"
        ).execute()
        
        # Create template lookup
        template_lookup = {t["id"]: t for t in templates_result.data}
        
        # Process sales data
        design_stats = {}
        
        for purchase in purchases_result.data:
            template_id = purchase["template_id"]
            if template_id in template_lookup:
                template = template_lookup[template_id]
                template_key = f"{template_id}_{template['title']}"
                
                if template_key not in design_stats:
                    design_stats[template_key] = {
                        "template_id": template_id,
                        "title": template["title"],
                        "category": template["category"],
                        "product_type": template["product_type"],
                        "thumbnail_url": template["thumbnail_url"],
                        "creator": purchase.get("creators", {}),
                        "sales_count": 0,
                        "last_sale": None
                    }
                
                design_stats[template_key]["sales_count"] += 1
                design_stats[template_key]["last_sale"] = purchase["created_at"]
        
        # Sort by sales count and return top 10
        top_designs = sorted(
            design_stats.values(), 
            key=lambda x: x["sales_count"], 
            reverse=True
        )[:10]
        
        return {"top_designs": top_designs}
        
    except Exception as e:
        logger.error(f"Error getting best selling designs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get best selling designs")


@router.get("/admin/analytics/best-selling-regions")
async def get_best_selling_regions(current_user: dict = Depends(get_current_user)):
    """Get sales analytics by region/state"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get orders with shipping address information
        orders_result = supabase.table("orders").select(
            "shipping_address, status, total_amount, created_at"
        ).execute()
        
        # Process the data
        region_stats = {}
        total_revenue = 0
        
        for order in orders_result.data:
            if order["status"] == "completed":
                shipping_address = order.get("shipping_address", {})
                state = shipping_address.get("state", "Unknown")
                amount = float(order["total_amount"] or 0)
                
                if state not in region_stats:
                    region_stats[state] = {
                        "count": 0,
                        "revenue": 0,
                        "percentage": 0,
                        "last_order": None
                    }
                
                region_stats[state]["count"] += 1
                region_stats[state]["revenue"] += amount
                region_stats[state]["last_order"] = order["created_at"]
                total_revenue += amount
        
        # Calculate percentages
        for state in region_stats:
            if total_revenue > 0:
                region_stats[state]["percentage"] = round(
                    (region_stats[state]["revenue"] / total_revenue) * 100, 2
                )
        
        # Sort by revenue and return top 15
        top_regions = sorted(
            region_stats.items(), 
            key=lambda x: x[1]["revenue"], 
            reverse=True
        )[:15]
        
        return {
            "regions": dict(top_regions),
            "total_revenue": total_revenue,
            "total_orders": sum(stats["count"] for stats in region_stats.values())
        }
        
    except Exception as e:
        logger.error(f"Error getting best selling regions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get best selling regions")


# Shipping Admin Endpoints
@router.get("/admin/shipping/orders")
async def get_shipping_orders(current_user: dict = Depends(get_current_user)):
    """Get all orders with shipping information"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get orders with shipping details
        orders_result = supabase.table("orders").select(
            "id, order_number, status, total_amount, shipping_address, tracking_number, "
            "shipping_method, shipping_cost, created_at, updated_at, product_type"
        ).order("created_at", desc=True).limit(100).execute()
        
        return {"orders": orders_result.data}
        
    except Exception as e:
        logger.error(f"Error getting shipping orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get shipping orders")


@router.get("/admin/shipping/orders/{order_id}/track")
async def track_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Track a specific order using UPS API"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get order details
        order_result = supabase.table("orders").select("*").eq("id", order_id).execute()
        
        if not order_result.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = order_result.data[0]
        tracking_number = order.get("tracking_number")
        
        if not tracking_number:
            return {
                "order_id": order_id,
                "tracking_number": None,
                "status": "No tracking number available",
                "message": "This order does not have a tracking number yet"
            }
        
        # Import UPS service here to avoid circular imports
        from backend.ups_shipping_service import ups_shipping_service
        
        # Track the package
        tracking_result = await ups_shipping_service.track_package(tracking_number)
        
        return {
            "order_id": order_id,
            "tracking_number": tracking_number,
            "tracking_info": tracking_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking order {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to track order")


@router.post("/admin/shipping/quote")
async def get_shipping_quote(
    quote_request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Get shipping quote for admin testing"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Import UPS service here to avoid circular imports
        from backend.ups_shipping_service import ups_shipping_service
        
        # Validate required fields
        required_fields = ["zip_code", "product_type", "quantity"]
        for field in required_fields:
            if field not in quote_request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Prepare customer info for UPS
        customer_info = {
            "zipCode": quote_request["zip_code"],
            "address": quote_request.get("address", "123 Admin St"),
            "city": quote_request.get("city", "Admin City"),
            "state": quote_request.get("state", "CA")
        }
        
        # Prepare order data
        order_data = {
            "total_quantity": quote_request["quantity"],
            "product_type": quote_request["product_type"],
            "dimensions": quote_request.get("dimensions", {}),
            "weight": quote_request.get("weight", 1.0)
        }
        
        # Get UPS shipping rates
        result = await ups_shipping_service.get_multiple_service_rates(order_data, customer_info)
        
        return {
            "quote_request": quote_request,
            "shipping_options": result.get("shipping_options", []),
            "success": result.get("success", False),
            "errors": result.get("errors", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting shipping quote: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get shipping quote")


@router.get("/admin/shipping/analytics")
async def get_shipping_analytics(current_user: dict = Depends(get_current_user)):
    """Get shipping analytics and performance metrics"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get orders with shipping data
        orders_result = supabase.table("orders").select(
            "status, shipping_method, shipping_cost, total_amount, created_at, shipping_address"
        ).execute()
        
        # Process analytics
        analytics = {
            "total_orders": len(orders_result.data),
            "shipped_orders": 0,
            "pending_shipment": 0,
            "total_shipping_cost": 0,
            "average_shipping_cost": 0,
            "shipping_methods": {},
            "shipping_by_state": {},
            "recent_shipments": []
        }
        
        for order in orders_result.data:
            if order["status"] in ["shipped", "delivered"]:
                analytics["shipped_orders"] += 1
                analytics["total_shipping_cost"] += float(order.get("shipping_cost", 0))
                
                # Track shipping methods
                method = order.get("shipping_method", "Unknown")
                analytics["shipping_methods"][method] = analytics["shipping_methods"].get(method, 0) + 1
                
                # Track by state
                shipping_address = order.get("shipping_address", {})
                state = shipping_address.get("state", "Unknown")
                analytics["shipping_by_state"][state] = analytics["shipping_by_state"].get(state, 0) + 1
                
                # Recent shipments (last 10)
                if len(analytics["recent_shipments"]) < 10:
                    analytics["recent_shipments"].append({
                        "order_id": order.get("id"),
                        "status": order["status"],
                        "shipping_method": method,
                        "shipping_cost": order.get("shipping_cost"),
                        "created_at": order["created_at"]
                    })
            elif order["status"] in ["processing", "confirmed"]:
                analytics["pending_shipment"] += 1
        
        # Calculate averages
        if analytics["shipped_orders"] > 0:
            analytics["average_shipping_cost"] = round(
                analytics["total_shipping_cost"] / analytics["shipped_orders"], 2
            )
        
        # Sort recent shipments by date
        analytics["recent_shipments"].sort(
            key=lambda x: x["created_at"], reverse=True
        )
        
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting shipping analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get shipping analytics")


@router.put("/admin/shipping/orders/{order_id}/update-tracking")
async def update_order_tracking(
    order_id: str,
    tracking_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update tracking information for an order"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Validate tracking data
        tracking_number = tracking_data.get("tracking_number")
        shipping_method = tracking_data.get("shipping_method")
        
        if not tracking_number:
            raise HTTPException(status_code=400, detail="Tracking number is required")
        
        # Update order with tracking information
        update_data = {
            "tracking_number": tracking_number,
            "shipping_method": shipping_method,
            "status": "shipped",
            "updated_at": datetime.now().isoformat()
        }
        
        result = supabase.table("orders").update(update_data).eq("id", order_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {
            "message": "Tracking information updated successfully",
            "order_id": order_id,
            "tracking_number": tracking_number
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tracking for order {order_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update tracking information")


# Package Lookup Endpoints
@router.get("/admin/shipping/lookup/tracking/{tracking_number}")
async def lookup_by_tracking_number(tracking_number: str, current_user: dict = Depends(get_current_user)):
    """Lookup package by tracking number"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Find order by tracking number
        order_result = supabase.table("orders").select("*").eq("tracking_number", tracking_number).execute()
        
        if not order_result.data:
            return {
                "success": False,
                "message": "No order found with this tracking number",
                "tracking_number": tracking_number
            }
        
        order = order_result.data[0]
        
        # Get detailed tracking from UPS
        from backend.ups_shipping_service import ups_shipping_service
        tracking_info = await ups_shipping_service.track_package(tracking_number)
        
        return {
            "success": True,
            "order": order,
            "tracking_info": tracking_info,
            "tracking_number": tracking_number
        }
        
    except Exception as e:
        logger.error(f"Error looking up package by tracking number {tracking_number}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to lookup package")


@router.get("/admin/shipping/lookup/order/{order_number}")
async def lookup_by_order_number(order_number: str, current_user: dict = Depends(get_current_user)):
    """Lookup package by order number"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Find order by order number
        order_result = supabase.table("orders").select("*").eq("order_number", order_number).execute()
        
        if not order_result.data:
            return {
                "success": False,
                "message": "No order found with this order number",
                "order_number": order_number
            }
        
        order = order_result.data[0]
        tracking_number = order.get("tracking_number")
        
        tracking_info = None
        if tracking_number:
            # Get detailed tracking from UPS
            from backend.ups_shipping_service import ups_shipping_service
            tracking_info = await ups_shipping_service.track_package(tracking_number)
        
        return {
            "success": True,
            "order": order,
            "tracking_info": tracking_info,
            "tracking_number": tracking_number
        }
        
    except Exception as e:
        logger.error(f"Error looking up package by order number {order_number}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to lookup package")


@router.get("/admin/shipping/lookup/customer/{customer_email}")
async def lookup_by_customer_email(customer_email: str, current_user: dict = Depends(get_current_user)):
    """Lookup packages by customer email"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Find orders by customer email (assuming email is stored in shipping_address or customer_info)
        orders_result = supabase.table("orders").select("*").ilike("shipping_address->>email", f"%{customer_email}%").execute()
        
        if not orders_result.data:
            return {
                "success": False,
                "message": "No orders found for this customer email",
                "customer_email": customer_email,
                "orders": []
            }
        
        orders = orders_result.data
        
        # Get tracking info for orders with tracking numbers
        orders_with_tracking = []
        for order in orders:
            tracking_number = order.get("tracking_number")
            tracking_info = None
            
            if tracking_number:
                try:
                    from backend.ups_shipping_service import ups_shipping_service
                    tracking_info = await ups_shipping_service.track_package(tracking_number)
                except Exception as e:
                    logger.warning(f"Failed to get tracking info for {tracking_number}: {e}")
            
            orders_with_tracking.append({
                "order": order,
                "tracking_info": tracking_info,
                "tracking_number": tracking_number
            })
        
        return {
            "success": True,
            "customer_email": customer_email,
            "orders": orders_with_tracking,
            "total_orders": len(orders_with_tracking)
        }
        
    except Exception as e:
        logger.error(f"Error looking up packages by customer email {customer_email}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to lookup packages")


@router.get("/admin/shipping/track/{tracking_number}")
async def get_detailed_tracking(tracking_number: str, current_user: dict = Depends(get_current_user)):
    """Get detailed tracking information from UPS"""
    try:
        # TODO: Add proper admin role check
        if current_user.get("email") != "Brainboxjp@gmail.com":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get detailed tracking from UPS
        from backend.ups_shipping_service import ups_shipping_service
        tracking_details = await ups_shipping_service.track_package(tracking_number)
        
        # Also get order information
        order_result = supabase.table("orders").select("*").eq("tracking_number", tracking_number).execute()
        order = order_result.data[0] if order_result.data else None
        
        return {
            "success": True,
            "tracking_number": tracking_number,
            "tracking_details": tracking_details,
            "order": order
        }
        
    except Exception as e:
        logger.error(f"Error getting detailed tracking for {tracking_number}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get detailed tracking information")
