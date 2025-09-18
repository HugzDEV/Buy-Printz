#!/usr/bin/env python3
"""
BuyPrintz Marketplace Thumbnail Generator
Creates optimized thumbnails for marketplace assets and creator uploads
Supports both bulk generation and single image processing
"""

import os
import sys
from PIL import Image
import asyncio
try:
    from .database import db_manager
except ImportError:
    from database import db_manager

# Thumbnail configuration
THUMBNAIL_SIZE = (300, 300)  # Square thumbnails for consistent grid layout
THUMBNAIL_QUALITY = 85
THUMBNAIL_DIR = "../frontend/public/assets/images/Marketplace/thumbnails"

# Supported image formats
SUPPORTED_FORMATS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

def create_thumbnail_directories():
    """Create thumbnail directories if they don't exist"""
    if not os.path.exists(THUMBNAIL_DIR):
        os.makedirs(THUMBNAIL_DIR)
        print(f"✅ Created thumbnail directory: {THUMBNAIL_DIR}")

def validate_image_file(image_path: str) -> tuple[bool, str]:
    """Validate if the image file is supported and accessible"""
    if not os.path.exists(image_path):
        return False, f"File not found: {image_path}"
    
    # Check file extension
    _, ext = os.path.splitext(image_path.lower())
    if ext not in SUPPORTED_FORMATS:
        return False, f"Unsupported format: {ext}. Supported formats: {', '.join(SUPPORTED_FORMATS)}"
    
    # Check if it's actually an image
    try:
        with Image.open(image_path) as img:
            img.verify()
        return True, "Valid image file"
    except Exception as e:
        return False, f"Invalid image file: {e}"

def detect_content_bounds(img):
    """Detect the bounds of actual content in the image (non-background areas)"""
    try:
        import numpy as np
    except ImportError:
        print("⚠️ NumPy not available, using simple content detection")
        # Simple fallback without numpy - just return full bounds
        return 0, 0, img.width, img.height
    
    # Convert to numpy array for analysis
    img_array = np.array(img)
    
    # Detect the dominant background color (assume it's the corner pixels)
    corners = [
        img_array[0, 0],  # top-left
        img_array[0, -1], # top-right
        img_array[-1, 0], # bottom-left
        img_array[-1, -1] # bottom-right
    ]
    
    # Use the most common corner color as background
    from collections import Counter
    corner_colors = [tuple(corner) for corner in corners]
    background_color = Counter(corner_colors).most_common(1)[0][0]
    
    print(f"🎨 Detected background color: {background_color}")
    
    # Define threshold for background similarity (allow for slight variations)
    background_threshold = 30
    
    # Find non-background pixels
    background_array = np.array(background_color)
    diff = np.sqrt(np.sum((img_array - background_array) ** 2, axis=2))
    non_background_mask = diff > background_threshold
    
    # Find bounds of non-background content
    rows = np.any(non_background_mask, axis=1)
    cols = np.any(non_background_mask, axis=0)
    
    if not np.any(rows) or not np.any(cols):
        # No content found, return full image bounds
        print("🔍 No distinct content detected, using full image")
        return 0, 0, img.width, img.height
    
    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])
    
    print(f"🎯 Content bounds detected: ({left}, {top}) to ({right}, {bottom})")
    return left, top, right, bottom

