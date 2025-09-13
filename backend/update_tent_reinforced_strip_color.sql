-- 🚀 GALACTIC FEDERATION: REINFORCED STRIP COLOR INTEGRATION
-- Add reinforced strip color option to existing tent empire database
-- This is a default included option (not a paid accessory)

-- ========================================
-- 1. ADD REINFORCED STRIP COLOR TO TRADESHOW TENTS TABLE
-- ========================================

-- Add reinforced strip color column to tradeshow_tents table
ALTER TABLE tradeshow_tents 
ADD COLUMN IF NOT EXISTS reinforced_strip_color VARCHAR(10) DEFAULT 'white' 
CHECK (reinforced_strip_color IN ('white', 'black'));

-- Add tent package type column to tradeshow_tents table
ALTER TABLE tradeshow_tents 
ADD COLUMN IF NOT EXISTS tent_package VARCHAR(30) DEFAULT 'complete-tent' 
CHECK (tent_package IN ('complete-tent', 'canopy-graphic-only'));

-- Add wall option column to tradeshow_tents table
ALTER TABLE tradeshow_tents 
ADD COLUMN IF NOT EXISTS wall_option VARCHAR(20) DEFAULT 'no-walls' 
CHECK (wall_option IN ('no-walls', 'half-walls', 'full-walls'));

-- ========================================
-- 2. ADD REINFORCED STRIP COLOR TO ORDERS TABLE
-- ========================================

-- Add reinforced strip color column to orders table for tent orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tent_reinforced_strip_color VARCHAR(10) DEFAULT 'white' 
CHECK (tent_reinforced_strip_color IN ('white', 'black'));

-- Add tent package type column to orders table for tent orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tent_package VARCHAR(30) DEFAULT 'complete-tent' 
CHECK (tent_package IN ('complete-tent', 'canopy-graphic-only'));

-- Add wall option column to orders table for tent orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tent_wall_option VARCHAR(20) DEFAULT 'no-walls' 
CHECK (tent_wall_option IN ('no-walls', 'half-walls', 'full-walls'));

-- ========================================
-- 3. UPDATE VALIDATION FUNCTION
-- ========================================

-- Update the tent order validation function to include reinforced strip color
CREATE OR REPLACE FUNCTION validate_tent_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_type = 'tradeshow_tent' THEN
        IF NEW.tent_size IS NULL OR NEW.tent_size NOT IN ('10x10', '10x20') THEN
            RAISE EXCEPTION 'Invalid tent size for tradeshow tent order';
        END IF;
        
        IF NEW.tent_type IS NULL THEN NEW.tent_type := 'event-tent'; END IF;
        IF NEW.tent_material IS NULL THEN NEW.tent_material := '6oz-tent-fabric'; END IF;
        IF NEW.tent_frame_type IS NULL THEN NEW.tent_frame_type := '40mm-aluminum-hex'; END IF;
        IF NEW.tent_print_method IS NULL THEN NEW.tent_print_method := 'dye-sublimation'; END IF;
        IF NEW.tent_accessories IS NULL THEN NEW.tent_accessories := '[]'; END IF;
        IF NEW.tent_reinforced_strip_color IS NULL THEN NEW.tent_reinforced_strip_color := 'white'; END IF;
        IF NEW.tent_package IS NULL THEN NEW.tent_package := 'complete-tent'; END IF;
        IF NEW.tent_wall_option IS NULL THEN NEW.tent_wall_option := 'no-walls'; END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. UPDATE TENT ORDER SUMMARY FUNCTION
-- ========================================

