#!/usr/bin/env python3
"""
BuyPrintz Marketplace Assets Import Script
Imports categorized BuyPrintz assets into the creator marketplace
"""

import os
import json
import uuid
from datetime import datetime
from database import db_manager

# Asset categorization and pricing
MARKETPLACE_ASSETS = {
    "zodiac": {
        "category": "Astrology & Zodiac",
        "description": "Beautiful zodiac sign designs perfect for personal branding and astrology-themed products",
        "base_price": 1.99,
        "assets": [
            {"file": "1_Cancer_FINAL_with text.png", "name": "Cancer Zodiac Design", "tags": ["cancer", "zodiac", "astrology", "water sign"]},
            {"file": "2_Taurus_FINAL-1_with text.png", "name": "Taurus Zodiac Design", "tags": ["taurus", "zodiac", "astrology", "earth sign"]},
            {"file": "2_Taurus_FINAL-2_with text.png", "name": "Taurus Zodiac Design V2", "tags": ["taurus", "zodiac", "astrology", "earth sign"]},
            {"file": "3_Capricornus_FINAL-1_with text.png", "name": "Capricorn Zodiac Design", "tags": ["capricorn", "zodiac", "astrology", "earth sign"]},
            {"file": "4_Pisces_FINAL-1_with text.png", "name": "Pisces Zodiac Design", "tags": ["pisces", "zodiac", "astrology", "water sign"]},
            {"file": "5_Leo_FINAL-1_with text.png", "name": "Leo Zodiac Design", "tags": ["leo", "zodiac", "astrology", "fire sign"]},
            {"file": "5_Leo_FINAL-2_with text.png", "name": "Leo Zodiac Design V2", "tags": ["leo", "zodiac", "astrology", "fire sign"]},
            {"file": "6_Aquarius_FINAL_with text.png", "name": "Aquarius Zodiac Design", "tags": ["aquarius", "zodiac", "astrology", "air sign"]},
            {"file": "7_Libra_FINAL-1_with text.png", "name": "Libra Zodiac Design", "tags": ["libra", "zodiac", "astrology", "air sign"]},
            {"file": "7_Libra_FINAL-2_with text.png", "name": "Libra Zodiac Design V2", "tags": ["libra", "zodiac", "astrology", "air sign"]},
            {"file": "8_Sagittarius_FINAL_with text.png", "name": "Sagittarius Zodiac Design", "tags": ["sagittarius", "zodiac", "astrology", "fire sign"]},
            {"file": "9_Gemini_FINAL-1_with text.png", "name": "Gemini Zodiac Design", "tags": ["gemini", "zodiac", "astrology", "air sign"]},
            {"file": "9_Gemini_FINAL-2_with text.png", "name": "Gemini Zodiac Design V2", "tags": ["gemini", "zodiac", "astrology", "air sign"]},
            {"file": "10_Aries_FINAL_with text.png", "name": "Aries Zodiac Design", "tags": ["aries", "zodiac", "astrology", "fire sign"]},
            {"file": "11_Virgo_FINAL-1_with text.png", "name": "Virgo Zodiac Design", "tags": ["virgo", "zodiac", "astrology", "earth sign"]},
            {"file": "11_Virgo_FINAL-2_with text.png", "name": "Virgo Zodiac Design V2", "tags": ["virgo", "zodiac", "astrology", "earth sign"]},
            {"file": "12_Scorpio_FINAL_with text.png", "name": "Scorpio Zodiac Design", "tags": ["scorpio", "zodiac", "astrology", "water sign"]},
        ]
    },
    "abstract": {
        "category": "Abstract Art",
        "description": "Modern abstract designs perfect for contemporary branding and artistic projects",
        "base_price": 1.49,
        "assets": [
            {"file": "Abstract 1.png", "name": "Abstract Design 1", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 2.png", "name": "Abstract Design 2", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 3.png", "name": "Abstract Design 3", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 4.png", "name": "Abstract Design 4", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 5.png", "name": "Abstract Design 5", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 6.png", "name": "Abstract Design 6", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 7.png", "name": "Abstract Design 7", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 8.png", "name": "Abstract Design 8", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 9.png", "name": "Abstract Design 9", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 10.png", "name": "Abstract Design 10", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 11.png", "name": "Abstract Design 11", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 12.png", "name": "Abstract Design 12", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 13.png", "name": "Abstract Design 13", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 14.png", "name": "Abstract Design 14", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 15.png", "name": "Abstract Design 15", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 16.png", "name": "Abstract Design 16", "tags": ["abstract", "modern", "artistic", "geometric"]},
            {"file": "Abstract 17.png", "name": "Abstract Design 17", "tags": ["abstract", "modern", "artistic", "geometric"]},
        ]
    },
    "ai_generated": {
        "category": "AI Generated Art",
        "description": "Unique AI-generated designs with vibrant colors and creative concepts",
        "base_price": 1.99,
        "assets": [
            {"file": "brainboxjp_colorful_abstract_heart__dynamic_and_fun_6a4afd93-1ee1-4620-a964-67af0ee6b1dc_3.png", "name": "Colorful Abstract Heart", "tags": ["heart", "abstract", "colorful", "ai art", "love"]},
            {"file": "brainboxjp_colorful_abstract_peacock_5e783440-1f4a-4995-af51-6edf41cb9fb5_2.png", "name": "Colorful Abstract Peacock", "tags": ["peacock", "abstract", "colorful", "ai art", "nature"]},
            {"file": "brainboxjp_abstract_red_background_made_out_of_red_hearts_vario_a5dd15b5-4049-4514-92c2-9763e3ce9b99.png", "name": "Red Hearts Background", "tags": ["hearts", "red", "abstract", "ai art", "love"]},
            {"file": "brainboxjp_printing_in_a_colorful_abstract_form_112127ad-1b76-42c4-8438-ca9a36b2d7d5_2.png", "name": "Printing Abstract Design", "tags": ["printing", "abstract", "colorful", "ai art", "business"]},
            {"file": "brainboxjp_a_colorful_symbol_for_a_print_shop_9cef5d18-025a-4a2f-aca1-e2308e8266b9_3.png", "name": "Print Shop Symbol", "tags": ["print shop", "symbol", "colorful", "ai art", "business"]},
        ]
    },
    "patterns": {
        "category": "Geometric Patterns",
        "description": "Clean geometric patterns perfect for professional branding and backgrounds",
        "base_price": 0.99,
        "assets": [
            {"file": "Patterns_White on Black Bg_Circles.png", "name": "Circle Pattern", "tags": ["circles", "pattern", "geometric", "black white"]},
            {"file": "Patterns_White on Black Bg_Squares.png", "name": "Square Pattern", "tags": ["squares", "pattern", "geometric", "black white"]},
            {"file": "Patterns_White on Black Bg_Stripes_side.png", "name": "Side Stripes Pattern", "tags": ["stripes", "pattern", "geometric", "black white"]},
            {"file": "Patterns_White on Black Bg_Stripes-long.png", "name": "Long Stripes Pattern", "tags": ["stripes", "pattern", "geometric", "black white"]},
            {"file": "Patterns_White on Black Bg_Triangle.png", "name": "Triangle Pattern", "tags": ["triangles", "pattern", "geometric", "black white"]},
            {"file": "Patterns_White on Black Bg_Triangle-Square.png", "name": "Triangle-Square Pattern", "tags": ["triangles", "squares", "pattern", "geometric", "black white"]},
        ]
    },
    "buttons": {
        "category": "Button Designs",
        "description": "Professional button designs for web and print applications",
        "base_price": 1.49,
        "assets": [
            {"file": "butons.png", "name": "Button Design 1", "tags": ["buttons", "ui", "web design", "interface"]},
            {"file": "buttons abstract.png", "name": "Abstract Button Design", "tags": ["buttons", "abstract", "ui", "web design"]},
            {"file": "buttons.png", "name": "Button Design 2", "tags": ["buttons", "ui", "web design", "interface"]},
        ]
    }
}

# BuyPrintz Creator Profile
BUYPRINTZ_CREATOR = {
    "user_id": "00000000-0000-0000-0000-000000000001",  # System user ID (valid UUID)
    "display_name": "BuyPrintz",
    "bio": "Official BuyPrintz design collection featuring professional templates for banners, business cards, and promotional materials. High-quality designs created by our expert design team.",
    "website": "https://buyprintz.com",
    "social_links": {
        "instagram": "https://instagram.com/buyprintz",
        "facebook": "https://facebook.com/buyprintz",
        "twitter": "https://twitter.com/buyprintz"
    },
    "is_verified": True,
    "is_active": True,
    "total_earnings": 0.00,
    "templates_sold": 0,
    "rating": 5.00,
    "rating_count": 0
}

async def create_buyprintz_creator():
    """Create or update BuyPrintz creator profile"""
    print("🏢 Creating BuyPrintz creator profile...")
    
    # Check if creator already exists
    existing_creator = await db_manager.get_creator_by_user_id("d6701c3b-e64f-4b31-bb9a-93c4d1ef202f")
    
    if existing_creator:
        print("✅ BuyPrintz creator profile already exists")
        return existing_creator["id"]
    
    # Create new creator profile
    creator_id = str(uuid.uuid4())
    creator_data = {
        "id": creator_id,
        **BUYPRINTZ_CREATOR
    }
    
    success = await db_manager.create_creator(creator_data)
    if success:
        print(f"✅ Created BuyPrintz creator profile with ID: {creator_id}")
        return creator_id
    else:
        print("❌ Failed to create BuyPrintz creator profile")
        return None

async def import_template(creator_id: str, category_data: dict, asset_data: dict):
    """Import a single template into the marketplace"""
    template_id = str(uuid.uuid4())
    
    # Create template data
    template_data = {
        "id": template_id,
        "creator_id": creator_id,
        "name": asset_data["name"],
        "description": f"{category_data['description']} - {asset_data['name']}",
        "category": category_data["category"],
        "price": max(3.00, category_data["base_price"]),  # Minimum $3.00 required by schema
        "canvas_data": {
            "template_type": "image",
            "template_file": f"/assets/images/Marketplace/{asset_data['file']}",
            "preview_image": f"/assets/images/Marketplace/{asset_data['file']}",
            "tags": asset_data["tags"],
            "created_by": "BuyPrintz",
            "is_official": True
        },
        "preview_image_url": f"/assets/images/Marketplace/{asset_data['file']}",
        "tags": asset_data["tags"],
        "is_approved": True,  # Auto-approve BuyPrintz templates
        "is_active": True,
        "approved_at": datetime.utcnow().isoformat(),
        "approved_by": "d6701c3b-e64f-4b31-bb9a-93c4d1ef202f",
        "view_count": 0,
        "sales_count": 0,
        "rating": 5.0,  # High rating for official templates
        "rating_count": 1
    }
    
    success = await db_manager.create_creator_template(template_data)
    if success:
        print(f"✅ Imported: {asset_data['name']} (${category_data['base_price']})")
        return True
    else:
        print(f"❌ Failed to import: {asset_data['name']}")
        return False

async def main():
    """Main import function"""
    print("🚀 Starting BuyPrintz Marketplace Assets Import")
    print("=" * 50)
    
    # Check database connection
    if not db_manager.is_connected():
        print("❌ Database not connected. Please check your connection.")
        return
    
    # Create BuyPrintz creator profile
    creator_id = await create_buyprintz_creator()
    if not creator_id:
        print("❌ Cannot proceed without creator profile")
        return
    
    print(f"\n📁 Importing templates for creator: {creator_id}")
    print("=" * 50)
    
    total_imported = 0
    total_failed = 0
    
    # Import templates by category
    for category_key, category_data in MARKETPLACE_ASSETS.items():
        print(f"\n📂 Processing category: {category_data['category']}")
        print(f"   Base price: ${category_data['base_price']}")
        print(f"   Assets: {len(category_data['assets'])}")
        
        for asset_data in category_data["assets"]:
            # Check if file exists
            file_path = f"../frontend/public/assets/images/Marketplace/{asset_data['file']}"
            if not os.path.exists(file_path):
                print(f"⚠️  File not found: {asset_data['file']}")
                total_failed += 1
                continue
            
            success = await import_template(creator_id, category_data, asset_data)
            if success:
                total_imported += 1
            else:
                total_failed += 1
    
    print("\n" + "=" * 50)
    print("📊 Import Summary:")
    print(f"✅ Successfully imported: {total_imported} templates")
    print(f"❌ Failed imports: {total_failed} templates")
    print(f"💰 Price range: $0.99 - $1.99")
    print(f"🏢 Creator: BuyPrintz")
    print("=" * 50)
    
    if total_imported > 0:
        print("🎉 BuyPrintz marketplace assets successfully imported!")
        print("🌐 Visit /marketplace to see the new templates")
    else:
        print("⚠️  No templates were imported. Please check the errors above.")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
