from supabase import create_client, Client
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import json
import uuid
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client with error handling for deployment
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_anon_key = os.getenv("SUPABASE_KEY")

# Debug: Print what keys we found
print(f"🔍 Environment check:")
print(f"SUPABASE_URL: {'✓' if supabase_url else '✗'}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {'✓' if supabase_service_role_key else '✗'}")
print(f"SUPABASE_KEY: {'✓' if supabase_anon_key else '✗'}")

# Use service role key (required for backend operations)
supabase_key = supabase_service_role_key

# Initialize supabase client with proper error handling
supabase = None

if supabase_url and supabase_key:
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase client initialized successfully")
        # More reliable key type detection
        key_type = "Service Role" if supabase_service_role_key else "Anon Key"
        print(f"Using key type: {key_type}")
    except Exception as e:
        print(f"❌ Failed to initialize Supabase client: {e}")
        supabase = None
else:
    print("⚠️ Supabase environment variables not set. Database features will be disabled.")
    print(f"SUPABASE_URL: {'✓' if supabase_url else '✗'}")
    print(f"SUPABASE_KEY: {'✓' if supabase_key else '✗'}")
    print("Server will start but database operations will fail gracefully.")

class DatabaseManager:
    def __init__(self):
        self.supabase = supabase
        
    def is_connected(self):
        """Check if database is properly connected"""
        return self.supabase is not None
    
    async def test_auth_role(self):
        """Test what auth role the backend is using"""
        if not self.is_connected():
            return {"error": "Database not connected"}
        
        try:
            # Test query to check current auth role
            response = self.supabase.rpc("auth.role").execute()
            return {"success": True, "role": response.data}
        except Exception as e:
            # If the RPC doesn't exist, try a different approach
            try:
                # Try to get current user info
                response = self.supabase.auth.get_user()
                return {"success": True, "user": response.user if response.user else None, "error": str(e)}
            except Exception as e2:
                return {"error": f"Auth test failed: {e2}"}

    # User Management
    async def create_user(self, email: str, password: str, full_name: str) -> Dict[str, Any]:
        """Create a new user account"""
        if not self.supabase:
            return {"success": False, "error": "Database not connected"}
        try:
            # Create user in Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            user_id = auth_response.user.id
            
            # Create user profile
            profile_data = {
                "id": user_id,
                "email": email,
                "full_name": full_name,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            profile_response = self.supabase.table("user_profiles").insert(profile_data).execute()
            
            return {
                "user_id": user_id,
                "email": email,
                "full_name": full_name,
                "success": True
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by ID"""
        try:
            response = self.supabase.table("user_profiles").select("*").eq("id", user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None

    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            profile_data["updated_at"] = datetime.utcnow().isoformat()
            response = self.supabase.table("user_profiles").update(profile_data).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False

    async def mark_tour_completed(self, user_id: str) -> bool:
        """Mark tour as completed for a user"""
        try:
            response = self.supabase.table("user_profiles").update({
                "tour_completed": True,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", user_id).execute()
            return True
        except Exception as e:
            print(f"Error marking tour as completed: {e}")
            return False

    async def is_tour_completed(self, user_id: str) -> bool:
        """Check if user has completed the tour"""
        try:
            response = self.supabase.table("user_profiles").select("tour_completed").eq("id", user_id).execute()
            if response.data:
                return response.data[0].get("tour_completed", False)
            return False
        except Exception as e:
            print(f"Error checking tour completion: {e}")
            return False

    # Order Management
    async def create_order(self, user_id: str, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new order"""
        try:
            # Create order_details that includes canvas_image
            order_details = {
                "canvas_image": order_data.get("canvas_image"),
                "banner_size": order_data.get("banner_size"),
                "banner_type": order_data.get("banner_type"),
                "banner_material": order_data.get("banner_material"),
                "banner_finish": order_data.get("banner_finish"),
                "banner_category": order_data.get("banner_category"),
                "background_color": order_data.get("background_color"),
                "print_options": order_data.get("print_options", {}),
                "dimensions": order_data["dimensions"],
                "canvas_data": order_data["canvas_data"]
            }
            
            order_record = {
                "user_id": user_id,
                "product_type": order_data["product_type"],
                "quantity": order_data["quantity"],
                "dimensions": json.dumps(order_data["dimensions"]),
                "canvas_data": json.dumps(order_data["canvas_data"]),
                "order_details": json.dumps(order_details),  # Store comprehensive order details
                "total_amount": order_data["total_amount"],
                "status": "pending",
                "banner_type": order_data.get("banner_type"),
                "banner_material": order_data.get("banner_material"),
                "banner_finish": order_data.get("banner_finish"),
                "banner_size": order_data.get("banner_size"),
                "banner_category": order_data.get("banner_category"),
                "print_options": json.dumps(order_data.get("print_options", {})),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("orders").insert(order_record).execute()
            
            if response.data:
                return {
                    "order_id": response.data[0]["id"],
                    "success": True
                }
            return {"success": False, "error": "Failed to create order"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def get_user_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all orders for a user"""
        try:
            response = self.supabase.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Error getting user orders: {e}")
            return []

    async def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get specific order by ID"""
        try:
            response = self.supabase.table("orders").select("*").eq("id", order_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting order: {e}")
            return None

    async def update_order_status(self, order_id: str, status: str, stripe_payment_intent_id: str = None) -> bool:
        """Update order status"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if stripe_payment_intent_id:
                update_data["stripe_payment_intent_id"] = stripe_payment_intent_id
            
            response = self.supabase.table("orders").update(update_data).eq("id", order_id).execute()
            return True
        except Exception as e:
            print(f"Error updating order status: {e}")
            return False

    async def update_order_customer_info(self, order_id: str, customer_info: Dict[str, str]) -> bool:
        """Update order with customer information"""
        try:
            update_data = {
                "customer_info": json.dumps(customer_info),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("orders").update(update_data).eq("id", order_id).execute()
            return True
        except Exception as e:
            print(f"Error updating order customer info: {e}")
            return False

    # Canvas Data Management
    async def save_canvas_design(self, user_id: str, design_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save canvas design for later use - database enforced limit"""
        if not self.is_connected():
            return {"success": False, "error": "Database not connected. Please check your connection."}
        
        try:
            print(f"Attempting to save design for user: {user_id}")
            
            # Get current design count using database function
            count_response = self.supabase.rpc("get_user_design_count", {"user_uuid": user_id}).execute()
            
            if count_response.data:
                count_info = count_response.data
                if count_info["at_limit"]:
                    return {
                        "success": False, 
                        "error": f"Design limit reached. You can save up to {count_info['design_limit']} designs. Please delete some existing designs first.",
                        "design_count": count_info["design_count"],
                        "design_limit": count_info["design_limit"]
                    }
            else:
                print("Warning: Could not get design count, proceeding with save")
            
            # Ensure canvas_data is properly formatted
            canvas_data = design_data.get("canvas_data", {})
            if isinstance(canvas_data, str):
                canvas_data = json.loads(canvas_data)
            
            design_record = {
                "user_id": user_id,
                "name": design_data.get("name", "Untitled Design"),
                "canvas_data": json.dumps(canvas_data),
                "product_type": design_data.get("product_type", "custom"),
                "dimensions": json.dumps(design_data.get("dimensions", {})),
                "banner_type": design_data.get("banner_type"),
                "banner_material": design_data.get("banner_material"),
                "banner_finish": design_data.get("banner_finish"),
                "banner_size": design_data.get("banner_size"),
                "banner_category": design_data.get("banner_category"),
                "background_color": design_data.get("background_color", "#ffffff"),
                "print_options": json.dumps(design_data.get("print_options", {})),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            print(f"Saving design record: {design_record['name']}")
            print(f"Design record data: {design_record}")
            
            # Use banner_templates table instead of canvas_designs
            response = self.supabase.table("banner_templates").insert(design_record).execute()
            
            if response.data:
                print(f"Design saved successfully with ID: {response.data[0]['id']}")
                
                # Get updated design count after insert
                try:
                    updated_count_response = self.supabase.rpc("get_user_design_count", {"user_uuid": user_id}).execute()
                    count_info = updated_count_response.data if updated_count_response.data else {"design_count": 1, "design_limit": 10}
                except Exception as count_error:
                    print(f"Warning: Could not get updated count: {count_error}")
                    count_info = {"design_count": 1, "design_limit": 10}
                
                return {
                    "design_id": response.data[0]["id"],
                    "design_count": count_info["design_count"],
                    "design_limit": count_info["design_limit"],
                    "success": True
                }
            else:
                print("Error: No data returned from insert operation")
                return {"success": False, "error": "Failed to save design - no data returned"}
                
        except Exception as e:
            error_msg = str(e)
            print(f"Error saving canvas design: {error_msg}")
            # Handle database-enforced limit error
            if "Design limit reached" in error_msg:
                return {
                    "success": False,
                    "error": "Design limit reached. You can save up to 10 designs. Please delete some existing designs first.",
                    "design_count": 10,
                    "design_limit": 10
                }
            return {"success": False, "error": error_msg}

    async def get_user_designs(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all saved designs for a user"""
        if not self.is_connected():
            print("Database not connected, returning empty designs list")
            return []
        
        try:
            print(f"Fetching designs for user: {user_id}")
            response = self.supabase.table("banner_templates").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            if response.data:
                print(f"Found {len(response.data)} designs for user")
                return response.data
            else:
                print("No designs found for user")
                return []
                
        except Exception as e:
            print(f"Error getting user designs: {e}")
            return []

    async def get_design_count_info(self, user_id: str) -> Dict[str, Any]:
        """Get design count and limit information using database function"""
        try:
            response = self.supabase.rpc("get_user_design_count", {"user_uuid": user_id}).execute()
            if response.data:
                return {
                    "success": True,
                    **response.data
                }
            return {
                "success": False,
                "design_count": 0,
                "design_limit": 10,
                "designs_remaining": 10,
                "at_limit": False,
                "near_limit": False
            }
        except Exception as e:
            print(f"Error getting design count info: {e}")
            return {
                "success": False,
                "error": str(e),
                "design_count": 0,
                "design_limit": 10
            }

    async def delete_design(self, design_id: str, user_id: str) -> bool:
        """Delete a saved design using database function for validation"""
        try:
            # Use database function for safe deletion with ownership validation
            response = self.supabase.rpc("delete_user_design", {
                "design_uuid": design_id,
                "user_uuid": user_id
            }).execute()
            
            if response.data and response.data.get("success"):
                print(f"Successfully deleted design {design_id} for user {user_id}")
                return True
            else:
                error_msg = response.data.get("error", "Unknown error") if response.data else "Database function failed"
                print(f"Failed to delete design {design_id}: {error_msg}")
                return False
                
        except Exception as e:
            print(f"Error deleting design: {e}")
            return False

    async def get_design(self, design_id: str) -> Optional[Dict[str, Any]]:
        """Get specific design by ID"""
        if not self.is_connected():
            print(f"❌ Database not connected when getting design {design_id}")
            return None
            
        try:
            print(f"🔍 Getting design {design_id}")
            response = self.supabase.table("banner_templates").select("*").eq("id", design_id).execute()
            print(f"🔍 Design query response: {response}")
            if response.data:
                print(f"✅ Found design: {response.data[0].get('name', 'unnamed')}")
                return response.data[0]
            else:
                print(f"❌ No design found with ID: {design_id}")
                return None
        except Exception as e:
            print(f"❌ Error getting design {design_id}: {e}")
            return None

    async def update_design(self, design_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing design"""
        try:
            # Convert canvas_data to JSON if it's a dict
            if "canvas_data" in update_data and isinstance(update_data["canvas_data"], dict):
                update_data["canvas_data"] = json.dumps(update_data["canvas_data"])
            
            # Add updated timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.supabase.table("banner_templates").update(update_data).eq("id", design_id).execute()
            
            if response.data:
                return {
                    "success": True,
                    "design_id": design_id,
                    "updated_data": response.data[0]
                }
            return {"success": False, "error": "Failed to update design"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # Address Management
    async def save_user_address(self, user_id: str, address_data: Dict[str, Any]) -> bool:
        """Save user shipping address"""
        try:
            address_record = {
                "user_id": user_id,
                "full_name": address_data["full_name"],
                "address_line1": address_data["address_line1"],
                "address_line2": address_data.get("address_line2", ""),
                "city": address_data["city"],
                "state": address_data["state"],
                "postal_code": address_data["postal_code"],
                "country": address_data.get("country", "US"),
                "phone": address_data.get("phone", ""),
                "is_default": address_data.get("is_default", True),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # If this is the default address, unset other defaults
            if address_record["is_default"]:
                self.supabase.table("user_addresses").update({"is_default": False}).eq("user_id", user_id).execute()
            
            response = self.supabase.table("user_addresses").insert(address_record).execute()
            return True
        except Exception as e:
            print(f"Error saving user address: {e}")
            return False

    async def get_user_addresses(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all addresses for a user"""
        try:
            response = self.supabase.table("user_addresses").select("*").eq("user_id", user_id).order("is_default", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Error getting user addresses: {e}")
            return []

    # User Preferences Management
    async def get_user_preferences(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user editor preferences"""
        try:
            response = self.supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting user preferences: {e}")
            return None

    async def save_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Save or update user editor preferences"""
        try:
            # Check if preferences exist
            existing = await self.get_user_preferences(user_id)
            
            if existing:
                # Update existing preferences
                update_data = {
                    "default_banner_type": preferences.get("default_banner_type", existing.get("default_banner_type")),
                    "default_banner_size": preferences.get("default_banner_size", existing.get("default_banner_size")),
                    "editor_settings": json.dumps(preferences.get("editor_settings", {})),
                    "updated_at": datetime.utcnow().isoformat()
                }
                response = self.supabase.table("user_preferences").update(update_data).eq("user_id", user_id).execute()
            else:
                # Create new preferences
                preference_record = {
                    "user_id": user_id,
                    "default_banner_type": preferences.get("default_banner_type", "vinyl-13oz"),
                    "default_banner_size": preferences.get("default_banner_size", "2ft x 4ft"),
                    "editor_settings": json.dumps(preferences.get("editor_settings", {})),
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat()
                }
                response = self.supabase.table("user_preferences").insert(preference_record).execute()
            
            return True
        except Exception as e:
            print(f"Error saving user preferences: {e}")
            return False

    # Banner Templates Management
    async def save_custom_template(self, user_id: str, template_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a custom banner template"""
        if not self.is_connected():
            return {"success": False, "error": "Database not connected. Please check your connection."}
        
        try:
            print(f"Attempting to save template for user: {user_id}")
            
            # Check for duplicate template names for this user
            template_name = template_data["name"]
            existing_templates = self.supabase.table("banner_templates").select("id,name").eq("user_id", user_id).eq("name", template_name).execute()
            
            if existing_templates.data:
                print(f"Template name '{template_name}' already exists for user {user_id}")
                return {"success": False, "error": f"Template name '{template_name}' already exists. Please choose a different name."}
            
            # Ensure canvas_data is properly formatted
            canvas_data = template_data.get("canvas_data", {})
            if isinstance(canvas_data, str):
                canvas_data = json.loads(canvas_data)
            
            template_record = {
                "user_id": user_id,
                "name": template_data["name"],
                "category": template_data.get("category", "Custom"),
                "description": template_data.get("description", ""),
                "canvas_data": json.dumps(canvas_data),
                "banner_type": template_data.get("banner_type"),
                "is_public": template_data.get("is_public", False),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            print(f"Saving template record: {template_record['name']}")
            print(f"Template record data: {template_record}")
            
            response = self.supabase.table("banner_templates").insert(template_record).execute()
            
            if response.data:
                print(f"Template saved successfully with ID: {response.data[0]['id']}")
                return {
                    "template_id": response.data[0]["id"],
                    "success": True
                }
            else:
                print("Error: No data returned from template insert operation")
                return {"success": False, "error": "Failed to save template - no data returned"}
                
        except Exception as e:
            error_msg = str(e)
            print(f"Error saving custom template: {error_msg}")
            
            # Handle table doesn't exist error
            if "relation \"banner_templates\" does not exist" in error_msg:
                return {
                    "success": False,
                    "error": "Templates table not found. Please contact support to set up the templates feature."
                }
            
            return {"success": False, "error": error_msg}

    async def get_user_templates(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all custom templates for a user"""
        if not self.is_connected():
            print("Database not connected, returning empty templates list")
            return []
        
        try:
            print(f"Fetching templates for user: {user_id}")
            response = self.supabase.table("banner_templates").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
            if response.data:
                print(f"Found {len(response.data)} templates for user")
                return response.data
            else:
                print("No templates found for user")
                return []
                
        except Exception as e:
            print(f"Error getting user templates: {e}")
            # If table doesn't exist, return empty list
            if "relation \"banner_templates\" does not exist" in str(e):
                print("banner_templates table does not exist. Please run the SQL setup.")
                return []
            return []

    async def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get specific template by ID"""
        if not self.is_connected():
            print("Database not connected, returning None for template")
            return None
        
        try:
            print(f"Fetching template with ID: {template_id}")
            response = self.supabase.table("banner_templates").select("*").eq("id", template_id).execute()
            
            if response.data:
                print(f"Found template: {response.data[0]['name']}")
                return response.data[0]
            else:
                print("Template not found")
                return None
                
        except Exception as e:
            print(f"Error getting template: {e}")
            # If table doesn't exist, return None
            if "relation \"banner_templates\" does not exist" in str(e):
                print("banner_templates table does not exist. Please run the SQL setup.")
                return None
            return None

    async def delete_template(self, template_id: str) -> bool:
        """Delete a template by ID"""
        if not self.is_connected():
            print("Database not connected, cannot delete template")
            return False
        
        try:
            print(f"Deleting template with ID: {template_id}")
            response = self.supabase.table("banner_templates").delete().eq("id", template_id).execute()
            
            if response.data:
                print(f"Successfully deleted template: {template_id}")
                return True
            else:
                print("Template not found for deletion")
                return False
                
        except Exception as e:
            print(f"Error deleting template: {e}")
            # If table doesn't exist, return False
            if "relation \"banner_templates\" does not exist" in str(e):
                print("banner_templates table does not exist. Please run the SQL setup.")
                return False
            return False

    async def get_user_template_count(self, user_id: str) -> int:
        """Get the number of templates a user has"""
        if not self.is_connected():
            print("Database not connected, returning 0 for template count")
            return 0
        
        try:
            response = self.supabase.table("banner_templates").select("id", count="exact").eq("user_id", user_id).execute()
            count = response.count if response.count is not None else 0
            print(f"User {user_id} has {count} templates")
            return count
        except Exception as e:
            print(f"Error getting template count: {e}")
            return 0

    async def check_template_limit(self, user_id: str, limit: int = 20) -> Dict[str, Any]:
        """Check if user has reached template limit"""
        try:
            current_count = await self.get_user_template_count(user_id)
            can_save = current_count < limit
            
            return {
                "current_count": current_count,
                "limit": limit,
                "can_save": can_save,
                "remaining": max(0, limit - current_count)
            }
        except Exception as e:
            print(f"Error checking template limit: {e}")
            return {
                "current_count": 0,
                "limit": limit,
                "can_save": True,
                "remaining": limit
            }

    async def get_public_templates(self) -> List[Dict[str, Any]]:
        """Get all public templates"""
        if not self.is_connected():
            print("Database not connected, returning empty public templates list")
            return []
        
        try:
            print("Fetching public templates")
            response = self.supabase.table("banner_templates").select("*").eq("is_public", True).order("created_at", desc=True).execute()
            
            if response.data:
                print(f"Found {len(response.data)} public templates")
                return response.data
            else:
                print("No public templates found")
                return []
                
        except Exception as e:
            print(f"Error getting public templates: {e}")
            # If table doesn't exist, return empty list
            if "relation \"banner_templates\" does not exist" in str(e):
                print("banner_templates table does not exist. Please run the SQL setup.")
                return []
            return []

    # Design History Management
    async def save_design_version(self, design_id: str, user_id: str, canvas_data: Dict[str, Any], changes_description: str = "") -> bool:
        """Save a version of a design for history tracking"""
        try:
            # Get current version number
            response = self.supabase.table("design_history").select("version_number").eq("design_id", design_id).order("version_number", desc=True).limit(1).execute()
            
            next_version = 1
            if response.data:
                next_version = response.data[0]["version_number"] + 1
            
            version_record = {
                "design_id": design_id,
                "user_id": user_id,
                "version_number": next_version,
                "canvas_data": json.dumps(canvas_data),
                "changes_description": changes_description,
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("design_history").insert(version_record).execute()
            return True
        except Exception as e:
            print(f"Error saving design version: {e}")
            return False

    async def get_design_history(self, design_id: str) -> List[Dict[str, Any]]:
        """Get version history for a design"""
        try:
            response = self.supabase.table("design_history").select("*").eq("design_id", design_id).order("version_number", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Error getting design history: {e}")
            return []

    # Analytics and Tracking
    async def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user statistics and usage data - only user-facing information"""
        try:
            # Only get completed orders for user-facing stats
            completed_orders_response = self.supabase.table("orders").select("status, total_amount").eq("user_id", user_id).in_("status", ['completed', 'paid', 'approved', 'shipped', 'delivered']).execute()
            completed_orders = completed_orders_response.data or []
            
            # Get template count (templates are now our "designs")
            templates_response = self.supabase.table("banner_templates").select("id").eq("user_id", user_id).execute()
            templates_count = len(templates_response.data or [])
            
            # Calculate total spent from completed orders only
            total_spent = 0
            for order in completed_orders:
                if order.get("total_amount"):
                    total_spent += order["total_amount"]
            
            return {
                "total_orders": len(completed_orders),  # Only completed orders
                "total_spent": total_spent,  # Only from completed orders
                "total_templates": templates_count,  # User's saved templates
                "success": True
            }
        except Exception as e:
            print(f"Error getting user stats: {e}")
            return {"success": False, "error": str(e)}

    async def get_pending_orders(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's pending/incomplete orders from the pending_orders table"""
        try:
            # Get from the dedicated pending_orders table
            response = self.supabase.table("pending_orders").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Error getting pending orders: {e}")
            # Fallback to old logic if pending_orders table doesn't exist yet
            try:
                response = self.supabase.table("orders").select("*").eq("user_id", user_id).in_("status", ["pending", "payment_failed", "incomplete"]).order("created_at", desc=True).execute()
                return response.data or []
            except Exception as fallback_error:
                print(f"Fallback error getting pending orders: {fallback_error}")
                return []

    async def create_pending_order(self, user_id: str, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new pending order that hasn't been paid yet"""
        try:
            # Add user_id and set initial status
            order_data["user_id"] = user_id
            order_data["status"] = "pending"
            
            response = self.supabase.table("pending_orders").insert(order_data).execute()
            if response.data:
                return {"success": True, "order": response.data[0]}
            else:
                return {"success": False, "error": "Failed to create pending order"}
        except Exception as e:
            print(f"Error creating pending order: {e}")
            return {"success": False, "error": str(e)}

    async def move_pending_to_orders(self, pending_order_id: str) -> Dict[str, Any]:
        """Move a pending order to the main orders table when payment is completed"""
        try:
            # Call the PostgreSQL function to move the order
            response = self.supabase.rpc("move_pending_to_orders", {"pending_order_id": pending_order_id}).execute()
            if response.data:
                return {"success": True, "order_id": response.data}
            else:
                return {"success": False, "error": "Failed to move pending order"}
        except Exception as e:
            print(f"Error moving pending order to orders: {e}")
            return {"success": False, "error": str(e)}

    async def update_pending_order(self, pending_order_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a pending order (e.g., payment status, customer info)"""
        try:
            response = self.supabase.table("pending_orders").update(update_data).eq("id", pending_order_id).execute()
            if response.data:
                return {"success": True, "order": response.data[0]}
            else:
                return {"success": False, "error": "Failed to update pending order"}
        except Exception as e:
            print(f"Error updating pending order: {e}")
            return {"success": False, "error": str(e)}

    async def delete_pending_order(self, pending_order_id: str) -> Dict[str, Any]:
        """Delete a pending order (e.g., when cancelled or expired)"""
        try:
            response = self.supabase.table("pending_orders").delete().eq("id", pending_order_id).execute()
            return {"success": True}
        except Exception as e:
            print(f"Error deleting pending order: {e}")
            return {"success": False, "error": str(e)}

    async def get_completed_designs(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's completed banner designs from successful orders"""
        try:
            # Get completed orders with their design data, ensure no duplicates
            response = self.supabase.table("orders").select("id, status, total_amount, created_at, order_details").eq("user_id", user_id).in_("status", ["completed", "paid", "approved", "shipped", "delivered"]).order("created_at", desc=True).execute()
            
            completed_designs = []
            processed_designs = set()  # Track processed designs to avoid duplicates
            
            print(f"Found {len(response.data or [])} completed orders for user {user_id}")
            
            for order in response.data or []:
                order_details = order.get("order_details")
                # Each order is unique, so use order_id as the unique key
                order_id = order['id']
                
                if order_id not in processed_designs:
                    design_data = {
                        "id": f"design_{order_id}",  # Make unique ID based on order
                        "order_id": order_id, 
                        "banner_size": order_details.get("banner_size", "Unknown") if order_details else "Unknown",
                        "total_amount": order.get("total_amount", 0),
                        "status": order["status"],
                        "created_at": order["created_at"],
                        "canvas_image": order_details.get("canvas_image") if order_details else None,
                        "design_preview": order_details.get("canvas_image") if order_details else None,
                        "title": f"Banner Design - {order_details.get('banner_size', 'Unknown Size') if order_details else 'Unknown Size'}"
                    }
                    completed_designs.append(design_data)
                    processed_designs.add(order_id)
                    print(f"Added design for order {order_id} with canvas_image: {'Yes' if order_details and order_details.get('canvas_image') else 'No'}")
            
            print(f"Returning {len(completed_designs)} unique completed designs")
            return completed_designs
        except Exception as e:
            print(f"Error getting completed designs: {e}")
            return []

    # Canvas State Management
    async def save_canvas_state(self, canvas_state_data: Dict[str, Any]) -> bool:
        """Save or update user's canvas state"""
        try:
            user_id = canvas_state_data['user_id']
            session_id = canvas_state_data.get('session_id')
            
            # Use upsert to handle both create and update
            # If session_id is provided, use it for uniqueness, otherwise use user_id only
            if session_id:
                # Check if canvas state exists for this user and session
                existing = self.supabase.table("canvas_states") \
                    .select("id") \
                    .eq("user_id", user_id) \
                    .eq("session_id", session_id) \
                    .execute()
            else:
                # Check if canvas state exists for this user (no specific session)
                existing = self.supabase.table("canvas_states") \
                    .select("id") \
                    .eq("user_id", user_id) \
                    .is_("session_id", "null") \
                    .execute()
            
            if existing.data:
                # Update existing canvas state
                response = self.supabase.table("canvas_states") \
                    .update({
                        "canvas_data": canvas_state_data['canvas_data'],
                        "banner_settings": canvas_state_data.get('banner_settings'),
                        "is_checkout_session": canvas_state_data.get('is_checkout_session', False),
                        "expires_at": canvas_state_data['expires_at'],
                        "updated_at": datetime.utcnow().isoformat()
                    }) \
                    .eq("id", existing.data[0]['id']) \
                    .execute()
            else:
                # Create new canvas state
                response = self.supabase.table("canvas_states") \
                    .insert(canvas_state_data) \
                    .execute()
            
            if hasattr(response, 'data') and response.data:
                print(f"Canvas state saved successfully: {len(response.data)} records affected")
                return True
            else:
                print(f"Canvas state save returned unexpected response: {response}")
                return False
            
        except Exception as e:
            print(f"Error saving canvas state: {e}")
            print(f"Canvas state data that failed: {canvas_state_data}")
            return False

    async def load_canvas_state(self, user_id: str, session_id: str = None, is_checkout_session: bool = None) -> Dict[str, Any]:
        """Load user's canvas state"""
        try:
            query = self.supabase.table("canvas_states") \
                .select("*") \
                .eq("user_id", user_id) \
                .gt("expires_at", datetime.utcnow().isoformat()) \
                .order("updated_at", desc=True)
            
            # Filter by session if provided
            if session_id:
                query = query.eq("session_id", session_id)
            else:
                query = query.is_("session_id", "null")
            
            # Filter by checkout session if specified
            if is_checkout_session is not None:
                query = query.eq("is_checkout_session", is_checkout_session)
            
            response = query.limit(1).execute()
            
            if response.data:
                canvas_state = response.data[0]
                return {
                    "canvas_data": canvas_state['canvas_data'],
                    "banner_settings": canvas_state.get('banner_settings'),
                    "created_at": canvas_state['created_at'],
                    "updated_at": canvas_state['updated_at']
                }
            
            return None
            
        except Exception as e:
            print(f"Error loading canvas state: {e}")
            return None

    async def clear_canvas_state(self, user_id: str, session_id: str = None) -> bool:
        """Clear user's canvas state"""
        try:
            query = self.supabase.table("canvas_states") \
                .delete() \
                .eq("user_id", user_id)
            
            if session_id:
                query = query.eq("session_id", session_id)
            else:
                query = query.is_("session_id", "null")
            
            response = query.execute()
            return True
            
        except Exception as e:
            print(f"Error clearing canvas state: {e}")
            return False

    async def cleanup_expired_canvas_states(self) -> int:
        """Clean up expired canvas states and return count of deleted records"""
        try:
            # Delete expired canvas states
            response = self.supabase.table("canvas_states") \
                .delete() \
                .lt("expires_at", datetime.utcnow().isoformat()) \
                .execute()
            
            deleted_count = len(response.data) if response.data else 0
            if deleted_count > 0:
                print(f"Cleaned up {deleted_count} expired canvas states")
            
            return deleted_count
            
        except Exception as e:
            print(f"Error cleaning up expired canvas states: {e}")
            return 0

    async def delete_user_account(self, user_id: str) -> bool:
        """Delete user account and all associated data"""
        if not self.supabase:
            return False
            
        try:
            # Delete user data in the correct order (respecting foreign key constraints)
            
            # Delete canvas states
            self.supabase.table("canvas_states").delete().eq("user_id", user_id).execute()
            
            # Delete design history
            self.supabase.table("design_history").delete().eq("user_id", user_id).execute()
            
            # Delete banner templates
            self.supabase.table("banner_templates").delete().eq("user_id", user_id).execute()
            
            # Delete orders
            self.supabase.table("orders").delete().eq("user_id", user_id).execute()
            
            # Delete user addresses
            self.supabase.table("user_addresses").delete().eq("user_id", user_id).execute()
            
            # Delete user preferences
            self.supabase.table("user_preferences").delete().eq("user_id", user_id).execute()
            
            # Delete user profile (this should cascade due to foreign key)
            self.supabase.table("user_profiles").delete().eq("id", user_id).execute()
            
            print(f"Successfully deleted all data for user: {user_id}")
            return True
            
        except Exception as e:
            print(f"Error deleting user account: {e}")
            return False

    # Business Card Tins Management
    async def create_business_card_tin_order(self, user_id: str, order_id: str, tin_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new business card tin order"""
        try:
            # Calculate pricing based on quantity, finish, and surface coverage
            base_prices = {
                100: {'front-back': 399.99, 'all-sides': 499.99},
                250: {'front-back': 749.99, 'all-sides': 849.99},
                500: {'front-back': 1000.00, 'all-sides': 1100.00}
            }
            
            finish_surcharges = {
                'silver': 0.00,
                'black': 0.25,
                'gold': 0.50
            }
            
            quantity = tin_data.get('quantity', 100)
            surface_coverage = tin_data.get('surface_coverage', 'front-back')
            tin_finish = tin_data.get('tin_finish', 'silver')
            
            base_price = base_prices.get(quantity, {}).get(surface_coverage, 399.99)
            finish_surcharge = finish_surcharges.get(tin_finish, 0.00)
            total_price = base_price + finish_surcharge
            
            tin_record = {
                "order_id": order_id,
                "user_id": user_id,
                "quantity": quantity,
                "surface_coverage": surface_coverage,
                "tin_finish": tin_finish,
                "printing_method": tin_data.get('printing_method', 'premium-vinyl'),
                "surface_designs": tin_data.get('surface_designs', {}),
                "sticker_specifications": tin_data.get('sticker_specifications', {
                    "dpi": 300,
                    "colorMode": "CMYK",
                    "material": tin_data.get('printing_method', 'premium-vinyl')
                }),
                "base_price": base_price,
                "finish_surcharge": finish_surcharge,
                "total_price": total_price,
                "status": "pending",
                "notes": tin_data.get('notes', '')
            }
            
            print(f"Creating business card tin order: {tin_record}")
            
            response = self.supabase.table("business_card_tins").insert(tin_record).execute()
            
            if response.data:
                return {
                    "tin_id": response.data[0]["id"],
                    "success": True,
                    "total_price": total_price
                }
            else:
                return {"success": False, "error": "Failed to create tin order"}
                
        except Exception as e:
            print(f"Error creating business card tin order: {e}")
            return {"success": False, "error": str(e)}

    async def get_business_card_tin(self, tin_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific business card tin by ID"""
        try:
            response = self.supabase.table("business_card_tins").select("*").eq("id", tin_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting business card tin: {e}")
            return None

    async def get_user_business_card_tins(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all business card tins for a user"""
        try:
            response = self.supabase.table("business_card_tins").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            print(f"Error getting user business card tins: {e}")
            return []

    async def update_business_card_tin_design(self, tin_id: str, surface_designs: Dict[str, Any]) -> bool:
        """Update the design data for a business card tin"""
        try:
            update_data = {
                "surface_designs": surface_designs,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            response = self.supabase.table("business_card_tins").update(update_data).eq("id", tin_id).execute()
            return bool(response.data)
        except Exception as e:
            print(f"Error updating business card tin design: {e}")
            return False

    async def update_business_card_tin_status(self, tin_id: str, status: str, notes: str = "") -> bool:
        """Update the status of a business card tin"""
        try:
            update_data = {
                "status": status,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            if notes:
                update_data["notes"] = notes
            
            response = self.supabase.table("business_card_tins").update(update_data).eq("id", tin_id).execute()
            return bool(response.data)
        except Exception as e:
            print(f"Error updating business card tin status: {e}")
            return False

    async def delete_business_card_tin(self, tin_id: str) -> bool:
        """Delete a business card tin order"""
        try:
            response = self.supabase.table("business_card_tins").delete().eq("id", tin_id).execute()
            return bool(response.data)
        except Exception as e:
            print(f"Error deleting business card tin: {e}")
            return False

    async def get_business_card_tin_by_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get business card tin by order ID"""
        try:
            response = self.supabase.table("business_card_tins").select("*").eq("order_id", order_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error getting business card tin by order: {e}")
            return None

    # =============================================
    # CREATOR MARKETPLACE METHODS
    # =============================================
    
    async def create_creator(self, creator_data: Dict[str, Any]) -> bool:
        """Create a new creator profile"""
        try:
            if not self.is_connected():
                return False
            
            response = self.supabase.table("creators").insert(creator_data).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error creating creator: {e}")
            return False
    
    async def get_creator_by_id(self, creator_id: str) -> Optional[Dict[str, Any]]:
        """Get creator by ID"""
        try:
            if not self.is_connected():
                return None
            
            response = self.supabase.table("creators").select("*").eq("id", creator_id).execute()
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting creator by ID: {e}")
            return None
    
    async def get_creator_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get creator by user ID"""
        try:
            if not self.is_connected():
                return None
            
            response = self.supabase.table("creators").select("*").eq("user_id", user_id).execute()
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting creator by user ID: {e}")
            return None
    
    async def update_creator(self, creator_id: str, update_data: Dict[str, Any]) -> bool:
        """Update creator profile"""
        try:
            if not self.is_connected():
                return False
            
            response = self.supabase.table("creators").update(update_data).eq("id", creator_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error updating creator: {e}")
            return False
    
    async def create_creator_template(self, template_data: Dict[str, Any]) -> bool:
        """Create a new creator template"""
        try:
            if not self.is_connected():
                return False
            
            response = self.supabase.table("creator_templates").insert(template_data).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error creating creator template: {e}")
            return False
    
    async def get_creator_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get creator template by ID"""
        try:
            if not self.is_connected():
                return None
            
            response = self.supabase.table("creator_templates").select("*").eq("id", template_id).execute()
            if response.data:
                return response.data[0]
            return None
            
        except Exception as e:
            print(f"Error getting creator template: {e}")
            return None
    
    async def get_creator_templates(self, creator_id: str) -> List[Dict[str, Any]]:
        """Get all templates for a creator"""
        try:
            if not self.is_connected():
                return []
            
            response = self.supabase.table("creator_templates").select("*").eq("creator_id", creator_id).order("created_at", desc=True).execute()
            return response.data or []
            
        except Exception as e:
            print(f"Error getting creator templates: {e}")
            return []
    
    async def get_marketplace_templates(self, filters: Dict[str, Any] = None, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Get approved templates for marketplace with total count"""
        try:
            if not self.is_connected():
                return {"templates": [], "total": 0}
            
            # Build base query for templates
            query = self.supabase.table("creator_templates").select("*, creators!inner(display_name, is_verified)")
            
            # Build count query
            count_query = self.supabase.table("creator_templates").select("id", count="exact")
            
            # Apply filters to both queries
            if filters:
                if filters.get('is_approved') is not None:
                    query = query.eq("is_approved", filters['is_approved'])
                    count_query = count_query.eq("is_approved", filters['is_approved'])
                if filters.get('is_active') is not None:
                    query = query.eq("is_active", filters['is_active'])
                    count_query = count_query.eq("is_active", filters['is_active'])
                if filters.get('category'):
                    query = query.eq("category", filters['category'])
                    count_query = count_query.eq("category", filters['category'])
                if filters.get('min_price') is not None:
                    query = query.gte("price", filters['min_price'])
                    count_query = count_query.gte("price", filters['min_price'])
                if filters.get('max_price') is not None:
                    query = query.lte("price", filters['max_price'])
                    count_query = count_query.lte("price", filters['max_price'])
                if filters.get('search'):
                    search_term = f"%{filters['search']}%"
                    query = query.or_(f"name.ilike.{search_term},description.ilike.{search_term}")
                    count_query = count_query.or_(f"name.ilike.{search_term},description.ilike.{search_term}")
            
            # Get total count
            count_response = count_query.execute()
            total = count_response.count if count_response.count is not None else 0
            
            # Apply pagination and ordering to main query
            query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
            
            response = query.execute()
            return {
                "templates": response.data or [],
                "total": total
            }
            
        except Exception as e:
            print(f"Error getting marketplace templates: {e}")
            return {"templates": [], "total": 0}
    
    async def increment_template_views(self, template_id: str) -> bool:
        """Increment template view count"""
        try:
            if not self.is_connected():
                return False
            
            # Get current view count
            current = self.supabase.table("creator_templates").select("view_count").eq("id", template_id).execute()
            if not current.data:
                return False
            
            current_views = current.data[0].get("view_count", 0)
            
            # Increment view count
            response = self.supabase.table("creator_templates").update({"view_count": current_views + 1}).eq("id", template_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error incrementing template views: {e}")
            return False
    
    async def approve_template(self, template_id: str, approved_by: str) -> bool:
        """Approve a template for marketplace"""
        try:
            if not self.is_connected():
                return False
            
            now = datetime.utcnow().isoformat()
            update_data = {
                "is_approved": True,
                "approved_at": now,
                "approved_by": approved_by,
                "updated_at": now
            }
            
            response = self.supabase.table("creator_templates").update(update_data).eq("id", template_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error approving template: {e}")
            return False
    
    async def reject_template(self, template_id: str, reason: str, rejected_by: str) -> bool:
        """Reject a template"""
        try:
            if not self.is_connected():
                return False
            
            now = datetime.utcnow().isoformat()
            update_data = {
                "is_active": False,
                "updated_at": now
            }
            
            response = self.supabase.table("creator_templates").update(update_data).eq("id", template_id).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error rejecting template: {e}")
            return False
    
    async def get_pending_templates(self) -> List[Dict[str, Any]]:
        """Get templates pending approval"""
        try:
            if not self.is_connected():
                return []
            
            response = self.supabase.table("creator_templates").select("*, creators!inner(display_name, user_id)").eq("is_approved", False).eq("is_active", True).order("created_at", desc=False).execute()
            return response.data or []
            
        except Exception as e:
            print(f"Error getting pending templates: {e}")
            return []
    
    async def get_creator_analytics(self, creator_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a creator"""
        try:
            if not self.is_connected():
                return {}
            
            # Get basic creator stats
            creator = await self.get_creator_by_id(creator_id)
            if not creator:
                return {}
            
            # Get template stats
            templates_response = self.supabase.table("creator_templates").select("*").eq("creator_id", creator_id).execute()
            templates = templates_response.data or []
            
            template_stats = {
                "total_templates": len(templates),
                "approved_templates": len([t for t in templates if t.get("is_approved", False)]),
                "pending_templates": len([t for t in templates if not t.get("is_approved", False)]),
                "total_sales": sum(t.get("sales_count", 0) for t in templates),
                "total_views": sum(t.get("view_count", 0) for t in templates),
                "average_rating": sum(t.get("rating", 0) for t in templates) / len(templates) if templates else 0
            }
            
            # Get recent sales (last 30 days)
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            recent_sales_response = self.supabase.table("template_purchases").select("*").eq("creator_id", creator_id).gte("purchased_at", thirty_days_ago).execute()
            recent_sales_data = recent_sales_response.data or []
            
            recent_sales = {
                "recent_sales": len(recent_sales_data),
                "recent_earnings": sum(sale.get("creator_earnings", 0) for sale in recent_sales_data)
            }
            
            # Get top performing templates
            top_templates = sorted(templates, key=lambda x: x.get("sales_count", 0), reverse=True)[:5]
            
            return {
                "creator": creator,
                "template_stats": template_stats,
                "recent_sales": recent_sales,
                "top_templates": top_templates
            }
            
        except Exception as e:
            print(f"Error getting creator analytics: {e}")
            return {}
    
    # =============================================
    # PURCHASE MANAGEMENT METHODS
    # =============================================
    
    async def create_template_purchase(self, purchase_data: Dict[str, Any]) -> bool:
        """Create a template purchase record"""
        try:
            if not self.is_connected():
                return False
            
            response = self.supabase.table("template_purchases").insert(purchase_data).execute()
            return response.data is not None
            
        except Exception as e:
            print(f"Error creating template purchase: {e}")
            return False
    
    async def get_user_purchases(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all purchases made by a user"""
        try:
            if not self.is_connected():
                return []
            
            response = self.supabase.table("template_purchases").select("*").eq("buyer_id", user_id).order("purchased_at", desc=True).execute()
            return response.data or []
            
        except Exception as e:
            print(f"Error getting user purchases: {e}")
            return []
    
    async def get_creator_earnings(self, creator_id: str) -> Dict[str, Any]:
        """Get earnings summary for a creator"""
        try:
            if not self.is_connected():
                return {}
            
            # Get total earnings
            earnings_response = self.supabase.table("template_purchases").select("creator_earnings").eq("creator_id", creator_id).eq("status", "completed").execute()
            total_earnings = sum(float(purchase["creator_earnings"]) for purchase in earnings_response.data or [])
            
            # Get recent sales (last 30 days)
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            recent_sales_response = self.supabase.table("template_purchases").select("*").eq("creator_id", creator_id).gte("purchased_at", thirty_days_ago).execute()
            recent_sales = recent_sales_response.data or []
            
            return {
                "total_earnings": round(total_earnings, 2),
                "recent_sales_count": len(recent_sales),
                "recent_earnings": round(sum(float(sale["creator_earnings"]) for sale in recent_sales), 2)
            }
            
        except Exception as e:
            print(f"Error getting creator earnings: {e}")
            return {}

# Initialize database manager
db_manager = DatabaseManager()
