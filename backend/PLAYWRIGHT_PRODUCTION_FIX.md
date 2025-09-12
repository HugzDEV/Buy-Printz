# 🚀 Playwright Production Fix Guide

## ❌ **Current Issue**
The production environment is failing with:
```
BrowserType.launch: Executable doesn't exist at /root/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell
```

This means Playwright browsers are not installed in the production environment.

## ✅ **Solution Steps**

### 1. **Immediate Fix - Install Playwright Browsers**

Run this command in your production environment:

```bash
# Navigate to your backend directory
cd /path/to/your/backend

# Install Playwright browsers
python -m playwright install chromium

# Install system dependencies
python -m playwright install-deps chromium

# Verify installation
python -c "import playwright; print('Playwright installed successfully')"
```

### 2. **Alternative - Use the Installation Script**

We've created a script to handle this automatically:

```bash
# Run the installation script
python backend/install_playwright_browsers.py
```

### 3. **Check Installation Status**

Use the new health check endpoint:

```bash
# Check if Playwright is working
curl https://your-api-domain.com/api/shipping-costs/playwright-status
```

Expected response:
```json
{
  "status": "healthy",
  "playwright": "installed",
  "browsers": "available",
  "message": "Playwright browsers are properly installed and working"
}
```

### 4. **Docker Deployment Fix**

If you're using Docker, ensure your Dockerfile includes:

```dockerfile
# Install Playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium
```

### 5. **Production Environment Requirements**

Your production environment needs:

- **Python 3.11+**
- **Playwright package installed** (`pip install playwright`)
- **Chromium browser installed** (`playwright install chromium`)
- **System dependencies** (`playwright install-deps chromium`)

## 🔧 **Troubleshooting**

### If installation fails:

1. **Check Python version:**
   ```bash
   python --version
   ```

2. **Check Playwright installation:**
   ```bash
   pip list | grep playwright
   ```

3. **Check system dependencies:**
   ```bash
   # For Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install -y libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgtk-3-0 libgbm1 libasound2
   ```

4. **Manual browser installation:**
   ```bash
   # Force reinstall
   python -m playwright install --force chromium
   ```

## 📋 **Verification Steps**

After installation, test the integration:

1. **Check health endpoint:**
   ```bash
   curl https://your-api-domain.com/api/shipping-costs/health
   ```

2. **Check Playwright status:**
   ```bash
   curl https://your-api-domain.com/api/shipping-costs/playwright-status
   ```

3. **Test shipping costs:**
   ```bash
   curl -X POST https://your-api-domain.com/api/shipping-costs/get \
     -H "Content-Type: application/json" \
     -d '{
       "product_type": "banner",
       "dimensions": {"width": 2, "height": 4},
       "quantity": 1,
       "zip_code": "02446",
       "customer_info": {
         "name": "Test User",
         "address": "123 Test St",
         "city": "Test City",
         "state": "MA",
         "zipCode": "02446",
         "jobName": "Test Order"
       }
     }'
   ```

## 🎯 **Expected Results**

After fixing the Playwright installation:

- ✅ **Health check returns "healthy"**
- ✅ **Playwright status shows "installed"**
- ✅ **Shipping costs API works without browser errors**
- ✅ **B2Sign integration completes in 15-20 seconds**

## 🚨 **Important Notes**

1. **This is a one-time fix** - once browsers are installed, they persist
2. **The installation takes 2-3 minutes** - be patient
3. **System dependencies are required** - don't skip the `install-deps` step
4. **Restart your application** after installation to ensure changes take effect

## 📞 **Support**

If you continue to have issues:

1. Check the application logs for specific error messages
2. Verify all system dependencies are installed
3. Ensure the production environment has sufficient disk space
4. Contact the development team with the specific error messages

---

**The B2Sign integration will work perfectly once Playwright browsers are properly installed! 🎉**
