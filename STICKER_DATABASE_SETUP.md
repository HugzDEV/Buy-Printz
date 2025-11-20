# 🎯 Sticker Database Setup Guide

This guide sets up the complete sticker database structure with pricing logic for the BuyPrintz platform.

## 📋 Overview

The sticker database includes:
- **Product Catalog**: Standard shapes and custom gang sheets
- **Material Options**: Vinyl, paper, clear vinyl, premium vinyl
- **Finish Options**: Matte, glossy, satin with properties
- **Shape Options**: 8 shapes with orientation support
- **Size Options**: 6 standard sizes + custom gang sheet
- **Quantity Tiers**: 5 pricing tiers (50-1000 stickers)
- **Pricing Logic**: Comprehensive pricing calculation functions
- **Order Management**: Complete sticker order tracking

## 🚀 Quick Setup

### 1. Run Database Setup
```bash
python setup_sticker_database.py
```

### 2. Manual Setup (Alternative)
If the automated script fails, run the SQL manually in Supabase:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase_stickers_table.sql`
3. Execute the SQL statements

## 📊 Database Structure

### Core Tables

#### `sticker_products`
- Master product catalog
- Standard shapes vs custom gang sheets
- Base pricing information

#### `sticker_materials`
- Available materials (vinyl, paper, clear vinyl, premium vinyl)
- Price modifiers per unit
- Durability and indoor/outdoor specifications

#### `sticker_finishes`
- Finish options (matte, glossy, satin)
- Price modifiers per unit
- Properties (waterproof, UV resistant, removable)

#### `sticker_shapes`
- 8 shape options (circle, square, rectangle, oval, triangle, diamond, star, custom)
- Price modifiers per unit
- Orientation support for rectangle/oval

#### `sticker_sizes`
- 6 standard sizes (1" to 6") + custom gang sheet
- Base size in inches
- Price modifiers per unit

#### `sticker_quantity_tiers`
- 5 quantity tiers (50, 100, 250, 500, 1000 stickers)
- Base pricing and per-unit pricing

#### `sticker_orders`
- Complete order tracking
- All specifications and pricing
- Design data and marketplace templates

### Pricing Functions

#### `calculate_sticker_price()`
Comprehensive pricing calculation with:
- Base quantity tier pricing
- Material surcharges
- Finish surcharges
- Shape surcharges
- Size surcharges
- Tax calculation (6.25% MA)

#### `get_sticker_product_details()`
Returns complete product catalog with all options

## 🔧 API Integration

### Backend API Endpoints

The sticker pricing API provides these endpoints:

```
GET  /api/stickers/products          # Get all products
POST /api/stickers/pricing           # Calculate pricing
POST /api/stickers/orders            # Create sticker order
GET  /api/stickers/orders/{id}       # Get order details
PUT  /api/stickers/orders/{id}/status # Update order status
GET  /api/stickers/materials         # Get materials
GET  /api/stickers/finishes          # Get finishes
GET  /api/stickers/shapes            # Get shapes
GET  /api/stickers/sizes             # Get sizes
GET  /api/stickers/quantity-tiers    # Get quantity tiers
```

### Frontend Integration

The `StickerCheckout.jsx` component now:
- Loads configuration from database
- Uses API pricing calculations
- Handles real-time pricing updates
- Supports all sticker specifications

## 💰 Pricing Logic

### Base Pricing Structure
```
Base Price = Quantity Tier Base Price
+ (Material Modifier × Quantity)
+ (Finish Modifier × Quantity)
+ (Shape Modifier × Quantity)
+ (Size Modifier × Quantity)
```

### Tax Calculation
- Massachusetts tax rate: 6.25%
- Applied to subtotal before shipping

### Example Pricing
- 100 Circle Stickers, 3", Vinyl, Matte: $49.99
- 100 Rectangle Stickers, 3", Clear Vinyl, Glossy: $64.99
- 100 Custom Shape Stickers, 3", Premium Vinyl, Satin: $77.99

## 🎨 Sticker Specifications

### Standard Shapes
- **Circle**: Perfect circle stickers
- **Square**: Square stickers
- **Rectangle**: Rectangular with orientation options
- **Oval**: Oval with orientation options
- **Triangle**: Triangular stickers
- **Diamond**: Diamond-shaped stickers
- **Star**: Star-shaped stickers

### Custom Gang Sheet
- **Size**: 20" × 20" canvas
- **Printable Area**: 17" × 17" (1.5" margins)
- **Orientation**: Horizontal
- **Use Case**: Large quantity custom shapes

### Materials
- **Roland Premium Vinyl**: 3-5 year outdoor durability
- **Roland Paper**: Indoor use, 1 year durability
- **Roland Clear Vinyl**: Transparent, 3 year durability
- **Orajet Premium Vinyl**: Enhanced durability, 6 year outdoor

### Finishes
- **Matte**: Indoor/outdoor, non-reflective
- **Glossy**: Waterproof, UV resistant, permanent
- **Satin**: Semi-gloss finish

## 🔄 Next Steps

### 1. Google Merchant Center Integration
With the database structure in place, you can now:
- Generate product feeds automatically
- Sync inventory in real-time
- Handle pricing updates dynamically
- Manage product specifications

### 2. Automated Feed Generation
The database structure supports:
- Product catalog export
- Inventory management
- Pricing updates
- Image optimization

### 3. Advanced Features
- Bulk pricing updates
- Seasonal pricing
- Promotional pricing
- Inventory tracking

## 🧪 Testing

### Test Pricing Function
```python
# Test the pricing calculation
result = supabase.rpc('calculate_sticker_price', {
    'p_quantity': 100,
    'p_material_code': 'vinyl',
    'p_finish_code': 'matte',
    'p_shape_code': 'circle',
    'p_size_code': '3'
}).execute()
```

### Test API Endpoints
```bash
# Test pricing endpoint
curl -X POST http://localhost:8000/api/stickers/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 100,
    "material_code": "vinyl",
    "finish_code": "matte",
    "shape_code": "circle",
    "size_code": "3"
  }'
```

## 📝 Notes

- All tables include Row Level Security (RLS)
- Service role has full access for backend operations
- Users can only access their own orders
- Public read access for product catalog
- Comprehensive error handling and validation

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ Complete sticker database structure
- ✅ Pricing logic with tax calculation
- ✅ API endpoints for frontend integration
- ✅ Order management system
- ✅ Ready for Google Merchant Center integration

The sticker system is now ready for production use with full database-backed pricing and order management!
