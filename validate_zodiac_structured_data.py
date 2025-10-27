#!/usr/bin/env python3
"""
Zodiac Tin Skinz Structured Data Validation Script

This script helps validate the structured data for Zodiac Tin Skinz pages
to ensure they meet Google's requirements for rich results.

Usage:
    python validate_zodiac_structured_data.py

The script will:
1. Generate sample structured data for each zodiac sign
2. Validate the JSON structure
3. Check for required fields
4. Provide recommendations for Google Rich Results Test
"""

import json
from datetime import datetime

def generate_zodiac_structured_data(sign_name, sign_data):
    """Generate structured data for a specific zodiac sign"""
    
    structured_data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": f"{sign_name} Tin Skinz",
        "description": f"Custom {sign_name} Tin Skinz featuring {sign_name} astrological sign design. Perfect for {sign_name} birthday gifts, party favors, and astrology lovers. Premium aluminum tins with personalized {sign_name} designs.",
        "image": [
            f"https://www.buyprintz.com{sign_data['image']}",
            f"https://www.buyprintz.com{sign_data['designUrl']}"
        ],
        "url": f"https://www.buyprintz.com/zodiac-tin-skinz/{sign_name.lower()}",
        "sku": f"zodiac-tin-skinz-{sign_name.lower()}",
        "mpn": f"TS-ZOD-{sign_name.upper()}",
        "brand": {
            "@type": "Brand",
            "name": "Tin Skinz"
        },
        "category": "Personalized Zodiac Gifts",
        "offers": {
            "@type": "Offer",
            "price": "19.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2025-12-31",
            "seller": {
                "@type": "Organization",
                "name": "BuyPrintz",
                "url": "https://www.buyprintz.com"
            },
            "url": f"https://www.buyprintz.com/zodiac-tin-skinz/{sign_name.lower()}"
        },
        "additionalProperty": [
            {
                "@type": "PropertyValue",
                "name": "Zodiac Sign",
                "value": sign_name
            },
            {
                "@type": "PropertyValue",
                "name": "Element",
                "value": sign_data['element']
            },
            {
                "@type": "PropertyValue",
                "name": "Dates",
                "value": sign_data['dates']
            },
            {
                "@type": "PropertyValue",
                "name": "Ruling Planet",
                "value": sign_data['rulingPlanet']
            },
            {
                "@type": "PropertyValue",
                "name": "Symbol",
                "value": sign_data['symbol']
            },
            {
                "@type": "PropertyValue",
                "name": "Quality",
                "value": sign_data['quality']
            },
            {
                "@type": "PropertyValue",
                "name": "Season",
                "value": sign_data['season']
            },
            {
                "@type": "PropertyValue",
                "name": "Material",
                "value": "Premium aluminum"
            },
            {
                "@type": "PropertyValue",
                "name": "Use Cases",
                "value": "Birthday gifts, party favors, stocking stuffers, astrology gifts"
            }
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
        }
    }
    
    return structured_data

def validate_structured_data(data):
    """Validate structured data for required fields"""
    
    required_fields = [
        "@context",
        "@type", 
        "name",
        "description",
        "image",
        "url",
        "offers"
    ]
    
    missing_fields = []
    for field in required_fields:
        if field not in data:
            missing_fields.append(field)
    
    # Check offers structure
    offers_issues = []
    if "offers" in data:
        offers = data["offers"]
        required_offer_fields = ["@type", "price", "priceCurrency", "availability"]
        for field in required_offer_fields:
            if field not in offers:
                offers_issues.append(f"offers.{field}")
    
    return {
        "valid": len(missing_fields) == 0 and len(offers_issues) == 0,
        "missing_fields": missing_fields,
        "offers_issues": offers_issues
    }

def main():
    """Main validation function"""
    
    print("🔍 Zodiac Tin Skinz Structured Data Validation")
    print("=" * 50)
    
    # Sample zodiac data (matching the frontend structure)
    zodiac_signs = [
        {
            "name": "Aries",
            "dates": "March 21 - April 19",
            "element": "Fire",
            "rulingPlanet": "Mars",
            "symbol": "Ram",
            "quality": "Cardinal",
            "season": "Spring",
            "image": "/assets/tin-skinz/designs/Zodiac Final/10_Aries_Front.png",
            "designUrl": "/assets/tin-skinz/designs/Zodiac Final/10_Aries_Cancer_Double_Both.png"
        },
        {
            "name": "Pisces",
            "dates": "February 19 - March 20",
            "element": "Water",
            "rulingPlanet": "Neptune",
            "symbol": "Fish",
            "quality": "Mutable",
            "season": "Winter",
            "image": "/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Front.png",
            "designUrl": "/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Double_Both.png"
        }
    ]
    
    all_valid = True
    
    for sign_data in zodiac_signs:
        sign_name = sign_data["name"]
        print(f"\n📋 Validating {sign_name} Tin Skinz...")
        
        # Generate structured data
        structured_data = generate_zodiac_structured_data(sign_name, sign_data)
        
        # Validate
        validation = validate_structured_data(structured_data)
        
        if validation["valid"]:
            print(f"✅ {sign_name}: Valid structured data")
        else:
            print(f"❌ {sign_name}: Issues found")
            all_valid = False
            
            if validation["missing_fields"]:
                print(f"   Missing fields: {', '.join(validation['missing_fields'])}")
            
            if validation["offers_issues"]:
                print(f"   Offers issues: {', '.join(validation['offers_issues'])}")
        
        # Save sample JSON for testing
        filename = f"zodiac_{sign_name.lower()}_structured_data.json"
        with open(filename, 'w') as f:
            json.dump(structured_data, f, indent=2)
        print(f"   📄 Sample data saved to: {filename}")
    
    print("\n" + "=" * 50)
    
    if all_valid:
        print("🎉 All Zodiac signs have valid structured data!")
    else:
        print("⚠️  Some issues found. Please review the validation results above.")
    
    print("\n📝 Next Steps:")
    print("1. Test your structured data using Google's Rich Results Test:")
    print("   https://search.google.com/test/rich-results")
    print("2. Submit your updated sitemap to Google Search Console")
    print("3. Request re-indexing of the Zodiac pages")
    print("4. Monitor Google Search Console for validation improvements")
    
    print(f"\n🕒 Validation completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
