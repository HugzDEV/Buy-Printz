# WWW Redirect Setup Guide - Fix Duplicate Content Issues

## The Problem
You have two versions of your site:
- `https://buyprintz.com` (incomplete listings)
- `https://www.buyprintz.com` (complete listings)

Google treats these as separate websites, causing:
- ❌ Duplicate content issues
- ❌ Split SEO authority
- ❌ Incomplete search listings
- ❌ Confused search results

## The Solution

### Step 1: Implement 301 Redirects ✅ DONE
I've added redirects to your `_redirects` file:
```
https://buyprintz.com/*  https://www.buyprintz.com/:splat  301!
http://buyprintz.com/*   https://www.buyprintz.com/:splat  301!
```

### Step 2: Verify Canonical URLs ✅ DONE
Your canonical URL is correctly set to:
```html
<link rel="canonical" href="https://www.buyprintz.com/" />
```

### Step 3: Additional Steps You Need to Take

#### A. DNS Configuration
Ensure your DNS is set up correctly:

**For Cloudflare (if using):**
1. Go to Cloudflare Dashboard
2. DNS → Records
3. Add CNAME record: `www` → `buyprintz.com`
4. Add A record: `@` → `your-server-ip`

**For other DNS providers:**
1. Add CNAME record: `www` → `buyprintz.com`
2. Ensure both domains point to same server

#### B. Server Configuration (if using custom server)
Add these redirects to your server config:

**Apache (.htaccess):**
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^buyprintz\.com$ [NC]
RewriteRule ^(.*)$ https://www.buyprintz.com/$1 [R=301,L]
```

**Nginx:**
```nginx
server {
    server_name buyprintz.com;
    return 301 https://www.buyprintz.com$request_uri;
}
```

#### C. Google Search Console Setup
1. **Add both properties:**
   - `https://buyprintz.com`
   - `https://www.buyprintz.com`

2. **Set preferred domain:**
   - Go to Settings → Site Settings
   - Set preferred domain to `www.buyprintz.com`

3. **Submit sitemap:**
   - Submit sitemap for `www.buyprintz.com`
   - Don't submit sitemap for `buyprintz.com`

#### D. Update All Internal Links
Ensure all internal links use `www.buyprintz.com`:
- Navigation menus
- Footer links
- Social media profiles
- Email signatures
- Business cards

### Step 4: Test Your Redirects

#### Test Commands:
```bash
# Test HTTP redirect
curl -I http://buyprintz.com

# Test HTTPS redirect  
curl -I https://buyprintz.com

# Should return: 301 Moved Permanently
# Location: https://www.buyprintz.com/
```

#### Browser Test:
1. Visit `https://buyprintz.com`
2. Should automatically redirect to `https://www.buyprintz.com`
3. URL should change in address bar

### Step 5: Monitor Results

#### Google Search Console:
1. Check for crawl errors
2. Monitor indexing status
3. Verify redirects are working

#### Timeline:
- **Immediate**: Redirects work
- **24-48 hours**: Google starts recognizing redirects
- **1-2 weeks**: Complete consolidation of SEO authority
- **1 month**: Full consolidation of search results

### Step 6: Additional SEO Improvements

#### Update Structured Data:
Ensure all structured data uses `www.buyprintz.com`:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "url": "https://www.buyprintz.com",
  "sameAs": [
    "https://www.buyprintz.com"
  ]
}
```

#### Update Social Media:
- Facebook: Use `www.buyprintz.com`
- Twitter: Use `www.buyprintz.com`
- Instagram: Use `www.buyprintz.com`
- LinkedIn: Use `www.buyprintz.com`

### Step 7: Verify Success

#### Check These URLs:
1. `https://buyprintz.com` → Should redirect to `https://www.buyprintz.com`
2. `https://buyprintz.com/about` → Should redirect to `https://www.buyprintz.com/about`
3. `https://buyprintz.com/products` → Should redirect to `https://www.buyprintz.com/products`

#### Google Search Test:
1. Search for "site:buyprintz.com"
2. Should show redirects or no results
3. Search for "site:www.buyprintz.com"
4. Should show complete listings

## Expected Results

After implementing this:
- ✅ `https://buyprintz.com` redirects to `https://www.buyprintz.com`
- ✅ All SEO authority consolidates to `www.buyprintz.com`
- ✅ Complete search listings in Google
- ✅ No duplicate content issues
- ✅ Better search rankings
- ✅ Consistent brand presence

## Troubleshooting

If redirects don't work:

1. **Check DNS**: Ensure both domains point to same server
2. **Check server config**: Verify redirect rules are active
3. **Clear cache**: Browser and CDN cache
4. **Test with curl**: Use command line to test redirects
5. **Check hosting provider**: Some providers have specific redirect settings

## Timeline

- **Immediate**: Redirects work
- **24-48 hours**: Google recognizes redirects
- **1-2 weeks**: SEO authority consolidation
- **1 month**: Complete search result consolidation
