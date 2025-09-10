# B2Sign Discovery Summary

## Overview
B2Sign (b2sign.com) is a print partner that uses a modern React/Inertia.js web application. The site requires authentication to access quote functionality.

## Key Findings

### 1. Site Structure
- **Base URL**: https://b2sign.com
- **Technology**: React/Inertia.js application
- **Authentication Required**: Yes, for quote functionality

### 2. Login Process
- **Login URL**: https://b2sign.com (homepage)
- **Login Form**: Present on homepage
- **Form Fields**:
  - Email field (placeholder: "Email" or "Email Address")
  - Password field (placeholder: "Password")
- **Form Method**: POST
- **Form Action**: https://b2sign.com

### 3. Quote Functionality
- **Quote URL**: https://b2sign.com/estimate
- **Access**: Requires authentication
- **Status**: Login form appears on estimate page (redirects to login if not authenticated)

### 4. Discovered URLs
The site mapper discovered 49 URLs including:
- Product pages: `/13oz-vinyl-banner`, `/fabric-banner-9oz-wrinkle-free`, `/mesh-banners`
- Category pages: `/banners`, `/trade-show-products`, `/real-estate`
- Account pages: `/user/login`, `/user/register`, `/user/forgot`
- Information pages: `/about-us`, `/contact-us`, `/help-center`

### 5. Forms Found
- **6 forms total** across the site
- **1 login form** identified on homepage
- **0 quote forms** found (requires authentication to access)

## Integration Challenges

### 1. JavaScript Rendering
- B2Sign uses React/Inertia.js, making it challenging for traditional web scraping
- Content is dynamically loaded
- Requires Selenium or similar browser automation

### 2. Authentication Flow
- Login form is on homepage
- Quote functionality is behind authentication
- Need to maintain session state

### 3. Form Field Detection
- Form fields have dynamic IDs (e.g., `:Rb969:`, `:Rj969:`)
- Need to rely on placeholders and field types for identification

## Recommended Integration Approach

### 1. Use Selenium
- Required for JavaScript-rendered content
- Can handle authentication flow
- Can interact with dynamic forms

### 2. Authentication Strategy
1. Navigate to https://b2sign.com
2. Wait for React to load
3. Find email field by placeholder
4. Find password field by type
5. Submit form
6. Verify authentication success

### 3. Quote Process
1. After authentication, navigate to quote pages
2. Look for product specification forms
3. Fill out quote form with product details
4. Submit and extract pricing

### 4. Field Mapping
Based on discovered structure, map:
- `width` → width field
- `height` → height field  
- `quantity` → quantity field
- `material` → material selection
- `zip_code` → shipping zip code

## Configuration Updates

The shipping service has been updated with:
```python
'b2sign': {
    'name': 'B2Sign',
    'base_url': 'https://b2sign.com',
    'login_url': 'https://b2sign.com',  # Login form is on homepage
    'quote_url': 'https://b2sign.com/estimate',  # Quote functionality requires login
    'credentials': {
        'username': 'order@buyprintz.com',
        'password': '$AG@BuyPr!n1z'
    },
    'site_map_file': 'site_maps/b2sign_map.json',
    'notes': 'B2Sign uses React/Inertia.js. Login form is on homepage. Quote functionality requires authentication.'
}
```

## Next Steps

1. **Test Authentication**: Use Selenium to test login process
2. **Map Quote Forms**: After authentication, discover actual quote form structure
3. **Implement Scraping**: Create Selenium-based scraper for quote generation
4. **Handle Dynamic Content**: Account for React rendering delays
5. **Error Handling**: Implement robust error handling for authentication failures

## Files Created

- `b2sign_site_mapper.py` - Initial site discovery
- `b2sign_estimate_analyzer.py` - Estimate page analysis
- `b2sign_authenticated_analyzer.py` - Authenticated page analysis
- `b2sign_selenium_mapper.py` - Selenium-based mapping
- `b2sign_discovery_results.json` - Detailed discovery results
- `b2sign_discovery_summary.txt` - Human-readable summary

## Conclusion

B2Sign presents a more complex integration challenge due to its modern web application architecture. However, with Selenium and proper authentication handling, it should be possible to automate the quote process. The key is to:

1. Handle the React/Inertia.js rendering
2. Maintain authentication state
3. Navigate the authenticated quote process
4. Extract pricing information from the results

The shipping integration system is already configured to handle this type of modern web application through the Selenium-based scraper.
