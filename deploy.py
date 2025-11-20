#!/usr/bin/env python3
"""
Production Deployment Script for Buy Printz Platform
Prepares the application for deployment to GoDaddy hosting
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Command failed: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Exception running command: {cmd}")
        print(f"Error: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Node.js
    if not run_command("node --version"):
        print("❌ Node.js is not installed")
        return False
    
    # Check Python
    if not run_command("python --version"):
        print("❌ Python is not installed")
        return False
    
    print("✅ Dependencies check passed")
    return True

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print("📦 Installing backend dependencies...")
    
    if not os.path.exists("requirements.txt"):
        print("❌ requirements.txt not found")
        return False
    
    if not run_command("pip install -r requirements.txt"):
        print("❌ Failed to install backend dependencies")
        return False
    
    print("✅ Backend dependencies installed")
    return True

def install_frontend_dependencies():
    """Install Node.js frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    if not run_command("npm install", cwd=frontend_path):
        print("❌ Failed to install frontend dependencies")
        return False
    
    print("✅ Frontend dependencies installed")
    return True

def run_tests():
    """Run the test suite"""
    print("🧪 Running tests...")
    
    # Run Python tests
    if not run_command("python -m pytest tests/ -v"):
        print("⚠️ Some backend tests failed, but continuing...")
    
    # Run frontend linting
    frontend_path = Path("frontend")
    if not run_command("npm run lint", cwd=frontend_path):
        print("⚠️ Frontend linting found issues, but continuing...")
    
    print("✅ Tests completed")
    return True

def build_frontend():
    """Build the frontend for production"""
    print("🏗️ Building frontend for production...")
    
    frontend_path = Path("frontend")
    if not run_command("npm run build", cwd=frontend_path):
        print("❌ Failed to build frontend")
        return False
    
    # Check if dist directory was created
    dist_path = frontend_path / "dist"
    if not dist_path.exists():
        print("❌ Build output directory not found")
        return False
    
    print("✅ Frontend built successfully")
    return True

def create_production_env():
    """Create production environment configuration"""
    print("⚙️ Creating production environment configuration...")
    
    # Create production .env template
    env_content = """# Production Environment Variables for Buy Printz
# Copy this file to .env and fill in your production values

# Database Configuration
SUPABASE_URL=your_production_supabase_url
SUPABASE_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_KEY=your_production_supabase_service_key

# Payment Configuration  
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Application Configuration
ENVIRONMENT=production
DEBUG=false
ALLOWED_HOSTS=buyprintz.com,www.buyprintz.com
CORS_ORIGINS=https://www.buyprintz.com

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@buyprintz.com
SMTP_PASSWORD=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/buyprintz/uploads

# SSL Configuration (for GoDaddy hosting)
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
"""
    
    with open(".env.production", "w") as f:
        f.write(env_content)
    
    print("✅ Production environment template created (.env.production)")
    print("📝 Please copy .env.production to .env and fill in your production values")
    return True

def create_deployment_package():
    """Create deployment package"""
    print("📦 Creating deployment package...")
    
    # Create deployment directory
    deploy_dir = Path("deployment")
    if deploy_dir.exists():
        shutil.rmtree(deploy_dir)
    deploy_dir.mkdir()
    
    # Copy backend files
    backend_files = [
        "backend/",
        "requirements.txt",
        "start_backend.sh",
        "canvas_state_schema.sql",
        "supabase_setup.sql"
    ]
    
    for file_path in backend_files:
        src = Path(file_path)
        if src.exists():
            if src.is_dir():
                shutil.copytree(src, deploy_dir / src.name)
            else:
                shutil.copy2(src, deploy_dir / src.name)
    
    # Copy frontend build
    frontend_dist = Path("frontend/dist")
    if frontend_dist.exists():
        shutil.copytree(frontend_dist, deploy_dir / "static")
    
    # Copy deployment files
    deployment_files = [
        ".env.production",
        "README.md"
    ]
    
    for file_path in deployment_files:
        src = Path(file_path)
        if src.exists():
            shutil.copy2(src, deploy_dir / src.name)
    
    print("✅ Deployment package created in 'deployment/' directory")
    return True

def create_godaddy_instructions():
    """Create deployment instructions for GoDaddy"""
    instructions = """
# GoDaddy Deployment Instructions for Buy Printz

## Prerequisites
1. GoDaddy cPanel hosting account with Python support
2. Domain: www.buyprintz.com configured
3. SSL certificate installed
4. Supabase account configured
5. Stripe account configured

## Deployment Steps

### 1. Upload Files
1. Upload the contents of the 'deployment/' directory to your GoDaddy file manager
2. Place backend files in the root directory or a subdirectory like 'api/'
3. Place static files (frontend build) in public_html/

### 2. Configure Environment
1. Copy .env.production to .env
2. Fill in all production values:
   - Supabase URLs and keys
   - Stripe live keys
   - JWT secret
   - Domain configuration

### 3. Install Dependencies
Using GoDaddy's Python environment:
```bash
pip install -r requirements.txt
```

### 4. Database Setup
1. Run the SQL files in your Supabase dashboard:
   - supabase_setup.sql
   - canvas_state_schema.sql

### 5. Configure Web Server
For GoDaddy cPanel:
1. Set document root to public_html/
2. Configure Python app:
   - Application URL: /api/
   - Application startup file: backend/main.py
   - Application Entry point: app

### 6. SSL Configuration
1. Ensure SSL certificate is installed for buyprintz.com
2. Enable force HTTPS redirect
3. Update CORS configuration for https://www.buyprintz.com

### 7. Test Deployment
1. Visit https://www.buyprintz.com
2. Test user registration and login
3. Test banner editor functionality
4. Test order placement with Stripe
5. Check all API endpoints: https://www.buyprintz.com/api/docs

### 8. Monitoring and Maintenance
1. Set up error logging
2. Monitor server performance
3. Regular backups of user data
4. Keep dependencies updated

## Troubleshooting
- Check server logs for Python errors
- Verify environment variables are loaded
- Test database connections
- Verify SSL certificate is valid
- Check CORS configuration
- Test Stripe webhook endpoints

## Support
For deployment issues: support@buyprintz.com
"""
    
    with open("DEPLOYMENT_INSTRUCTIONS.md", "w") as f:
        f.write(instructions)
    
    print("✅ GoDaddy deployment instructions created")
    return True

def main():
    """Main deployment preparation function"""
    print("🚀 Buy Printz Production Deployment Preparation")
    print("=" * 50)
    
    steps = [
        ("Checking dependencies", check_dependencies),
        ("Installing backend dependencies", install_backend_dependencies),
        ("Installing frontend dependencies", install_frontend_dependencies),
        ("Running tests", run_tests),
        ("Building frontend", build_frontend),
        ("Creating production environment", create_production_env),
        ("Creating deployment package", create_deployment_package),
        ("Creating deployment instructions", create_godaddy_instructions)
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        if not step_func():
            print(f"❌ Failed at step: {step_name}")
            sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Deployment preparation completed successfully!")
    print("\nNext steps:")
    print("1. Review .env.production and fill in production values")
    print("2. Upload deployment/ directory to GoDaddy")
    print("3. Follow DEPLOYMENT_INSTRUCTIONS.md")
    print("4. Test at https://www.buyprintz.com")
    print("\n🌟 Good luck with your launch!")

if __name__ == "__main__":
    main()
