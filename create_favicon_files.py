#!/usr/bin/env python3
"""
Create favicon files from your existing logo.
This script will help you generate the required favicon files.
"""

import os
from PIL import Image
import requests
from io import BytesIO

def create_favicon_files():
    """Create favicon files from your existing logo."""
    
    # Your existing logo path
    logo_path = "frontend/public/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png"
    
    if not os.path.exists(logo_path):
        print(f"❌ Logo file not found: {logo_path}")
        print("Please ensure your logo file exists at this path.")
        return False
    
    try:
        # Open the logo
        logo = Image.open(logo_path)
        print(f"✅ Found logo: {logo.size} pixels")
        
        # Create favicon files
        favicon_sizes = [
            (16, 16, "favicon-16x16.png"),
            (32, 32, "favicon-32x32.png"),
            (180, 180, "apple-touch-icon.png")
        ]
        
        for width, height, filename in favicon_sizes:
            # Resize the logo
            resized = logo.resize((width, height), Image.Resampling.LANCZOS)
            
            # Save as PNG
            output_path = f"frontend/public/{filename}"
            resized.save(output_path, "PNG")
            print(f"✅ Created: {filename} ({width}x{height})")
        
        # Create favicon.ico (16x16)
        favicon_16 = logo.resize((16, 16), Image.Resampling.LANCZOS)
        favicon_16.save("frontend/public/favicon.ico", "ICO")
        print("✅ Created: favicon.ico (16x16)")
        
        print("\n🎉 All favicon files created successfully!")
        print("📁 Files created in: frontend/public/")
        print("   - favicon.ico")
        print("   - favicon-16x16.png")
        print("   - favicon-32x32.png")
        print("   - apple-touch-icon.png")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating favicon files: {e}")
        return False

def create_simple_favicon():
    """Create a simple favicon if the logo doesn't exist."""
    
    print("Creating a simple favicon as fallback...")
    
    # Create a simple blue square with "B" text
    from PIL import Image, ImageDraw, ImageFont
    
    # Create 32x32 image
    img = Image.new('RGBA', (32, 32), (30, 58, 138, 255))  # Blue background
    draw = ImageDraw.Draw(img)
    
    # Try to add text (if font is available)
    try:
        # Use default font
        font = ImageFont.load_default()
        text = "B"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (32 - text_width) // 2
        y = (32 - text_height) // 2
        
        draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    except:
        # If font fails, just create a solid square
        pass
    
    # Save in different sizes
    sizes = [
        (16, 16, "favicon-16x16.png"),
        (32, 32, "favicon-32x32.png"),
        (180, 180, "apple-touch-icon.png")
    ]
    
    for width, height, filename in sizes:
        resized = img.resize((width, height), Image.Resampling.LANCZOS)
        resized.save(f"frontend/public/{filename}", "PNG")
        print(f"✅ Created: {filename} ({width}x{height})")
    
    # Create favicon.ico
    favicon_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
    favicon_16.save("frontend/public/favicon.ico", "ICO")
    print("✅ Created: favicon.ico (16x16)")
    
    print("\n🎉 Simple favicon files created!")
    return True

def main():
    """Main function."""
    print("🎯 BuyPrintz Favicon Creator")
    print("=" * 40)
    
    # Check if PIL is available
    try:
        from PIL import Image
    except ImportError:
        print("❌ PIL (Pillow) not installed!")
        print("Install it with: pip install Pillow")
        return
    
    # Try to create from logo
    if create_favicon_files():
        print("\n✅ Success! Your favicon files are ready.")
        print("🚀 Deploy to Vercel and test your favicon!")
    else:
        print("\n⚠️  Could not create from logo, creating simple favicon...")
        if create_simple_favicon():
            print("\n✅ Simple favicon created as fallback.")
            print("💡 For better results, ensure your logo file exists at:")
            print("   frontend/public/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png")

if __name__ == "__main__":
    main()
