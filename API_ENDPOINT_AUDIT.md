# 🔍 API Endpoint Audit Report
**Generated**: September 22, 2025  
**Purpose**: Comprehensive mapping and testing of all API endpoints

## 📊 Summary Statistics
- **Total Endpoints**: 142
- **Main API**: 67 endpoints
- **Creator Marketplace**: 25 endpoints  
- **Creator Followers**: 10 endpoints
- **Business Card Tins**: 4 endpoints
- **Tin Skinz**: 6 endpoints
- **Shipping Costs**: 7 endpoints
- **Tin Skinz Shipping**: 8 endpoints
- **B2Sign**: 5 endpoints

---

## 🏗️ Core API Endpoints (main.py)

### 🔐 Authentication & User Management
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/auth/register` | User registration | ✅ Active |
| POST | `/api/auth/login` | User login | ✅ Active |
| POST | `/api/auth/refresh` | Token refresh | ✅ Active |
| POST | `/api/auth/logout` | User logout | ✅ Active |
| GET | `/api/user/profile` | Get user profile | ✅ Active |
| PUT | `/api/user/profile` | Update user profile | ✅ Active |
| POST | `/api/user/change-password` | Change password | ✅ Active |
| DELETE | `/api/user/delete-account` | Delete account | ✅ Active |

### 🎯 User Preferences & Tour
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/user/tour-status` | Get tour completion status | ✅ Active |
| POST | `/api/user/mark-tour-completed` | Mark tour as completed | ✅ Active |
| GET | `/api/user/preferences` | Get user preferences | ✅ Active |
| POST | `/api/user/preferences` | Save user preferences | ✅ Active |
| GET | `/api/user/stats` | Get user statistics | ✅ Active |

### 📍 Address Management
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/user/addresses` | Save user address | ✅ Active |
| GET | `/api/user/addresses` | Get user addresses | ✅ Active |

### 🛒 Orders & Payments
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/orders/create` | Create new order | ✅ Active |
| GET | `/api/orders` | Get user orders | ✅ Active |
| GET | `/api/orders/{order_id}` | Get specific order | ✅ Active |
| POST | `/api/orders/{order_id}/customer-info` | Save customer info | ✅ Active |
| POST | `/api/payments/create-intent` | Create payment intent | ✅ Active |
| POST | `/api/payments/webhook` | Stripe webhook | ✅ Active |

### 🎨 Templates (Original System)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/templates/save` | Save custom template | ✅ Active |
| GET | `/api/templates/user` | Get user templates | ✅ Active |
| GET | `/api/templates/limit` | Get template limits | ✅ Active |
| GET | `/api/templates/public` | Get public templates | ✅ Active |
| GET | `/api/templates/{template_id}` | Get specific template | ✅ Active |
| POST | `/api/templates/generate-thumbnail` | Generate thumbnail | ✅ Active |
| DELETE | `/api/templates/{template_id}` | Delete template | ✅ Active |
| POST | `/api/templates/clear-cache` | Clear template cache | ✅ Active |

### 🎨 Canvas & Designs
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/designs/save-enhanced` | Save enhanced design | ✅ Active |
| POST | `/api/canvas/save` | Save canvas state | ✅ Active |
| GET | `/api/canvas/load` | Load canvas state | ✅ Active |
| DELETE | `/api/canvas/clear` | Clear canvas state | ✅ Active |

### 🤖 AI Integration
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/ai/chat` | AI chat endpoint | ✅ Active |
| POST | `/api/ai/design-assistance` | Design assistance | ✅ Active |
| POST | `/api/ai/order-assistance` | Order assistance | ✅ Active |
| POST | `/api/ai/banner-recommendations` | Banner recommendations | ✅ Active |
| GET | `/api/ai/health` | AI health check | ✅ Active |
| POST | `/api/ai/generate-banner` | Generate banner | ✅ Active |
| POST | `/api/ai/modify-design` | Modify design | ✅ Active |
| POST | `/api/ai/add-element` | Add element | ✅ Active |
| POST | `/api/ai/create-design` | Create design | ✅ Active |

