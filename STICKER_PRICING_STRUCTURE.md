# Sticker Pricing Structure Documentation

## Overview
This document outlines the complete pricing structure for custom stickers at BuyPrintz, including base pricing, quantity tiers, size modifiers, and shape-specific premiums for all 8 sticker shapes.

## Base Pricing (1x1 Circle Stickers)

### Quantity Tiers
| Quantity | Price per Unit | Total Price |
|----------|----------------|-------------|
| 50       | $1.02          | $51.00      |
| 100      | $0.80          | $80.00      |
| 200      | $0.70          | $140.00     |
| 300      | $0.60          | $180.00     |
| 400      | $0.52          | $208.00     |
| 500      | $0.40          | $200.00     |
| 1,000    | $0.25          | $250.00     |
| 2,000    | $0.22          | $440.00     |
| 3,000    | $0.19          | $570.00     |
| 5,000    | $0.17          | $850.00    |
| 10,000   | $0.15          | $1,500.00   |

## Shape-Specific Pricing

### Shape Premiums (Applied per unit)
- **Circle**: No premium (base shape)
- **Square**: No premium (simple shape)
- **Rectangle**: No premium (simple shape)
- **Oval**: +2% premium (more complex than circle)
- **Triangle**: No premium (simple geometric shape)
- **Diamond**: +3% premium (complex cutting)
- **Star**: +5% premium (most complex standard shape)
- **Custom**: **Special pricing model** (see Custom Gang Sheet Pricing below)

## Size Modifiers

### 50 Count Tier (Base Modifiers)
- **2x2**: +15% increase
- **3x3**: +32% increase  
- **4x4**: +50% increase
- **5x5**: +85% increase
- **6x6**: +120% increase

### 100+ Count Tier (Higher Modifiers)
- **2x2**: +22% increase
- **3x3**: +40% increase
- **4x4**: +90% increase
- **5x5**: +132% increase
- **6x6**: +180% increase

## Pricing Examples

### Example 1: 100 Count, 2x2 Circle Stickers
- Base price (100 count, 1x1): $0.80 per unit
- Shape premium (Circle): +0% = $0.80 per unit
- Size modifier (2x2): +22% = $0.80 × 1.22 = $0.976 per unit
- Total: 100 × $0.976 = $97.60

### Example 2: 500 Count, 3x3 Star Stickers
- Base price (500 count, 1x1): $0.40 per unit
- Shape premium (Star): +5% = $0.40 × 1.05 = $0.42 per unit
- Size modifier (3x3): +40% = $0.42 × 1.40 = $0.588 per unit
- Total: 500 × $0.588 = $294.00

## Custom Gang Sheet Pricing

### Special Pricing Model
Custom gang sheets are **NOT** sold by individual sticker count or size. Instead, they are sold by the sheet:

- **Sheet Size**: 20" × 20"
- **Printable Area**: 17" × 17" (with 1.5" margins all around)
- **Base Price**: $19.99 per sheet
- **Quantity Independent**: Price is the same whether you fit 1 sticker or 100 stickers on the sheet

### Custom Gang Sheet Examples
- **1 Gang Sheet, Vinyl, Matte**: $19.99 per sheet
- **1 Gang Sheet, Vinyl, Glossy**: $20.99 per sheet (+5% finish premium)
- **1 Gang Sheet, Clear Vinyl, Matte**: $22.99 per sheet (+15% material premium)
- **1 Gang Sheet, Clear Vinyl, Glossy**: $24.00 per sheet (+15% material + 5% finish)

### Example 4: 200 Count, 2x2 Diamond Stickers
- Base price (200 count, 1x1): $0.70 per unit
- Shape premium (Diamond): +3% = $0.70 × 1.03 = $0.721 per unit
- Size modifier (2x2): +22% = $0.721 × 1.22 = $0.880 per unit
- Total: 200 × $0.880 = $176.00

## Database Structure

### Tables Updated
1. **sticker_quantity_tiers**: Updated with new pricing
2. **sticker_sizes**: Updated with size modifiers
3. **sticker_pricing_functions**: Updated calculation logic

### Key Functions
- `calculate_sticker_price()`: Main pricing calculation
- `get_quantity_tier_price()`: Base price lookup
- `get_size_modifier()`: Size modifier calculation

## API Integration

### Frontend Integration
The `StickerCheckout.jsx` component now:
- Fetches pricing from `/api/stickers/pricing` endpoint
- Displays real-time pricing based on selections
- Updates automatically when quantity, size, or other options change

### Backend Endpoints
- `GET /api/stickers/quantity-tiers`: Fetch quantity tiers
- `GET /api/stickers/sizes`: Fetch available sizes
- `POST /api/stickers/pricing`: Calculate total price

## Testing

### Automated Testing
Run the test script to verify pricing calculations:
```bash
python test_sticker_pricing.py
```

### Manual Testing
1. Navigate to sticker editor
2. Select different quantities and sizes
3. Verify pricing updates correctly
4. Check that size modifiers are applied properly

## Implementation Status

### ✅ Completed
- [x] Database schema updates
- [x] Pricing function updates
- [x] API endpoint integration
- [x] Frontend pricing integration
- [x] Test script creation

### 🔄 In Progress
- [ ] Google Merchant Center API integration
- [ ] Automated product feed generation
- [ ] Real-time inventory synchronization

### 📋 Pending
- [ ] Production testing
- [ ] Performance optimization
- [ ] Error handling improvements

## Notes

### Pricing Logic
- Base pricing is calculated from quantity tiers
- Size modifiers are applied as percentage increases
- Different modifier rates for different quantity tiers
- All calculations are done server-side for security

### Performance Considerations
- Pricing calculations are cached for performance
- Database queries are optimized for speed
- Frontend updates are debounced to prevent excessive API calls

### Future Enhancements
- Dynamic pricing based on material costs
- Seasonal pricing adjustments
- Bulk discount tiers for enterprise customers
- Real-time market pricing integration