-- Drop the existing function first (since we're changing the return type)
DROP FUNCTION IF EXISTS get_tent_order_summary(UUID);

-- Recreate the function to get tent order summary to include reinforced strip color
CREATE OR REPLACE FUNCTION get_tent_order_summary(order_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    tent_size VARCHAR,
    tent_type VARCHAR,
    material VARCHAR,
    frame_type VARCHAR,
    print_method VARCHAR,
    accessories JSONB,
    reinforced_strip_color VARCHAR,
    tent_package VARCHAR,
    wall_option VARCHAR,
    base_price DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL,
    surface_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.tent_size,
        o.tent_type,
        o.tent_material,
        o.tent_frame_type,
        o.tent_print_method,
        o.tent_accessories,
        o.tent_reinforced_strip_color,
        o.tent_package,
        o.tent_wall_option,
        tt.base_price,
        tt.accessories_total,
        tt.total_price,
        CASE 
            WHEN tt.surface_designs IS NOT NULL THEN 
                jsonb_array_length(jsonb_object_keys(tt.surface_designs))
            ELSE 0
        END as surface_count
    FROM orders o
    LEFT JOIN tradeshow_tents tt ON o.id = tt.order_id
    WHERE o.id = order_uuid AND o.product_type = 'tradeshow_tent';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. UPDATE TENT ORDERS VIEW
-- ========================================

-- Drop the existing view first (since we're changing the column structure)
DROP VIEW IF EXISTS tent_orders_view;

-- Recreate the tent orders view to include reinforced strip color
CREATE OR REPLACE VIEW tent_orders_view AS
SELECT 
    o.id as order_id,
    o.user_id,
    o.product_type,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.tent_size,
    o.tent_type,
    o.tent_material,
    o.tent_frame_type,
    o.tent_print_method,
    o.tent_accessories,
    o.tent_reinforced_strip_color,
    o.tent_package,
    o.tent_wall_option,
    o.product_metadata,
    tt.id as tent_id,
    tt.surface_designs,
    tt.base_price,
    tt.accessories_total,
    tt.file_setup,
    tt.reinforced_strip_color,
    tt.wall_option
FROM orders o
LEFT JOIN tradeshow_tents tt ON o.id = tt.order_id
WHERE o.product_type = 'tradeshow_tent';

-- ========================================
-- 6. ADD COMMENTS AND DOCUMENTATION
-- ========================================

-- Add comments explaining the new options
COMMENT ON COLUMN tradeshow_tents.reinforced_strip_color IS 'Default included reinforced strip color option: white or black';
COMMENT ON COLUMN tradeshow_tents.tent_package IS 'Tent package type: complete-tent or canopy-graphic-only';
COMMENT ON COLUMN tradeshow_tents.wall_option IS 'Wall option: no-walls, half-walls, or full-walls';
COMMENT ON COLUMN orders.tent_reinforced_strip_color IS 'Default included reinforced strip color option for tent orders: white or black';
COMMENT ON COLUMN orders.tent_package IS 'Tent package type for tent orders: complete-tent or canopy-graphic-only';
COMMENT ON COLUMN orders.tent_wall_option IS 'Wall option for tent orders: no-walls, half-walls, or full-walls';

-- ========================================
-- 7. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🚀 GALACTIC FEDERATION: TENT DESIGN OPTIONS INTEGRATION COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Added tent design options:';
    RAISE NOTICE '   - tradeshow_tents.reinforced_strip_color (default: white)';
    RAISE NOTICE '   - tradeshow_tents.tent_package (default: complete-tent)';
    RAISE NOTICE '   - tradeshow_tents.wall_option (default: no-walls)';
    RAISE NOTICE '   - orders.tent_reinforced_strip_color (default: white)';
    RAISE NOTICE '   - orders.tent_package (default: complete-tent)';
    RAISE NOTICE '   - orders.tent_wall_option (default: no-walls)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Package Types Available:';
    RAISE NOTICE '   - complete-tent: Full tent with frame and canopy';
    RAISE NOTICE '   - canopy-graphic-only: Just the printed canopy (for existing frames)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Wall Options Available:';
    RAISE NOTICE '   - no-walls: Canopy only (default)';
    RAISE NOTICE '   - half-walls: Half-height sidewalls ($175.00)';
    RAISE NOTICE '   - full-walls: Full-height sidewalls ($230.00)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Updated functions:';
    RAISE NOTICE '   - validate_tent_order() - includes all new options validation';
    RAISE NOTICE '   - get_tent_order_summary() - includes all new options';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Updated views:';
    RAISE NOTICE '   - tent_orders_view - includes all new options';
    RAISE NOTICE '';
    RAISE NOTICE '🌙 TENT DESIGN OPTIONS READY FOR GALACTIC DOMINATION! 🚀';
END $$;
