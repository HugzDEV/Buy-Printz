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
