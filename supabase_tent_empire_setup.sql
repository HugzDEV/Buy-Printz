-- 🚀 GALACTIC FEDERATION: COMPLETE TENT EMPIRE DATABASE SETUP
-- This script sets up the complete database infrastructure for our tent empire!

-- ========================================
-- 1. CREATE TRADESHOW TENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS tradeshow_tents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Tent Specifications
    tent_size VARCHAR(20) NOT NULL CHECK (tent_size IN ('10x10', '10x20')),
    tent_type VARCHAR(50) NOT NULL DEFAULT 'event-tent',
    material VARCHAR(50) NOT NULL DEFAULT '6oz-tent-fabric',
    frame_type VARCHAR(50) NOT NULL DEFAULT '40mm-aluminum-hex',
    print_method VARCHAR(50) NOT NULL DEFAULT 'dye-sublimation',
    
    -- Surface Designs (JSONB for all 7 surfaces)
    surface_designs JSONB NOT NULL DEFAULT '{}',
    
    -- Accessories
    accessories JSONB DEFAULT '[]',
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    accessories_total DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- File Setup and Specifications
    file_setup JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. UPDATE ORDERS TABLE FOR TENT SUPPORT
-- ========================================

-- Update product_type constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_product_type_check 
    CHECK (product_type IN ('banner', 'business_card_tin', 'tradeshow_tent'));

-- Add tent-specific columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_size VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_material VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_frame_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_print_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_accessories JSONB DEFAULT '[]';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_metadata JSONB DEFAULT '{}';

-- ========================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Tradeshow tents indexes
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_order_id ON tradeshow_tents(order_id);
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_tent_size ON tradeshow_tents(tent_size);
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_created_at ON tradeshow_tents(created_at);

-- Orders tent indexes
CREATE INDEX IF NOT EXISTS idx_orders_tent_size ON orders(tent_size) WHERE product_type = 'tradeshow_tent';
CREATE INDEX IF NOT EXISTS idx_orders_tent_type ON orders(tent_type) WHERE product_type = 'tradeshow_tent';

-- ========================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on tradeshow_tents
ALTER TABLE tradeshow_tents ENABLE ROW LEVEL SECURITY;

