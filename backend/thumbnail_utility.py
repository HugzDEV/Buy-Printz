#!/usr/bin/env python3
"""
BuyPrintz Thumbnail Utility
Standalone utility for creators to generate thumbnails for their artwork
Can be used via command line or imported as a module
"""

import os
import sys
import argparse
from generate_thumbnails import process_single_image, validate_image_file, THUMBNAIL_SIZE, SUPPORTED_FORMATS

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"

def process_image_cli(image_path: str, output_dir: str = None, verbose: bool = False) -> bool:
    """Process a single image via command line interface"""
    print(f"🖼️  Processing image: {image_path}")
    print(f"📏 Thumbnail size: {THUMBNAIL_SIZE[0]}x{THUMBNAIL_SIZE[1]} pixels")
    print("=" * 50)
    
    # Validate input
    is_valid, message = validate_image_file(image_path)
    if not is_valid:
        print(f"❌ Validation failed: {message}")
        return False
    
    print(f"✅ Image validation passed: {message}")
    
    # Process the image
    result = process_single_image(image_path, output_dir)
    
    if result['success']:
        print(f"✅ Thumbnail generated successfully!")
        print(f"📁 Original: {result['original_path']} ({format_file_size(result['file_size'])})")
        print(f"🖼️  Thumbnail: {result['thumbnail_path']} ({format_file_size(result['thumbnail_size'])})")
        print(f"🌐 Web URL: {result['thumbnail_url']}")
        
        if verbose:
            compression_ratio = (1 - result['thumbnail_size'] / result['file_size']) * 100
            print(f"📊 Compression: {compression_ratio:.1f}% size reduction")
        
        return True
    else:
        print(f"❌ Failed to generate thumbnail: {result['error']}")
        return False

def batch_process_directory(directory_path: str, output_dir: str = None, verbose: bool = False) -> dict:
    """Process all images in a directory"""
    print(f"📁 Processing directory: {directory_path}")
    print("=" * 50)
    
    if not os.path.exists(directory_path):
        print(f"❌ Directory not found: {directory_path}")
        return {'success': 0, 'failed': 0, 'errors': []}
    
    results = {'success': 0, 'failed': 0, 'errors': []}
    
    # Find all image files
    image_files = []
    for file in os.listdir(directory_path):
        _, ext = os.path.splitext(file.lower())
        if ext in SUPPORTED_FORMATS:
            image_files.append(os.path.join(directory_path, file))
    
    if not image_files:
        print(f"⚠️  No supported image files found in directory")
        print(f"   Supported formats: {', '.join(SUPPORTED_FORMATS)}")
        return results
    
    print(f"📊 Found {len(image_files)} image files to process")
    print()
    
    # Process each image
    for i, image_path in enumerate(image_files, 1):
        filename = os.path.basename(image_path)
        print(f"[{i:2d}/{len(image_files)}] Processing: {filename}")
        
        result = process_single_image(image_path, output_dir)
        
        if result['success']:
            print(f"    ✅ Success: {result['thumbnail_url']}")
            results['success'] += 1
        else:
            print(f"    ❌ Failed: {result['error']}")
            results['failed'] += 1
            results['errors'].append(f"{filename}: {result['error']}")
    
    print("\n" + "=" * 50)
    print(f"📊 Batch Processing Summary:")
    print(f"✅ Successful: {results['success']} thumbnails")
    print(f"❌ Failed: {results['failed']} thumbnails")
    
    if results['errors'] and verbose:
        print("\n❌ Errors:")
        for error in results['errors']:
            print(f"   - {error}")
    
    return results

def main():
    """Main CLI function"""
    parser = argparse.ArgumentParser(
        description="BuyPrintz Thumbnail Generator - Create optimized thumbnails for marketplace assets",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate thumbnail for a single image
  python thumbnail_utility.py image.png
  
  # Generate thumbnail with custom output directory
  python thumbnail_utility.py image.png --output ./thumbnails
  
  # Process all images in a directory
  python thumbnail_utility.py --batch ./images
  
  # Verbose output with file size information
  python thumbnail_utility.py image.png --verbose
        """
    )
    
    parser.add_argument('input', help='Input image file or directory (for batch processing)')
    parser.add_argument('--output', '-o', help='Output directory for thumbnails (default: marketplace thumbnails)')
    parser.add_argument('--batch', '-b', action='store_true', help='Process all images in the input directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Show detailed information')
    
    args = parser.parse_args()
    
    print("🖼️  BuyPrintz Thumbnail Utility")
    print("=" * 50)
    
    if args.batch:
        # Batch processing
        results = batch_process_directory(args.input, args.output, args.verbose)
        success = results['success'] > 0
    else:
        # Single image processing
        success = process_image_cli(args.input, args.output, args.verbose)
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Thumbnail generation completed successfully!")
        print("🌐 Your thumbnails are ready for the marketplace")
    else:
        print("⚠️  Thumbnail generation completed with errors")
        print("💡 Check the error messages above for details")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
