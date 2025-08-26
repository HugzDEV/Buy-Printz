# 🚀 Railway Environment Variables Setup

## Critical Environment Variables Required for Deployment

### **Step 1: Go to Railway Dashboard**
1. Open [railway.app](https://railway.app)
2. Find your `buy-printz` project
3. Click on your deployment
4. Go to **Variables** tab

### **Step 2: Add These Environment Variables**

```bash
# Supabase Configuration (CRITICAL for database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Authentication
JWT_SECRET=your-jwt-secret-token

# Stripe Payment Processing
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Application Configuration
CORS_ORIGINS=https://www.buyprintz.com,https://buy-printz-frontend.vercel.app
ENVIRONMENT=production
DEBUG=false
```

### **Step 3: Get Your Supabase Credentials**

1. Go to [supabase.com](https://supabase.com)
2. Sign in and find your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### **Step 4: Generate JWT Secret**
```bash
# Run this command to generate a secure JWT secret:
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
```

### **Step 5: Get Stripe Keys**
1. Go to [stripe.com](https://stripe.com) dashboard
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** and **Secret key**

## 🔄 **After Adding Variables**

1. **Save** all environment variables in Railway
2. Railway will automatically **redeploy** your application
3. Check the deployment logs for success
4. Test the `/health` endpoint

## 🧪 **Testing After Setup**

```bash
# Test health endpoint
curl https://your-railway-app.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "supabase_configured": true,
  "stripe_configured": true
}
```

## ⚠️ **Critical Notes**

- **Without these variables**, the app will fail to start
- **Database operations** require Supabase configuration
- **User authentication** requires both Supabase and JWT
- **Payments** require Stripe configuration
- Railway **auto-redeploys** when you add variables

---

**Next Step**: Add these variables to Railway, then check deployment logs! 🚀
