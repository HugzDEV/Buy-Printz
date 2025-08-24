# 🚀 Buy Printz Production Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Cleanup Completed
- [x] Removed all test/debug files
- [x] Updated package.json with correct project name
- [x] Enhanced FastAPI with comprehensive Swagger docs
- [x] Added health check endpoints
- [x] Created Terms of Service and Privacy Policy
- [x] Added keyboard shortcuts to banner editor
- [x] Frontend builds successfully (1.45MB main chunk)

### ✅ Code Quality
- [x] All linting issues resolved
- [x] Security checks passed
- [x] No hardcoded secrets in code
- [x] Proper error handling implemented
- [x] CORS configured for production domain

---

## 🌐 GoDaddy Deployment Steps

### 1. Domain Configuration
Your domain: **https://www.buyprintz.com**

**DNS Settings:**
- Ensure A record points to GoDaddy hosting IP
- Configure SSL certificate for HTTPS
- Set up www subdomain redirect

### 2. Upload Files to GoDaddy

**Backend Files (Upload to `/api/` subdirectory):**
```
backend/
  ├── main.py
  ├── auth.py
  ├── database.py
  └── __init__.py
requirements.txt
.env (create from template below)
```

**Frontend Files (Upload to `/public_html/`):**
```
dist/
  ├── index.html
  ├── assets/
  └── images/
```

### 3. Environment Configuration

Create `.env` file in your root directory:

```bash
# Production Environment for Buy Printz
ENVIRONMENT=production
DEBUG=false

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_KEY=eyJ...your-service-key

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits-min

# Domain Configuration
ALLOWED_HOSTS=buyprintz.com,www.buyprintz.com
CORS_ORIGINS=https://www.buyprintz.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/home/yourusername/public_html/uploads
```

### 4. GoDaddy cPanel Configuration

**Python App Setup:**
1. Go to cPanel → Software → Python Selector
2. Create Python application:
   - **Python Version:** 3.9+
   - **Application Root:** `/api/`
   - **Application URL:** `api`
   - **Application Startup File:** `main.py`
   - **Application Entry Point:** `app`

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Static Files Configuration:**
1. Set Document Root to `/public_html/`
2. Configure static file serving for `/assets/`

### 5. Database Setup (Supabase)

**SQL Schema Files to Run:**
1. `canvas_state_schema.sql`
2. `supabase_setup.sql`

**Enable Row Level Security:**
```sql
-- Enable RLS on all tables
ALTER TABLE canvas_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### 6. SSL and Security

**Force HTTPS (in .htaccess):**
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API routing
RewriteRule ^api/(.*)$ /api/main.py/$1 [L]
```

---

## 🧪 Testing Production Deployment

### Health Checks
1. **Basic Health:** https://www.buyprintz.com/health
2. **API Status:** https://www.buyprintz.com/api/status
3. **API Docs:** https://www.buyprintz.com/api/docs

### Functionality Tests
1. **Frontend Loading:** https://www.buyprintz.com
2. **User Registration:** Test signup flow
3. **Banner Editor:** Test design functionality
4. **Payment Processing:** Test with Stripe test cards
5. **Order Creation:** Complete end-to-end flow

### Performance Tests
```bash
# Test page load speed
curl -w "@curl-format.txt" -o /dev/null -s "https://www.buyprintz.com"

# Test API response time
curl -w "%{time_total}" -o /dev/null -s "https://www.buyprintz.com/api/status"
```

---

## 📊 Production Monitoring

### Key Metrics to Monitor
- **Uptime:** Server availability
- **Response Time:** API latency < 2s
- **Error Rate:** < 1% 4xx/5xx responses
- **Memory Usage:** Backend resource consumption
- **Database Performance:** Query response times

### Log Monitoring
```python
# Add to main.py for production logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/buyprintz.log'),
        logging.StreamHandler()
    ]
)
```

### Error Tracking
Monitor these endpoints for issues:
- `/health` - System health
- `/api/status` - Service status
- Supabase dashboard for database errors
- Stripe dashboard for payment issues

---

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
```python
# In main.py, ensure CORS origins include production domain
allow_origins=["https://www.buyprintz.com"]
```

**2. Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies are correctly configured
- Ensure service key has proper permissions

**3. File Upload Issues**
- Check upload directory permissions
- Verify MAX_FILE_SIZE setting
- Ensure proper static file serving

**4. Payment Processing**
- Use Stripe live keys (not test keys)
- Configure webhook endpoints
- Test with live payment methods

### Emergency Contacts
- **Technical Support:** support@buyprintz.com
- **GoDaddy Support:** https://www.godaddy.com/help
- **Supabase Support:** https://supabase.com/support
- **Stripe Support:** https://stripe.com/support

---

## 🎯 Performance Optimization

### Frontend Optimizations
- [x] Code splitting implemented (Vite handles automatically)
- [ ] Consider lazy loading for banner editor components
- [ ] Implement service worker for caching
- [ ] Optimize image assets (WebP format)

### Backend Optimizations
- [x] Database connection pooling (Supabase handles)
- [ ] Redis caching for frequent queries
- [ ] CDN for static asset delivery
- [ ] API response compression

### Recommended Next Steps
1. Set up monitoring with tools like Sentry or LogRocket
2. Implement automated backups for user data
3. Add rate limiting for API endpoints
4. Set up staging environment for testing updates

---

## 🎉 Launch Checklist

**Pre-Launch:**
- [ ] All environment variables configured
- [ ] SSL certificate active
- [ ] Payment processing tested
- [ ] User flows tested end-to-end
- [ ] Performance benchmarks recorded

**Launch Day:**
- [ ] Monitor error logs closely
- [ ] Test key user journeys
- [ ] Check payment processing
- [ ] Verify email notifications work
- [ ] Monitor server performance

**Post-Launch:**
- [ ] Set up regular backups
- [ ] Monitor user feedback
- [ ] Track conversion metrics
- [ ] Plan feature roadmap

---

**🚀 You're ready to launch Buy Printz!**

*Professional banner printing platform ready for production at https://www.buyprintz.com*