def generate_thumbnail(image_path: str, thumbnail_path: str) -> bool:
    """Generate a smart thumbnail that focuses on actual content"""
    try:
        # Increase PIL's image size limit to handle large images
        Image.MAX_IMAGE_PIXELS = None
        
        # Open the original image
        with Image.open(image_path) as img:
            print(f"🔍 PROCESSING IMAGE: {image_path}")
            print(f"🔍 Original dimensions: {img.width} x {img.height}")
            print(f"🔍 Original mode: {img.mode}")
            
            original_width, original_height = img.width, img.height
            
            # Convert to RGB if necessary (handles PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create a white background
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
                print(f"🔍 Converted from {img.mode} to RGB with white background")
            elif img.mode != 'RGB':
                img = img.convert('RGB')
                print(f"🔍 Converted to RGB from {img.mode}")
            
            # TEMPORARILY DISABLE SMART CROPPING TO DEBUG MOBILE ISSUE
            # The smart cropping might be causing mobile thumbnails to appear smaller
            print(f"🚫 SMART CROPPING TEMPORARILY DISABLED FOR DEBUGGING")
            print(f"🚫 Using full image to ensure consistent thumbnail sizes")
            content_detected = False
            
            # Keep the content detection code for logging but don't apply cropping
            try:
                left, top, right, bottom = detect_content_bounds(img)
                content_width = right - left
                content_height = bottom - top
                
                print(f"🔍 Content bounds detected: ({left}, {top}) to ({right}, {bottom})")
                print(f"🔍 Content size: {content_width} x {content_height}")
                print(f"🔍 Content coverage: {(content_width * content_height) / (img.width * img.height) * 100:.1f}% of image")
                print(f"🔍 Would crop: {content_width > 30 and content_height > 30 and (content_width < img.width * 0.95 or content_height < img.height * 0.95)}")
                
            except Exception as e:
                print(f"⚠️ Content detection failed: {e}")
            
            print(f"📏 USING FULL IMAGE FOR CONSISTENT THUMBNAILS")
            
            print(f"🔍 Image size before thumbnail generation: {img.width} x {img.height}")
            
            # IMPROVED THUMBNAIL GENERATION FOR BETTER MOBILE SUPPORT
            # Resize to fill the square thumbnail space while staying centered
            
            original_aspect = img.width / img.height
            target_aspect = THUMBNAIL_SIZE[0] / THUMBNAIL_SIZE[1]  # Should be 1.0 for square
            
            print(f"🔍 Original aspect ratio: {original_aspect:.3f}")
            print(f"🔍 Target aspect ratio: {target_aspect:.3f}")
            
            # Target fill: use ~82% of height for strong presence, cap width at 98%
            target_width = THUMBNAIL_SIZE[0]
            target_height = THUMBNAIL_SIZE[1]
            height_fill_ratio = 0.82
            width_cap_ratio = 0.98

            # Start by filling height to 82%
            new_height = int(target_height * height_fill_ratio)
            new_width = int(new_height * original_aspect)

            # If that exceeds our width cap, reduce proportionally
            max_width = int(target_width * width_cap_ratio)
            if new_width > max_width:
                new_width = max_width
                new_height = int(new_width / original_aspect)
            
            print(f"🔍 Calculated new size: {new_width} x {new_height}")
            
            # Resize the image to the calculated dimensions
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            print(f"🔍 Image size after resize: {img.width} x {img.height}")
            
            # Create a square thumbnail with white background
            thumbnail = Image.new('RGB', THUMBNAIL_SIZE, (255, 255, 255))
            
            # Calculate position to center the image
            x = (THUMBNAIL_SIZE[0] - img.size[0]) // 2
            y = (THUMBNAIL_SIZE[1] - img.size[1]) // 2
            thumbnail.paste(img, (x, y))
            
            print(f"🔍 Final positioning: centered at ({x}, {y})")
            print(f"🔍 Final thumbnail fills: {(img.width * img.height) / (THUMBNAIL_SIZE[0] * THUMBNAIL_SIZE[1]) * 100:.1f}% of thumbnail space")
            
            print(f"🔍 Final thumbnail: {THUMBNAIL_SIZE[0]} x {THUMBNAIL_SIZE[1]} (content centered at {x}, {y})")
            print(f"🔍 Content detected and cropped: {content_detected}")
            print(f"🔍 Original vs Final scaling: {img.width / original_width:.3f}x width, {img.height / original_height:.3f}x height")
            
            # Save the thumbnail with higher quality for better mobile viewing
            thumbnail.save(thumbnail_path, 'JPEG', quality=THUMBNAIL_QUALITY, optimize=True)
            print(f"✅ THUMBNAIL SAVED: {thumbnail_path}")
            return True
            
    except Exception as e:
        print(f"❌ Error generating thumbnail for {image_path}: {e}")
        return False

def process_single_image(image_path: str, output_dir: str = None) -> dict:
    """
    Process a single image and generate its thumbnail
    Returns a dictionary with success status and file paths
    """
    result = {
        'success': False,
        'original_path': image_path,
        'thumbnail_path': None,
        'thumbnail_url': None,
        'error': None,
        'file_size': 0,
        'thumbnail_size': 0
    }
    
    try:
        # Validate the image
        is_valid, message = validate_image_file(image_path)
        if not is_valid:
            result['error'] = message
            return result
        
        # Get file size
        result['file_size'] = os.path.getsize(image_path)
        
        # Determine output directory
        if output_dir is None:
            output_dir = THUMBNAIL_DIR
        
        # Create output directory if it doesn't exist
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # Generate thumbnail filename
        original_filename = os.path.basename(image_path)
        name, ext = os.path.splitext(original_filename)
        # Clean filename for web compatibility
        name = name.replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')
        thumbnail_filename = f"{name}_thumb.jpg"
        thumbnail_path = os.path.join(output_dir, thumbnail_filename)
        
        # Generate thumbnail
        if generate_thumbnail(image_path, thumbnail_path):
            result['success'] = True
            result['thumbnail_path'] = thumbnail_path
            result['thumbnail_size'] = os.path.getsize(thumbnail_path)
            
            # Generate relative URL for web access
            if output_dir == THUMBNAIL_DIR:
                result['thumbnail_url'] = f"/assets/images/Marketplace/thumbnails/{thumbnail_filename}"
            elif output_dir.endswith("user_templates"):
                # For user templates directory (same pattern as marketplace)
                result['thumbnail_url'] = f"/assets/images/user_templates/{thumbnail_filename}"
            elif output_dir.startswith("uploads/"):
                # For uploads directory (Railway-compatible)
                result['thumbnail_url'] = f"/{output_dir}/{thumbnail_filename}"
            else:
                # For custom output directories, use relative path
                result['thumbnail_url'] = f"/assets/images/{os.path.basename(output_dir)}/{thumbnail_filename}"
        else:
            result['error'] = "Failed to generate thumbnail"
            
    except Exception as e:
        result['error'] = f"Unexpected error: {e}"
    
    return result

