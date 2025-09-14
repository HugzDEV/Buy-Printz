# BuyPrintz Platform

**Full-stack business branding platform with integrated marketplace and checkout system.**

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Konva.js
- **Backend**: FastAPI + Python
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Deployment**: Railway (backend) + Vercel (frontend)

## Core Components

### Canvas Editor (`BannerEditor.jsx`)
- Multi-surface editor for banners, tins, and tents
- Konva.js-based canvas with element management
- Template system (user templates + marketplace templates)
- Real-time preview and export functionality

### Marketplace System
- Creator template marketplace with pricing
- IP protection and download controls
- Template categorization and search
- Integrated checkout flow

### Checkout System
- **Banner Checkout**: Material selection, options, pricing
- **Tin Checkout**: Quantity, finish, surface coverage
- **Tent Checkout**: Size, accessories, specifications
- **Real-time Shipping**: B2Sign integration for live shipping quotes
- Stripe payment integration with marketplace template pricing

## Product Types

### Banners
- Materials: 13oz Vinyl, 18oz Blackout, Mesh, Indoor, Pole, Fabric
- Options: Sides, pole pockets, grommets, webbing, corners, rope, wind slits
- Pricing: Material-based per square foot + option modifiers

### Business Card Tins
- Quantities: 100, 250, 500 units
- Surfaces: Front+Back or All Sides (Front, Back, Inside, Lid)
- Finishes: Silver ($0), Black (+$0.25/unit), Gold (+$0.50/unit)
- Printing: Premium vinyl stickers or clear vinyl stickers

### Tradeshow Tents
- Sizes: 10x10 ($299.99), 10x20 ($499.99)
- Materials: 6oz Tent Fabric (600x600 denier)
- Frame: 40mm Aluminum Hex Hardware
- Accessories: Carrying bag, sandbags, ropes/stakes, walls

## Database Schema

### Core Tables
- `orders`: Order management with product type and canvas data
- `users`: User authentication and profiles
- `templates`: User-created templates
- `creator_templates`: Marketplace templates
- `template_purchases`: Marketplace purchase tracking

### Product-Specific Tables
- `business_card_tins`: Tin specifications and surface designs
- `tradeshow_tents`: Tent specifications and component designs

## API Endpoints

### Core
- `POST /api/orders/create`: Create new order
- `POST /api/payments/create-intent`: Create Stripe payment intent
- `GET /api/templates/user`: Get user templates
- `POST /api/templates/save`: Save user template

### Shipping Integration
- `POST /api/shipping-costs/get`: Get real-time shipping costs for banners
- `POST /api/shipping-costs/tent`: Get real-time shipping costs for tents
- `GET /api/shipping-costs/health`: Health check for shipping system
- `GET /api/shipping-costs/playwright-status`: Check Playwright browser status

### Marketplace
- `GET /api/creator-marketplace/templates/marketplace`: Get marketplace templates
- `POST /api/creator-marketplace/templates/{id}/purchase`: Purchase template
- `GET /api/creator-marketplace/templates/{id}/download`: Download template

## Environment Variables

### Backend (Railway)
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
JWT_SECRET_KEY=
OPENAI_API_KEY=
FRONTEND_URL=
B2SIGN_USERNAME=order@buyprintz.com
B2SIGN_PASSWORD=$AG@BuyPr!n1z
PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

### Frontend (Vercel)
```
VITE_API_URL=
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Development Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Shipping Integration System

### B2Sign Print Partner Integration
- **Real-time Shipping Quotes**: Live shipping costs from B2Sign print partners
- **Browser Automation**: Playwright-based automation for form interaction
- **Modular Design**: Separate integrations for banners and tents
- **Dynamic Customer Info**: No hardcoded addresses or states

### Workflow Process
1. **Login**: Authenticate with B2Sign using production credentials
2. **Navigate**: Go to correct product pages (banner-specific or tent-specific)
3. **Fill Forms**: Input product specifications, dimensions, and options
4. **Shipping Method**: Select "Blind Drop Ship" for customer delivery
5. **Address Modal**: Fill customer shipping information dynamically
6. **Extract Options**: Retrieve all available shipping methods and costs

### Technical Implementation
- **Frontend Timeout**: 5-minute timeout for automation completion
- **State Selection**: Robust hidden select + MuiAutocomplete fallback
- **Error Handling**: Comprehensive error handling and logging
- **Production Ready**: Headless browser automation for security

### Supported Products
- **Banners**: All materials and sizes with shipping options
- **Tents**: 10x10, 10x15, 10x20 with accessories and wall options

## Key Features

- **Multi-surface Canvas Editor**: Support for banners, tins, and tents
- **Template System**: User templates and marketplace templates
- **IP Protection**: Watermarking and download controls
- **Integrated Checkout**: Seamless payment flow with marketplace pricing
- **Real-time Shipping**: Live shipping quotes from B2Sign print partners
- **Browser Automation**: Playwright integration for shipping cost extraction
- **Responsive Design**: Mobile-optimized interface
- **Real-time Preview**: Live design preview and export

## License

MIT License