### 🏢 Business Card Tins
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/business-card-tins/create` | Create tin order | ✅ Active |
| GET | `/api/business-card-tins/{tin_id}` | Get tin order | ✅ Active |
| GET | `/api/business-card-tins` | Get user tins | ✅ Active |
| PUT | `/api/business-card-tins/{tin_id}/design` | Update tin design | ✅ Active |
| PUT | `/api/business-card-tins/{tin_id}/status` | Update tin status | ✅ Active |
| DELETE | `/api/business-card-tins/{tin_id}` | Delete tin | ✅ Active |
| GET | `/api/business-card-tins/order/{order_id}` | Get tin by order | ✅ Active |

### 🛠️ System & Debug
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/debug` | Debug endpoint | ✅ Active |
| GET | `/api/debug/auth` | Auth debug | ✅ Active |
| GET | `/api/debug/auth-required` | Auth required debug | ✅ Active |
| GET | `/api/status` | API status | ✅ Active |
| GET | `/health` | Health check | ✅ Active |
| GET | `/` | Root endpoint | ✅ Active |
| GET | `/api/database/test` | Database test | ✅ Active |
| GET | `/api/auth/test` | Auth test | ✅ Active |
| GET | `/api/canvas/test` | Canvas test | ✅ Active |
| GET | `/api/templates/test` | Templates test | ✅ Active |
| GET | `/api/test/file-exists/{file_path:path}` | File exists test | ✅ Active |
| GET | `/api/test/thumbnail-dependencies` | Thumbnail test | ✅ Active |

### 🗄️ Cache Management
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/cache/stats` | Get cache stats | ✅ Active |
| POST | `/api/cache/clear` | Clear cache | ✅ Active |
| POST | `/api/cache/cleanup` | Cleanup cache | ✅ Active |
| DELETE | `/api/cache/invalidate/{cache_key}` | Invalidate cache key | ✅ Active |

### 📦 Products & Config
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/products` | Get products | ✅ Active |
| GET | `/api/config` | Get config | ✅ Active |

---

## 🎨 Creator Marketplace API (creator_marketplace.py)

### 👤 Creator Management
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/creator-marketplace/creators/database-status` | Check DB status | ✅ Active |
| POST | `/api/creator-marketplace/creators/quick-register` | Quick register | ✅ Active |
| POST | `/api/creator-marketplace/creators/register` | Register creator | ✅ Active |
| GET | `/api/creator-marketplace/creators/profile` | Get creator profile | ✅ Active |
| PUT | `/api/creator-marketplace/creators/profile` | Update profile | ✅ Active |
| POST | `/api/creator-marketplace/creators/upload-logo` | Upload logo | ✅ Active |
| GET | `/api/creator-marketplace/creators/analytics` | Get analytics | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}` | Get public profile | ✅ Active |

### 🎨 Template Management (Creator)
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/creator-marketplace/templates/upload` | Upload template | ✅ Active |
| POST | `/api/creator-marketplace/templates/upload-file` | Upload file template | ✅ Active |
| GET | `/api/creator-marketplace/templates/my-templates` | Get my templates | ✅ Active |
| GET | `/api/creator-marketplace/templates/marketplace` | Get marketplace | ✅ Active |
| GET | `/api/creator-marketplace/templates/{template_id}` | Get template details | ✅ Active |
| POST | `/api/creator-marketplace/templates/generate-thumbnail` | Generate thumbnail | ✅ Active |
| POST | `/api/creator-marketplace/templates/validate-image` | Validate image | ✅ Active |
| GET | `/api/creator-marketplace/templates/{template_id}/download` | Download template | ✅ Active |
| POST | `/api/creator-marketplace/templates/{template_id}/track-download` | Track download | ✅ Active |
| POST | `/api/creator-marketplace/templates/process-order-templates` | Process order | ✅ Active |
| GET | `/api/creator-marketplace/templates/{template_id}/protected-image` | Get protected image | ✅ Active |
| GET | `/api/creator-marketplace/templates/{template_id}/download-url` | Get download URL | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}/templates` | Get creator templates | ✅ Active |

