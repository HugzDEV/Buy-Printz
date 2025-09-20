# UPS API Setup Guide

## Required Environment Variables

Add these environment variables to your Railway deployment:

```bash
# UPS OAuth 2.0 Credentials
UPS_CLIENT_ID=your_ups_client_id_here
UPS_CLIENT_SECRET=your_ups_client_secret_here
UPS_SHIPPER_NUMBER=your_ups_shipper_number_here

# Environment (optional - defaults to CIE for testing)
UPS_BASE_URL=https://cie-api.ups.com/api  # For testing
# UPS_BASE_URL=https://onlinetools.ups.com/api  # For production
```

## UPS Developer Account Setup

1. **Create UPS Developer Account**
   - Go to https://developer.ups.com/
   - Sign up for a developer account
   - Create a new application

2. **Configure Callback URL**
   - Add this callback URL in your UPS app settings:
   - `https://api.buyprintz.com/api/tin-skinz/shipping/ups-callback`

3. **Get API Credentials**
   - Access Key: Your UPS API access key
   - Username: Your UPS API username
   - Password: Your UPS API password
   - Account Number: Your UPS account number

## API Endpoints

### Shipping Rates
```
POST /api/tin-skinz/shipping/get-rates
```

### Webhook Callback
```
POST /api/tin-skinz/shipping/ups-callback
```

### Health Check
```
GET /api/tin-skinz/shipping/health
```

### Test Integration
```
POST /api/tin-skinz/shipping/test
```

## Testing

1. **Test UPS Integration**
   ```bash
   curl -X POST https://api.buyprintz.com/api/tin-skinz/shipping/test
   ```

2. **Test Shipping Rates**
   ```bash
   curl -X POST https://api.buyprintz.com/api/tin-skinz/shipping/get-rates \
     -H "Content-Type: application/json" \
     -d '{
       "selected_designs": [{"design_id": "abstract-1", "quantity": 3}],
       "total_quantity": 3,
       "customer_info": {
         "name": "Test Customer",
         "address": "123 Test St",
         "city": "Boston",
         "state": "MA",
         "zipCode": "02101"
       }
     }'
   ```

## Webhook Events

The UPS callback endpoint handles these webhook types:
- `shipping.rate.updated` - Rate changes
- `shipping.tracking.updated` - Tracking updates

## Security

- All API calls require proper UPS authentication
- Webhook callbacks are logged for monitoring
- Rate limiting is applied to prevent abuse
- Error handling for failed UPS API calls
