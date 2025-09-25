# 🖼️ Image Optimization Guide

## Overview
This guide outlines the steps to optimize images for the BuyPrintz website to achieve the **602 KiB savings** identified by Page Speed Insights.

## Target Images for Optimization

### 1. Business Card Tin Image
- **Current**: `business_card_tin.png` (377 KiB)
- **Target Savings**: 351.9 KiB
- **Display Size**: 393x393px
- **Current Size**: 1200x980px (oversized)

### 2. Vinyl Banner Image  
- **Current**: `13oz Vinyl Banner.jpg` (177.2 KiB)
- **Target Savings**: 152.1 KiB
- **Display Size**: 393x393px
- **Current Size**: 1000x816px (oversized)

### 3. BuyPrintz Logo
- **Current**: `buyprintz_logo.png` (87.3 KiB)
- **Target Savings**: 85.3 KiB
- **Display Size**: 112x112px
- **Current Size**: 600x600px (oversized)

### 4. Tent Complete Image
- **Current**: `tent_complete-buyprintz.jpg` (34.0 KiB)
- **Target Savings**: 12.8 KiB
- **Display Size**: Various
- **Current Size**: Various

## Optimization Steps

### Step 1: Create Multiple Sizes
For each image, create these versions:
- **1x**: Exact display size (e.g., 393x393px)
- **2x**: Double resolution for retina displays (e.g., 786x786px)
- **WebP**: Modern format with 25-35% better compression
- **AVIF**: Next-gen format with 50% better compression

### Step 2: Use Image Optimization Tools

#### Option A: Online Tools
- **Squoosh.app** (Google's image optimizer)
- **TinyPNG** (for PNG compression)
- **ImageOptim** (Mac)
- **RIOT** (Windows)

#### Option B: Command Line Tools
```bash
# Install tools
npm install -g imagemin-cli imagemin-webp imagemin-avif

# Convert to WebP
imagemin frontend/public/assets/images/*.{png,jpg} --out-dir=frontend/public/assets/images/webp --plugin=webp

# Convert to AVIF  
imagemin frontend/public/assets/images/*.{png,jpg} --out-dir=frontend/public/assets/images/avif --plugin=avif
```

### Step 3: File Structure
```
frontend/public/assets/images/
├── business_card_tin.png (393x393)
├── business_card_tin@2x.png (786x786)
├── business_card_tin.webp (393x393)
├── business_card_tin@2x.webp (786x786)
├── business_card_tin.avif (393x393)
├── business_card_tin@2x.avif (786x786)
├── buyprintz_logo.png (112x112)
├── buyprintz_logo@2x.png (224x224)
├── buyprintz_logo.webp (112x112)
├── buyprintz_logo@2x.webp (224x224)
├── buyprintz_logo.avif (112x112)
└── buyprintz_logo@2x.avif (224x224)
```

### Step 4: Update Components
The `OptimizedImage` component has been created to automatically serve the best format:

```jsx
import OptimizedImage from './OptimizedImage';

<OptimizedImage
  src="/assets/images/business_card_tin.png"
  alt="Business Card Tin"
  width="393"
  height="393"
  className="w-full max-w-md object-contain"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## Expected Results

### File Size Reductions
- **Business Card Tin**: 377 KiB → ~25 KiB (93% reduction)
- **Vinyl Banner**: 177.2 KiB → ~25 KiB (86% reduction)  
- **Logo**: 87.3 KiB → ~2 KiB (98% reduction)
- **Tent Image**: 34.0 KiB → ~21 KiB (38% reduction)

### Total Savings
- **Estimated Total**: ~602 KiB savings
- **LCP Improvement**: Faster Largest Contentful Paint
- **FCP Improvement**: Faster First Contentful Paint
- **Better UX**: Faster perceived load times

## Implementation Status

✅ **Completed**:
- Created `OptimizedImage` component
- Added responsive image attributes
- Implemented lazy loading optimization
- Added image preloading for critical images
- Created CSS for image rendering optimization

🔄 **Next Steps**:
1. Convert actual image files to WebP/AVIF formats
2. Create multiple sizes for responsive images
3. Test with Page Speed Insights
4. Deploy and verify improvements

## Browser Support

- **WebP**: 95%+ browser support
- **AVIF**: 85%+ browser support (growing)
- **Fallback**: Original PNG/JPG for older browsers

The `OptimizedImage` component automatically handles format detection and fallbacks.