async def get_marketplace_templates():
    """Get all marketplace templates from database"""
    try:
        templates = await db_manager.get_marketplace_templates({'is_approved': True, 'is_active': True}, limit=100)
        return templates
    except Exception as e:
        print(f"❌ Error fetching templates: {e}")
        return []

async def update_template_thumbnail(template_id: str, thumbnail_url: str) -> bool:
    """Update template with thumbnail URL"""
    try:
        # Update the preview_image_url in the database
        response = db_manager.supabase.table("creator_templates").update({
            "preview_image_url": thumbnail_url
        }).eq("id", template_id).execute()
        
        return response.data is not None
    except Exception as e:
        print(f"❌ Error updating template {template_id}: {e}")
        return False

async def main():
    """Main thumbnail generation function"""
    print("🖼️  Starting BuyPrintz Marketplace Thumbnail Generation")
    print("=" * 60)
    
    # Create thumbnail directories
    create_thumbnail_directories()
    
    # Get all marketplace templates
    print("📋 Fetching marketplace templates...")
    templates = await get_marketplace_templates()
    
    if not templates:
        print("❌ No templates found in marketplace")
        return
    
    print(f"📊 Found {len(templates)} templates to process")
    print("=" * 60)
    
    successful_thumbnails = 0
    failed_thumbnails = 0
    updated_database = 0
    
    # Process each template
    for i, template in enumerate(templates, 1):
        template_name = template['name']
        canvas_data = template.get('canvas_data', {})
        
        # Extract image path from canvas_data
        if isinstance(canvas_data, dict):
            image_path = canvas_data.get('template_file', '')
        else:
            # Handle case where canvas_data might be a string
            try:
                import json
                canvas_data_dict = json.loads(canvas_data) if isinstance(canvas_data, str) else canvas_data
                image_path = canvas_data_dict.get('template_file', '')
            except:
                image_path = ''
        
        if not image_path:
            print(f"⚠️  No image path found for template: {template_name}")
            failed_thumbnails += 1
            continue
        
        # Convert relative path to absolute path
        if image_path.startswith('/assets/'):
            image_path = f"../frontend/public{image_path}"
        elif not image_path.startswith('/'):
            image_path = f"../frontend/public/assets/images/Marketplace/{image_path}"
        
        # Check if original image exists
        if not os.path.exists(image_path):
            print(f"⚠️  Original image not found: {image_path}")
            failed_thumbnails += 1
            continue
        
        # Generate thumbnail filename
        original_filename = os.path.basename(image_path)
        name, ext = os.path.splitext(original_filename)
        # Clean filename for Windows compatibility
        name = name.replace(' ', '_').replace('(', '').replace(')', '').replace('-', '_')
        thumbnail_filename = f"{name}_thumb.jpg"
        thumbnail_path = os.path.join(THUMBNAIL_DIR, thumbnail_filename)
        
        # Generate thumbnail
        print(f"[{i:2d}/{len(templates)}] Processing: {template_name}")
        
        if generate_thumbnail(image_path, thumbnail_path):
            print(f"    ✅ Generated thumbnail: {thumbnail_filename}")
            successful_thumbnails += 1
            
            # Update database with thumbnail URL
            thumbnail_url = f"/assets/images/Marketplace/thumbnails/{thumbnail_filename}"
            if await update_template_thumbnail(template['id'], thumbnail_url):
                print(f"    ✅ Updated database with thumbnail URL")
                updated_database += 1
            else:
                print(f"    ⚠️  Failed to update database")
        else:
            print(f"    ❌ Failed to generate thumbnail")
            failed_thumbnails += 1
    
    print("\n" + "=" * 60)
    print("📊 Thumbnail Generation Summary:")
    print(f"✅ Successfully generated: {successful_thumbnails} thumbnails")
    print(f"❌ Failed generations: {failed_thumbnails} thumbnails")
    print(f"🗄️  Database updates: {updated_database} templates")
    print(f"📁 Thumbnail directory: {THUMBNAIL_DIR}")
    print("=" * 60)
    
    if successful_thumbnails > 0:
        print("🎉 Thumbnail generation completed successfully!")
        print("🌐 Thumbnails are now available in the marketplace")
    else:
        print("⚠️  No thumbnails were generated. Please check the errors above.")

if __name__ == "__main__":
    asyncio.run(main())
