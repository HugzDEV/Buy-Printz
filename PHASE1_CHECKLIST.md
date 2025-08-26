# Phase 1: Domain Setup Checklist

## 🎯 **Goal**: Complete `api.buyprintz.com` setup and test connectivity

---

## Step 1: Railway API Domain Setup

### 1.1 Add Custom Domain to Railway
- [ ] Go to [Railway Dashboard](https://railway.app/dashboard)
- [ ] Select your backend service
- [ ] Navigate to **Settings** → **Public Networking**
- [ ] Click **+ Custom Domain**
- [ ] Enter: `api.buyprintz.com`
- [ ] **Copy the CNAME record** Railway provides (format: `xxx.railway.app`)

### 1.2 Configure DNS Record
- [ ] Go to your domain registrar's DNS management
- [ ] Add new CNAME record:
  ```
  Type: CNAME
  Name: api
  Value: [Railway-provided-URL].railway.app
  TTL: 3600 (or default)
  ```
- [ ] Save DNS changes

**⏱️ DNS Propagation**: Can take 0-48 hours

---

## Step 2: Vercel Environment Variables

### 2.1 Update Production Environment
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Select your BuyPrintz project
- [ ] Navigate to **Settings** → **Environment Variables**
- [ ] Add/Update these for **Production**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://api.buyprintz.com` |
| `VITE_SITE_URL` | `https://buyprintz.com` |

### 2.2 Redeploy Frontend
- [ ] Go to **Deployments** tab
- [ ] Click **⋯** on latest deployment
- [ ] Select **Redeploy**
- [ ] Wait for deployment to complete

---

## Step 3: Test API Connectivity

### 3.1 Quick Manual Tests
**Once DNS propagates (may take time):**

- [ ] Test API health: `https://api.buyprintz.com/health`
- [ ] Test API docs: `https://api.buyprintz.com/docs`
- [ ] Test CORS: Load frontend and check browser console

### 3.2 Automated Testing
Run our test script:

```bash
node test-api-domain.js
```

### 3.3 Frontend Integration Test
- [ ] Visit `https://buyprintz.com`
- [ ] Try to register/login
- [ ] Check browser developer tools for API calls
- [ ] Ensure no CORS errors

---

## 🔍 **Troubleshooting**

### If `api.buyprintz.com` doesn't work:
1. **Check DNS propagation**: https://dnschecker.org
2. **Verify Railway status**: Check Railway dashboard for domain status
3. **DNS record format**: Ensure CNAME points to correct Railway URL
4. **Clear browser cache**: Try incognito/private browsing

### If frontend can't reach API:
1. **Check Vercel env vars**: Ensure they're set for Production
2. **Redeploy**: New environment variables require redeployment
3. **CORS issues**: Check browser console for blocked requests

---

## ✅ **Success Criteria**

- [ ] `https://api.buyprintz.com/health` returns 200 OK
- [ ] `https://api.buyprintz.com/docs` shows API documentation
- [ ] Frontend loads without API errors
- [ ] User registration/login works
- [ ] No CORS errors in browser console

---

## 📞 **Support Resources**

- **Railway Docs**: https://docs.railway.app/guides/public-networking
- **Vercel Docs**: https://vercel.com/docs/environment-variables
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

---

## ⏭️ **After Completion**

Once Phase 1 is complete, we'll move to:
- **Phase 2**: Performance & UX improvements
- **Phase 3**: Analytics & optimization

**Estimated Time**: 2-4 hours (mostly waiting for DNS propagation)
