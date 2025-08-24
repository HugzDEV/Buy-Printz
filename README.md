
# 🎨 Buy Printz - Professional Banner Printing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/HugzDEV/buy-printz)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/HugzDEV/buy-printz)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](https://github.com/HugzDEV/buy-printz)

> **Professional banner printing platform with advanced design tools, built for scale and performance.**

🌐 **Live Demo:** [www.buyprintz.com](https://www.buyprintz.com)  
📖 **API Docs:** [api.buyprintz.com/docs](https://api.buyprintz.com/docs)

---

## ✨ **Key Features**

### 🎨 **Advanced Design Editor**
- **Konva.js Canvas**: High-performance 2D design editor
- **Professional Tools**: Text, shapes, images, layers with full manipulation
- **Keyboard Shortcuts**: Ctrl+C/V, Del, Ctrl+D for power users
- **Real-time Preview**: Live PDF generation with print quality analysis
- **State Persistence**: Auto-save with cross-device synchronization

### 🔐 **Enterprise Authentication**
- **Supabase Integration**: Secure user management with JWT
- **Row-Level Security**: Database-level access controls
- **Session Management**: Persistent login with secure token handling

### 💳 **Complete E-commerce**
- **Stripe Integration**: Secure payment processing
- **Order Management**: Full lifecycle tracking
- **Multiple Products**: Vinyl, fabric, mesh banners with custom sizing
- **Print Specifications**: Professional finishing options

### 📱 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Legal Compliance**: Terms of Service & Privacy Policy
- **Professional Branding**: Consistent design system

---

## 🚀 **Technology Stack**

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Modern SPA with fast builds |
| **Design Engine** | Konva.js | High-performance 2D canvas |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Backend** | FastAPI | High-performance Python API |
| **Database** | Supabase (PostgreSQL) | Managed database with real-time features |
| **Payments** | Stripe | Secure payment processing |
| **Authentication** | JWT + Supabase Auth | Enterprise-grade security |
| **PDF Generation** | jsPDF + html2canvas | Print-ready file export |

---

## 📁 **Project Structure**

```
buy-printz/
├── 🎨 frontend/                    # React frontend (production-ready)
│   ├── src/
│   │   ├── components/             # React components
│   │   │   ├── BannerEditor.jsx    # 4,683 lines - Advanced design editor
│   │   │   ├── PrintPreviewModal.jsx # PDF generation & quality analysis
│   │   │   ├── Dashboard.jsx       # User management dashboard
│   │   │   ├── Checkout.jsx        # Order processing flow
│   │   │   ├── TermsOfService.jsx  # Legal compliance
│   │   │   └── PrivacyPolicy.jsx   # Privacy compliance
│   │   ├── services/               # API integrations
│   │   │   ├── auth.js             # Authentication service
│   │   │   └── canvasState.js      # Design persistence
│   │   └── assets/                 # Static assets
│   ├── public/                     # Static files
│   └── package.json                # Dependencies & scripts
├── ⚡ backend/                     # FastAPI backend (production-ready)
│   ├── main.py                     # 942 lines - Main API application
│   ├── auth.py                     # JWT authentication
│   ├── database.py                 # Supabase integration
│   └── __init__.py                 # Package initialization
├── 🗄️ Database/
│   ├── canvas_state_schema.sql     # Canvas persistence schema
│   └── supabase_setup.sql          # Complete database setup
├── 🧪 tests/                      # Comprehensive testing suite
│   ├── test_api_endpoints.py       # API testing
│   ├── test_frontend_components.py # Component testing
│   └── conftest.py                 # Test configuration
├── 📋 Documentation/
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md # Complete deployment guide
│   └── README.md                   # This file
├── 🛠️ Configuration/
│   ├── requirements.txt            # Python dependencies
│   ├── .gitignore                  # Git ignore rules
│   └── env.example                 # Environment template
└── 🚀 Deployment/
    ├── deploy.py                   # Automated deployment script
    ├── run_tests.py                # Test runner
    └── start_*.sh/bat              # Development scripts
```

---

## 🏃‍♂️ **Quick Start**

### **Prerequisites**
- Node.js 18+ & npm
- Python 3.9+
- Git
- Supabase account
- Stripe account

### **1. Clone & Setup**
```bash
git clone https://github.com/your-username/buy-printz.git
cd buy-printz

# Copy environment template
cp env.example .env
# Edit .env with your API keys
```

### **2. Install Dependencies**
```bash
# Frontend
cd frontend && npm install

# Backend
cd .. && pip install -r requirements.txt
```

### **3. Database Setup**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase_setup.sql` in SQL editor
3. Run `canvas_state_schema.sql` for design persistence
4. Update `.env` with your Supabase credentials

### **4. Start Development**
```bash
# Terminal 1 - Backend
./start_backend.sh    # or start_backend.bat on Windows

# Terminal 2 - Frontend  
./start_frontend.sh   # or start_frontend.bat on Windows
```

### **5. Access Application**
- 🎨 **Frontend:** [localhost:3000](http://localhost:3000)
- ⚡ **Backend:** [localhost:8000](http://localhost:8000)
- 📖 **API Docs:** [localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 **Testing**

### **Run All Tests**
```bash
python run_tests.py
```

### **Component Tests**
```bash
python -m pytest tests/test_frontend_components.py -v
```

### **API Tests**
```bash
python -m pytest tests/test_api_endpoints.py -v
```

### **Production Build Test**
```bash
cd frontend && npm run build
```

---

## 🌐 **Deployment**

### **Recommended: Vercel + Railway**

#### **Frontend → Vercel**
```bash
npm i -g vercel
cd frontend
vercel --prod
```

#### **Backend → Railway**
```bash
# Connect GitHub repo to Railway
# Set environment variables
# Deploy automatically on push
```

#### **Domain Setup**
In GoDaddy DNS:
- `www.buyprintz.com` → Vercel
- `api.buyprintz.com` → Railway

### **Alternative Deployments**
- **Netlify + Heroku**
- **AWS + DigitalOcean**
- **Custom VPS**

📋 **See `PRODUCTION_DEPLOYMENT_GUIDE.md` for complete instructions**

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Authentication  
JWT_SECRET=your_256_bit_secret

# Payments
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# CORS
CORS_ORIGINS=https://www.buyprintz.com

# Environment
ENVIRONMENT=production
DEBUG=false
```

---

## 📊 **Performance & Metrics**

- **Frontend Build:** 3.75s ⚡
- **Bundle Size:** 1.4MB (optimized)
- **Test Coverage:** 71.4% ✅
- **API Response:** <200ms 🚀
- **Lighthouse Score:** 95+ 🌟

---

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### **Development Guidelines**
- Follow existing code patterns
- Add tests for new features
- Update documentation
- Ensure build passes

---

## 📞 **Support**

- 📧 **Email:** support@buyprintz.com
- 🌐 **Website:** [www.buyprintz.com](https://www.buyprintz.com)
- 📖 **Docs:** [api.buyprintz.com/docs](https://api.buyprintz.com/docs)

---

## 📄 **License**

**Proprietary Software** - All rights reserved.  
© 2025 Buy Printz. Unauthorized copying or distribution is prohibited.

---

<div align="center">

**🎨 Built with ❤️ for professional banner printing**

[🌐 Visit Buy Printz](https://www.buyprintz.com) • [📖 API Documentation](https://api.buyprintz.com/docs) • [🚀 Deploy Now](PRODUCTION_DEPLOYMENT_GUIDE.md)

</div>

