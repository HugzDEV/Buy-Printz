-- 🏕️ UPDATE SUPABASE TENT PRICING TO MATCH TENTCHECKOUT.JSX
-- This script updates the tent pricing functions to match the current TentCheckout.jsx pricing structure

-- ========================================
-- 1. CREATE/UPDATE TENT PRICING FUNCTION
-- ========================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS calculate_tent_price(VARCHAR, JSONB);
DROP FUNCTION IF EXISTS calculate_canopy_only_price(VARCHAR, JSONB);

-- Create updated tent pricing function that matches TentCheckout.jsx
CREATE OR REPLACE FUNCTION calculate_tent_price(
    p_tent_size VARCHAR,
    p_with_frame BOOLEAN DEFAULT true,
    p_surfaces JSONB DEFAULT '{"canopy": true, "sidewalls": false, "backwall": false}',
    p_accessories JSONB DEFAULT '[]'
)
RETURNS TABLE (
    base_price DECIMAL,
    surface_additions DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL := 0;
    v_surface_additions DECIMAL := 0;
    v_accessories_total DECIMAL := 0;
    v_accessory JSONB;
    v_has_backwall BOOLEAN;
    v_has_sidewalls BOOLEAN;
BEGIN
    -- Extract surface options
    v_has_backwall := COALESCE((p_surfaces->>'backwall')::boolean, false);
    v_has_sidewalls := COALESCE((p_surfaces->>'sidewalls')::boolean, false);
    
    -- Set base price based on frame option
    IF p_with_frame THEN
        -- Complete tent with frame pricing
        v_base_price := 599.00;
        
        -- Add costs for additional surfaces (with frame pricing)
        IF v_has_backwall AND NOT v_has_sidewalls THEN
            v_surface_additions := v_surface_additions + 201.00; -- Just backwall
        ELSIF v_has_sidewalls AND NOT v_has_backwall THEN
            v_surface_additions := v_surface_additions + 151.00; -- Just sidewalls
        ELSIF v_has_sidewalls AND v_has_backwall THEN
            v_surface_additions := v_surface_additions + 301.00; -- Full walls
        END IF;
    ELSE
        -- Graphic only (no frame) pricing
        v_base_price := 325.00; -- Base canopy graphic
        
        -- Add costs for additional surfaces (graphic only pricing)
        IF v_has_backwall THEN
            v_surface_additions := v_surface_additions + 175.00; -- Backwall graphic
        END IF;
        IF v_has_sidewalls THEN
            v_surface_additions := v_surface_additions + 230.00; -- Sidewalls graphic
        END IF;
    END IF;
    
    -- Calculate accessories total
    FOR v_accessory IN SELECT jsonb_array_elements(p_accessories)
    LOOP
        CASE v_accessory::text
            WHEN '"carrying-bag-wheels"' THEN v_accessories_total := v_accessories_total + 74.99;
            WHEN '"sandbags"' THEN v_accessories_total := v_accessories_total + 60.00;
            WHEN '"carrying-bag"' THEN v_accessories_total := v_accessories_total + 49.99;
            WHEN '"ropes-stakes"' THEN v_accessories_total := v_accessories_total + 19.99;
        END CASE;
    END LOOP;
    
    RETURN QUERY SELECT 
        v_base_price, 
        v_surface_additions, 
        v_accessories_total, 
        v_base_price + v_surface_additions + v_accessories_total;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 2. CREATE TENT PRICING LOOKUP TABLE
-- ========================================

-- Create a table to store tent pricing configurations
CREATE TABLE IF NOT EXISTS tent_pricing_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tent_size VARCHAR(20) NOT NULL,
    with_frame BOOLEAN NOT NULL,
    has_backwall BOOLEAN NOT NULL DEFAULT false,
    has_sidewalls BOOLEAN NOT NULL DEFAULT false,
    base_price DECIMAL(10,2) NOT NULL,
    surface_additions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_tent_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data
TRUNCATE TABLE tent_pricing_config;

-- Insert pricing configurations that match TentCheckout.jsx
INSERT INTO tent_pricing_config (tent_size, with_frame, has_backwall, has_sidewalls, base_price, surface_additions, total_tent_price) VALUES
-- GRAPHIC ONLY (no frame) pricing
('10x10', false, false, false, 325.00, 0.00, 325.00),      -- Canopy only
('10x10', false, true, false, 325.00, 175.00, 500.00),     -- Canopy + backwall
('10x10', false, false, true, 325.00, 230.00, 555.00),     -- Canopy + sidewalls
('10x10', false, true, true, 325.00, 405.00, 730.00),      -- Canopy + backwall + sidewalls

-- COMPLETE TENT (with frame) pricing
('10x10', true, false, false, 599.00, 0.00, 599.00),       -- Complete tent (canopy only)
('10x10', true, true, false, 599.00, 201.00, 800.00),      -- Complete tent + backwall
('10x10', true, false, true, 599.00, 151.00, 750.00),      -- Complete tent + sidewalls
('10x10', true, true, true, 599.00, 301.00, 900.00),       -- Complete tent + full walls

-- 10x20 pricing (same structure, different base if needed)
('10x20', false, false, false, 325.00, 0.00, 325.00),      -- Canopy only
('10x20', false, true, false, 325.00, 175.00, 500.00),     -- Canopy + backwall
('10x20', false, false, true, 325.00, 230.00, 555.00),     -- Canopy + sidewalls
('10x20', false, true, true, 325.00, 405.00, 730.00),      -- Canopy + backwall + sidewalls
('10x20', true, false, false, 599.00, 0.00, 599.00),       -- Complete tent (canopy only)
('10x20', true, true, false, 599.00, 201.00, 800.00),      -- Complete tent + backwall
('10x20', true, false, true, 599.00, 151.00, 750.00),      -- Complete tent + sidewalls
('10x20', true, true, true, 599.00, 301.00, 900.00);       -- Complete tent + full walls

-- ========================================
-- 3. CREATE ACCESSORIES PRICING TABLE
-- ========================================

-- Create a table for tent accessories pricing
CREATE TABLE IF NOT EXISTS tent_accessories_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    accessory_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    available_for_graphic_only BOOLEAN DEFAULT true,
    available_for_complete_tent BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data
TRUNCATE TABLE tent_accessories_config;

-- Insert accessories that match TentCheckout.jsx
INSERT INTO tent_accessories_config (accessory_id, name, description, price, available_for_graphic_only, available_for_complete_tent) VALUES
('carrying-bag-wheels', 'Carrying Bag w/ Wheels', 'Premium wheeled bag for easy transport (upgrade from standard bag)', 74.99, true, true),
('sandbags', 'Sandbags', 'Heavy-duty sandbags for tent stability (sand not included)', 60.00, true, false),
('carrying-bag', 'Standard Carrying Bag', 'Basic carrying bag for transport', 49.99, true, false),
('ropes-stakes', 'Ropes & Stakes', 'Professional tent ropes and stakes', 19.99, true, false);

-- ========================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_tent_pricing_config_lookup ON tent_pricing_config(tent_size, with_frame, has_backwall, has_sidewalls);
CREATE INDEX IF NOT EXISTS idx_tent_accessories_config_id ON tent_accessories_config(accessory_id);

-- ========================================
-- 5. CREATE HELPER FUNCTION TO GET PRICING
-- ========================================

-- Function to get tent pricing by configuration
CREATE OR REPLACE FUNCTION get_tent_pricing(
    p_tent_size VARCHAR,
    p_with_frame BOOLEAN,
    p_has_backwall BOOLEAN DEFAULT false,
    p_has_sidewalls BOOLEAN DEFAULT false
)
RETURNS TABLE (
    tent_size VARCHAR,
    with_frame BOOLEAN,
    has_backwall BOOLEAN,
    has_sidewalls BOOLEAN,
    base_price DECIMAL,
    surface_additions DECIMAL,
    total_tent_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tpc.tent_size,
        tpc.with_frame,
        tpc.has_backwall,
        tpc.has_sidewalls,
        tpc.base_price,
        tpc.surface_additions,
        tpc.total_tent_price
    FROM tent_pricing_config tpc
    WHERE tpc.tent_size = p_tent_size
      AND tpc.with_frame = p_with_frame
      AND tpc.has_backwall = p_has_backwall
      AND tpc.has_sidewalls = p_has_sidewalls;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. GRANT PERMISSIONS
-- ========================================

-- Grant permissions to authenticated users
GRANT SELECT ON tent_pricing_config TO authenticated;
GRANT SELECT ON tent_accessories_config TO authenticated;

-- Enable RLS
ALTER TABLE tent_pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tent_accessories_config ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for tent pricing" ON tent_pricing_config
    FOR SELECT USING (true);

CREATE POLICY "Public read access for tent accessories" ON tent_accessories_config
    FOR SELECT USING (true);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Test the pricing function
SELECT * FROM calculate_tent_price('10x10', true, '{"canopy": true, "sidewalls": false, "backwall": false}', '[]');
SELECT * FROM calculate_tent_price('10x10', false, '{"canopy": true, "sidewalls": true, "backwall": true}', '["carrying-bag-wheels"]');

-- Test the pricing lookup
SELECT * FROM get_tent_pricing('10x10', true, false, false);
SELECT * FROM get_tent_pricing('10x10', false, true, true);

-- View all pricing configurations
SELECT 
    tent_size,
    CASE WHEN with_frame THEN 'Complete Tent' ELSE 'Graphic Only' END as package_type,
    CASE 
        WHEN has_backwall AND has_sidewalls THEN 'Canopy + Backwall + Sidewalls'
        WHEN has_backwall THEN 'Canopy + Backwall'
        WHEN has_sidewalls THEN 'Canopy + Sidewalls'
        ELSE 'Canopy Only'
    END as surface_config,
    base_price,
    surface_additions,
    total_tent_price
FROM tent_pricing_config
ORDER BY tent_size, with_frame DESC, total_tent_price;

-- View all accessories
SELECT accessory_id, name, price, description FROM tent_accessories_config ORDER BY price;
