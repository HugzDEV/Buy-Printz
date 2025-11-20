# BuyPrintz.com Domain Setup Guide

## 🌐 Domain Configuration Overview

**Frontend (Vercel):**
- `buyprintz.com` → Main website
- `www.buyprintz.com` → Redirect to main

**Backend (Railway):**
- `api.buyprintz.com` → API endpoints

## 1️⃣ Vercel Frontend Domain Setup

### Step 1: Add Domain to Vercel
1. Go to your Vercel dashboard
2. Select your BuyPrintz frontend project
3. Navigate to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `buyprintz.com`
6. Also add: `www.buyprintz.com` (will auto-redirect)

### Step 2: Get DNS Records from Vercel
Vercel will provide you with DNS records. Typically:
- **A Record**: `buyprintz.com` → `76.76.19.61` (example)
- **CNAME**: `www.buyprintz.com` → `cname.vercel-dns.com`

## 2️⃣ Railway Backend Domain Setup

### Step 1: Add Custom Domain to Railway
1. Go to Railway dashboard
2. Select your backend service
3. Navigate to **Settings** → **Public Networking**
4. Click **+ Custom Domain**
5. Enter: `api.buyprintz.com`

### Step 2: Get CNAME Record from Railway
Railway will provide:
- **CNAME**: `api.buyprintz.com` → `your-service.railway.app`

## 3️⃣ DNS Configuration at Domain Registrar

Add these records to your domain registrar's DNS settings:

```
Type    Name                Value                           TTL
A       @                   [Vercel IP]                     3600
CNAME   www                 cname.vercel-dns.com            3600
CNAME   api                 your-service.railway.app        3600
```

## 4️⃣ Update Frontend Configuration

Update your frontend to use the new API domain:

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_API_URL=https://api.buyprintz.com
NEXT_PUBLIC_SITE_URL=https://buyprintz.com
```

### Auth Service Update
```javascript
// In frontend/src/services/auth.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.buyprintz.com'
```

## 5️⃣ Backend CORS Configuration

Update your backend to allow the new domain:

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://buyprintz.com",
        "https://www.buyprintz.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 6️⃣ Verification Steps

### After DNS Propagation (24-48 hours):

1. **Test Frontend:**
   - Visit `https://buyprintz.com`
   - Verify `https://www.buyprintz.com` redirects

2. **Test Backend:**
   - Check `https://api.buyprintz.com/health`
   - Verify API endpoints work

3. **Test Integration:**
   - Ensure frontend can communicate with backend
   - Test user registration/login

## 7️⃣ SSL Certificates

Both Vercel and Railway automatically provide SSL certificates:
- ✅ Vercel: Auto-generates Let's Encrypt certificates
- ✅ Railway: Auto-generates SSL for custom domains

## 8️⃣ Monitoring

### Domain Health Checks:
- `https://buyprintz.com` → Should load landing page
- `https://api.buyprintz.com/docs` → Should show API docs
- Check SSL certificates are valid

## 🚀 Go Live Checklist

- [ ] Domain added to Vercel
- [ ] Domain added to Railway  
- [ ] DNS records configured
- [ ] Environment variables updated
- [ ] CORS settings updated
- [ ] SSL certificates active
- [ ] All functionality tested

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs/domains
- **Railway Docs**: https://docs.railway.com/guides/public-networking
- **DNS Checker**: https://dnschecker.org

---

**Note**: DNS propagation can take 24-48 hours. During this time, some users may still see the old hosting while others see the new domain.
