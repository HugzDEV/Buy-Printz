"""
B2Sign-specific configuration and field mappings.
This file contains specific configurations for b2sign.com integration.
"""

# B2Sign-specific field mappings
B2SIGN_FIELD_MAPPINGS = {
    # Common banner/print product fields
    'width': ['width', 'w', 'dimension_width', 'size_width', 'banner_width'],
    'height': ['height', 'h', 'dimension_height', 'size_height', 'banner_height'],
    'material': ['material', 'substrate', 'product_type', 'type', 'media', 'fabric'],
    'quantity': ['quantity', 'qty', 'amount', 'count', 'pieces', 'units'],
    'zip_code': ['zip', 'zipcode', 'postal_code', 'zip_code', 'postal', 'shipping_zip'],
    'weight': ['weight', 'lbs', 'pounds', 'kg', 'kilograms'],
    'dimensions': ['dimensions', 'size', 'measurements', 'specs', 'banner_size'],
    'product_type': ['product', 'item', 'category', 'type', 'banner_type'],
    
    # B2Sign-specific fields
    'finish': ['finish', 'coating', 'lamination', 'surface'],
    'grommets': ['grommets', 'grommet', 'holes', 'reinforcement'],
    'hemming': ['hemming', 'hem', 'sewing', 'edge'],
    'rush_order': ['rush', 'expedite', 'priority', 'urgent'],
    'shipping_method': ['shipping', 'delivery', 'method', 'carrier']
}

# B2Sign product types and their corresponding form values
B2SIGN_PRODUCT_TYPES = {
    'banner': ['banner', 'vinyl_banner', 'outdoor_banner', 'sign'],
    'tent': ['tent', 'canopy', 'pop_up_tent', 'event_tent'],
    'tin': ['tin', 'business_card_tin', 'metal_tin', 'container'],
    'sign': ['sign', 'corrugated_sign', 'yard_sign', 'real_estate_sign']
}

# B2Sign material options
B2SIGN_MATERIALS = {
    'vinyl': ['vinyl', '13oz_vinyl', '18oz_vinyl', 'heavy_vinyl'],
    'fabric': ['fabric', 'mesh', 'polyester', 'canvas'],
    'corrugated': ['corrugated', 'coroplast', 'plastic'],
    'aluminum': ['aluminum', 'metal', 'steel']
}

# B2Sign finish options
B2SIGN_FINISHES = {
    'matte': ['matte', 'flat', 'non_glare'],
    'glossy': ['glossy', 'gloss', 'shiny'],
    'laminate': ['laminate', 'laminated', 'protected']
}

# B2Sign shipping options
B2SIGN_SHIPPING_METHODS = {
    'standard': ['standard', 'ground', 'regular'],
    'expedited': ['expedited', '2_day', 'priority'],
    'overnight': ['overnight', 'next_day', 'rush']
}

# B2Sign-specific form field patterns
B2SIGN_FORM_PATTERNS = {
    'login': {
        'username_fields': ['email', 'username', 'login', 'user_email'],
        'password_fields': ['password', 'pass', 'pwd'],
        'submit_buttons': ['login', 'sign_in', 'submit', 'enter']
    },
    'quote': {
        'form_indicators': ['quote', 'estimate', 'calculate', 'pricing', 'cost'],
        'result_containers': ['total', 'price', 'cost', 'quote', 'estimate', 'shipping'],
        'submit_buttons': ['calculate', 'get_quote', 'estimate', 'submit', 'quote']
    }
}

# B2Sign URL patterns
B2SIGN_URLS = {
    'base': 'https://b2sign.com',
    'login': 'https://b2sign.com/login',
    'quote': 'https://b2sign.com/quote',
    'pricing': 'https://b2sign.com/pricing',
    'contact': 'https://b2sign.com/contact',
    'account': 'https://b2sign.com/account'
}

# B2Sign-specific selectors (if known)
B2SIGN_SELECTORS = {
    'login_form': 'form[action*="login"], .login-form, #login-form',
    'quote_form': 'form[action*="quote"], .quote-form, #quote-form',
    'price_display': '.price, .total, .cost, .quote-amount, #total-price',
    'shipping_cost': '.shipping, .shipping-cost, .delivery, #shipping-amount'
}

# B2Sign expected response patterns
B2SIGN_RESPONSE_PATTERNS = {
    'price_patterns': [
        r'\$(\d+\.?\d*)',
        r'(\d+\.?\d*)\s*dollars?',
        r'cost:\s*\$?(\d+\.?\d*)',
        r'total:\s*\$?(\d+\.?\d*)',
        r'shipping:\s*\$?(\d+\.?\d*)'
    ],
    'success_indicators': [
        'quote generated',
        'estimate ready',
        'pricing calculated',
        'total calculated'
    ],
    'error_indicators': [
        'error',
        'invalid',
        'failed',
        'unable to calculate',
        'please check'
    ]
}

def get_b2sign_field_mapping(product_details):
    """
    Get B2Sign-specific field mapping for product details.
    """
    mappings = {}
    
    for product_key, product_value in product_details.items():
        if product_key in B2SIGN_FIELD_MAPPINGS:
            # Find matching field name in B2Sign form
            for pattern in B2SIGN_FIELD_MAPPINGS[product_key]:
                # This will be used by the scraper to find form fields
                mappings[pattern] = product_value
    
    return mappings

def get_b2sign_product_type_mapping(product_type):
    """
    Map our product types to B2Sign product types.
    """
    for our_type, b2sign_types in B2SIGN_PRODUCT_TYPES.items():
        if our_type == product_type:
            return b2sign_types[0]  # Return first match
    
    return product_type  # Fallback to original

def get_b2sign_material_mapping(material):
    """
    Map our materials to B2Sign materials.
    """
    for our_material, b2sign_materials in B2SIGN_MATERIALS.items():
        if our_material.lower() in material.lower():
            return b2sign_materials[0]  # Return first match
    
    return material  # Fallback to original

def get_b2sign_expected_selectors():
    """
    Get expected CSS selectors for B2Sign forms and elements.
    """
    return B2SIGN_SELECTORS

def get_b2sign_response_patterns():
    """
    Get response patterns for B2Sign quote results.
    """
    return B2SIGN_RESPONSE_PATTERNS
