#!/usr/bin/env python3
"""
Generate simplified Google Merchant Center feed with only essential attributes
"""

# TinSkinz designs from TinSkinzMarketplace.jsx
tinskinz_designs = {
    'abstract-art': [
        {'id': 'abstract-1', 'name': 'Abstract 1'},
        {'id': 'abstract-2', 'name': 'Abstract 2'},
        {'id': 'abstract-3', 'name': 'Abstract 3'},
        {'id': 'abstract-4', 'name': 'Abstract 4'},
        {'id': 'abstract-5', 'name': 'Abstract 5'},
        {'id': 'abstract-6', 'name': 'Abstract 6'},
        {'id': 'abstract-9', 'name': 'Abstract 9'},
        {'id': 'abstract-10', 'name': 'Abstract 10'},
        {'id': 'abstract-11', 'name': 'Abstract 11'},
        {'id': 'abstract-12', 'name': 'Abstract 12'},
        {'id': 'abstract-16', 'name': 'Abstract 16'},
        {'id': 'abstract-17', 'name': 'Abstract 17'},
    ],
    'zodiac': [
        {'id': 'cancer', 'name': 'Cancer'},
        {'id': 'taurus', 'name': 'Taurus'},
        {'id': 'capricornus', 'name': 'Capricorn'},
        {'id': 'pisces', 'name': 'Pisces'},
        {'id': 'leo', 'name': 'Leo'},
        {'id': 'aquarius', 'name': 'Aquarius'},
        {'id': 'libra', 'name': 'Libra'},
        {'id': 'sagittarius', 'name': 'Sagittarius'},
        {'id': 'gemini', 'name': 'Gemini'},
        {'id': 'aries', 'name': 'Aries'},
        {'id': 'virgo', 'name': 'Virgo'},
        {'id': 'scorpio', 'name': 'Scorpio'},
    ],
    'animals': [
        {'id': 'bee', 'name': 'Bee'},
        {'id': 'wolf', 'name': 'Wolf'},
        {'id': 'hummingbird', 'name': 'Hummingbird'},
        {'id': 'bunny', 'name': 'Bunny'},
        {'id': 'butterfly', 'name': 'Butterfly'},
        {'id': 'cat', 'name': 'Cat'},
        {'id': 'puppy', 'name': 'Puppy'},
        {'id': 'horse', 'name': 'Horse'},
        {'id': 'lion', 'name': 'Lion'},
        {'id': 'owl', 'name': 'Owl'},
        {'id': 'parrot', 'name': 'Parrot'},
        {'id': 'peacock-14', 'name': 'Peacock'},
        {'id': 'peacock-15', 'name': 'Peacock 2'},
        {'id': 'turtle', 'name': 'Turtle'},
        {'id': 'frog', 'name': 'Frog'},
        {'id': 'ladybugs', 'name': 'Ladybugs'},
        {'id': 'monkey', 'name': 'Monkey'},
        {'id': 'elephant', 'name': 'Elephant'},
    ]
}

def generate_simplified_tinskinz_row(design, category):
    """Generate a simplified TSV row for a TinSkinz design with only essential attributes"""
    return [
        f"tinskinz-{design['id']}",  # id (unique identifier)
        f"TinSkinz {design['name']}",  # title
        f"Pre-designed tin with {category.replace('-', ' ')} design, perfect for birthdays, events, and special occasions. Includes candy and custom message option. Contact us at order@buyprintz.com or 617-505-0603 for custom orders.",  # description
        "9.99",  # price
        "new",  # condition
        "https://buyprintz.com/tin-skinz",  # link
        "in_stock",  # availability
        f"https://buyprintz.com/assets/tin-skinz/designs/{category.title() if category == 'abstract-art' else category.title()}/{'Abstract Art' if category == 'abstract-art' else category.title()}/{design['name']}_Front.png",  # image_link
        "TinSkinz",  # brand
        "",  # gtin
        f"TS-{design['id'].upper()}",  # mpn
        "Food, Beverages & Tobacco > Food Items > Candy & Chocolate > Candy",  # google_product_category
        "TinSkinz",  # product_type
        "0.194",  # shipping_weight (lbs) - tin with candy (matches backend calculation)
        "4",  # shipping_length (inches)
        "4",  # shipping_width (inches)
        "6",  # shipping_height (inches)
        f"tinskinz-{category}",  # item_group_id
        f"https://buyprintz.com/assets/tin-skinz/designs/{category.title() if category == 'abstract-art' else category.title()}/{'Abstract Art' if category == 'abstract-art' else category.title()}/{design['name']}_Back.png",  # additional_image_link
        "adult",  # age_group
        "unisex",  # gender
        "Aluminum",  # material
        category.replace('-', ' ').title(),  # pattern
        "Multi",  # color
        "Standard",  # size
    ]

