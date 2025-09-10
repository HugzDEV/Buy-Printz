import os
import json
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import redis
from site_mapper import SiteMapper
from intelligent_scraper import IntelligentScraper

logger = logging.getLogger(__name__)

class ShippingService:
    """
    Main shipping service that coordinates site mapping and scraping
    to get shipping quotes from print partners.
    """
    
    def __init__(self):
        self.redis_client = self._setup_redis()
        self.site_maps_dir = "site_maps"
        self.cache_ttl = 3600  # 1 hour cache
        
        # Ensure site maps directory exists
        os.makedirs(self.site_maps_dir, exist_ok=True)
        
        # Print partner configurations
        self.print_partners = {
            'b2sign': {
                'name': 'B2Sign',
                'base_url': 'https://b2sign.com',
                'login_url': 'https://b2sign.com',  # Login form is on homepage
                'quote_url': 'https://b2sign.com/13oz-vinyl-banner',  # Default product page for quotes
                'product_pages': {
                    'banner_13oz_vinyl': 'https://www.b2sign.com/13oz-vinyl-banner',
                    'banner_fabric_9oz': 'https://www.b2sign.com/fabric-banner-9oz-wrinkle-free',
                    'banner_mesh': 'https://www.b2sign.com/mesh-banners',
                    'banner_backlit': 'https://www.b2sign.com/vinyl-banner-backlit',
                    'banner_blockout': 'https://www.b2sign.com/vinyl-banner-18oz-blockout',
                    'banner_indoor': 'https://www.b2sign.com/super-smooth-indoor-banner',
                    'banner_pole': 'https://www.b2sign.com/pole-banner-set',
                    'banner_hand': 'https://www.b2sign.com/hand-banner',
                    'tent_10x10': 'https://www.b2sign.com/custom-event-tents',
                    'tent_10x15': 'https://www.b2sign.com/custom-event-tents',
                    'tent_10x20': 'https://www.b2sign.com/custom-event-tents'
                },
                'credentials': {
                    'username': os.getenv('B2SIGN_USERNAME', 'order@buyprintz.com'),
                    'password': os.getenv('B2SIGN_PASSWORD', '$AG@BuyPr!n1z')
                },
                'site_map_file': f"{self.site_maps_dir}/b2sign_map.json",
                'notes': 'B2Sign uses React/Inertia.js. Login form is on homepage. Instant quotes are on individual product pages, not estimate page.'
            },
            # Add more partners as needed
        }
    
    def _setup_redis(self) -> Optional[redis.Redis]:
        """Setup Redis connection for caching."""
        try:
            redis_url = os.getenv('REDIS_URL')
            if redis_url:
                return redis.from_url(redis_url)
            else:
                logger.warning("No Redis URL found, caching disabled")
                return None
        except Exception as e:
            logger.error(f"Failed to setup Redis: {e}")
            return None
    
    def get_shipping_quote(self, product_details: Dict[str, Any], partner_id: str = 'partner_1') -> Dict[str, Any]:
        """
        Get shipping quote for product details from specified print partner.
        """
        try:
            # Check cache first
            cache_key = self._generate_cache_key(product_details, partner_id)
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                logger.info("Returning cached shipping quote")
                return cached_result
            
            # Get fresh quote
            quote_result = self._scrape_shipping_quote(product_details, partner_id)
            
            # Cache the result
            if quote_result.get('success'):
                self._save_to_cache(cache_key, quote_result)
            
            return quote_result
            
        except Exception as e:
            logger.error(f"Failed to get shipping quote: {e}")
            return {
                'success': False,
                'error': str(e),
                'partner_id': partner_id,
                'timestamp': datetime.now().isoformat()
            }
    
    def _scrape_shipping_quote(self, product_details: Dict[str, Any], partner_id: str) -> Dict[str, Any]:
        """
        Scrape shipping quote from print partner website.
        """
        if partner_id not in self.print_partners:
            raise Exception(f"Unknown partner ID: {partner_id}")
        
        partner_config = self.print_partners[partner_id]
        scraper = None
        
        try:
            # Check if site map exists, if not create it
            if not os.path.exists(partner_config['site_map_file']):
                logger.info(f"Creating site map for {partner_config['name']}")
                self._create_site_map(partner_config)
            
            # Initialize scraper with site map
            scraper = IntelligentScraper(partner_config['site_map_file'], headless=True)
            
            # Login to print partner site
            login_success = scraper.login_with_intelligence(
                partner_config['credentials']['username'],
                partner_config['credentials']['password']
            )
            
            if not login_success:
                raise Exception("Failed to login to print partner site")
            
            # Get shipping quote
            quote_result = scraper.get_quote_with_intelligence(product_details)
            
            # Add metadata
            quote_result.update({
                'partner_id': partner_id,
                'partner_name': partner_config['name'],
                'timestamp': datetime.now().isoformat(),
                'product_details': product_details
            })
            
            return quote_result
            
        except Exception as e:
            logger.error(f"Scraping failed for {partner_config['name']}: {e}")
            return {
                'success': False,
                'error': str(e),
                'partner_id': partner_id,
                'partner_name': partner_config['name'],
                'timestamp': datetime.now().isoformat()
            }
        finally:
            if scraper:
                scraper.close()
    
    def _create_site_map(self, partner_config: Dict[str, Any]) -> None:
        """
        Create site map for print partner using BeautifulSoup.
        """
        try:
            # Initialize site mapper
            mapper = SiteMapper(partner_config['base_url'])
            
            # Authenticate and map login form
            mapper.authenticate(
                partner_config['login_url'],
                partner_config['credentials']['username'],
                partner_config['credentials']['password']
            )
            
            # Map quote form
            mapper.map_quote_form(partner_config['quote_url'])
            
            # Detect dynamic elements
            mapper.detect_dynamic_elements(partner_config['quote_url'])
            
            # Save site map
            mapper.save_site_map(partner_config['site_map_file'])
            
            logger.info(f"Site map created for {partner_config['name']}")
            
        except Exception as e:
            logger.error(f"Failed to create site map for {partner_config['name']}: {e}")
            raise
    
    def update_site_map(self, partner_id: str) -> Dict[str, Any]:
        """
        Update site map for a print partner (useful when their site changes).
        """
        if partner_id not in self.print_partners:
            return {'success': False, 'error': f'Unknown partner ID: {partner_id}'}
        
        try:
            partner_config = self.print_partners[partner_id]
            
            # Remove old site map
            if os.path.exists(partner_config['site_map_file']):
                os.remove(partner_config['site_map_file'])
            
            # Create new site map
            self._create_site_map(partner_config)
            
            return {
                'success': True,
                'message': f'Site map updated for {partner_config["name"]}',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to update site map for {partner_id}: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_all_partner_quotes(self, product_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get shipping quotes from all available print partners.
        """
        results = {}
        
        for partner_id in self.print_partners.keys():
            try:
                quote_result = self.get_shipping_quote(product_details, partner_id)
                results[partner_id] = quote_result
            except Exception as e:
                results[partner_id] = {
                    'success': False,
                    'error': str(e),
                    'partner_id': partner_id
                }
        
        # Find best quote
        successful_quotes = [
            (partner_id, result) for partner_id, result in results.items()
            if result.get('success') and 'shipping_cost' in result
        ]
        
        if successful_quotes:
            best_quote = min(successful_quotes, key=lambda x: x[1]['shipping_cost'])
            results['best_quote'] = {
                'partner_id': best_quote[0],
                'shipping_cost': best_quote[1]['shipping_cost'],
                'partner_name': best_quote[1].get('partner_name', '')
            }
        
        return {
            'success': True,
            'results': results,
            'timestamp': datetime.now().isoformat(),
            'total_partners': len(self.print_partners)
        }
    
    def _generate_cache_key(self, product_details: Dict[str, Any], partner_id: str) -> str:
        """Generate cache key for product details and partner."""
        # Create a hash of the product details for caching
        import hashlib
        
        # Sort keys for consistent hashing
        sorted_details = json.dumps(product_details, sort_keys=True)
        details_hash = hashlib.md5(sorted_details.encode()).hexdigest()
        
        return f"shipping_quote:{partner_id}:{details_hash}"
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get result from cache."""
        if not self.redis_client:
            return None
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, data: Dict[str, Any]) -> None:
        """Save result to cache."""
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(data)
            )
        except Exception as e:
            logger.warning(f"Cache write error: {e}")
    
    def get_partner_status(self, partner_id: str) -> Dict[str, Any]:
        """
        Check if a print partner is available and site map is up to date.
        """
        if partner_id not in self.print_partners:
            return {'success': False, 'error': f'Unknown partner ID: {partner_id}'}
        
        partner_config = self.print_partners[partner_id]
        
        status = {
            'partner_id': partner_id,
            'partner_name': partner_config['name'],
            'has_site_map': os.path.exists(partner_config['site_map_file']),
            'has_credentials': bool(partner_config['credentials']['username'] and partner_config['credentials']['password']),
            'base_url': partner_config['base_url']
        }
        
        if status['has_site_map']:
            try:
                # Check site map age
                site_map_time = os.path.getmtime(partner_config['site_map_file'])
                site_map_age = datetime.now() - datetime.fromtimestamp(site_map_time)
                status['site_map_age_hours'] = site_map_age.total_seconds() / 3600
                status['site_map_needs_update'] = site_map_age > timedelta(days=7)
            except Exception as e:
                status['site_map_error'] = str(e)
        
        return status
    
    def get_all_partner_status(self) -> Dict[str, Any]:
        """Get status of all print partners."""
        status = {}
        for partner_id in self.print_partners.keys():
            status[partner_id] = self.get_partner_status(partner_id)
        
        return {
            'success': True,
            'partners': status,
            'timestamp': datetime.now().isoformat()
        }
