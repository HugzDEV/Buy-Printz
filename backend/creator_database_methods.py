"""
Database methods for Creator Marketplace functionality
Phase 1: Foundation - Creator and template management
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from database import DatabaseManager

class CreatorDatabaseManager(DatabaseManager):
    """Extended database manager for creator marketplace functionality"""
    
    # =============================================
    # CREATOR MANAGEMENT METHODS
    # =============================================
    
    async def create_creator(self, creator_data: Dict[str, Any]) -> bool:
        """Create a new creator profile"""
        try:
            query = """
                INSERT INTO creators (
                    id, user_id, display_name, bio, profile_image_url, 
                    website, social_links, is_verified, is_active, 
                    total_earnings, templates_sold, rating, rating_count,
                    created_at, updated_at
                ) VALUES (
                    %(id)s, %(user_id)s, %(display_name)s, %(bio)s, %(profile_image_url)s,
                    %(website)s, %(social_links)s, %(is_verified)s, %(is_active)s,
                    %(total_earnings)s, %(templates_sold)s, %(rating)s, %(rating_count)s,
                    %(created_at)s, %(updated_at)s
                )
            """
            
            result = await self.execute_query(query, creator_data)
            return result is not None
            
        except Exception as e:
            print(f"Error creating creator: {e}")
            return False
    
    async def get_creator_by_id(self, creator_id: str) -> Optional[Dict[str, Any]]:
        """Get creator by ID"""
        try:
            query = "SELECT * FROM creators WHERE id = %s"
            result = await self.fetch_one(query, (creator_id,))
            return result
            
        except Exception as e:
            print(f"Error getting creator by ID: {e}")
            return None
    
    async def get_creator_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get creator by user ID"""
        try:
            query = "SELECT * FROM creators WHERE user_id = %s"
            result = await self.fetch_one(query, (user_id,))
            return result
            
        except Exception as e:
            print(f"Error getting creator by user ID: {e}")
            return None
    
    async def update_creator(self, creator_id: str, update_data: Dict[str, Any]) -> bool:
        """Update creator profile"""
        try:
            # Build dynamic update query
            set_clauses = []
            values = []
            
            for key, value in update_data.items():
                if key != 'id':  # Don't update the ID
                    set_clauses.append(f"{key} = %s")
                    values.append(value)
            
            if not set_clauses:
                return True  # Nothing to update
            
            query = f"UPDATE creators SET {', '.join(set_clauses)} WHERE id = %s"
            values.append(creator_id)
            
            result = await self.execute_query(query, tuple(values))
            return result is not None
            
        except Exception as e:
            print(f"Error updating creator: {e}")
            return False
    
    # =============================================
    # TEMPLATE MANAGEMENT METHODS
    # =============================================
    
    async def create_creator_template(self, template_data: Dict[str, Any]) -> bool:
        """Create a new creator template"""
        try:
            query = """
                INSERT INTO creator_templates (
                    id, creator_id, name, description, category, price,
                    canvas_data, preview_image_url, tags, is_approved,
                    is_featured, is_active, sales_count, view_count,
                    rating, rating_count, created_at, updated_at
                ) VALUES (
                    %(id)s, %(creator_id)s, %(name)s, %(description)s, %(category)s, %(price)s,
                    %(canvas_data)s, %(preview_image_url)s, %(tags)s, %(is_approved)s,
                    %(is_featured)s, %(is_active)s, %(sales_count)s, %(view_count)s,
                    %(rating)s, %(rating_count)s, %(created_at)s, %(updated_at)s
                )
            """
            
            result = await self.execute_query(query, template_data)
            return result is not None
            
        except Exception as e:
            print(f"Error creating creator template: {e}")
            return False
    
    async def get_creator_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get creator template by ID"""
        try:
            query = "SELECT * FROM creator_templates WHERE id = %s"
            result = await self.fetch_one(query, (template_id,))
            return result
            
        except Exception as e:
            print(f"Error getting creator template: {e}")
            return None
    
    async def get_creator_templates(self, creator_id: str) -> List[Dict[str, Any]]:
        """Get all templates for a creator"""
        try:
            query = """
                SELECT * FROM creator_templates 
                WHERE creator_id = %s 
                ORDER BY created_at DESC
            """
            results = await self.fetch_all(query, (creator_id,))
            return results or []
            
        except Exception as e:
            print(f"Error getting creator templates: {e}")
            return []
    
    async def get_marketplace_templates(
        self, 
        filters: Dict[str, Any] = None, 
        limit: int = 20, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get approved templates for marketplace"""
        try:
            # Build base query
            query = """
                SELECT ct.*, c.display_name as creator_name, c.is_verified as creator_verified
                FROM creator_templates ct
                JOIN creators c ON ct.creator_id = c.id
                WHERE ct.is_approved = %s AND ct.is_active = %s
            """
            values = [filters.get('is_approved', True), filters.get('is_active', True)]
            
            # Add additional filters
            if filters:
                if 'category' in filters:
                    query += " AND ct.category = %s"
                    values.append(filters['category'])
                
                if 'min_price' in filters:
                    query += " AND ct.price >= %s"
                    values.append(filters['min_price'])
                
                if 'max_price' in filters:
                    query += " AND ct.price <= %s"
                    values.append(filters['max_price'])
                
                if 'search' in filters:
                    query += " AND (ct.name ILIKE %s OR ct.description ILIKE %s)"
                    search_term = f"%{filters['search']}%"
                    values.extend([search_term, search_term])
            
            # Add ordering and pagination
            query += " ORDER BY ct.created_at DESC LIMIT %s OFFSET %s"
            values.extend([limit, offset])
            
            results = await self.fetch_all(query, tuple(values))
            return results or []
            
        except Exception as e:
            print(f"Error getting marketplace templates: {e}")
            return []
    
    async def increment_template_views(self, template_id: str) -> bool:
        """Increment template view count"""
        try:
            query = "UPDATE creator_templates SET view_count = view_count + 1 WHERE id = %s"
            result = await self.execute_query(query, (template_id,))
            return result is not None
            
        except Exception as e:
            print(f"Error incrementing template views: {e}")
            return False
    
    async def approve_template(self, template_id: str, approved_by: str) -> bool:
        """Approve a template for marketplace"""
        try:
            query = """
                UPDATE creator_templates 
                SET is_approved = true, approved_at = %s, approved_by = %s, updated_at = %s
                WHERE id = %s
            """
            now = datetime.utcnow().isoformat()
            result = await self.execute_query(query, (now, approved_by, now, template_id))
            return result is not None
            
        except Exception as e:
            print(f"Error approving template: {e}")
            return False
    
    async def reject_template(self, template_id: str, reason: str, rejected_by: str) -> bool:
        """Reject a template"""
        try:
            # For now, we'll just deactivate the template
            # In the future, you might want to store the rejection reason
            query = """
                UPDATE creator_templates 
                SET is_active = false, updated_at = %s
                WHERE id = %s
            """
            now = datetime.utcnow().isoformat()
            result = await self.execute_query(query, (now, template_id))
            return result is not None
            
        except Exception as e:
            print(f"Error rejecting template: {e}")
            return False
    
    async def get_pending_templates(self) -> List[Dict[str, Any]]:
        """Get templates pending approval"""
        try:
            query = """
                SELECT ct.*, c.display_name as creator_name, c.user_id as creator_user_id
                FROM creator_templates ct
                JOIN creators c ON ct.creator_id = c.id
                WHERE ct.is_approved = false AND ct.is_active = true
                ORDER BY ct.created_at ASC
            """
            results = await self.fetch_all(query)
            return results or []
            
        except Exception as e:
            print(f"Error getting pending templates: {e}")
            return []
    
    # =============================================
    # PURCHASE MANAGEMENT METHODS
    # =============================================
    
    async def create_template_purchase(self, purchase_data: Dict[str, Any]) -> bool:
        """Create a template purchase record"""
        try:
            query = """
                INSERT INTO template_purchases (
                    id, template_id, buyer_id, creator_id, price_paid,
                    commission_amount, creator_earnings, stripe_payment_intent_id,
                    stripe_charge_id, status, purchased_at
                ) VALUES (
                    %(id)s, %(template_id)s, %(buyer_id)s, %(creator_id)s, %(price_paid)s,
                    %(commission_amount)s, %(creator_earnings)s, %(stripe_payment_intent_id)s,
                    %(stripe_charge_id)s, %(status)s, %(purchased_at)s
                )
            """
            
            result = await self.execute_query(query, purchase_data)
            return result is not None
            
        except Exception as e:
            print(f"Error creating template purchase: {e}")
            return False
    
    async def get_user_purchases(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's template purchases"""
        try:
            query = """
                SELECT tp.*, ct.name as template_name, ct.preview_image_url,
                       c.display_name as creator_name
                FROM template_purchases tp
                JOIN creator_templates ct ON tp.template_id = ct.id
                JOIN creators c ON tp.creator_id = c.id
                WHERE tp.buyer_id = %s
                ORDER BY tp.purchased_at DESC
            """
            results = await self.fetch_all(query, (user_id,))
            return results or []
            
        except Exception as e:
            print(f"Error getting user purchases: {e}")
            return []
    
    async def get_creator_earnings(self, creator_id: str) -> List[Dict[str, Any]]:
        """Get creator's earnings from template sales"""
        try:
            query = """
                SELECT tp.*, ct.name as template_name, u.email as buyer_email
                FROM template_purchases tp
                JOIN creator_templates ct ON tp.template_id = ct.id
                JOIN auth.users u ON tp.buyer_id = u.id
                WHERE tp.creator_id = %s
                ORDER BY tp.purchased_at DESC
            """
            results = await self.fetch_all(query, (creator_id,))
            return results or []
            
        except Exception as e:
            print(f"Error getting creator earnings: {e}")
            return []
    
    # =============================================
    # ANALYTICS METHODS
    # =============================================
    
    async def get_creator_analytics(self, creator_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a creator"""
        try:
            # Get basic creator stats
            creator = await self.get_creator_by_id(creator_id)
            if not creator:
                return {}
            
            # Get template stats
            templates_query = """
                SELECT 
                    COUNT(*) as total_templates,
                    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_templates,
                    COUNT(CASE WHEN is_approved = false THEN 1 END) as pending_templates,
                    SUM(sales_count) as total_sales,
                    SUM(view_count) as total_views,
                    AVG(rating) as average_rating
                FROM creator_templates 
                WHERE creator_id = %s
            """
            template_stats = await self.fetch_one(templates_query, (creator_id,))
            
            # Get recent sales
            recent_sales_query = """
                SELECT COUNT(*) as recent_sales, SUM(creator_earnings) as recent_earnings
                FROM template_purchases 
                WHERE creator_id = %s 
                AND purchased_at >= NOW() - INTERVAL '30 days'
            """
            recent_sales = await self.fetch_one(recent_sales_query, (creator_id,))
            
            # Get top performing templates
            top_templates_query = """
                SELECT name, sales_count, view_count, rating, price
                FROM creator_templates 
                WHERE creator_id = %s AND is_approved = true
                ORDER BY sales_count DESC 
                LIMIT 5
            """
            top_templates = await self.fetch_all(top_templates_query, (creator_id,))
            
            return {
                "creator": creator,
                "template_stats": template_stats or {},
                "recent_sales": recent_sales or {},
                "top_templates": top_templates or []
            }
            
        except Exception as e:
            print(f"Error getting creator analytics: {e}")
            return {}
    
    # =============================================
    # BLOG MANAGEMENT METHODS
    # =============================================
    
    async def create_blog_post(self, post_data: Dict[str, Any]) -> bool:
        """Create a new blog post"""
        try:
            query = """
                INSERT INTO blog_posts (
                    id, title, slug, content, excerpt, featured_image_url,
                    author_id, category, tags, meta_description, is_published,
                    is_featured, view_count, published_at, created_at, updated_at
                ) VALUES (
                    %(id)s, %(title)s, %(slug)s, %(content)s, %(excerpt)s, %(featured_image_url)s,
                    %(author_id)s, %(category)s, %(tags)s, %(meta_description)s, %(is_published)s,
                    %(is_featured)s, %(view_count)s, %(published_at)s, %(created_at)s, %(updated_at)s
                )
            """
            
            result = await self.execute_query(query, post_data)
            return result is not None
            
        except Exception as e:
            print(f"Error creating blog post: {e}")
            return False
    
    async def get_blog_posts(
        self, 
        published_only: bool = True, 
        limit: int = 10, 
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get blog posts"""
        try:
            query = """
                SELECT bp.*, u.email as author_email
                FROM blog_posts bp
                JOIN auth.users u ON bp.author_id = u.id
            """
            values = []
            
            if published_only:
                query += " WHERE bp.is_published = true"
            
            query += " ORDER BY bp.published_at DESC LIMIT %s OFFSET %s"
            values.extend([limit, offset])
            
            results = await self.fetch_all(query, tuple(values))
            return results or []
            
        except Exception as e:
            print(f"Error getting blog posts: {e}")
            return []
    
    async def get_blog_categories(self) -> List[Dict[str, Any]]:
        """Get blog categories"""
        try:
            query = "SELECT * FROM blog_categories ORDER BY name"
            results = await self.fetch_all(query)
            return results or []
            
        except Exception as e:
            print(f"Error getting blog categories: {e}")
            return []
