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

## Key Features

- **Multi-surface Canvas Editor**: Support for banners, tins, and tents
- **Template System**: User templates and marketplace templates
- **IP Protection**: Watermarking and download controls
- **Integrated Checkout**: Seamless payment flow with marketplace pricing
- **Responsive Design**: Mobile-optimized interface
- **Real-time Preview**: Live design preview and export

## License

MIT License