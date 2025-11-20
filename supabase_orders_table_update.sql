-- 🎨 SUPABASE ORDERS TABLE UPDATE FOR CANVAS IMAGE STORAGE
-- This script updates the orders table to support all the fields needed for canvas image storage
-- Run this SQL in your Supabase SQL Editor

-- ========================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ========================================

-- Add banner-specific columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_type VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_material VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_finish VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_size VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_category VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS background_color VARCHAR(20) DEFAULT '#ffffff';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_options JSONB DEFAULT '{}';

-- Add tent-specific columns (if not already added)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_size VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_material VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_frame_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_print_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_accessories JSONB DEFAULT '[]';

-- Add tin-specific columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tin_quantity INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tin_surface_coverage VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tin_finish VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tin_printing_method VARCHAR(50);

-- Add design option columns for multi-surface products
ALTER TABLE orders ADD COLUMN IF NOT EXISTS design_option VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_design_option VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tin_surface_coverage VARCHAR(50);

-- Add marketplace template support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS marketplace_templates JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS marketplace_cost DECIMAL(10,2) DEFAULT 0.00;

-- ========================================
-- 2. ENSURE ORDER_DETAILS COLUMN EXISTS
-- ========================================

-- Add the crucial order_details field to store canvas_image and comprehensive order data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_details JSONB;

-- ========================================
-- 3. ADD INDEXES FOR PERFORMANCE
-- ========================================

-- Index for order_details queries (especially for canvas_image searches)
CREATE INDEX IF NOT EXISTS idx_orders_order_details ON orders USING GIN (order_details);

-- Indexes for banner fields
CREATE INDEX IF NOT EXISTS idx_orders_banner_type ON orders(banner_type) WHERE product_type = 'banner';
CREATE INDEX IF NOT EXISTS idx_orders_banner_size ON orders(banner_size) WHERE product_type = 'banner';

-- Indexes for tent fields
CREATE INDEX IF NOT EXISTS idx_orders_tent_size ON orders(tent_size) WHERE product_type = 'tradeshow_tent';
CREATE INDEX IF NOT EXISTS idx_orders_tent_type ON orders(tent_type) WHERE product_type = 'tradeshow_tent';

-- Indexes for tin fields
CREATE INDEX IF NOT EXISTS idx_orders_tin_quantity ON orders(tin_quantity) WHERE product_type = 'business_card_tin';
CREATE INDEX IF NOT EXISTS idx_orders_tin_surface_coverage ON orders(tin_surface_coverage) WHERE product_type = 'business_card_tin';

-- ========================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON COLUMN orders.order_details IS 'JSONB field containing canvas_image, surface_images, surface_elements, and comprehensive order metadata for design tracking';
COMMENT ON COLUMN orders.banner_type IS 'Banner type specification (vinyl-13oz, fabric-9oz, etc.)';
COMMENT ON COLUMN orders.banner_material IS 'Banner material description';
COMMENT ON COLUMN orders.banner_finish IS 'Banner finish specification (Matte, Glossy, etc.)';
COMMENT ON COLUMN orders.banner_size IS 'Banner size specification';
COMMENT ON COLUMN orders.banner_category IS 'Banner category (Indoor, Outdoor, etc.)';
COMMENT ON COLUMN orders.background_color IS 'Canvas background color';
COMMENT ON COLUMN orders.print_options IS 'Print options and specifications as JSONB';
COMMENT ON COLUMN orders.design_option IS 'Design option for multi-surface products';
COMMENT ON COLUMN orders.tent_design_option IS 'Tent-specific design option';
COMMENT ON COLUMN orders.marketplace_templates IS 'Marketplace templates used in the design';
COMMENT ON COLUMN orders.marketplace_cost IS 'Total cost of marketplace templates';

-- ========================================
-- 5. UPDATE PRODUCT TYPE CONSTRAINT
-- ========================================

-- Update product_type constraint to include all supported types
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_product_type_check 
    CHECK (product_type IN ('banner', 'business_card_tin', 'tradeshow_tent', 'sign', 'sticker', 'custom'));

-- ========================================
-- 6. EXAMPLE ORDER_DETAILS STRUCTURE
-- ========================================

-- Example structure of order_details for reference:
-- {
--   "canvas_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
--   "surface_images": {
--     "canopy_front": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
--     "canopy_back": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
--     "canopy_left": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
--     "canopy_right": "data:image/png;base64,iVBORw0KGgoAAAANSUhE..."
--   },
--   "surface_elements": {
--     "canopy_front": [...],
--     "canopy_back": [...],
--     "canopy_left": [...],
--     "canopy_right": [...]
--   },
--   "banner_size": "4ft x 2ft (landscape)",
--   "banner_type": "vinyl-13oz",
--   "banner_material": "13oz Vinyl",
--   "banner_finish": "Matte",
--   "banner_category": "Outdoor",
--   "background_color": "#ffffff",
--   "print_options": {"grommets": "every-2ft", "hem": "standard-hem"},
--   "dimensions": {"width": 800, "height": 600},
--   "canvas_data": {"elements": [...], "canvasSize": {...}, "backgroundColor": "#ffffff"},
--   "design_option": "canopy-only",
--   "tent_design_option": "canopy-only",
--   "tin_surface_coverage": "front-back",
--   "marketplace_templates": []
-- }

-- This field is essential for:
-- 1. Storing canvas images for consistent preview display
-- 2. Supporting multi-surface products (tents, tins)
-- 3. Storing comprehensive order metadata
-- 4. Enabling the print preview and approval workflow
-- 5. Supporting marketplace template integration
