-- Critical Missing Field: Add order_details to orders table
-- This is required for canvas_image storage in completed designs
-- Run this SQL in your Supabase SQL Editor

-- Add the crucial order_details field to store canvas_image and comprehensive order data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_details JSONB;

-- Add index for order_details queries (especially for canvas_image searches)
CREATE INDEX IF NOT EXISTS idx_orders_order_details ON orders USING GIN (order_details);

-- Comment explaining the purpose
COMMENT ON COLUMN orders.order_details IS 'JSONB field containing canvas_image, banner specifications, and comprehensive order metadata for design tracking';

-- Example structure of order_details:
-- {
--   "canvas_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhE...",
--   "banner_size": "4ft x 2ft (landscape)",
--   "banner_type": "vinyl-13oz",
--   "banner_material": "13oz Vinyl",
--   "banner_finish": "Matte",
--   "banner_category": "Outdoor",
--   "background_color": "#ffffff",
--   "print_options": {"grommets": "every-2ft", "hem": "standard-hem"},
--   "dimensions": {"width": 800, "height": 600},
--   "canvas_data": {"elements": [...], "canvasSize": {...}, "backgroundColor": "#ffffff"}
-- }

-- This field is essential for:
-- 1. Displaying unique canvas images in the My Designs dashboard
-- 2. Storing comprehensive order metadata for completed designs
-- 3. Supporting the print preview and approval workflow
