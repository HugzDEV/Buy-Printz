"""
User synchronization utilities for BuyPrintz
Automatically sync authenticated users to the public users table
"""

from backend.database import db_manager
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

async def sync_user_to_public_table(user_data: Dict[str, Any]) -> bool:
    """
    Sync a user from auth to the public users table
    Called when a user signs up or updates their profile
    """
    try:
        user_id = user_data.get("id")
        email = user_data.get("email")
        metadata = user_data.get("user_metadata", {})
        
        if not user_id or not email:
            logger.error("Missing required user data for sync")
            return False
        
        # Prepare user data for insertion
        user_record = {
            "user_id": user_id,
            "email": email,
            "full_name": metadata.get("full_name") or metadata.get("name") or metadata.get("display_name"),
            "is_creator": False,  # Default to not creator
            "is_active": True,
            "metadata": metadata
        }
        
        # Insert or update user in public table
        response = db_manager.supabase.table("users").upsert(
            user_record,
            on_conflict="user_id"
        ).execute()
        
        if response.data:
            logger.info(f"Successfully synced user {email} to public users table")
            return True
        else:
            logger.error(f"Failed to sync user {email}")
            return False
            
    except Exception as e:
        logger.error(f"Error syncing user to public table: {e}")
        return False

async def update_user_creator_status(user_id: str, is_creator: bool) -> bool:
    """
    Update a user's creator status in the public users table
    """
    try:
        response = db_manager.supabase.table("users").update({
            "is_creator": is_creator,
            "updated_at": "NOW()"
        }).eq("user_id", user_id).execute()
        
        if response.data:
            logger.info(f"Updated creator status for user {user_id}: {is_creator}")
            return True
        else:
            logger.error(f"Failed to update creator status for user {user_id}")
            return False
            
    except Exception as e:
        logger.error(f"Error updating creator status: {e}")
        return False

async def sync_all_existing_users() -> int:
    """
    Sync all existing authenticated users to the public users table
    This can be called during application startup or as a maintenance task
    """
    try:
        # This would need to be called with elevated permissions
        # or through a Supabase function
        logger.info("Starting sync of all existing users...")
        
        # Call the database function to sync all users
        response = db_manager.supabase.rpc("sync_all_auth_users").execute()
        
        if response.data:
            user_count = response.data[0] if response.data else 0
            logger.info(f"Successfully synced {user_count} users")
            return user_count
        else:
            logger.error("Failed to sync existing users")
            return 0
            
    except Exception as e:
        logger.error(f"Error syncing existing users: {e}")
        return 0

# Integration with existing auth flow
async def on_user_signup(user_data: Dict[str, Any]) -> bool:
    """
    Call this when a user signs up to automatically sync them
    """
    return await sync_user_to_public_table(user_data)

async def on_user_profile_update(user_id: str, user_data: Dict[str, Any]) -> bool:
    """
    Call this when a user updates their profile
    """
    return await sync_user_to_public_table(user_data)

async def on_creator_registration(user_id: str) -> bool:
    """
    Call this when a user registers as a creator
    """
    return await update_user_creator_status(user_id, True)
