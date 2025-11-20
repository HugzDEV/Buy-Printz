# Shipping Integration Setup Guide

This guide explains how to set up the intelligent shipping integration system that uses BeautifulSoup4 and Selenium to get shipping quotes from print partners who don't have APIs.

## Overview

The system consists of three main components:

1. **SiteMapper** - Uses BeautifulSoup4 to analyze and map print partner websites
2. **IntelligentScraper** - Uses Selenium to automate quote generation
3. **ShippingService** - Coordinates the mapping and scraping process

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Railway       │    │  Print Partner  │
│   (Vercel)      │───▶│   Backend       │───▶│   Website       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Caching)     │
                       └─────────────────┘
```

## Setup Instructions

### 1. Environment Variables

Add these environment variables to your Railway backend:

```bash
# B2Sign Print Partner Credentials
B2SIGN_USERNAME=order@buyprintz.com
B2SIGN_PASSWORD=$AG@BuyPr!n1z

# Redis Configuration (Optional - for caching)
REDIS_URL=redis://localhost:6379

# Chrome Configuration for Railway
CHROME_BINARY_PATH=/usr/bin/google-chrome
CHROMEDRIVER_PATH=/usr/bin/chromedriver
CHROME_HEADLESS=true
CHROME_NO_SANDBOX=true
CHROME_DISABLE_DEV_SHM=true
```

### 2. Railway Chrome Setup

Railway provides Chrome and ChromeDriver in their deployment environment. The system automatically detects and uses them.

### 3. Print Partner Configuration

The system is already configured for B2Sign. The configuration in `backend/shipping_service.py` includes:

```python
self.print_partners = {
    'b2sign': {
        'name': 'B2Sign',
        'base_url': 'https://b2sign.com',
        'login_url': 'https://b2sign.com/login',
        'quote_url': 'https://b2sign.com/quote',
        'credentials': {
            'username': os.getenv('B2SIGN_USERNAME', 'order@buyprintz.com'),
            'password': os.getenv('B2SIGN_PASSWORD', '$AG@BuyPr!n1z')
        },
        'site_map_file': f"{self.site_maps_dir}/b2sign_map.json"
    }
}
```

## API Endpoints

### Get Shipping Quote

```http
POST /api/shipping/quote
Content-Type: application/json

{
  "product_details": {
    "width": 24,
    "height": 36,
    "material": "vinyl",
    "quantity": 1,
    "zip_code": "10001",
    "product_type": "banner"
  },
  "partner_id": "b2sign"
}
```

### Get All Partner Quotes

```http
POST /api/shipping/quote/all
Content-Type: application/json

{
  "product_details": {
    "width": 24,
    "height": 36,
    "material": "vinyl",
    "quantity": 1,
    "zip_code": "10001"
  }
}
```

### Update Site Map

```http
POST /api/shipping/sitemap/update
Content-Type: application/json

{
  "partner_id": "b2sign"
}
```

### Check Partner Status

```http
GET /api/shipping/partners/status
```

## How It Works

### 1. Site Mapping Phase

When you first set up a print partner, the system:

1. **Analyzes the login form** - Identifies username/password fields, CSRF tokens, etc.
2. **Maps the quote form** - Finds all form fields, dropdowns, and result containers
3. **Detects dynamic elements** - Identifies AJAX endpoints and loading indicators
4. **Saves the site map** - Stores the structure for future use

### 2. Quote Generation Phase

When getting a quote:

1. **Loads the site map** - Uses previously mapped structure
2. **Logs into the partner site** - Uses mapped login form
3. **Fills the quote form** - Intelligently maps product details to form fields
4. **Submits and extracts results** - Gets shipping cost from result containers
5. **Caches the result** - Stores quote for future use

### 3. Intelligent Field Mapping

The system automatically maps your product details to form fields:

```python
field_patterns = {
    'width': ['width', 'w', 'dimension_width', 'size_width'],
    'height': ['height', 'h', 'dimension_height', 'size_height'],
    'material': ['material', 'substrate', 'product_type', 'type'],
    'quantity': ['quantity', 'qty', 'amount', 'count'],
    'zip_code': ['zip', 'zipcode', 'postal_code', 'zip_code']
}
```

## Caching Strategy

- **Quote Results**: Cached for 1 hour to avoid repeated scraping
- **Site Maps**: Cached indefinitely, updated when partner sites change
- **Redis Integration**: Optional Redis caching for production scaling

## Error Handling

The system includes comprehensive error handling:

- **Login failures** - Retries with different field mappings
- **Form submission errors** - Fallback submit methods
- **Result extraction failures** - Multiple extraction strategies
- **Network timeouts** - Configurable timeouts and retries

## Monitoring and Maintenance

### Health Checks

```http
GET /api/shipping/health
```

### Partner Status

```http
GET /api/shipping/partners/{partner_id}/status
```

### Site Map Updates

When print partners update their websites, update the site map:

```http
POST /api/shipping/sitemap/update
```

## Security Considerations

1. **Credentials**: Store print partner credentials as environment variables
2. **Rate Limiting**: Implement rate limiting to avoid overwhelming partner sites
3. **User Agent**: Use realistic user agents to avoid detection
4. **Session Management**: Properly manage browser sessions and cleanup

## Troubleshooting

### Common Issues

1. **Chrome Driver Not Found**
   - Ensure Railway has Chrome and ChromeDriver installed
   - Check environment variables for correct paths

2. **Login Failures**
   - Verify credentials are correct
   - Check if partner site has changed login form
   - Update site map if necessary

3. **Quote Form Not Found**
   - Partner site may have changed structure
   - Run site map update to refresh mappings

4. **Result Extraction Fails**
   - Partner site may have changed result display
   - Check site map result selectors
   - Update site map if necessary

### Debug Mode

Enable debug mode by setting:

```bash
LOG_LEVEL=DEBUG
```

This will provide detailed logging of the scraping process.

## Performance Optimization

1. **Headless Mode**: Always run Chrome in headless mode for better performance
2. **Resource Limits**: Disable images and CSS for faster loading
3. **Connection Pooling**: Reuse browser sessions when possible
4. **Caching**: Implement aggressive caching for frequently requested quotes

## Future Enhancements

1. **Multiple Partners**: Support for multiple print partners
2. **Real-time Updates**: WebSocket updates for quote status
3. **Machine Learning**: AI-powered field mapping improvements
4. **API Integration**: Direct API integration when available
5. **Mobile Support**: Mobile-optimized scraping strategies

## Support

For issues or questions about the shipping integration system, please check:

1. **Logs**: Check Railway logs for detailed error information
2. **Health Endpoints**: Use health check endpoints to diagnose issues
3. **Site Map Status**: Verify site maps are up to date
4. **Partner Status**: Check individual partner availability

The system is designed to be robust and self-healing, but may require occasional maintenance when print partners update their websites.
