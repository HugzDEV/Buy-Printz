from supabase import create_client, Client
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import json
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
            
            # The database trigger will automatically enforce the 10-design limit
            response = self.supabase.table("canvas_designs").insert(design_record).execute()
            
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
            response = self.supabase.table("canvas_designs").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            
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
            response = self.supabase.table("canvas_designs").select("*").eq("id", design_id).execute()
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
            
            response = self.supabase.table("canvas_designs").update(update_data).eq("id", design_id).execute()
            
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
        """Get user statistics and usage data"""
        try:
            # Get all orders with status and total_amount
            orders_response = self.supabase.table("orders").select("status, total_amount").eq("user_id", user_id).execute()
            orders = orders_response.data or []
            
            # Get design count
            designs_response = self.supabase.table("canvas_designs").select("id").eq("user_id", user_id).execute()
            designs_count = len(designs_response.data or [])
            
            # Get template count
            templates_response = self.supabase.table("banner_templates").select("id").eq("user_id", user_id).execute()
            templates_count = len(templates_response.data or [])
            
            # Calculate order statistics
            order_stats = {}
            completed_orders = []
            total_spent = 0
            
            for order in orders:
                status = order["status"]
                order_stats[status] = order_stats.get(status, 0) + 1
                
                # Only count completed/paid orders for totals and spending
                if status in ['completed', 'paid', 'approved', 'shipped', 'delivered']:
                    completed_orders.append(order)
                    if order.get("total_amount"):
                        total_spent += order["total_amount"]
            
            return {
                "total_orders": len(completed_orders),  # Only completed orders
                "total_spent": total_spent,  # Only from completed orders
                "order_stats": order_stats,  # All order statuses for breakdown
                "pending_orders": order_stats.get('pending', 0),  # Pending orders count
                "total_designs": designs_count,
                "total_templates": templates_count,
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
            
            # Delete canvas designs
            self.supabase.table("canvas_designs").delete().eq("user_id", user_id).execute()
            
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

# Initialize database manager
db_manager = DatabaseManager()
