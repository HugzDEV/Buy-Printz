#!/usr/bin/env python3
"""
Focused Banner Pricing Mapper
This script maps banner configurations to get accurate base pricing from B2Sign
without trying to guess shipping costs for all 50 states.
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

class FocusedBannerPricingMapper:
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
        
        # Focused banner configurations - just the essential combinations
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
                {'width': 2, 'height': 4},   # 8 sqft - Small
                {'width': 3, 'height': 6},   # 18 sqft - Medium
                {'width': 4, 'height': 8},   # 32 sqft - Large
                {'width': 6, 'height': 12},  # 72 sqft - Extra Large
                {'width': 8, 'height': 16},  # 128 sqft - XXL
                {'width': 10, 'height': 20}, # 200 sqft - XXXL
                {'width': 16, 'height': 32}, # 512 sqft - Huge
                {'width': 20, 'height': 40}  # 800 sqft - Massive
            ],
            'base_config': {
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
            'premium_config': {
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
        }
        
        # Tent configurations
        self.tent_configs = {
            'sizes': ['10x10', '10x15', '10x20'],
            'design_options': ['canopy-only', 'canopy-backwall', 'all-sides'],
            'base_accessories': [],  # No accessories for base pricing
            'premium_accessories': ['carrying-bag', 'sandbags', 'ropes-stakes']  # All accessories
        }
    
    async def initialize(self):
        """Initialize B2Sign integration"""
        try:
            logger.info("🚀 Initializing B2Sign integration for focused pricing mapper...")
            
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
    
    async def map_banner_base_pricing(self):
        """Map base pricing for all banner configurations"""
        logger.info("📊 Starting banner base pricing mapping...")
        
        total_combinations = len(self.banner_configs['materials']) * len(self.banner_configs['sizes']) * 2  # base + premium
        self.pricing_data['total_combinations'] += total_combinations
        
        logger.info(f"📋 Testing {total_combinations} banner combinations...")
        
        for material in self.banner_configs['materials']:
            logger.info(f"🎨 Mapping pricing for {material} banners...")
            self.pricing_data['banners'][material] = {}
            
            for size in self.banner_configs['sizes']:
                size_key = f"{size['width']}x{size['height']}"
                self.pricing_data['banners'][material][size_key] = {}
                
                # Test base configuration
                await self._test_banner_config(material, size, size_key, self.banner_configs['base_config'], 'base')
                
                # Test premium configuration
                await self._test_banner_config(material, size, size_key, self.banner_configs['premium_config'], 'premium')
                
                # Rate limiting between sizes
                await asyncio.sleep(1)
    
    async def map_tent_base_pricing(self):
        """Map base pricing for all tent configurations"""
        logger.info("🏕️ Starting tent base pricing mapping...")
        
        total_combinations = len(self.tent_configs['sizes']) * len(self.tent_configs['design_options']) * 2  # base + premium
        self.pricing_data['total_combinations'] += total_combinations
        
        logger.info(f"📋 Testing {total_combinations} tent combinations...")
        
        for size in self.tent_configs['sizes']:
            logger.info(f"🏕️ Mapping pricing for {size} tents...")
            self.pricing_data['tents'][size] = {}
            
            for design_option in self.tent_configs['design_options']:
                self.pricing_data['tents'][size][design_option] = {}
                
                # Test base configuration (no accessories)
                await self._test_tent_config(size, design_option, self.tent_configs['base_accessories'], 'base')
                
                # Test premium configuration (all accessories)
                await self._test_tent_config(size, design_option, self.tent_configs['premium_accessories'], 'premium')
                
                # Rate limiting between configurations
                await asyncio.sleep(1)
    
    async def _test_banner_config(self, material: str, size: Dict, size_key: str, config: Dict, config_type: str):
        """Test a specific banner configuration"""
        try:
            # Create order data
            order_data = {
                'product_type': 'banner',
                'material': material,
                'dimensions': size,
                'quantity': 1,
                'zip_code': '10001',  # Use a standard zip for base pricing
                'job_name': f'Base Pricing Test - {material} - {size_key} - {config_type}',
                'print_options': config
            }
            
            # Get pricing from B2Sign
            pricing_info = await self._get_banner_pricing(order_data)
            
            # Store pricing data
            self.pricing_data['banners'][material][size_key][config_type] = pricing_info
            
            if pricing_info['success']:
                self.pricing_data['successful_quotes'] += 1
                base_price = pricing_info.get('estimated_base_price', 0)
                price_per_sqft = pricing_info.get('price_per_sqft', 0)
                logger.info(f"✅ {material} {size_key} {config_type}: ${base_price:.2f} (${price_per_sqft:.2f}/sqft)")
            else:
                self.pricing_data['failed_quotes'] += 1
                logger.warning(f"⚠️ {material} {size_key} {config_type}: Failed")
            
        except Exception as e:
            logger.error(f"❌ Error testing {material} {size_key} {config_type}: {e}")
            self.pricing_data['failed_quotes'] += 1
    
    async def _test_tent_config(self, size: str, design_option: str, accessories: List[str], config_type: str):
        """Test a specific tent configuration"""
        try:
            # Create order data
            order_data = {
                'product_type': 'tent',
                'dimensions': {'width': 10, 'height': 10},  # Tent dimensions
                'quantity': 1,
                'zip_code': '10001',  # Use a standard zip for base pricing
                'job_name': f'Tent Base Pricing Test - {size} - {design_option} - {config_type}',
                'print_options': {
                    'tent_size': size,
                    'tent_design_option': design_option
                },
                'accessories': accessories
            }
            
            # Get pricing from B2Sign
            pricing_info = await self._get_tent_pricing(order_data)
            
            # Store pricing data
            self.pricing_data['tents'][size][design_option][config_type] = pricing_info
            
            if pricing_info['success']:
                self.pricing_data['successful_quotes'] += 1
                base_price = pricing_info.get('estimated_base_price', 0)
                logger.info(f"✅ {size} {design_option} {config_type}: ${base_price:.2f}")
            else:
                self.pricing_data['failed_quotes'] += 1
                logger.warning(f"⚠️ {size} {design_option} {config_type}: Failed")
            
        except Exception as e:
            logger.error(f"❌ Error testing {size} {design_option} {config_type}: {e}")
            self.pricing_data['failed_quotes'] += 1
    
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
                'base_pricing': {},
                'premium_pricing': {}
            }
            
            for size, configs in sizes.items():
                if 'base' in configs and configs['base'].get('success'):
                    base_data = configs['base']
                    summary['banner_summary'][material]['base_pricing'][size] = {
                        'base_price': base_data.get('estimated_base_price', 0),
                        'price_per_sqft': base_data.get('price_per_sqft', 0)
                    }
                
                if 'premium' in configs and configs['premium'].get('success'):
                    premium_data = configs['premium']
                    summary['banner_summary'][material]['premium_pricing'][size] = {
                        'base_price': premium_data.get('estimated_base_price', 0),
                        'price_per_sqft': premium_data.get('price_per_sqft', 0)
                    }
        
        # Tent pricing summary
        for size, designs in self.pricing_data['tents'].items():
            summary['tent_summary'][size] = {
                'designs_tested': len(designs),
                'base_pricing': {},
                'premium_pricing': {}
            }
            
            for design, configs in designs.items():
                if 'base' in configs and configs['base'].get('success'):
                    base_data = configs['base']
                    summary['tent_summary'][size]['base_pricing'][design] = {
                        'base_price': base_data.get('estimated_base_price', 0)
                    }
                
                if 'premium' in configs and configs['premium'].get('success'):
                    premium_data = configs['premium']
                    summary['tent_summary'][size]['premium_pricing'][design] = {
                        'base_price': premium_data.get('estimated_base_price', 0)
                    }
        
        return summary
    
    def save_pricing_data(self, filename: str = None):
        """Save pricing data to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"b2sign_base_pricing_data_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(self.pricing_data, f, indent=2)
        
        logger.info(f"💾 Base pricing data saved to: {filename}")
        return filename
    
    def save_pricing_summary(self, filename: str = None):
        """Save pricing summary to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"b2sign_base_pricing_summary_{timestamp}.json"
        
        summary = self.generate_pricing_summary()
        
        with open(filename, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"📊 Base pricing summary saved to: {filename}")
        return filename
    
    async def close(self):
        """Close the integration and cleanup resources"""
        if self.b2sign_integration:
            self.b2sign_integration.close()
            logger.info("🔒 B2Sign integration closed")

async def main():
    """Main function to run the focused banner pricing mapper"""
    logger.info("🚀 Starting focused B2Sign base pricing mapper...")
    
    mapper = FocusedBannerPricingMapper()
    
    try:
        # Initialize B2Sign integration
        if not await mapper.initialize():
            logger.error("❌ Failed to initialize B2Sign integration")
            return
        
        # Map banner base pricing
        await mapper.map_banner_base_pricing()
        
        # Map tent base pricing
        await mapper.map_tent_base_pricing()
        
        # Save results
        pricing_file = mapper.save_pricing_data()
        summary_file = mapper.save_pricing_summary()
        
        # Print summary
        summary = mapper.generate_pricing_summary()
        logger.info(f"\n📊 BASE PRICING MAPPING SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Total combinations tested: {summary['total_combinations']}")
        logger.info(f"Successful quotes: {summary['successful_quotes']}")
        logger.info(f"Failed quotes: {summary['failed_quotes']}")
        logger.info(f"Success rate: {summary['success_rate']:.1f}%")
        logger.info(f"Banner materials tested: {len(summary['banner_summary'])}")
        logger.info(f"Tent sizes tested: {len(summary['tent_summary'])}")
        logger.info(f"Base pricing data saved to: {pricing_file}")
        logger.info(f"Base pricing summary saved to: {summary_file}")
        
        return mapper.pricing_data
        
    except Exception as e:
        logger.error(f"❌ Error in base pricing mapper: {e}")
        return None
    
    finally:
        await mapper.close()

if __name__ == "__main__":
    asyncio.run(main())
