# Shipping Integration Deployment Guide

## How the Live Deployment Works

### **B2Sign Integration** (REQUIRED for Production)
- **Status**: 🔄 Ready for deployment with Docker
- **Features**: Real-time shipping costs from B2Sign.com
- **Requirements**: Chrome + ChromeDriver in Railway environment
- **Critical**: NO FALLBACK SYSTEM - Real shipping costs only

## Deployment Requirements

### **ONLY Option: B2Sign Integration**
```bash
# Deploy with Docker (includes Chrome)
# Railway will use the full shipping cost extractor
# Users get real B2Sign shipping quotes
# NO FALLBACK - Real costs only to prevent financial losses
```

## Railway Environment Variables Needed

```bash
# Required for B2Sign integration
B2SIGN_USERNAME=order@buyprintz.com
B2SIGN_PASSWORD=$AG@BuyPr!n1z

# Chrome configuration (set automatically by Dockerfile)
CHROME_BINARY_PATH=/usr/bin/google-chrome
CHROMEDRIVER_PATH=/usr/local/bin/chromedriver
CHROME_HEADLESS=true
CHROME_NO_SANDBOX=true
CHROME_DISABLE_DEV_SHM=true
```

## How It Works in Production

### Frontend (Vercel)
1. User enters shipping info in checkout
2. Frontend calls `https://api.buyprintz.com/api/shipping-costs/get`
3. Displays real B2Sign shipping options to user

### Backend (Railway)
1. Receives shipping request with product specs
2. **B2Sign Integration**: 
   - Logs into B2Sign.com
   - Fills out product form with user specs
   - Extracts real shipping costs
   - Returns accurate shipping quotes
3. **NO FALLBACK** - System fails if B2Sign is unavailable (prevents financial losses)

### Database (Supabase)
- Base product pricing (with BuyPrintz margins)
- Order management
- User authentication

## Testing the Integration

### Test B2Sign Integration
```bash
curl -X POST https://api.buyprintz.com/api/shipping-costs/get \
  -H "Content-Type: application/json" \
  -d '{
    "product_type": "banner",
    "material": "13oz Vinyl",
    "dimensions": {"width": 2, "height": 4},
    "quantity": 1,
    "zip_code": "90210",
    "print_options": {"sides": "single", "grommets": true}
  }'
```

## Next Steps

1. **Deploy Docker version**: Railway with Chrome/ChromeDriver for B2Sign integration
2. **Test B2Sign integration**: Verify real shipping costs are extracted
3. **Monitor system**: Ensure B2Sign scraping remains stable
4. **Optimize**: Improve shipping cost extraction speed and reliability

## Benefits

- **Accurate**: Real B2Sign shipping costs prevent financial losses
- **Profitable**: Only charge customers actual shipping costs
- **Reliable**: System fails safely if B2Sign is unavailable (no false quotes)
- **Scalable**: Can handle multiple product types and shipping destinations
