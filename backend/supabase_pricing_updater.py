#!/usr/bin/env python3
"""
Supabase Pricing Updater
This script updates the Supabase database with accurate pricing data scraped from B2Sign.
"""

import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import os
from supabase import create_client, Client

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SupabasePricingUpdater:
    def __init__(self):
        # Initialize Supabase client
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
        
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Pricing data structure
        self.pricing_data = None
        self.update_summary = {
            'banner_updates': 0,
            'tent_updates': 0,
            'errors': [],
            'updated_at': datetime.now().isoformat()
        }
    
    def load_pricing_data(self, filename: str):
        """Load pricing data from JSON file"""
        try:
            with open(filename, 'r') as f:
                self.pricing_data = json.load(f)
            logger.info(f"📊 Loaded pricing data from: {filename}")
            return True
        except Exception as e:
            logger.error(f"❌ Error loading pricing data: {e}")
            return False
    
    def update_banner_pricing(self):
        """Update banner pricing in Supabase"""
        if not self.pricing_data or 'banners' not in self.pricing_data:
            logger.error("❌ No banner pricing data available")
            return
        
        logger.info("🎨 Updating banner pricing in Supabase...")
        
        for material, sizes in self.pricing_data['banners'].items():
            logger.info(f"📋 Processing {material} banners...")
            
            for size, options in sizes.items():
                for option_key, pricing_info in options.items():
                    if not pricing_info.get('success'):
                        continue
                    
                    try:
                        # Extract pricing information
                        base_price = pricing_info.get('estimated_base_price', 0)
                        price_per_sqft = pricing_info.get('price_per_sqft', 0)
                        dimensions = pricing_info.get('dimensions', {})
                        
                        # Create or update banner pricing record
                        banner_pricing = {
                            'material': material,
                            'width': dimensions.get('width', 0),
                            'height': dimensions.get('height', 0),
                            'size_label': size,
                            'option_config': option_key,
                            'base_price': base_price,
                            'price_per_sqft': price_per_sqft,
                            'b2sign_product': pricing_info.get('b2sign_product', ''),
                            'b2sign_url': pricing_info.get('b2sign_url', ''),
                            'last_updated': datetime.now().isoformat(),
                            'data_source': 'b2sign_scraper'
                        }
                        
                        # Check if record exists
                        existing = self.supabase.table('banner_pricing').select('*').eq('material', material).eq('size_label', size).eq('option_config', option_key).execute()
                        
                        if existing.data:
                            # Update existing record
                            result = self.supabase.table('banner_pricing').update(banner_pricing).eq('material', material).eq('size_label', size).eq('option_config', option_key).execute()
                            logger.info(f"✅ Updated {material} {size} {option_key}: ${base_price:.2f}")
                        else:
                            # Insert new record
                            result = self.supabase.table('banner_pricing').insert(banner_pricing).execute()
                            logger.info(f"➕ Added {material} {size} {option_key}: ${base_price:.2f}")
                        
                        self.update_summary['banner_updates'] += 1
                        
                    except Exception as e:
                        error_msg = f"Error updating {material} {size} {option_key}: {e}"
                        logger.error(f"❌ {error_msg}")
                        self.update_summary['errors'].append(error_msg)
    
    def update_tent_pricing(self):
        """Update tent pricing in Supabase"""
        if not self.pricing_data or 'tents' not in self.pricing_data:
            logger.error("❌ No tent pricing data available")
            return
        
        logger.info("🏕️ Updating tent pricing in Supabase...")
        
        for size, designs in self.pricing_data['tents'].items():
            logger.info(f"📋 Processing {size} tents...")
            
            for design_option, accessories in designs.items():
                for accessory_key, pricing_info in accessories.items():
                    if not pricing_info.get('success'):
                        continue
                    
                    try:
                        # Extract pricing information
                        base_price = pricing_info.get('estimated_base_price', 0)
                        tent_size = pricing_info.get('tent_size')
                        design_coverage = pricing_info.get('design_coverage', design_option)
                        accessory_list = pricing_info.get('accessories', [])
                        
                        # Create or update tent pricing record
                        tent_pricing = {
                            'tent_size': size,
                            'design_option': design_option,
                            'design_coverage': design_coverage,
                            'accessories': accessory_list,
                            'accessory_config': accessory_key,
                            'base_price': base_price,
                            'b2sign_product': pricing_info.get('b2sign_product', ''),
                            'b2sign_url': pricing_info.get('b2sign_url', ''),
                            'last_updated': datetime.now().isoformat(),
                            'data_source': 'b2sign_scraper'
                        }
                        
                        # Check if record exists
                        existing = self.supabase.table('tent_pricing').select('*').eq('tent_size', size).eq('design_option', design_option).eq('accessory_config', accessory_key).execute()
                        
                        if existing.data:
                            # Update existing record
                            result = self.supabase.table('tent_pricing').update(tent_pricing).eq('tent_size', size).eq('design_option', design_option).eq('accessory_config', accessory_key).execute()
                            logger.info(f"✅ Updated {size} {design_option} {accessory_key}: ${base_price:.2f}")
                        else:
                            # Insert new record
                            result = self.supabase.table('tent_pricing').insert(tent_pricing).execute()
                            logger.info(f"➕ Added {size} {design_option} {accessory_key}: ${base_price:.2f}")
                        
                        self.update_summary['tent_updates'] += 1
                        
                    except Exception as e:
                        error_msg = f"Error updating {size} {design_option} {accessory_key}: {e}"
                        logger.error(f"❌ {error_msg}")
                        self.update_summary['errors'].append(error_msg)
    
    def create_pricing_tables(self):
        """Create pricing tables in Supabase if they don't exist"""
        logger.info("🏗️ Creating pricing tables in Supabase...")
        
        # Note: This would typically be done via SQL migration
        # For now, we'll assume the tables exist or create them manually
        
        banner_table_sql = """
        CREATE TABLE IF NOT EXISTS banner_pricing (
            id SERIAL PRIMARY KEY,
            material VARCHAR(50) NOT NULL,
            width DECIMAL(5,2) NOT NULL,
            height DECIMAL(5,2) NOT NULL,
            size_label VARCHAR(20) NOT NULL,
            option_config VARCHAR(100) NOT NULL,
            base_price DECIMAL(10,2) NOT NULL,
            price_per_sqft DECIMAL(10,2) NOT NULL,
            b2sign_product VARCHAR(100),
            b2sign_url TEXT,
            last_updated TIMESTAMP DEFAULT NOW(),
            data_source VARCHAR(50) DEFAULT 'b2sign_scraper',
            UNIQUE(material, size_label, option_config)
        );
        """
        
        tent_table_sql = """
        CREATE TABLE IF NOT EXISTS tent_pricing (
            id SERIAL PRIMARY KEY,
            tent_size VARCHAR(20) NOT NULL,
            design_option VARCHAR(50) NOT NULL,
            design_coverage VARCHAR(50) NOT NULL,
            accessories TEXT[],
            accessory_config VARCHAR(100) NOT NULL,
            base_price DECIMAL(10,2) NOT NULL,
            b2sign_product VARCHAR(100),
            b2sign_url TEXT,
            last_updated TIMESTAMP DEFAULT NOW(),
            data_source VARCHAR(50) DEFAULT 'b2sign_scraper',
            UNIQUE(tent_size, design_option, accessory_config)
        );
        """
        
        try:
            # Execute table creation (this would need to be done via Supabase SQL editor)
            logger.info("📋 Banner pricing table SQL:")
            logger.info(banner_table_sql)
            logger.info("📋 Tent pricing table SQL:")
            logger.info(tent_table_sql)
            logger.info("⚠️ Please create these tables in Supabase SQL editor before running updates")
            
        except Exception as e:
            logger.error(f"❌ Error creating tables: {e}")
    
    def generate_update_report(self) -> Dict[str, Any]:
        """Generate a report of the update process"""
        return {
            'update_summary': self.update_summary,
            'banner_materials_updated': len(self.pricing_data.get('banners', {})) if self.pricing_data else 0,
            'tent_sizes_updated': len(self.pricing_data.get('tents', {})) if self.pricing_data else 0,
            'total_records_updated': self.update_summary['banner_updates'] + self.update_summary['tent_updates'],
            'errors_count': len(self.update_summary['errors']),
            'success_rate': ((self.update_summary['banner_updates'] + self.update_summary['tent_updates']) / 
                           (self.update_summary['banner_updates'] + self.update_summary['tent_updates'] + len(self.update_summary['errors'])) * 100) 
                           if (self.update_summary['banner_updates'] + self.update_summary['tent_updates'] + len(self.update_summary['errors'])) > 0 else 0
        }
    
    def save_update_report(self, filename: str = None):
        """Save update report to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"supabase_pricing_update_report_{timestamp}.json"
        
        report = self.generate_update_report()
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"📊 Update report saved to: {filename}")
        return filename

def main():
    """Main function to update Supabase pricing"""
    logger.info("🚀 Starting Supabase pricing update...")
    
    try:
        # Initialize updater
        updater = SupabasePricingUpdater()
        
        # Load pricing data (you'll need to specify the filename)
        pricing_file = input("Enter the pricing data JSON filename: ").strip()
        if not pricing_file:
            logger.error("❌ No filename provided")
            return
        
        if not updater.load_pricing_data(pricing_file):
            logger.error("❌ Failed to load pricing data")
            return
        
        # Create tables (optional - for first run)
        create_tables = input("Create pricing tables? (y/n): ").strip().lower()
        if create_tables == 'y':
            updater.create_pricing_tables()
        
        # Update banner pricing
        updater.update_banner_pricing()
        
        # Update tent pricing
        updater.update_tent_pricing()
        
        # Generate and save report
        report_file = updater.save_update_report()
        
        # Print summary
        report = updater.generate_update_report()
        logger.info(f"\n📊 SUPABASE UPDATE SUMMARY")
        logger.info(f"{'='*50}")
        logger.info(f"Banner updates: {report['update_summary']['banner_updates']}")
        logger.info(f"Tent updates: {report['update_summary']['tent_updates']}")
        logger.info(f"Total records updated: {report['total_records_updated']}")
        logger.info(f"Errors: {report['errors_count']}")
        logger.info(f"Success rate: {report['success_rate']:.1f}%")
        logger.info(f"Update report saved to: {report_file}")
        
    except Exception as e:
        logger.error(f"❌ Error in Supabase pricing update: {e}")

if __name__ == "__main__":
    main()
