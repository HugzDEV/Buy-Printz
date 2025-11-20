# Master Tent Template Coordinates & Guidelines

This document provides the master coordinate system and design guidelines for creating consistent tent templates in the BuyPrintz application.

## Overview

The tent template system uses a standardized coordinate system across all surfaces to ensure consistent branding, spacing, and visual hierarchy. This master template serves as the foundation for creating new tent designs.

## Surface Dimensions

- **Canopy Surfaces**: 1110 x 780px (Triangular)
- **Sidewall Surfaces**: 1110 x 390px (Rectangular)
- **Backwall Surface**: 1110 x 780px (Full Height)

## Master Coordinate System

### Canopy Surfaces (Front, Back, Left, Right)

#### Front & Back Canopy (Identical Layout)
```javascript
// Logo Background
{
  x: 508, y: 175, width: 200, height: 100,
  fill: '#ffffff', cornerRadius: 8
}

// Company Name
{
  x: 508, y: 260, fontSize: 24,
  text: 'BUYPRINTZ', align: 'center'
}

// Main Headline
{
  x: 335, y: 416, fontSize: 36, width: 500,
  text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE'
}

// Contact Information
{
  x: 278, y: 680, fontSize: 18, width: 250,
  text: 'www.buyprintz.com\n617-505-0603'
}

// Valence Text (Lower Section)
{
  x: 270, y: 875, fontSize: 36, width: 600,
  text: 'WWW.BUYPRINTZ.COM\n617-505-0603'
}

// QR Code Elements (Front/Back Only)
// Left QR Code
{ x: 40, y: 850, width: 120, height: 120 }
// Right QR Code  
{ x: 1000, y: 850, width: 120, height: 120 }
// QR Labels
{ x: 180, y: 900, text: 'SCAN ME' }  // Left
{ x: 910, y: 900, text: 'SCAN ME' }  // Right
```

#### Left & Right Canopy (Social Media Layout)
```javascript
// Same coordinates as Front/Back for main elements
// Social Media Logos (instead of QR codes)
// Instagram Logo
{ x: 40, y: 850, width: 120, height: 120, fill: '#E4405F' }
// Facebook Logo
{ x: 1000, y: 850, width: 120, height: 120, fill: '#1877F2' }
// Social Media Labels
{ x: 180, y: 900, text: 'INSTAGRAM' }   // Left
{ x: 910, y: 900, text: 'FACEBOOK' }   // Right
```

### Sidewall Surfaces (Left & Right - Identical)

```javascript
// Company Name
{
  x: 100, y: 90, fontSize: 18,
  text: 'BUYPRINTZ', align: 'center'
}

// Main Text
{
  x: 50, y: 300, fontSize: 24, width: 500,
  text: 'DESIGN\nFAST DELIVERY & QUALITY\nBRANDING, MARKETING & PRINTING'
}

// Contact Information
{
  x: 835, y: 385, fontSize: 16,
  text: 'www.buyprintz.com | 617-505-0603'
}

// QR Code
{
  x: 880, y: 50, width: 200, height: 200,
  fill: '#ffffff', stroke: '#1e40af'
}

// QR Label
{
  x: 805, y: 150, fontSize: 12,
  text: 'SCAN ME', align: 'center'
}
```

### Backwall Surface (Hero Layout - Full Height)

**Hero Messaging Strategy:**
The backwall serves as the primary conversion surface with powerful hero messaging designed to grab attention and drive action.

```javascript
// Logo Background (Large)
{
  x: 50, y: 50, width: 300, height: 150,
  fill: '#ffffff', cornerRadius: 12
}

// Company Name
{
  x: 200, y: 120, fontSize: 28,
  text: 'BUYPRINTZ', align: 'center'
}

// Hero Title
{
  x: 400, y: 150, fontSize: 52, width: 500,
  text: 'YOUR BRAND\nDESERVES\nEXCELLENCE'
}

// Hero Slogan
{
  x: 400, y: 350, fontSize: 24, width: 500,
  text: 'FAST 2-3 DAY DELIVERY\nPROFESSIONAL QUALITY\nCUSTOM PRINTING SOLUTIONS'
}

// Call to Action
{
  x: 400, y: 500, fontSize: 20, width: 400,
  text: 'GET YOUR QUOTE TODAY!\nwww.buyprintz.com\n617-505-0603\norder@buyprintz.com'
}

// QR Code (Large)
{
  x: 900, y: 150, width: 150, height: 150,
  fill: '#ffffff', stroke: '#1e40af'
}

// QR Label
{
  x: 975, y: 320, fontSize: 14,
  text: 'SCAN FOR\nQUOTE', align: 'center'
}
```