### 💰 Purchases & Payments
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/creator-marketplace/templates/{template_id}/purchase` | Purchase template | ✅ Active |
| POST | `/api/creator-marketplace/payments/webhook` | Payment webhook | ✅ Active |
| GET | `/api/creator-marketplace/purchases/my-purchases` | Get my purchases | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}/earnings` | Get earnings | ✅ Active |

### 👑 Admin Functions
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/creator-marketplace/admin/pending-templates` | Get pending templates | ✅ Active |
| POST | `/api/creator-marketplace/admin/templates/{template_id}/approve` | Approve template | ✅ Active |
| POST | `/api/creator-marketplace/admin/templates/{template_id}/reject` | Reject template | ✅ Active |

---

## 👥 Creator Follower API (creator_follower_api.py)

### 🔗 Follow Management
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/creator-marketplace/creators/{creator_id}/follow` | Follow creator | ✅ Active |
| DELETE | `/api/creator-marketplace/creators/{creator_id}/follow` | Unfollow creator | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}/follow-status` | Check follow status | ✅ Active |
| GET | `/api/creator-marketplace/users/following` | Get following list | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}/followers` | Get followers | ✅ Active |

### 🔔 Notifications
| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/creator-marketplace/notifications` | Get notifications | ✅ Active |
| PUT | `/api/creator-marketplace/notifications/{notification_id}/read` | Mark as read | ✅ Active |
| PUT | `/api/creator-marketplace/notifications/read-all` | Mark all as read | ✅ Active |
| GET | `/api/creator-marketplace/creators/{creator_id}/notification-preferences` | Get preferences | ✅ Active |
| PUT | `/api/creator-marketplace/creators/{creator_id}/notification-preferences` | Update preferences | ✅ Active |

---

## 🍬 Business Card Tins API (business_card_tin_api.py)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/business-card-tins/candy-options` | Get candy options | ✅ Active |
| POST | `/api/business-card-tins/calculate-pricing` | Calculate pricing | ✅ Active |
| POST | `/api/business-card-tins/create-order` | Create order | ✅ Active |
| GET | `/api/business-card-tins/volume-discounts` | Get volume discounts | ✅ Active |

---

## 🎨 Tin Skinz API (tin_skinz_api.py)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/api/tin-skinz/designs` | Get designs | ✅ Active |
| GET | `/api/tin-skinz/candy-options` | Get candy options | ✅ Active |
| POST | `/api/tin-skinz/calculate-price` | Calculate price | ✅ Active |
| POST | `/api/tin-skinz/create-order` | Create order | ✅ Active |
| POST | `/api/tin-skinz/confirm-payment` | Confirm payment | ✅ Active |
| GET | `/api/tin-skinz/orders/{user_id}` | Get user orders | ✅ Active |

---

## 🚚 Shipping Costs API (shipping_costs_api.py)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/shipping-costs/get` | Get shipping costs | ✅ Active |
| POST | `/api/shipping-costs/validate` | Validate request | ✅ Active |
| GET | `/api/shipping-costs/health` | Health check | ✅ Active |
| GET | `/api/shipping-costs/playwright-status` | Playwright status | ✅ Active |
| POST | `/api/shipping-costs/test` | Test shipping | ✅ Active |
| POST | `/api/shipping-costs/tent` | Get tent shipping | ✅ Active |
| POST | `/api/shipping-costs/debug` | Debug shipping | ✅ Active |

---

