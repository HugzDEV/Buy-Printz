# BuyPrintz Platform

**Professional cloud-based banner creation platform with comprehensive marketplace, creator system, and advanced design tools.**

## 🚀 Platform Overview

BuyPrintz is a full-stack business branding platform that enables users to create professional banners, business card tins, and tradeshow tents with an integrated marketplace, creator system, and advanced design tools. Built with modern cloud architecture and deployed across multiple services.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + Tailwind CSS + Konva.js
- **Backend**: FastAPI + Python 3.9+
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Storage**: Supabase Storage (cloud-native file storage)
- **Payments**: Stripe integration
- **Deployment**: Railway (backend) + Vercel (frontend)
- **Domain**: https://www.buyprintz.com

## ✨ Key Features

### 🎨 Advanced Canvas Editor
- **Multi-Product Support**: Banners, Business Card Tins, Tradeshow Tents
- **Konva.js Integration**: Professional 2D canvas with element management
- **Real-time Preview**: Live design preview with inline image-based system
- **Mobile Optimized**: Responsive design with mobile-specific toolbar
- **Template System**: User templates + marketplace templates
- **IP Protection**: Comprehensive watermarking system

### 👥 Creator Marketplace System
- **Creator Registration**: Complete creator onboarding and profile management
- **Logo Upload**: Supabase Storage integration for persistent file storage
- **Follower System**: Social features with notifications and preferences
- **Earnings Tracking**: Comprehensive analytics and revenue management
- **Template Upload**: Creator design submission and approval workflow
- **Mobile Dashboard**: Responsive creator dashboard with analytics

### 🛒 Integrated Checkout System
- **Multi-Product Checkout**: Banners, Tins, Tents with product-specific flows
- **Hybrid Shipping**: B2Sign reseller integration (Banners/Tents) + UPS API (In-house Tins)
- **Stripe Integration**: Secure payment processing with marketplace pricing
- **Order Management**: Complete order tracking and fulfillment
- **Dynamic Pricing**: Material-based pricing with option modifiers

### 📦 Product Catalog

#### Banners
- **Materials**: 13oz Vinyl, 18oz Blackout, Mesh, Indoor, Pole, Fabric
- **Options**: Sides, pole pockets, grommets, webbing, corners, rope, wind slits
- **Pricing**: Material-based per square foot + option modifiers

#### Business Card Tins
- **Quantities**: 100, 250, 500 units
- **Surfaces**: Front+Back or All Sides (Front, Back, Inside, Lid)
- **Finishes**: Silver ($0), Black (+$0.25/unit), Gold (+$0.50/unit)
- **Printing**: Premium vinyl stickers or clear vinyl stickers

#### Tradeshow Tents
- **Sizes**: 10x10 ($299.99), 10x20 ($499.99)
- **Materials**: 6oz Tent Fabric (600x600 denier)
- **Frame**: 40mm Aluminum Hex Hardware
- **Accessories**: Carrying bag, sandbags, ropes/stakes, walls

## 🗄️ Database Schema

### Core Tables
- `users`: User authentication and profiles
- `orders`: Order management with product type and canvas data
- `templates`: User-created templates
- `canvas_states`: Design state persistence

### Creator Marketplace Tables
- `creators`: Creator profiles and earnings
- `creator_templates`: Marketplace templates with approval workflow
- `template_purchases`: Marketplace purchase tracking
- `creator_followers`: Social following system
- `creator_notifications`: Notification system
- `creator_following_preferences`: User notification preferences

### Product-Specific Tables
- `business_card_tins`: Tin specifications and surface designs
- `tradeshow_tents`: Tent specifications and component designs
- `tin_skinz_designs`: Tin Skinz product catalog
- `tin_skinz_orders`: Tin Skinz order management

### Storage
- **Supabase Storage**: Cloud-native file storage for all uploads
- **Creator Assets**: Logo uploads and design files
- **Template Thumbnails**: Marketplace template previews

## 🔌 API Endpoints

### Core API
- `POST /api/orders/create`: Create new order
- `POST /api/payments/create-intent`: Create Stripe payment intent
- `GET /api/templates/user`: Get user templates
- `POST /api/templates/save`: Save user template

### Creator Marketplace API
- `GET /api/creator-marketplace/templates/marketplace`: Get marketplace templates
- `POST /api/creator-marketplace/templates/{id}/purchase`: Purchase template
- `GET /api/creator-marketplace/templates/{id}/download`: Download template
- `POST /api/creator-marketplace/creators/register`: Register as creator
- `POST /api/creator-marketplace/creators/upload-logo`: Upload creator logo
- `GET /api/creator-marketplace/creators/profile`: Get creator profile
- `GET /api/creator-marketplace/creators/analytics`: Get creator analytics

### Creator Follower API
- `POST /api/creator-marketplace/creators/{id}/follow`: Follow creator
- `DELETE /api/creator-marketplace/creators/{id}/follow`: Unfollow creator
- `GET /api/creator-marketplace/creators/{id}/follow-status`: Check follow status
- `GET /api/creator-marketplace/users/following`: Get user's following list
- `GET /api/creator-marketplace/notifications`: Get user notifications

### Shipping API
- `POST /api/shipping-costs/get`: Get banner shipping costs from B2Sign (Playwright automation)
- `POST /api/shipping-costs/tent`: Get tent shipping costs from B2Sign (Playwright automation)
- `POST /api/shipping/ups-rates`: Get UPS shipping rates for in-house products
- `GET /api/shipping-costs/health`: B2Sign integration health check

