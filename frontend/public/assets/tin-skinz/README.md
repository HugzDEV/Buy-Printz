# Tin Skinz Assets

This directory contains the assets for the Tin Skinz marketplace mockup system.

## Required Assets

### Base Assets
- `tin-frames/Vertical_Frame.png` - The main tin spine view showing both front and back simultaneously
- `tin-frames/Vertical_Frame_Panels.png` - Mask image for the cut-out areas (used for both front and back)

### Design Assets
Place design images in the `designs/` subdirectory by category:
- `Abstract Art/` - Abstract art designs
  - `Abstract 1_Front.png` - Front thumbnail
  - `Abstract 1_Back.png` - Back thumbnail  
  - `Abstract 1_Double.png` - Full design for mockup
  - `Abstract 2_Front.png`, `Abstract 2_Back.png`, `Abstract 2_Double.png`
  - ... (and so on for each design)

## Asset Specifications

### Tin Spine View (tin-frames/Vertical_Frame.png)
- **Dimensions**: 1200x1200px (FIXED - for perfect masking)
- **Format**: PNG with transparency
- **Content**: Fixed-position tin showing both front and back surfaces
- **Positioning**: Must be exactly positioned for consistent masking

### Mask Images (tin-frames/Vertical_Frame_Panels.png)
- **Dimensions**: 1200x1200px (FIXED - must match tin spine exactly)
- **Format**: PNG with transparency
- **Content**: White areas where design should appear, transparent elsewhere
- **Positioning**: Must align perfectly with cut-out areas on tin spine

### Design Images
- **Front/Back Thumbnails**: Used in design selection grid
- **Double Design**: Full design for mockup overlay (matches cut-out areas)
- **Format**: PNG with transparency
- **Content**: The actual design that will be applied to the tin surfaces
- **Positioning**: Will be automatically positioned at front (200,200) and back (700,200) cut-out areas

## Usage

The TinSkinzMockupViewer component will automatically load these assets and apply them using Konva's masking capabilities to create real-time mockups.
