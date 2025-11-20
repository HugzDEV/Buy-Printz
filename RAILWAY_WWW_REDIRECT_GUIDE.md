# Railway WWW Redirect Setup Guide

## The Problem
You're using Railway hosting, not Netlify, so the `_redirects` file won't work for www redirects. Railway requires a different approach.

## Railway Solutions

### Option 1: DNS-Level Redirect (Recommended)
This is the cleanest solution - handle redirects at the DNS level:

#### A. Cloudflare (If using Cloudflare DNS)
1. Go to Cloudflare Dashboard
2. Select your domain `buyprintz.com`
3. Go to **Rules** → **Redirect Rules**
4. Create a new redirect rule:
   - **Name**: WWW Redirect
   - **When incoming requests match**:
     - Field: `Hostname`
     - Operator: `equals`
     - Value: `buyprintz.com`
   - **Then**:
     - Status: `301 - Permanent Redirect`
     - Destination URL: `https://www.buyprintz.com/$1`
     - Preserve query string: `Yes`

#### B. Other DNS Providers
Most DNS providers offer redirect services:
- **GoDaddy**: Domain redirects
- **Namecheap**: URL redirects
- **Route 53**: Alias records

### Option 2: Railway Middleware (If using custom server)
If you have a custom server on Railway, add this middleware:

#### Express.js Example:
```javascript
// Add to your server.js or main server file
app.use((req, res, next) => {
  if (req.hostname === 'buyprintz.com') {
    return res.redirect(301, `https://www.buyprintz.com${req.url}`);
  }
  next();
});
```

#### FastAPI Example:
```python
# Add to your main.py
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse

@app.middleware("http")
async def redirect_www(request: Request, call_next):
    if request.url.hostname == "buyprintz.com":
        return RedirectResponse(
            url=f"https://www.buyprintz.com{request.url.path}",
            status_code=301
        )
    response = await call_next(request)
    return response
```

### Option 3: Railway Environment Variables
Set up environment variables in Railway:

1. Go to Railway Dashboard
2. Select your project
3. Go to **Variables**
4. Add:
   - `FORCE_WWW=true`
   - `CANONICAL_DOMAIN=www.buyprintz.com`

### Option 4: Frontend Redirect (JavaScript)
Add this to your `index.html` before the closing `</head>` tag:

```html
<script>
// Redirect non-www to www
if (window.location.hostname === 'buyprintz.com') {
  window.location.replace('https://www.buyprintz.com' + window.location.pathname);
}
</script>
```

## Recommended Solution: Cloudflare Redirect Rules

Since you're likely using Cloudflare (most domains do), this is the best approach:

### Step 1: Access Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Select your domain `buyprintz.com`

### Step 2: Create Redirect Rule
1. Go to **Rules** → **Redirect Rules**
2. Click **Create redirect rule**
3. Configure:
   - **Rule name**: `WWW Redirect`
   - **When incoming requests match**:
     - Field: `Hostname`
     - Operator: `equals`
     - Value: `buyprintz.com`
   - **Then**:
     - Status: `301 - Permanent Redirect`
     - Destination URL: `https://www.buyprintz.com/$1`
     - Preserve query string: `Yes`
     - Preserve path: `Yes`

### Step 3: Test the Redirect
1. Visit `https://buyprintz.com`
2. Should redirect to `https://www.buyprintz.com`
3. Test with paths: `https://buyprintz.com/about`
4. Should redirect to `https://www.buyprintz.com/about`

## Alternative: Railway Custom Domain Setup

### Step 1: Railway Domain Configuration
1. Go to Railway Dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Add both domains:
   - `buyprintz.com`
   - `www.buyprintz.com`

### Step 2: Configure Primary Domain
Set `www.buyprintz.com` as your primary domain in Railway.

### Step 3: DNS Configuration
Point both domains to Railway:
- `buyprintz.com` → Railway IP
- `www.buyprintz.com` → Railway IP

## Testing Your Setup

### Test Commands:
```bash
# Test HTTP redirect
curl -I http://buyprintz.com

# Test HTTPS redirect
curl -I https://buyprintz.com

# Should return: 301 Moved Permanently
# Location: https://www.buyprintz.com/
```

### Browser Test:
1. Visit `https://buyprintz.com`
2. Should automatically redirect to `https://www.buyprintz.com`
3. URL should change in address bar
4. Test with different paths

## Expected Results

After implementing this:
- ✅ `https://buyprintz.com` redirects to `https://www.buyprintz.com`
- ✅ All SEO authority consolidates to `www.buyprintz.com`
- ✅ Complete search listings in Google
- ✅ No duplicate content issues
- ✅ Better search rankings

## Timeline

- **Immediate**: Redirects work
- **24-48 hours**: Google recognizes redirects
- **1-2 weeks**: SEO authority consolidation
- **1 month**: Complete search result consolidation

## Troubleshooting

If redirects don't work:

1. **Check DNS**: Ensure both domains point to same server
2. **Check Cloudflare**: Verify redirect rules are active
3. **Clear cache**: Browser and CDN cache
4. **Test with curl**: Use command line to test redirects
5. **Check Railway**: Verify domain configuration

## Next Steps

1. **Choose your preferred method** (Cloudflare redirect rules recommended)
2. **Implement the redirect**
3. **Test thoroughly**
4. **Monitor Google Search Console**
5. **Wait for SEO consolidation**