## Smart Text Rendering Rules

### Single-Line Text Elements
```javascript
{
  width: 'auto',      // Auto-expand to content
  height: 'auto',     // Auto-expand to content
  wrap: 'none'        // No text wrapping
}
```

### Multi-Line Text Elements
```javascript
{
  width: [fixed],     // Fixed width (e.g., 500, 400, 250)
  height: 'auto',    // Auto-expand to content
  wrap: 'word'       // Allow word wrapping
}
```

## Color Palette

### Primary Colors
- **Background Blue**: `#1e40af` (Primary brand color)
- **White**: `#ffffff` (Text and logo backgrounds)
- **Text White**: `#ffffff` (Main text color)

### Social Media Colors
- **Instagram**: `#E4405F`
- **Facebook**: `#1877F2`

## Typography Guidelines

### Font Hierarchy
- **Hero Titles**: 52px, Arial Bold (Backwall only)
- **Main Headlines**: 36-48px, Arial Bold
- **Hero Slogans**: 24px, Arial Bold (Backwall only)
- **Company Names**: 18-28px, Arial Bold
- **Call to Action**: 20px, Arial Bold (Backwall only)
- **Body Text**: 16-20px, Arial Regular
- **Contact Info**: 16-18px, Arial Regular
- **Labels**: 12-14px, Arial Regular

### Line Heights
- **Headlines**: 1.2
- **Body Text**: 1.3-1.4
- **Contact Info**: 1.4

## Layout Principles

### Spacing Guidelines
- **Logo to Headline**: ~100px vertical spacing
- **Headline to Description**: ~200px vertical spacing
- **Description to Contact**: ~150px vertical spacing
- **Side Margins**: 50px minimum
- **QR Code Spacing**: 20px from edges

### Hero Messaging Strategy (Backwall)
- **Hero Title**: Large, bold, customer-focused messaging
- **Hero Slogan**: Key value propositions in bold statements
- **Call to Action**: Direct, urgent, actionable language
- **QR Code**: Direct connection to the CTA ("SCAN FOR QUOTE")
- **Visual Hierarchy**: Title → Slogan → CTA → QR Code

### Alignment Rules
- **Company Names**: Center-aligned
- **Headlines**: Left-aligned
- **Contact Info**: Left-aligned
- **QR Labels**: Center-aligned

## Template Creation Guidelines

### 1. Start with Master Coordinates
Use the provided coordinates as your starting point for new templates.

### 2. Maintain Visual Hierarchy
- Logo/Company name at top
- Main headline prominently displayed
- Supporting text below
- Contact information at bottom
- QR codes/social media in corners

### 3. Apply Smart Text Rendering
Always use the smart text rendering rules for proper text display.

### 4. Consistent Branding
- Use BuyPrintz contact information
- Maintain color consistency
- Follow typography guidelines

### 5. Surface-Specific Considerations
- **Canopies**: Focus on triangular layout optimization
- **Sidewalls**: Utilize horizontal space effectively
- **Backwall**: Take advantage of full height for comprehensive messaging

## Quality Checklist

- [ ] All text elements use smart rendering
- [ ] Coordinates follow master template system
- [ ] BuyPrintz branding is consistent
- [ ] Text is readable and properly sized
- [ ] QR codes/social media are properly positioned
- [ ] Color palette is consistent
- [ ] Typography hierarchy is clear
- [ ] Spacing follows guidelines

## Future Template Development

This master coordinate system enables rapid development of new tent templates by providing:
- Consistent starting points
- Proven layout patterns
- Standardized spacing
- Brand consistency
- Smart text handling

Use this documentation as the foundation for creating event/promotional, trade show, outdoor/weather, and minimalist/modern tent templates.
