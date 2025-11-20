# BuyPrintz Deployment Guide

## Frontend Deployment (Vercel)

### Single Page Application Routing Fix

The `vercel.json` file handles client-side routing by rewriting all routes to `index.html`. This fixes the 404 errors when refreshing pages or accessing direct URLs.

### Key Configuration Files:

1. **`frontend/vercel.json`** - Main Vercel configuration
   - Rewrites all routes to `/index.html` for SPA routing
   - Security headers (XSS, CSRF protection)
   - Cache headers for static assets
   - Node.js runtime configuration for API routes

2. **`frontend/public/_redirects`** - Fallback for other static hosts
   - Netlify-style redirect configuration
   - Backup routing solution

3. **`frontend/vite.config.js`** - Build configuration
   - Correct base path for routing
   - Code splitting for better performance
   - Development server configuration

### Common 404 Issues:

- **Problem**: Refreshing `/login`, `/register`, `/dashboard` returns 404
- **Cause**: Server looking for physical files at those paths
- **Solution**: `vercel.json` rewrites configure SPA routing

### Environment Variables on Vercel:

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=https://api.buyprintz.com
VITE_SITE_URL=https://buyprintz.com
```

## Backend Deployment (Railway)

### Domain Configuration:

1. **Railway Dashboard**: Add custom domain `api.buyprintz.com`
2. **DNS Settings**: CNAME record pointing to Railway URL
3. **SSL**: Automatically provisioned by Railway

### Environment Variables on Railway:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
CORS_ORIGINS=https://buyprintz.com,https://www.buyprintz.com
```

## DNS Configuration

### Current Setup:
- **Frontend**: `buyprintz.com` → Vercel
- **Backend**: `api.buyprintz.com` → Railway
- **DNS**: Managed by Vercel

### DNS Records:
```
@ ALIAS cname.vercel-dns-017.com
api CNAME ssrmn57r.up.railway.app
```

## Supabase Configuration

### Site URLs:
- Site URL: `https://buyprintz.com`
- Redirect URLs: `https://buyprintz.com/**`

### Email Templates:
- Use custom templates from `SUPABASE_EMAIL_TEMPLATES_COMPLETE.md`
- Configure in Supabase Dashboard → Authentication → Email Templates

## Common Deployment Issues

### 1. 404 on Page Refresh
- **Solution**: Ensure `vercel.json` is deployed with frontend
- **Check**: Vercel deployment logs for configuration

### 2. API CORS Errors
- **Solution**: Update `CORS_ORIGINS` in Railway
- **Check**: Backend logs for CORS configuration

### 3. Authentication Issues
- **Solution**: Verify Supabase URLs in environment variables
- **Check**: Browser console for Supabase connection errors

### 4. Email Confirmation Redirects
- **Solution**: Update Supabase Site URLs to production
- **Check**: Email links point to correct domain

## Deployment Commands

### Frontend (Local Testing):
```bash
cd frontend
npm run build
npm run preview  # Test production build locally
```

### Vercel Deployment:
- Automatic on push to main branch
- Manual: `vercel --prod` from frontend directory

### Railway Deployment:
- Automatic on push to main branch
- Manual: Railway CLI or dashboard

## Performance Optimizations

### Frontend:
- Code splitting in `vite.config.js`
- Asset caching headers in `vercel.json`
- Sourcemaps for debugging

### Backend:
- API response caching
- Database connection pooling
- Asset compression

## Security Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Monitoring

### Frontend:
- Vercel Analytics
- Browser console errors
- Performance metrics

### Backend:
- Railway logs
- API response times
- Database performance

## Troubleshooting

### Check Deployment Status:
1. **Vercel**: Visit dashboard for build logs
2. **Railway**: Check deployment status and logs
3. **DNS**: Use `nslookup` to verify records
4. **SSL**: Check certificate status in browser

### Common Fixes:
1. **Clear browser cache** after deployment
2. **Wait for DNS propagation** (up to 24 hours)
3. **Check environment variables** in hosting dashboards
4. **Verify API connectivity** with browser network tab
