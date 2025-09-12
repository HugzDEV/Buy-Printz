# Playwright Production Deployment Guide

This guide ensures Playwright works correctly in production environments for B2Sign integration.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Install system dependencies (Linux/containers)
playwright install-deps chromium
```

### 2. Verify Installation
```bash
# Run the setup script
python setup_playwright.py
```

## 🐳 Docker Deployment

### Using the Playwright Dockerfile
```bash
# Build the image
docker build -f Dockerfile.playwright -t buyprintz-backend .

# Run the container
docker run -p 8000:8000 buyprintz-backend
```

## ☁️ Cloud Platform Deployment

### Railway
1. Use the `Dockerfile.playwright` for deployment
2. Ensure the buildpack includes system dependencies
3. Set environment variables:
   ```
   PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
   ```

### Heroku
1. Add buildpack: `https://github.com/jontewks/puppeteer-heroku-buildpack`
2. Set config vars:
   ```
   PLAYWRIGHT_BROWSERS_PATH=/app/.local-chromium
   ```

### AWS/GCP/Azure
1. Use the `Dockerfile.playwright`
2. Ensure container has sufficient memory (512MB+)
3. Set proper security groups for outbound HTTPS

## 🔧 Production Configuration

### Environment Variables
```bash
# Required for Playwright
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
PYTHONUNBUFFERED=1

# B2Sign credentials (set securely)
B2SIGN_USERNAME=order@buyprintz.com
B2SIGN_PASSWORD=your_secure_password
```

### Browser Configuration
The browser is configured for production with:
- ✅ **Always headless** - Never shows browser to users
- ✅ **Security hardened** - Disabled extensions, plugins, etc.
- ✅ **Resource optimized** - Minimal memory usage
- ✅ **Container friendly** - Works in Docker/containers

## 🛡️ Security Considerations

### Browser Security
- Browser runs in headless mode (invisible to users)
- No extensions or plugins enabled
- Disabled JavaScript by default (enabled per page as needed)
- Sandboxed execution environment

### Credential Security
- B2Sign credentials stored as environment variables
- Never logged or exposed in error messages
- Secure credential rotation capability

## 🔍 Troubleshooting

### Common Issues

#### 1. Browser Initialization Failed
```
Error: Failed to initialize browser for B2Sign integration
```
**Solution**: Ensure system dependencies are installed:
```bash
playwright install-deps chromium
```

#### 2. Missing Browser Binary
```
Error: Browser executable not found
```
**Solution**: Install Chromium browser:
```bash
playwright install chromium
```

#### 3. Permission Denied
```
Error: Permission denied
```
**Solution**: Run with proper permissions or use Docker with non-root user

### Debug Mode
To enable debug logging, set:
```bash
LOG_LEVEL=DEBUG
```

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/shipping-costs/health
```

### Logs to Monitor
- Browser initialization success/failure
- B2Sign login attempts
- Shipping cost extraction results
- Error rates and response times

## 🚨 Production Checklist

- [ ] Playwright browsers installed
- [ ] System dependencies installed
- [ ] Browser runs in headless mode
- [ ] B2Sign credentials configured
- [ ] Health check endpoint responding
- [ ] Error handling configured
- [ ] Logging configured
- [ ] Security measures in place
- [ ] Resource limits set
- [ ] Monitoring configured

## 🔄 Updates and Maintenance

### Browser Updates
```bash
# Update Playwright
pip install --upgrade playwright

# Update browsers
playwright install chromium
```

### Security Updates
- Regularly update Playwright version
- Monitor for security advisories
- Rotate B2Sign credentials periodically

## 📞 Support

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all dependencies are installed
3. Test browser functionality with setup script
4. Check system resource availability
5. Verify network connectivity to B2Sign
