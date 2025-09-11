#!/usr/bin/env python3
"""
Comprehensive Pricing Scraper
This script scrapes real pricing from B2Sign for all BuyPrintz product configurations
to update our Supabase database with accurate base pricing.
"""

import json
import time
import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime
import asyncio

from buyprintz_b2sign_mapper import BuyPrintzB2SignMapper
from b2sign_shipping_integration import B2SignShippingIntegration

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensivePricingScraper:
    def __init__(self):
        self.mapper = BuyPrintzB2SignMapper()
        self.b2sign_integration = None
        self.pricing_data = {
            'banners': {},
            'tents': {},
            'scraped_at': datetime.now().isoformat(),
            'total_combinations': 0,
            'successful_quotes': 0,
            'failed_quotes': 0
        }
        
        # Banner configurations to test
        self.banner_configs = {
            'materials': [
                '13oz-vinyl',
                '18oz-blackout', 
                'mesh',
                'indoor',
                'pole',
                '9oz-fabric',
                'blockout-fabric',
                'tension-fabric',
                'backlit'
            ],
            'sizes': [
                {'width': 2, 'height': 4},   # 8 sqft
                {'width': 3, 'height': 6},   # 18 sqft
                {'width': 4, 'height': 8},   # 32 sqft
                {'width': 5, 'height': 10},  # 50 sqft
                {'width': 6, 'height': 12},  # 72 sqft
                {'width': 8, 'height': 16},  # 128 sqft
                {'width': 10, 'height': 20}, # 200 sqft
                {'width': 12, 'height': 24}, # 288 sqft
                {'width': 16, 'height': 32}, # 512 sqft
                {'width': 20, 'height': 40}  # 800 sqft
            ],
            'print_options': [
                # Basic configurations
                {
                    'sides': 1,
                    'grommets': 'every-2ft-all-sides',
                    'hem': 'all-sides',
                    'polePockets': 'none',
                    'webbing': 'no-webbing',
                    'corners': 'no-reinforcement',
                    'rope': 'no-rope',
                    'windslits': 'no-windslits',
                    'turnaround': 'next-day'
                },
                # Premium configurations
                {
                    'sides': 2,
                    'grommets': 'every-2ft-all-sides',
                    'hem': 'all-sides',
                    'polePockets': '3in-top',
                    'webbing': '1in-webbing',
                    'corners': 'reinforce-all-corners',
                    'rope': '3-16-top-bottom',
                    'windslits': 'standard-windslits',
                    'turnaround': 'same-day'
                }
            ]
        }
        
        # Tent configurations to test
        self.tent_configs = {
            'sizes': ['10x10', '10x15', '10x20'],
            'design_options': ['canopy-only', 'canopy-backwall', 'all-sides'],
            'accessories': [
                [],  # No accessories
                ['carrying-bag'],  # Basic accessory
                ['carrying-bag', 'sandbags'],  # Multiple accessories
                ['carrying-bag', 'sandbags', 'ropes-stakes']  # All accessories
            ]
        }
    
    async def initialize(self):
        """Initialize B2Sign integration"""
        try:
            logger.info("🚀 Initializing B2Sign integration for pricing scraper...")
            
            self.b2sign_integration = B2SignShippingIntegration(headless=True)
            
            # Initialize with credentials
            username = 'order@buyprintz.com'
            password = '$AG@BuyPr!n1z'
            
            if self.b2sign_integration.initialize(username, password):
                logger.info("✅ B2Sign integration initialized successfully")
                return True
            else:
                logger.error("❌ Failed to initialize B2Sign integration")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error initializing B2Sign integration: {e}")
            return False
    
    async def scrape_banner_pricing(self):
        """Scrape pricing for all banner configurations"""
        logger.info("📊 Starting banner pricing scrape...")
        
        total_combinations = len(self.banner_configs['materials']) * len(self.banner_configs['sizes']) * len(self.banner_configs['print_options'])
        self.pricing_data['total_combinations'] += total_combinations
        
        logger.info(f"📋 Testing {total_combinations} banner combinations...")
        
        for material in self.banner_configs['materials']:
            logger.info(f"🎨 Scraping pricing for {material} banners...")
            self.pricing_data['banners'][material] = {}
            
            for size in self.banner_configs['sizes']:
                size_key = f"{size['width']}x{size['height']}"
                self.pricing_data['banners'][material][size_key] = {}
                
                for option_set in self.banner_configs['print_options']:
                    try:
                        # Create order data
                        order_data = {
                            'product_type': 'banner',
                            'material': material,
                            'dimensions': size,
                            'quantity': 1,
                            'zip_code': '10001',
                            'job_name': f'Pricing Test - {material} - {size_key}',
                            'print_options': option_set
                        }
                        
                        # Get pricing from B2Sign
                        pricing_info = await self._get_banner_pricing(order_data)
                        
                        # Store pricing data
                        option_key = self._generate_option_key(option_set)
                        self.pricing_data['banners'][material][size_key][option_key] = pricing_info
                        
                        if pricing_info['success']:
                            self.pricing_data['successful_quotes'] += 1
                            logger.info(f"✅ {material} {size_key} {option_key}: ${pricing_info.get('base_price', 'N/A')}")
                        else:
                            self.pricing_data['failed_quotes'] += 1
                            logger.warning(f"⚠️ {material} {size_key} {option_key}: Failed")
                        
                        # Rate limiting
                        await asyncio.sleep(2)
                        
                    except Exception as e:
                        logger.error(f"❌ Error scraping {material} {size_key}: {e}")
                        self.pricing_data['failed_quotes'] += 1
                        continue
    
    async def scrape_tent_pricing(self):
        """Scrape pricing for all tent configurations"""
        logger.info("🏕️ Starting tent pricing scrape...")
        
        total_combinations = len(self.tent_configs['sizes']) * len(self.tent_configs['design_options']) * len(self.tent_configs['accessories'])
        self.pricing_data['total_combinations'] += total_combinations
        
        logger.info(f"📋 Testing {total_combinations} tent combinations...")
        
        for size in self.tent_configs['sizes']:
            logger.info(f"🏕️ Scraping pricing for {size} tents...")
            self.pricing_data['tents'][size] = {}
            
            for design_option in self.tent_configs['design_options']:
                self.pricing_data['tents'][size][design_option] = {}
                
                for accessories in self.tent_configs['accessories']:
                    try:
                        # Create order data
                        order_data = {
                            'product_type': 'tent',
                            'dimensions': {'width': 10, 'height': 10},  # Tent dimensions
                            'quantity': 1,
                            'zip_code': '10001',
                            'job_name': f'Tent Pricing Test - {size} - {design_option}',
                            'print_options': {
                                'tent_size': size,
                                'tent_design_option': design_option
                            },
                            'accessories': accessories
                        }
                        
                        # Get pricing from B2Sign
                        pricing_info = await self._get_tent_pricing(order_data)
                        
                        # Store pricing data
                        accessory_key = '_'.join(accessories) if accessories else 'no_accessories'
                        self.pricing_data['tents'][size][design_option][accessory_key] = pricing_info
                        
                        if pricing_info['success']:
                            self.pricing_data['successful_quotes'] += 1
                            logger.info(f"✅ {size} {design_option} {accessory_key}: ${pricing_info.get('base_price', 'N/A')}")
                        else:
                            self.pricing_data['failed_quotes'] += 1
                            logger.warning(f"⚠️ {size} {design_option} {accessory_key}: Failed")
                        
                        # Rate limiting
                        await asyncio.sleep(2)
                        
                    except Exception as e:
                        logger.error(f"❌ Error scraping {size} {design_option}: {e}")
                        self.pricing_data['failed_quotes'] += 1
                        continue
    
    async def _get_banner_pricing(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get pricing for a banner configuration"""
        try:
            # Map to B2Sign configuration
            b2sign_config = self.mapper.map_buyprintz_to_b2sign(order_data)
            
            # Get shipping quote (which includes pricing)
            quote_request = self.mapper.get_shipping_quote_request(order_data)
            shipping_quote = await asyncio.get_event_loop().run_in_executor(
                None, self.b2sign_integration.get_shipping_quote, quote_request['product_details']
            )
            
            # Extract pricing information
            pricing_info = {
                'success': shipping_quote.get('success', False),
                'b2sign_product': b2sign_config['product_key'],
                'b2sign_url': b2sign_config['product_url'],
                'material': b2sign_config['material'],
                'dimensions': b2sign_config['dimensions'],
                'options': b2sign_config['options'],
                'estimated_base_price': b2sign_config['estimated_base_price'],
                'shipping_options': shipping_quote.get('shipping_options', []),
                'total_cost': shipping_quote.get('total_cost'),
                'errors': shipping_quote.get('errors', [])
            }
            
            # Calculate price per square foot
            sqft = b2sign_config['dimensions']['width'] * b2sign_config['dimensions']['height']
            if sqft > 0:
                pricing_info['price_per_sqft'] = b2sign_config['estimated_base_price'] / sqft
            
            return pricing_info
            
        except Exception as e:
            logger.error(f"❌ Error getting banner pricing: {e}")
            return {
                'success': False,
                'error': str(e),
                'b2sign_product': 'unknown',
                'estimated_base_price': 0
            }
    
    async def _get_tent_pricing(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get pricing for a tent configuration"""
        try:
            # Map to B2Sign configuration
            b2sign_config = self.mapper.map_buyprintz_to_b2sign(order_data)
            
            # Get shipping quote (which includes pricing)
            quote_request = self.mapper.get_shipping_quote_request(order_data)
            shipping_quote = await asyncio.get_event_loop().run_in_executor(
                None, self.b2sign_integration.get_shipping_quote, quote_request['product_details']
            )
            
            # Extract pricing information
            pricing_info = {
                'success': shipping_quote.get('success', False),
                'b2sign_product': b2sign_config['product_key'],
                'b2sign_url': b2sign_config['product_url'],
                'material': b2sign_config['material'],
                'tent_size': b2sign_config.get('tent_size'),
                'design_coverage': b2sign_config.get('design_coverage'),
                'accessories': b2sign_config.get('accessories', []),
                'estimated_base_price': b2sign_config['estimated_base_price'],
                'shipping_options': shipping_quote.get('shipping_options', []),
                'total_cost': shipping_quote.get('total_cost'),
                'errors': shipping_quote.get('errors', [])
            }
            
            return pricing_info
            
        except Exception as e:
            logger.error(f"❌ Error getting tent pricing: {e}")
            return {
                'success': False,
                'error': str(e),
                'b2sign_product': 'unknown',
                'estimated_base_price': 0
            }
    
    def _generate_option_key(self, options: Dict[str, Any]) -> str:
        """Generate a key for the option combination"""
        key_parts = []
        
        # Add key options
        if options.get('sides') == 2:
            key_parts.append('double_sided')
        
        if options.get('polePockets') != 'none':
            key_parts.append('pole_pockets')
        
        if options.get('webbing') != 'no-webbing':
            key_parts.append('webbing')
        
        if options.get('corners') != 'no-reinforcement':
            key_parts.append('reinforced_corners')
        
        if options.get('rope') != 'no-rope':
            key_parts.append('rope')
        
        if options.get('windslits') != 'no-windslits':
            key_parts.append('wind_slits')
        
        if options.get('turnaround') == 'same-day':
            key_parts.append('rush')
        
        return '_'.join(key_parts) if key_parts else 'basic'
    
    def generate_pricing_summary(self) -> Dict[str, Any]:
        """Generate a summary of pricing data"""
        summary = {
            'scraped_at': self.pricing_data['scraped_at'],
            'total_combinations': self.pricing_data['total_combinations'],
            'successful_quotes': self.pricing_data['successful_quotes'],
            'failed_quotes': self.pricing_data['failed_quotes'],
            'success_rate': (self.pricing_data['successful_quotes'] / self.pricing_data['total_combinations'] * 100) if self.pricing_data['total_combinations'] > 0 else 0,
            'banner_summary': {},
            'tent_summary': {}
        }
        
        # Banner pricing summary
        for material, sizes in self.pricing_data['banners'].items():
            summary['banner_summary'][material] = {
                'sizes_tested': len(sizes),
                'price_ranges': {}
            }
            
            for size, options in sizes.items():
                prices = []
                for option, data in options.items():
                    if data.get('success') and data.get('price_per_sqft'):
                        prices.append(data['price_per_sqft'])
                
                if prices:
                    summary['banner_summary'][material]['price_ranges'][size] = {
                        'min_price_per_sqft': min(prices),
                        'max_price_per_sqft': max(prices),
                        'avg_price_per_sqft': sum(prices) / len(prices)
                    }
        
        # Tent pricing summary
        for size, designs in self.pricing_data['tents'].items():
            summary['tent_summary'][size] = {
                'designs_tested': len(designs),
                'price_ranges': {}
            }
            
            for design, accessories in designs.items():
                prices = []
                for accessory, data in accessories.items():
                    if data.get('success') and data.get('estimated_base_price'):
                        prices.append(data['estimated_base_price'])
                
                if prices:
                    summary['tent_summary'][size]['price_ranges'][design] = {
                        'min_price': min(prices),
                        'max_price': max(prices),
                        'avg_price': sum(prices) / len(prices)
                    }
        
        return summary
    
    def save_pricing_data(self, filename: str = None):
        """Save pricing data to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"b2sign_pricing_data_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.pricing_data, f, indent=2)
        
        logger.info(f"💾 Pricing data saved to: {filename}")
        return filename
    
    def save_pricing_summary(self, filename: str = None):
        """Save pricing summary to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"b2sign_pricing_summary_{timestamp}.json"
        
        summary = self.generate_pricing_summary()
        
        with open(filename, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"📊 Pricing summary saved to: {filename}")
        return filename
    
    async def close(self):
        """Close the integration and cleanup resources"""
        if self.b2sign_integration:
            self.b2sign_integration.close()
            logger.info("🔒 B2Sign integration closed")

async def main():
    """Main function to run the comprehensive pricing scraper"""
    logger.info("🚀 Starting comprehensive B2Sign pricing scraper...")
    
    scraper = ComprehensivePricingScraper()
    
    try:
        # Initialize B2Sign integration
        if not await scraper.initialize():
            logger.error("❌ Failed to initialize B2Sign integration")
            return
        
        # Scrape banner pricing
        await scraper.scrape_banner_pricing()
        
        # Scrape tent pricing
        await scraper.scrape_tent_pricing()
        
        # Save results
        pricing_file = scraper.save_pricing_data()
        summary_file = scraper.save_pricing_summary()
        
        # Print summary
        summary = scraper.generate_pricing_summary()
        logger.info(f"\n📊 PRICING SCRAPE SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Total combinations tested: {summary['total_combinations']}")
        logger.info(f"Successful quotes: {summary['successful_quotes']}")
        logger.info(f"Failed quotes: {summary['failed_quotes']}")
        logger.info(f"Success rate: {summary['success_rate']:.1f}%")
        logger.info(f"Banner materials tested: {len(summary['banner_summary'])}")
        logger.info(f"Tent sizes tested: {len(summary['tent_summary'])}")
        logger.info(f"Pricing data saved to: {pricing_file}")
        logger.info(f"Pricing summary saved to: {summary_file}")
        
        return scraper.pricing_data
        
    except Exception as e:
        logger.error(f"❌ Error in pricing scraper: {e}")
        return None
    
    finally:
        await scraper.close()

if __name__ == "__main__":
    asyncio.run(main())