-- Tradeshow tents policies
CREATE POLICY "Users can view own tent orders" ON tradeshow_tents
    FOR SELECT USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can insert own tent orders" ON tradeshow_tents
    FOR INSERT WITH CHECK (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update own tent orders" ON tradeshow_tents
    FOR UPDATE USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete own tent orders" ON tradeshow_tents
    FOR DELETE USING (
        order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    );

CREATE POLICY "Service role full access" ON tradeshow_tents
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- 5. TRIGGERS AND FUNCTIONS
-- ========================================

-- Updated_at trigger for tradeshow_tents
CREATE OR REPLACE FUNCTION update_tradeshow_tents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tradeshow_tents_updated_at
    BEFORE UPDATE ON tradeshow_tents
    FOR EACH ROW
    EXECUTE FUNCTION update_tradeshow_tents_updated_at();

-- Tent order validation function
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
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_tent_order_trigger ON orders;
CREATE TRIGGER validate_tent_order_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_tent_order();

-- ========================================
-- 6. UTILITY FUNCTIONS
-- ========================================

-- Function to calculate tent pricing
CREATE OR REPLACE FUNCTION calculate_tent_price(
    p_tent_size VARCHAR,
    p_accessories JSONB DEFAULT '[]'
)
RETURNS TABLE (
    base_price DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL;
    v_accessories_total DECIMAL := 0;
    v_accessory JSONB;
BEGIN
    -- Set base price based on tent size
    IF p_tent_size = '10x10' THEN
        v_base_price := 299.99;
    ELSIF p_tent_size = '10x20' THEN
        v_base_price := 499.99;
    ELSE
        RAISE EXCEPTION 'Invalid tent size: %', p_tent_size;
    END IF;
    
    -- Calculate accessories total
    FOR v_accessory IN SELECT jsonb_array_elements(p_accessories)
    LOOP
        CASE v_accessory::text
            WHEN '"carrying-bag"' THEN v_accessories_total := v_accessories_total + 49.99;
            WHEN '"sandbags"' THEN v_accessories_total := v_accessories_total + 24.99;
            WHEN '"ropes-stakes"' THEN v_accessories_total := v_accessories_total + 19.99;
            WHEN '"full-wall"' THEN v_accessories_total := v_accessories_total + 199.99;
            WHEN '"half-wall"' THEN v_accessories_total := v_accessories_total + 149.99;
        END CASE;
    END LOOP;
    
    RETURN QUERY SELECT v_base_price, v_accessories_total, v_base_price + v_accessories_total;
END;
$$ LANGUAGE plpgsql;

-- Function to get tent order summary
CREATE OR REPLACE FUNCTION get_tent_order_summary(order_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    tent_size VARCHAR,
    tent_type VARCHAR,
    material VARCHAR,
    frame_type VARCHAR,
    print_method VARCHAR,
    accessories JSONB,
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
-- 7. VIEWS FOR EASY DATA ACCESS
-- ========================================

-- Tent orders view
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
    o.product_metadata,
    tt.id as tent_id,
    tt.surface_designs,
    tt.base_price,
    tt.accessories_total,
    tt.file_setup
FROM orders o
LEFT JOIN tradeshow_tents tt ON o.id = tt.order_id
WHERE o.product_type = 'tradeshow_tent';

-- Tent surface specifications view
CREATE OR REPLACE VIEW tent_surface_specs AS
SELECT 
    'canopy_front' as surface_id,
    'Canopy Front' as surface_name,
    1160 as width,
    789 as height,
    'triangular' as shape
UNION ALL
SELECT 'canopy_back', 'Canopy Back', 1160, 789, 'triangular'
UNION ALL
SELECT 'canopy_left', 'Canopy Left', 1160, 789, 'triangular'
UNION ALL
SELECT 'canopy_right', 'Canopy Right', 1160, 789, 'triangular'
UNION ALL
SELECT 'sidewall_left', 'Left Sidewall', 1110, 390, 'rectangular'
UNION ALL
SELECT 'sidewall_right', 'Right Sidewall', 1110, 390, 'rectangular'
UNION ALL
SELECT 'backwall', 'Back Wall', 1110, 780, 'rectangular';

-- ========================================
-- 8. PERMISSIONS AND GRANTS
-- ========================================

-- Grant permissions
GRANT SELECT ON tent_orders_view TO authenticated;
GRANT SELECT ON tent_surface_specs TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_tent_price(VARCHAR, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_tent_order_summary(UUID) TO authenticated;

-- ========================================
-- 9. COMMENTS AND DOCUMENTATION
-- ========================================

COMMENT ON TABLE tradeshow_tents IS 'Stores tradeshow tent orders with multi-surface designs and accessories';
COMMENT ON COLUMN tradeshow_tents.tent_size IS 'Tent size: 10x10 or 10x20 feet';
COMMENT ON COLUMN tradeshow_tents.surface_designs IS 'JSONB object containing designs for all 7 tent surfaces';
COMMENT ON COLUMN tradeshow_tents.accessories IS 'JSONB array of selected accessories';
COMMENT ON COLUMN tradeshow_tents.file_setup IS 'JSONB object containing file specifications and print requirements';

COMMENT ON COLUMN orders.tent_size IS 'Tent size for tradeshow tent orders (10x10, 10x20)';
COMMENT ON COLUMN orders.tent_type IS 'Tent type (event-tent, etc.)';
COMMENT ON COLUMN orders.tent_material IS 'Tent material specification';
COMMENT ON COLUMN orders.tent_frame_type IS 'Tent frame type specification';
COMMENT ON COLUMN orders.tent_print_method IS 'Tent printing method';
COMMENT ON COLUMN orders.tent_accessories IS 'Selected tent accessories as JSONB array';
COMMENT ON COLUMN orders.product_metadata IS 'Product-specific metadata for all product types';

-- ========================================
-- 10. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🚀 GALACTIC FEDERATION: TENT EMPIRE DATABASE SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables Created:';
    RAISE NOTICE '   - tradeshow_tents (main tent orders table)';
    RAISE NOTICE '   - Updated orders table with tent support';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Features Added:';
    RAISE NOTICE '   - 7-surface design support (4 canopy + 2 sidewalls + 1 backwall)';
    RAISE NOTICE '   - Accessory management (carrying-bag, sandbags, ropes-stakes, walls)';
    RAISE NOTICE '   - Dynamic pricing calculation';
    RAISE NOTICE '   - File setup specifications';
    RAISE NOTICE '   - RLS security policies';
    RAISE NOTICE '   - Performance indexes';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Functions Available:';
    RAISE NOTICE '   - calculate_tent_price() - Dynamic pricing';
    RAISE NOTICE '   - get_tent_order_summary() - Order summaries';
    RAISE NOTICE '   - validate_tent_order() - Order validation';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Views Created:';
    RAISE NOTICE '   - tent_orders_view - Complete tent order data';
    RAISE NOTICE '   - tent_surface_specs - Surface specifications';
    RAISE NOTICE '';
    RAISE NOTICE '🌙 TENT EMPIRE READY FOR GALACTIC DOMINATION! 🚀';
END $$;