def generate_simplified_business_row(product):
    """Generate simplified row for business products"""
    return [
        product['id'],
        product['title'],
        product['description'],
        product['price'],
        "new",
        product['link'],
        "in_stock",
        product['image_link'],
        "BuyPrintz",
        "",
        product['mpn'],
        product['google_product_category'],
        product['product_type'],
        product['shipping_weight'],
        product['shipping_length'],
        product['shipping_width'],
        product['shipping_height'],
        product['item_group_id'],
        "",
        "adult",
        "unisex",
        product['material'],
        "",
        product['color'],
        product['size'],
    ]

def main():
    # Essential attributes only (Google Merchant Center compliant)
    header = [
        "id", "title", "description", "price", "condition", "link", "availability", 
        "image_link", "brand", "gtin", "mpn", "google_product_category", "product_type",
        "shipping_weight", "shipping_length", "shipping_width", "shipping_height", 
        "item_group_id", "additional_image_link", "age_group", "gender", "material", 
        "pattern", "color", "size"
    ]
    
    # Real contact information from Contact.jsx
    contact_info = {
        'email': 'order@buyprintz.com',
        'phone': '617-505-0603',
        'business_hours': 'Monday - Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 4:00 PM, Sunday: Closed'
    }
    
    # Business products (simplified) - using real contact info
    business_products = [
        {
            'id': 'vinyl-13oz',
            'title': '13oz Vinyl Banner',
            'description': 'Our most popular banner - perfect for outdoor use with weather resistance and vibrant colors. Priced per square foot starting at $1.60/sqft. Contact us at order@buyprintz.com or 617-505-0603 for custom orders.',
            'price': '1.60',
            'link': 'https://buyprintz.com/product/vinyl-13oz',
            'image_link': 'https://buyprintz.com/assets/images/13oz Vinyl Banner.jpg',
            'mpn': 'BP-VB-13OZ',
            'google_product_category': 'Home & Garden > Home Improvement > Hardware > Building Materials > Lumber & Composites > Lumber > Plywood & Engineered Wood > Plywood',
            'product_type': 'Banner',
            'shipping_weight': '0.5',
            'shipping_length': '36',
            'shipping_width': '24',
            'shipping_height': '0.125',
            'item_group_id': 'vinyl-banners',
            'material': '13oz Scrim Vinyl',
            'color': 'White',
            'size': 'Custom'
        },
        {
            'id': 'vinyl-18oz',
            'title': '18oz Blocked Banner',
            'description': '18 oz matte blockout banner - Full color UV printed, indoor and outdoor ready. Priced per square foot starting at $2.50/sqft. Contact us at order@buyprintz.com or 617-505-0603 for custom orders.',
            'price': '2.50',
            'link': 'https://buyprintz.com/product/vinyl-18oz',
            'image_link': 'https://buyprintz.com/assets/images/blockout Banner -BuyPrintz.jpg',
            'mpn': 'BP-VB-18OZ',
            'google_product_category': 'Home & Garden > Home Improvement > Hardware > Building Materials > Lumber & Composites > Lumber > Plywood & Engineered Wood > Plywood',
            'product_type': 'Banner',
            'shipping_weight': '0.6',
            'shipping_length': '36',
            'shipping_width': '24',
            'shipping_height': '0.15',
            'item_group_id': 'vinyl-banners',
            'material': '18oz Matte Blockout Vinyl',
            'color': 'White',
            'size': 'Custom'
        },
        {
            'id': 'tin-silver-100',
            'title': 'Business Card Tins - Silver (100 units)',
            'description': 'Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. 100 unit minimum order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '399.99',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/silvertin-buyprintz.jpg',
            'mpn': 'BP-TIN-SILVER',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '2.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '1',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Silver Aluminum',
            'color': 'Silver',
            'size': 'Custom'
        },
        {
            'id': 'tin-silver-250',
            'title': 'Business Card Tins - Silver (250 units)',
            'description': 'Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. 250 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '649.99',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/silvertin-buyprintz.jpg',
            'mpn': 'BP-TIN-SILVER-250',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '6.25',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '2.5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Silver Aluminum',
            'color': 'Silver',
            'size': 'Custom'
        },
        {
            'id': 'tin-silver-500',
            'title': 'Business Card Tins - Silver (500 units)',
            'description': 'Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. 500 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '899.99',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/silvertin-buyprintz.jpg',
            'mpn': 'BP-TIN-SILVER-500',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '12.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Silver Aluminum',
            'color': 'Silver',
            'size': 'Custom'
        },
        {
            'id': 'tin-black-100',
            'title': 'Business Card Tins - Black (100 units)',
            'description': 'Sleek black aluminum business card tins with custom vinyl stickers - modern and sophisticated. 100 unit minimum order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '425.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/black tins-buyprintz.jpg',
            'mpn': 'BP-TIN-BLACK-100',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '2.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '1',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Black Aluminum',
            'color': 'Black',
            'size': 'Custom'
        },
        {
            'id': 'tin-black-250',
            'title': 'Business Card Tins - Black (250 units)',
            'description': 'Sleek black aluminum business card tins with custom vinyl stickers - modern and sophisticated. 250 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '675.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/black tins-buyprintz.jpg',
            'mpn': 'BP-TIN-BLACK-250',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '6.25',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '2.5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Black Aluminum',
            'color': 'Black',
            'size': 'Custom'
        },
        {
            'id': 'tin-black-500',
            'title': 'Business Card Tins - Black (500 units)',
            'description': 'Sleek black aluminum business card tins with custom vinyl stickers - modern and sophisticated. 500 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '925.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/black tins-buyprintz.jpg',
            'mpn': 'BP-TIN-BLACK-500',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '12.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Black Aluminum',
            'color': 'Black',
            'size': 'Custom'
        },
        {
            'id': 'tin-gold-100',
            'title': 'Business Card Tins - Gold (100 units)',
            'description': 'Luxurious gold aluminum business card tins with custom vinyl stickers - premium and elegant. 100 unit minimum order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '450.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/gold tins-buyprintz.jpg',
            'mpn': 'BP-TIN-GOLD-100',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '2.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '1',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Gold Aluminum',
            'color': 'Gold',
            'size': 'Custom'
        },
        {
            'id': 'tin-gold-250',
            'title': 'Business Card Tins - Gold (250 units)',
            'description': 'Luxurious gold aluminum business card tins with custom vinyl stickers - premium and elegant. 250 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '700.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/gold tins-buyprintz.jpg',
            'mpn': 'BP-TIN-GOLD-250',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '6.25',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '2.5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Gold Aluminum',
            'color': 'Gold',
            'size': 'Custom'
        },
        {
            'id': 'tin-gold-500',
            'title': 'Business Card Tins - Gold (500 units)',
            'description': 'Luxurious gold aluminum business card tins with custom vinyl stickers - premium and elegant. 500 unit order. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '950.00',
            'link': 'https://buyprintz.com/business-card-tins',
            'image_link': 'https://buyprintz.com/assets/images/gold tins-buyprintz.jpg',
            'mpn': 'BP-TIN-GOLD-500',
            'google_product_category': 'Office Products > Office Supplies > Paper Products > Business Cards',
            'product_type': 'Business Card Tins',
            'shipping_weight': '12.5',
            'shipping_length': '4',
            'shipping_width': '3',
            'shipping_height': '5',
            'item_group_id': 'business-card-tins',
            'material': 'Premium Gold Aluminum',
            'color': 'Gold',
            'size': 'Custom'
        },
        {
            'id': 'tent-canopy-only',
            'title': '10x10 Complete Tent (Canopy Only)',
            'description': 'Complete tent package with frame and canopy. Perfect starter option with professional aluminum frame and custom dye sublimated canopy graphics. Starting at $325. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '325.00',
            'link': 'https://buyprintz.com/tradeshow-tents',
            'image_link': 'https://buyprintz.com/assets/images/Tent_only-buyprintz.jpg',
            'mpn': 'BP-TENT-10X10-CANOPY',
            'google_product_category': 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking > Tents & Shelters > Tents',
            'product_type': 'Trade Show Tent',
            'shipping_weight': '51',
            'shipping_length': '120',
            'shipping_width': '120',
            'shipping_height': '137',
            'item_group_id': 'tradeshow-tents',
            'material': '6oz Tent Fabric (600x600 denier)',
            'color': 'White',
            'size': '10x10'
        },
        {
            'id': 'tent-with-walls',
            'title': '10x10 Complete Tent + Walls',
            'description': 'Complete tent with frame, canopy, and wall options. Enhanced coverage with sidewalls and/or backwall for maximum branding and protection. Up to $900 depending on configuration. Contact us at order@buyprintz.com or 617-505-0603.',
            'price': '900.00',
            'link': 'https://buyprintz.com/tradeshow-tents',
            'image_link': 'https://buyprintz.com/assets/images/tent_complete-buyprintz.jpg',
            'mpn': 'BP-TENT-10X10-WALLS',
            'google_product_category': 'Sports & Outdoors > Outdoor Recreation > Camping & Hiking > Tents & Shelters > Tents',
            'product_type': 'Trade Show Tent',
            'shipping_weight': '58',
            'shipping_length': '120',
            'shipping_width': '120',
            'shipping_height': '137',
            'item_group_id': 'tradeshow-tents',
            'material': '6oz Tent Fabric (600x600 denier)',
            'color': 'White',
            'size': '10x10'
        }
    ]
    
    # Generate all rows
    all_rows = [header]
    
    # Add business products
    for product in business_products:
        all_rows.append(generate_simplified_business_row(product))
    
    # Add TinSkinz products
    for category, designs in tinskinz_designs.items():
        for design in designs:
            all_rows.append(generate_simplified_tinskinz_row(design, category))
    
    # Write simplified feed
    with open('buyprintz_simplified_merchant_center_feed.tsv', 'w', encoding='utf-8') as f:
        for row in all_rows:
            f.write('\t'.join(row) + '\n')
    
    print(f"Generated simplified feed with {len(business_products)} business products + {sum(len(designs) for designs in tinskinz_designs.values())} TinSkinz products = {len(all_rows)-1} total products")
    print(f"Using only {len(header)} essential attributes (Google compliant)")

if __name__ == "__main__":
    main()