### Tin Skinz API
- `GET /api/tin-skinz/designs`: Get Tin Skinz designs
- `POST /api/tin-skinz/orders`: Create Tin Skinz order
- `GET /api/tin-skinz/orders/{order_id}`: Get Tin Skinz order

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (Railway)
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
JWT_SECRET_KEY=your_256_bit_secret
B2SIGN_USERNAME=your_b2sign_username
B2SIGN_PASSWORD=your_b2sign_password
UPS_API_KEY=your_ups_api_key
UPS_USERNAME=your_ups_username
UPS_PASSWORD=your_ups_password
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
CORS_ORIGINS=https://www.buyprintz.com
```

#### Frontend (Vercel)
```bash
VITE_API_URL=https://api.buyprintz.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 🚀 Deployment

### Production URLs
- **Frontend**: https://www.buyprintz.com
- **Backend API**: https://api.buyprintz.com
- **API Documentation**: https://api.buyprintz.com/docs

### Deployment Services
- **Frontend**: Vercel (automatic deployment from GitHub)
- **Backend**: Railway (automatic deployment from GitHub)
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Supabase Storage (cloud file storage)

## 📊 Recent Achievements (August 2025 - September 2025)

### 🎨 UI/UX Improvements
- **Mobile Optimization**: Complete responsive design overhaul
- **Sidebar Refactoring**: Enhanced design tools with visual feedback
- **Status Bar Redesign**: Compact neumorphic design with universal controls
- **Template System**: Visual selection indicators and improved formatting
- **Font Collection**: Expanded from 11 to 61+ professional fonts

### 🔧 Technical Improvements
- **Print Preview Overhaul**: Inline image-based preview system
- **Canvas Editor Enhancements**: Mobile toolbar, guidelines, magnet functionality
- **Controlled Component Fixes**: Resolved input field issues
- **Text Editor Improvements**: Enhanced modal design and keyboard support
- **Star Shape Morphing**: Fixed scaling distortion issues

### 👥 Creator System Implementation
- **Complete Creator Marketplace**: Registration, profiles, earnings tracking
- **Follower System**: Social features with notifications
- **Logo Upload System**: Supabase Storage integration
- **Creator Analytics**: Comprehensive dashboard with metrics
- **Mobile Creator Dashboard**: Responsive creator interface

### 🗄️ Database & Storage
- **Supabase Storage**: Cloud-native file storage implementation
- **Creator Database Schema**: 15+ tables with RLS policies
- **Tin Skinz Integration**: Creator functionality for tin designs
- **Follower System**: Complete social features database

### 🚚 Shipping Integration
- **B2Sign Reseller Integration**: Custom Playwright automation for Banners & Tents (no API available)
- **UPS API Integration**: Direct shipping rate calculation for in-house Tin Skinz & Business Card Tins
- **Hybrid Architecture**: Reseller integration + in-house production shipping
- **Dynamic Customer Info**: Address validation and state handling
- **Production Automation**: Headless browser automation for B2Sign integration

### 📈 SEO & Content
- **Sitemap Updates**: Comprehensive sitemap.xml with all pages
- **SEO Head Components**: Meta tags and structured data
- **Blog System**: Content management and SEO optimization
- **Landing Page Optimization**: Improved user journey and conversion

## 🎯 Key Statistics

- **Development Period**: 6+ weeks (August 8, 2025 - September 21, 2025)
- **Total Issues Resolved**: 19 major categories
- **Lines of Code**: 8,000+ frontend + 6,000+ backend
- **User Experience Improvements**: 35+ enhancements
- **Database Tables**: 15+ tables with RLS, triggers, and indexes
- **API Endpoints**: 50+ endpoints across multiple services

## 🔒 Security Features

- **Row Level Security**: Supabase RLS policies for data protection
- **JWT Authentication**: Secure user authentication
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Validation**: Pydantic models for data validation
- **File Upload Security**: Type and size validation

## 📱 Mobile Features

- **Responsive Design**: Mobile-first approach
- **Touch Optimized**: Mobile-specific interactions
- **Mobile Toolbar**: Double-wide toolbar with all functionality
- **Mobile Creator Dashboard**: Optimized creator interface
- **Mobile Checkout**: Streamlined mobile checkout flow

## 🎨 Design System

- **GlassUI Neumorphic**: Modern design aesthetic
- **Tailwind CSS**: Utility-first styling
- **Consistent Components**: Reusable UI components
- **Mobile Responsive**: Adaptive design across devices
- **Accessibility**: WCAG compliant design patterns

## 📚 Documentation

- **API Documentation**: Comprehensive Swagger/OpenAPI docs
- **Development Tasks**: Detailed task tracking in `tasks.md`
- **Deployment Guides**: Step-by-step deployment instructions
- **Database Schemas**: Complete SQL schema documentation

## 🤝 Contributing

This is a proprietary platform. For internal development:

1. Follow the established code patterns
2. Update documentation for new features
3. Test on mobile and desktop
4. Ensure proper error handling
5. Update API documentation

## 📄 License

Proprietary - BuyPrintz Platform

---

**Built with ❤️ by the BuyPrintz Development Team**

*Last Updated: September 21, 2025*