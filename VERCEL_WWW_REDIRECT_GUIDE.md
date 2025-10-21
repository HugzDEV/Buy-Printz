# Vercel WWW Redirect Setup Guide

## Your Setup
- **Frontend**: Vercel (excellent redirect support)
- **Backend**: Railway
- **Issue**: `https://buyprintz.com` shows incomplete listings vs `https://www.buyprintz.com`

## Vercel Solutions

### Option 1: _redirects File (Recommended) ✅ DONE
I've updated your `_redirects` file with Vercel-compatible redirects:

```
# Vercel redirects - Force www subdomain for SEO consistency
https://buyprintz.com/*  https://www.buyprintz.com/:splat  301
http://buyprintz.com/*   https://www.buyprintz.com/:splat  301

# Vercel SPA fallback
/*    /index.html   200
```

### Option 2: vercel.json Configuration
Create a `vercel.json` file in your frontend root:

```json
{
  "redirects": [
    {
      "source": "https://buyprintz.com/:path*",
      "destination": "https://www.buyprintz.com/:path*",
      "permanent": true
    },
    {
      "source": "http://buyprintz.com/:path*",
      "destination": "https://www.buyprintz.com/:path*",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option 3: Vercel Dashboard Redirects
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Redirects and Rewrites**
4. Add redirect:
   - **Source**: `https://buyprintz.com/:path*`
   - **Destination**: `https://www.buyprintz.com/:path*`
   - **Status Code**: `301`

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
2. Should redirect to `https://www.buyprintz.com`
3. Test with paths: `https://buyprintz.com/about`
4. Should redirect to `https://www.buyprintz.com/about`

## Vercel-Specific Features

### Automatic HTTPS
Vercel automatically handles HTTPS redirects, so you don't need to worry about HTTP → HTTPS.

### Edge Functions
If you need more complex redirect logic, you can use Vercel Edge Functions:

```javascript
// api/redirect.js
export default function handler(req, res) {
  if (req.headers.host === 'buyprintz.com') {
    res.redirect(301, `https://www.buyprintz.com${req.url}`);
  }
}
```

## Domain Configuration in Vercel

### Step 1: Add Both Domains
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Add both domains:
   - `buyprintz.com`
   - `www.buyprintz.com`

### Step 2: Set Primary Domain
Set `www.buyprintz.com` as your primary domain in Vercel.

### Step 3: DNS Configuration
Point both domains to Vercel:
- `buyprintz.com` → Vercel IP
- `www.buyprintz.com` → Vercel IP

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

1. **Check Vercel deployment**: Ensure latest code is deployed
2. **Check DNS**: Ensure both domains point to Vercel
3. **Clear cache**: Browser and CDN cache
4. **Test with curl**: Use command line to test redirects
5. **Check Vercel logs**: Look for redirect errors

## Vercel Advantages

- ✅ **Built-in redirect support** - No server configuration needed
- ✅ **Edge network** - Fast redirects worldwide
- ✅ **Automatic HTTPS** - No SSL configuration needed
- ✅ **Easy deployment** - Just push to git
- ✅ **Analytics** - Track redirect performance

## Next Steps

1. **Deploy your changes** to Vercel
2. **Test the redirects** thoroughly
3. **Monitor Google Search Console**
4. **Wait for SEO consolidation**

The `_redirects` file I've created should work perfectly with Vercel! 🚀
