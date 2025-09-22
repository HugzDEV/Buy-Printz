"""
BuyPrintz Creator Follower System API
Handles following/unfollowing creators, notifications, and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from .database import db_manager
from .auth import get_current_user

router = APIRouter()

# =============================================
# FOLLOWER MANAGEMENT ENDPOINTS
# =============================================

@router.post("/creators/{creator_id}/follow")
async def follow_creator(
    creator_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Follow a creator"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Check if creator exists
        creator = await db_manager.get_creator_by_id(creator_id)
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # Can't follow yourself
        if creator["user_id"] == follower_user_id:
            raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
        # Check if already following
        existing_follow = db_manager.supabase.table("creator_followers").select("*").eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        if existing_follow.data:
            raise HTTPException(status_code=400, detail="Already following this creator")
        
        # Add follow relationship
        follow_data = {
            "creator_id": creator_id,
            "follower_user_id": follower_user_id,
            "followed_at": datetime.utcnow().isoformat()
        }
        
        result = db_manager.supabase.table("creator_followers").insert(follow_data).execute()
        
        # Set default notification preferences
        preferences_data = {
            "follower_user_id": follower_user_id,
            "creator_id": creator_id,
            "notify_new_templates": True,
            "notify_sales": False,
            "notify_updates": True
        }
        
        db_manager.supabase.table("creator_following_preferences").insert(preferences_data).execute()
        
        return {
            "success": True,
            "message": f"Now following {creator['display_name']}",
            "followers_count": creator.get("followers_count", 0) + 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error following creator: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/creators/{creator_id}/follow")
async def unfollow_creator(
    creator_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Unfollow a creator"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Check if following
        existing_follow = db_manager.supabase.table("creator_followers").select("*").eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        if not existing_follow.data:
            raise HTTPException(status_code=400, detail="Not following this creator")
        
        # Remove follow relationship
        db_manager.supabase.table("creator_followers").delete().eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        # Remove notification preferences
        db_manager.supabase.table("creator_following_preferences").delete().eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        # Get updated followers count
        creator = await db_manager.get_creator_by_id(creator_id)
        
        return {
            "success": True,
            "message": "Unfollowed creator",
            "followers_count": creator.get("followers_count", 0)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error unfollowing creator: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/creators/{creator_id}/follow-status")
async def get_follow_status(
    creator_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if current user is following a creator"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Check if following
        existing_follow = db_manager.supabase.table("creator_followers").select("*").eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        is_following = len(existing_follow.data) > 0
        
        return {
            "success": True,
            "is_following": is_following
        }
        
    except Exception as e:
        print(f"Error checking follow status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================
# FOLLOWING MANAGEMENT ENDPOINTS
# =============================================

@router.get("/users/following")
async def get_user_following(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get creators that the current user is following"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Get following with creator details
        following_response = db_manager.supabase.table("creator_followers").select(
            "creator_id, followed_at, creators!inner(id, display_name, bio, profile_image_url, followers_count, is_verified)"
        ).eq("follower_user_id", follower_user_id).order("followed_at", desc=True).range(offset, offset + limit - 1).execute()
        
        following_data = following_response.data or []
        
        # Format the response
        following = []
        for item in following_data:
            creator = item["creators"]
            following.append({
                "creator_id": creator["id"],
                "display_name": creator["display_name"],
                "bio": creator["bio"],
                "profile_image_url": creator["profile_image_url"],
                "followers_count": creator["followers_count"],
                "is_verified": creator["is_verified"],
                "followed_at": item["followed_at"]
            })
        
        return {
            "success": True,
            "following": following,
            "total": len(following_data)
        }
        
    except Exception as e:
        print(f"Error getting user following: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/creators/{creator_id}/followers")
async def get_creator_followers(
    creator_id: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get followers of a specific creator (public endpoint)"""
    try:
        # Check if creator exists
        creator = await db_manager.get_creator_by_id(creator_id)
        if not creator:
            raise HTTPException(status_code=404, detail="Creator not found")
        
        # Get followers (only public info)
        followers_response = db_manager.supabase.table("creator_followers").select(
            "follower_user_id, followed_at, auth.users!inner(id, full_name, avatar_url)"
        ).eq("creator_id", creator_id).order("followed_at", desc=True).range(offset, offset + limit - 1).execute()
        
        followers_data = followers_response.data or []
        
        # Format the response (limited public info)
        followers = []
        for item in followers_data:
            user = item["auth.users"]
            followers.append({
                "user_id": user["id"],
                "display_name": user.get("full_name", "Anonymous"),
                "avatar_url": user.get("avatar_url"),
                "followed_at": item["followed_at"]
            })
        
        return {
            "success": True,
            "followers": followers,
            "total": len(followers_data),
            "creator": {
                "id": creator["id"],
                "display_name": creator["display_name"],
                "followers_count": creator.get("followers_count", 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting creator followers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================
# NOTIFICATION ENDPOINTS
# =============================================

@router.get("/notifications")
async def get_user_notifications(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False)
):
    """Get notifications for the current user"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Build query
        query = db_manager.supabase.table("creator_notifications").select(
            "*, creators!inner(id, display_name, profile_image_url), creator_templates(id, name, preview_image_url)"
        ).eq("follower_user_id", follower_user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        notifications_response = query.execute()
        notifications_data = notifications_response.data or []
        
        # Format the response
        notifications = []
        for item in notifications_data:
            creator = item["creators"]
            template = item.get("creator_templates")
            
            notifications.append({
                "id": item["id"],
                "type": item["notification_type"],
                "title": item["title"],
                "message": item["message"],
                "is_read": item["is_read"],
                "created_at": item["created_at"],
                "creator": {
                    "id": creator["id"],
                    "display_name": creator["display_name"],
                    "profile_image_url": creator["profile_image_url"]
                },
                "template": {
                    "id": template["id"] if template else None,
                    "name": template["name"] if template else None,
                    "preview_image_url": template["preview_image_url"] if template else None
                } if template else None
            })
        
        return {
            "success": True,
            "notifications": notifications,
            "total": len(notifications_data)
        }
        
    except Exception as e:
        print(f"Error getting notifications: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Update notification
        result = db_manager.supabase.table("creator_notifications").update({
            "is_read": True
        }).eq("id", notification_id).eq("follower_user_id", follower_user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {
            "success": True,
            "message": "Notification marked as read"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read for the current user"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Update all unread notifications
        result = db_manager.supabase.table("creator_notifications").update({
            "is_read": True
        }).eq("follower_user_id", follower_user_id).eq("is_read", False).execute()
        
        return {
            "success": True,
            "message": f"Marked {len(result.data)} notifications as read"
        }
        
    except Exception as e:
        print(f"Error marking all notifications as read: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# =============================================
# NOTIFICATION PREFERENCES ENDPOINTS
# =============================================

@router.get("/creators/{creator_id}/notification-preferences")
async def get_notification_preferences(
    creator_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get notification preferences for a specific creator"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Get preferences
        preferences_response = db_manager.supabase.table("creator_following_preferences").select("*").eq("creator_id", creator_id).eq("follower_user_id", follower_user_id).execute()
        
        if not preferences_response.data:
            # Return default preferences if not set
            return {
                "success": True,
                "preferences": {
                    "notify_new_templates": True,
                    "notify_sales": False,
                    "notify_updates": True
                }
            }
        
        preferences = preferences_response.data[0]
        
        return {
            "success": True,
            "preferences": {
                "notify_new_templates": preferences["notify_new_templates"],
                "notify_sales": preferences["notify_sales"],
                "notify_updates": preferences["notify_updates"]
            }
        }
        
    except Exception as e:
        print(f"Error getting notification preferences: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/creators/{creator_id}/notification-preferences")
async def update_notification_preferences(
    creator_id: str,
    preferences: Dict[str, bool],
    current_user: dict = Depends(get_current_user)
):
    """Update notification preferences for a specific creator"""
    try:
        follower_user_id = current_user["user_id"]
        
        # Validate preferences
        valid_keys = {"notify_new_templates", "notify_sales", "notify_updates"}
        if not all(key in valid_keys for key in preferences.keys()):
            raise HTTPException(status_code=400, detail="Invalid preference keys")
        
        # Update or insert preferences
        preferences_data = {
            "follower_user_id": follower_user_id,
            "creator_id": creator_id,
            **preferences,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = db_manager.supabase.table("creator_following_preferences").upsert(preferences_data).execute()
        
        return {
            "success": True,
            "message": "Notification preferences updated",
            "preferences": preferences
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating notification preferences: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