## 📦 Tin Skinz Shipping API (tin_skinz_shipping_api.py)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| POST | `/api/tin-skinz-shipping/get-rates` | Get shipping rates | ✅ Active |
| GET | `/api/tin-skinz-shipping/health` | Health check | ✅ Active |
| POST | `/api/tin-skinz-shipping/ups-callback` | UPS webhook | ✅ Active |
| POST | `/api/tin-skinz-shipping/create-shipment` | Create shipment | ✅ Active |
| POST | `/api/tin-skinz-shipping/void-shipment` | Void shipment | ✅ Active |
| POST | `/api/tin-skinz-shipping/recover-label` | Recover label | ✅ Active |
| POST | `/api/tin-skinz-shipping/track` | Track shipment | ✅ Active |
| POST | `/api/tin-skinz-shipping/test` | Test UPS integration | ✅ Active |

---

## 🏢 B2Sign API (b2sign_api.py)

| Method | Endpoint | Purpose | Status |
|--------|----------|---------|--------|
| GET | `/` | Root endpoint | ✅ Active |
| GET | `/health` | Health check | ✅ Active |
| POST | `/api/v1/banner/shipping` | Banner shipping | ✅ Active |
| POST | `/api/v1/tent/shipping` | Tent shipping | ✅ Active |
| GET | `/api/v1/materials` | Get materials | ✅ Active |

---

## 🔍 Potential Issues Identified

### ⚠️ Duplicate Endpoints
1. **Template Thumbnails**:
   - `/api/templates/generate-thumbnail` (main.py)
   - `/api/creator-marketplace/templates/generate-thumbnail` (creator_marketplace.py)
   - **Issue**: Two different implementations for same functionality

2. **Template Details**:
   - `/api/templates/{template_id}` (main.py)
   - `/api/creator-marketplace/templates/{template_id}` (creator_marketplace.py)
   - **Issue**: Different template systems with same endpoint pattern

3. **Health Checks**:
   - `/health` (main.py)
   - `/api/status` (main.py)
   - `/api/shipping-costs/health` (shipping_costs_api.py)
   - `/api/tin-skinz-shipping/health` (tin_skinz_shipping_api.py)
   - `/health` (b2sign_api.py)
   - **Issue**: Multiple health check endpoints

### 🗑️ Potentially Orphaned Endpoints
1. **Test Endpoints**:
   - `/api/debug/auth`
   - `/api/debug/auth-required`
   - `/api/database/test`
   - `/api/auth/test`
   - `/api/canvas/test`
   - `/api/templates/test`
   - `/api/test/file-exists/{file_path:path}`
   - `/api/test/thumbnail-dependencies`
   - **Issue**: Debug/test endpoints in production

2. **Cache Management**:
   - `/api/cache/stats`
   - `/api/cache/clear`
   - `/api/cache/cleanup`
   - `/api/cache/invalidate/{cache_key}`
   - **Issue**: Internal cache management exposed

### 🔄 Inconsistent Patterns
1. **Template Systems**:
   - Original: `/api/templates/*`
   - Creator: `/api/creator-marketplace/templates/*`
   - **Issue**: Two separate template systems

2. **Payment Webhooks**:
   - `/api/payments/webhook` (main.py)
   - `/api/creator-marketplace/payments/webhook` (creator_marketplace.py)
   - **Issue**: Two webhook endpoints

---

## 📋 Next Steps

1. **Test All Endpoints** - Verify functionality
2. **Consolidate Duplicates** - Merge or deprecate duplicate endpoints
3. **Remove Orphaned Code** - Clean up test/debug endpoints
4. **Standardize Patterns** - Consistent API design
5. **Document Dependencies** - Map endpoint relationships
6. **Create API Versioning** - Plan for future changes

---

## 🧪 Testing Plan

### Phase 1: Core Functionality
- [ ] Authentication endpoints
- [ ] User management
- [ ] Template systems (both)
- [ ] Order processing

### Phase 2: Specialized Features
- [ ] Creator marketplace
- [ ] Follower system
- [ ] AI integration
- [ ] Shipping calculations

### Phase 3: Integration Testing
- [ ] End-to-end workflows
- [ ] Cross-system dependencies
- [ ] Error handling
- [ ] Performance testing

---

*This audit will be updated as endpoints are tested and cleaned up.*
