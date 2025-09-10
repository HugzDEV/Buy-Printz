#!/usr/bin/env python3
"""
BuyPrintz to B2Sign Product Mapper
This module maps BuyPrintz product specifications to B2Sign product options and configurations.
"""

import logging
from typing import Dict, List, Optional, Any, Tuple

logger = logging.getLogger(__name__)

class BuyPrintzB2SignMapper:
    def __init__(self):
        # B2Sign product page mappings
        self.b2sign_products = {
            # Banner products
            'banner_13oz_vinyl': {
                'url': 'https://www.b2sign.com/13oz-vinyl-banner',
                'material': '13oz Vinyl',
                'base_price_per_sqft': 1.60,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming', 'pole_pockets', 'wind_slits']
            },
            'banner_fabric_9oz': {
                'url': 'https://www.b2sign.com/fabric-banner-9oz-wrinkle-free',
                'material': '9oz Fabric',
                'base_price_per_sqft': 2.75,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming', 'pole_pockets']
            },
            'banner_mesh': {
                'url': 'https://www.b2sign.com/mesh-banners',
                'material': 'Mesh',
                'base_price_per_sqft': 1.80,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming', 'wind_slits']
            },
            'banner_backlit': {
                'url': 'https://www.b2sign.com/vinyl-banner-backlit',
                'material': 'Backlit Vinyl',
                'base_price_per_sqft': 7.00,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming']
            },
            'banner_blockout': {
                'url': 'https://www.b2sign.com/vinyl-banner-18oz-blockout',
                'material': '18oz Blockout',
                'base_price_per_sqft': 2.50,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming', 'pole_pockets']
            },
            'banner_indoor': {
                'url': 'https://www.b2sign.com/super-smooth-indoor-banner',
                'material': 'Indoor Vinyl',
                'base_price_per_sqft': 2.50,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['grommets', 'hemming']
            },
            'banner_pole': {
                'url': 'https://www.b2sign.com/pole-banner-set',
                'material': 'Pole Banner',
                'base_price_per_sqft': 3.00,
                'min_size': (1, 1),
                'max_size': (20, 20),
                'available_options': ['pole_pockets', 'hemming']
            },
            'banner_hand': {
                'url': 'https://www.b2sign.com/hand-banner',
                'material': 'Hand Banner',
                'base_price_per_sqft': 2.00,
                'min_size': (1, 1),
                'max_size': (10, 10),
                'available_options': ['hemming']
            },
            
            # Tent products
            'tent_10x10': {
                'url': 'https://www.b2sign.com/custom-event-tents',
                'material': '6oz Tent Fabric',
                'base_price': 299.99,
                'size': (10, 10),
                'available_options': ['carrying_bag', 'sandbags', 'ropes_stakes'],
                'design_options': ['canopy_only', 'canopy_backwall', 'all_sides']
            },
            'tent_10x15': {
                'url': 'https://www.b2sign.com/custom-event-tents',
                'material': '6oz Tent Fabric',
                'base_price': 399.99,
                'size': (10, 15),
                'available_options': ['carrying_bag', 'sandbags', 'ropes_stakes'],
                'design_options': ['canopy_only', 'canopy_backwall', 'all_sides']
            },
            'tent_10x20': {
                'url': 'https://www.b2sign.com/custom-event-tents',
                'material': '6oz Tent Fabric',
                'base_price': 499.99,
                'size': (10, 20),
                'available_options': ['carrying_bag', 'sandbags', 'ropes_stakes'],
                'design_options': ['canopy_only', 'canopy_backwall', 'all_sides']
            }
        }
        
        # BuyPrintz material to B2Sign product mapping
        self.material_mapping = {
            '13oz-vinyl': 'banner_13oz_vinyl',
            '18oz-blackout': 'banner_blockout',
            'mesh': 'banner_mesh',
            'indoor': 'banner_indoor',
            'pole': 'banner_pole',
            '9oz-fabric': 'banner_fabric_9oz',
            'blockout-fabric': 'banner_blockout',
            'tension-fabric': 'banner_fabric_9oz',
            'backlit': 'banner_backlit',
            '6oz-tent-fabric': 'tent_10x10'  # Default tent size
        }
        
        # BuyPrintz options to B2Sign options mapping
        self.options_mapping = {
            # Banner options
            'grommets': {
                'every-2ft-all-sides': 'grommets_all_sides',
                'every-2ft-top-bottom': 'grommets_top_bottom',
                'every-2ft-left-right': 'grommets_left_right',
                '4-corners-only': 'grommets_corners',
                'no-grommets': 'no_grommets'
            },
            'hem': {
                'no-hem': 'no_hem',
                'all-sides': 'hem_all_sides'
            },
            'polePockets': {
                'none': 'no_pole_pockets',
                '2in-top': 'pole_pockets_2in_top',
                '3in-top': 'pole_pockets_3in_top',
                '4in-top': 'pole_pockets_4in_top',
                '2in-top-bottom': 'pole_pockets_2in_top_bottom',
                '3in-top-bottom': 'pole_pockets_3in_top_bottom',
                '4in-top-bottom': 'pole_pockets_4in_top_bottom'
            },
            'windslits': {
                'no-windslits': 'no_wind_slits',
                'standard-windslits': 'standard_wind_slits'
            },
            'sides': {
                1: 'single_sided',
                2: 'double_sided'
            },
            'turnaround': {
                'next-day': 'standard_turnaround',
                'same-day': 'rush_turnaround'
            },
            
            # Tent options
            'tent_design_option': {
                'canopy-only': 'canopy_only',
                'canopy-backwall': 'canopy_backwall',
                'all-sides': 'all_sides'
            },
            'tent_size': {
                '10x10': 'tent_10x10',
                '10x15': 'tent_10x15',
                '10x20': 'tent_10x20'
            }
        }
    
    def map_buyprintz_to_b2sign(self, buyprintz_order: Dict[str, Any]) -> Dict[str, Any]:
        """Map BuyPrintz order data to B2Sign product configuration"""
        try:
            logger.info("🔄 Mapping BuyPrintz order to B2Sign configuration...")
            
            product_type = buyprintz_order.get('product_type', 'banner')
            material = buyprintz_order.get('material', '13oz-vinyl')
            dimensions = buyprintz_order.get('dimensions', {})
            print_options = buyprintz_order.get('print_options', {})
            
            # Determine B2Sign product
            b2sign_product_key = self._determine_b2sign_product(product_type, material, dimensions, print_options)
            b2sign_product = self.b2sign_products.get(b2sign_product_key)
            
            if not b2sign_product:
                raise ValueError(f"No B2Sign product found for: {product_type}, {material}")
            
            # Map dimensions
            width = dimensions.get('width', 2)
            height = dimensions.get('height', 4)
            
            # Map print options
            mapped_options = self._map_print_options(print_options, product_type)
            
            # Create B2Sign configuration
            b2sign_config = {
                'product_key': b2sign_product_key,
                'product_url': b2sign_product['url'],
                'material': b2sign_product['material'],
                'dimensions': {
                    'width': width,
                    'height': height
                },
                'quantity': buyprintz_order.get('quantity', 1),
                'options': mapped_options,
                'zip_code': buyprintz_order.get('zip_code', '10001'),
                'job_name': buyprintz_order.get('job_name', f'BuyPrintz Order {buyprintz_order.get("order_id", "")}'),
                'customer_info': buyprintz_order.get('customer_info', {}),
                'estimated_base_price': self._calculate_base_price(b2sign_product, width, height),
                'product_type': product_type
            }
            
            # Add tent-specific configurations
            if product_type in ['tent', 'tradeshow_tent']:
                b2sign_config.update(self._map_tent_specifics(buyprintz_order, b2sign_product))
            
            logger.info(f"✅ Mapped to B2Sign product: {b2sign_product_key}")
            return b2sign_config
            
        except Exception as e:
            logger.error(f"❌ Error mapping BuyPrintz to B2Sign: {e}")
            raise
    
    def _determine_b2sign_product(self, product_type: str, material: str, dimensions: Dict, print_options: Dict) -> str:
        """Determine the appropriate B2Sign product based on BuyPrintz specifications"""
        
        if product_type in ['tent', 'tradeshow_tent']:
            # Map tent size
            tent_size = print_options.get('tent_size', '10x10')
            return self.options_mapping['tent_size'].get(tent_size, 'tent_10x10')
        
        elif product_type == 'banner':
            # Map banner material
            return self.material_mapping.get(material, 'banner_13oz_vinyl')
        
        else:
            # Default to vinyl banner
            return 'banner_13oz_vinyl'
    
    def _map_print_options(self, print_options: Dict, product_type: str) -> Dict[str, Any]:
        """Map BuyPrintz print options to B2Sign format"""
        mapped = {}
        
        # Map common options
        for buyprintz_key, b2sign_mapping in self.options_mapping.items():
            if buyprintz_key in print_options:
                buyprintz_value = print_options[buyprintz_key]
                if buyprintz_value in b2sign_mapping:
                    mapped[buyprintz_key] = b2sign_mapping[buyprintz_value]
                else:
                    mapped[buyprintz_key] = buyprintz_value
        
        # Map tent-specific options
        if product_type in ['tent', 'tradeshow_tent']:
            tent_design_option = print_options.get('tent_design_option', 'canopy-only')
            mapped['design_option'] = self.options_mapping['tent_design_option'].get(
                tent_design_option, 'canopy_only'
            )
        
        return mapped
    
    def _map_tent_specifics(self, buyprintz_order: Dict, b2sign_product: Dict) -> Dict[str, Any]:
        """Map tent-specific configurations"""
        return {
            'tent_size': b2sign_product['size'],
            'frame_type': '40mm Aluminum Hex',
            'print_method': 'Dye-Sublimation',
            'design_coverage': buyprintz_order.get('print_options', {}).get('tent_design_option', 'canopy-only'),
            'accessories': self._map_tent_accessories(buyprintz_order.get('accessories', []))
        }
    
    def _map_tent_accessories(self, accessories: List[str]) -> List[str]:
        """Map BuyPrintz tent accessories to B2Sign accessories"""
        accessory_mapping = {
            'carrying-bag': 'carrying_bag',
            'sandbags': 'sandbags',
            'ropes-stakes': 'ropes_stakes'
        }
        
        return [accessory_mapping.get(acc, acc) for acc in accessories]
    
    def _calculate_base_price(self, b2sign_product: Dict, width: float, height: float) -> float:
        """Calculate base price for the product"""
        if 'base_price' in b2sign_product:
            # Fixed price for tents
            return b2sign_product['base_price']
        else:
            # Price per square foot for banners
            sqft = width * height
            return sqft * b2sign_product.get('base_price_per_sqft', 1.60)
    
    def get_shipping_quote_request(self, buyprintz_order: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a shipping quote request for B2Sign"""
        try:
            # Map BuyPrintz order to B2Sign configuration
            b2sign_config = self.map_buyprintz_to_b2sign(buyprintz_order)
            
            # Create shipping quote request
            quote_request = {
                'partner': 'b2sign',
                'product_config': b2sign_config,
                'customer_info': {
                    'zip_code': b2sign_config.get('zip_code', '10001'),
                    'job_name': b2sign_config.get('job_name', 'BuyPrintz Quote'),
                    'quantity': b2sign_config.get('quantity', 1)
                },
                'product_details': {
                    'product_type': b2sign_config['product_type'],
                    'material': b2sign_config['material'],
                    'width': b2sign_config['dimensions']['width'],
                    'height': b2sign_config['dimensions']['height'],
                    'quantity': b2sign_config['quantity'],
                    'zip_code': b2sign_config['zip_code'],
                    'job_name': b2sign_config['job_name']
                },
                'b2sign_product_url': b2sign_config['product_url'],
                'estimated_base_price': b2sign_config['estimated_base_price']
            }
            
            logger.info(f"📦 Generated shipping quote request for {b2sign_config['product_type']} product")
            return quote_request
            
        except Exception as e:
            logger.error(f"❌ Error generating shipping quote request: {e}")
            raise
    
    def validate_buyprintz_order(self, buyprintz_order: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate BuyPrintz order data for B2Sign compatibility"""
        errors = []
        
        # Check required fields
        required_fields = ['product_type', 'dimensions']
        for field in required_fields:
            if field not in buyprintz_order:
                errors.append(f"Missing required field: {field}")
        
        # Validate dimensions
        dimensions = buyprintz_order.get('dimensions', {})
        width = dimensions.get('width', 0)
        height = dimensions.get('height', 0)
        
        if width <= 0 or height <= 0:
            errors.append("Invalid dimensions: width and height must be greater than 0")
        
        # Validate product type
        product_type = buyprintz_order.get('product_type', '')
        if product_type not in ['banner', 'tent', 'tradeshow_tent']:
            errors.append(f"Unsupported product type: {product_type}")
        
        # Validate material for banners
        if product_type == 'banner':
            material = buyprintz_order.get('material', '')
            if material not in self.material_mapping:
                errors.append(f"Unsupported banner material: {material}")
        
        return len(errors) == 0, errors

def main():
    """Test the BuyPrintz to B2Sign mapper"""
    logger.info("🚀 Testing BuyPrintz to B2Sign mapper...")
    
    mapper = BuyPrintzB2SignMapper()
    
    # Test banner order
    banner_order = {
        'product_type': 'banner',
        'material': '13oz-vinyl',
        'dimensions': {'width': 3, 'height': 6},
        'quantity': 1,
        'zip_code': '10001',
        'job_name': 'Test Banner Order',
        'print_options': {
            'sides': 1,
            'grommets': 'every-2ft-all-sides',
            'hem': 'all-sides',
            'polePockets': 'none',
            'windslits': 'no-windslits',
            'turnaround': 'next-day'
        }
    }
    
    # Test tent order
    tent_order = {
        'product_type': 'tent',
        'dimensions': {'width': 10, 'height': 10},
        'quantity': 1,
        'zip_code': '10001',
        'job_name': 'Test Tent Order',
        'print_options': {
            'tent_size': '10x10',
            'tent_design_option': 'canopy-only'
        },
        'accessories': ['carrying-bag', 'sandbags']
    }
    
    # Test banner mapping
    print("\n📋 BANNER ORDER MAPPING:")
    print("=" * 50)
    try:
        banner_config = mapper.map_buyprintz_to_b2sign(banner_order)
        print(f"✅ Mapped to: {banner_config['product_key']}")
        print(f"   URL: {banner_config['product_url']}")
        print(f"   Material: {banner_config['material']}")
        print(f"   Dimensions: {banner_config['dimensions']['width']}x{banner_config['dimensions']['height']}")
        print(f"   Options: {banner_config['options']}")
        print(f"   Estimated Price: ${banner_config['estimated_base_price']:.2f}")
        
        # Generate shipping quote request
        quote_request = mapper.get_shipping_quote_request(banner_order)
        print(f"\n📦 SHIPPING QUOTE REQUEST:")
        print(f"   Product Type: {quote_request['product_details']['product_type']}")
        print(f"   B2Sign URL: {quote_request['b2sign_product_url']}")
        
    except Exception as e:
        print(f"❌ Banner mapping error: {e}")
    
    # Test tent mapping
    print("\n📋 TENT ORDER MAPPING:")
    print("=" * 50)
    try:
        tent_config = mapper.map_buyprintz_to_b2sign(tent_order)
        print(f"✅ Mapped to: {tent_config['product_key']}")
        print(f"   URL: {tent_config['product_url']}")
        print(f"   Material: {tent_config['material']}")
        print(f"   Size: {tent_config['tent_size']}")
        print(f"   Design Option: {tent_config['design_coverage']}")
        print(f"   Accessories: {tent_config['accessories']}")
        print(f"   Estimated Price: ${tent_config['estimated_base_price']:.2f}")
        
        # Generate shipping quote request
        quote_request = mapper.get_shipping_quote_request(tent_order)
        print(f"\n📦 SHIPPING QUOTE REQUEST:")
        print(f"   Product Type: {quote_request['product_details']['product_type']}")
        print(f"   B2Sign URL: {quote_request['b2sign_product_url']}")
        
    except Exception as e:
        print(f"❌ Tent mapping error: {e}")
    
    # Test validation
    print("\n📋 ORDER VALIDATION:")
    print("=" * 50)
    
    # Valid order
    is_valid, errors = mapper.validate_buyprintz_order(banner_order)
    print(f"Banner order valid: {is_valid}")
    if errors:
        print(f"Errors: {errors}")
    
    # Invalid order
    invalid_order = {'product_type': 'invalid', 'dimensions': {'width': 0, 'height': 0}}
    is_valid, errors = mapper.validate_buyprintz_order(invalid_order)
    print(f"Invalid order valid: {is_valid}")
    if errors:
        print(f"Errors: {errors}")

if __name__ == "__main__":
    main()
