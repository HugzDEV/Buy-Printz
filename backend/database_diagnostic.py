"""
Database Diagnostic Tool for BuyPrintz
This helps identify missing or renamed tables
"""

from fastapi import APIRouter, Depends
from backend.database import db_manager
from backend.auth import get_current_user
import traceback

router = APIRouter()

@router.get("/api/diagnostic/database-status")
async def check_database_status(current_user: dict = Depends(get_current_user)):
    """Comprehensive database status check"""
    try:
        # Expected tables based on codebase analysis
        expected_tables = [
            "orders",
            "creators", 
            "creator_templates",
            "banner_templates",
            "canvas_states",
            "design_history",
            "user_profiles",
            "user_addresses", 
            "user_preferences",
            "business_card_tins",
            "creator_followers",
            "creator_notifications",
            "creator_analytics",
            "tin_skinz_orders",
            "tin_skinz_templates",
            "shipping_costs"
        ]
        
        # Check what tables actually exist
        existing_tables = []
        missing_tables = []
        error_tables = []
        
        for table in expected_tables:
            try:
                # Try to query the table
                response = db_manager.supabase.table(table).select("id").limit(1).execute()
                existing_tables.append(table)
            except Exception as e:
                if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                    missing_tables.append(table)
                else:
                    error_tables.append({"table": table, "error": str(e)})
        
        # Get all tables in the database
        try:
            # This is a more complex query to get all tables
            all_tables_response = db_manager.supabase.rpc('get_all_tables').execute()
            all_tables = all_tables_response.data if all_tables_response.data else []
        except:
            # Fallback: try to query information_schema
            try:
                all_tables_response = db_manager.supabase.table('information_schema.tables').select('table_name').eq('table_schema', 'public').execute()
                all_tables = [t['table_name'] for t in all_tables_response.data] if all_tables_response.data else []
            except:
                all_tables = []
        
        return {
            "success": True,
            "user_id": current_user.get("user_id"),
            "expected_tables": expected_tables,
            "existing_tables": existing_tables,
            "missing_tables": missing_tables,
            "error_tables": error_tables,
            "all_database_tables": all_tables,
            "summary": {
                "total_expected": len(expected_tables),
                "total_existing": len(existing_tables),
                "total_missing": len(missing_tables),
                "total_errors": len(error_tables)
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@router.get("/api/diagnostic/table-structure/{table_name}")
async def check_table_structure(table_name: str, current_user: dict = Depends(get_current_user)):
    """Check the structure of a specific table"""
    try:
        # Try to get table structure by querying with limit 0
        response = db_manager.supabase.table(table_name).select("*").limit(0).execute()
        
        # Get column information
        columns = []
        if hasattr(response, 'data') and response.data:
            # If we have data, get columns from first row
            if response.data:
                columns = list(response.data[0].keys())
        else:
            # Try to get columns by doing a minimal query
            try:
                test_response = db_manager.supabase.table(table_name).select("id").limit(1).execute()
                columns = ["id"]  # At minimum, we know id exists
            except:
                pass
        
        return {
            "success": True,
            "table_name": table_name,
            "columns": columns,
            "accessible": True
        }
        
    except Exception as e:
        return {
            "success": False,
            "table_name": table_name,
            "error": str(e),
            "accessible": False
        }
