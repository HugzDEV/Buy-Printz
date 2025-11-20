-- 🎨 UPDATE SUPABASE BANNER PRICING TO MATCH CHECKOUT.JSX
-- This script updates the banner pricing functions to match the current Checkout.jsx pricing structure

-- ========================================
-- 1. MATERIAL PRICING TABLE
-- ========================================

-- Create material pricing table that matches Checkout.jsx
CREATE TABLE IF NOT EXISTS banner_material_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material VARCHAR(50) NOT NULL UNIQUE,
    price_per_sqft DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data and insert current pricing from Checkout.jsx
TRUNCATE TABLE banner_material_pricing;

INSERT INTO banner_material_pricing (material, price_per_sqft, description) VALUES
('13oz-vinyl', 1.60, 'Standard outdoor vinyl'),
('18oz-blackout', 2.50, 'Heavy-duty blackout material'),
('mesh', 1.80, 'Wind-resistant mesh'),
('indoor', 2.50, 'Premium indoor material'),
('pole', 3.00, 'Durable pole banner material'),
('9oz-fabric', 2.75, 'Lightweight fabric'),
('blockout-fabric', 7.00, 'Premium blockout fabric'),
('tension-fabric', 5.15, 'Professional tension fabric'),
('backlit', 7.00, 'Premium backlit material');

-- ========================================
-- 2. BANNER OPTIONS PRICING CONFIGURATION
-- ========================================

-- Create table for banner option pricing rules
CREATE TABLE IF NOT EXISTS banner_option_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    option_category VARCHAR(50) NOT NULL,
    option_value VARCHAR(100) NOT NULL,
    pricing_type VARCHAR(20) NOT NULL CHECK (pricing_type IN ('flat_rate', 'percentage', 'per_sqft')),
    pricing_value DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(option_category, option_value)
);

-- Clear existing data
TRUNCATE TABLE banner_option_pricing;

-- Insert pricing rules that match Checkout.jsx logic
INSERT INTO banner_option_pricing (option_category, option_value, pricing_type, pricing_value, description) VALUES
-- Sides pricing (100% markup for double sided)
('sides', '2', 'percentage', 100.00, 'Double sided - 100% markup on base price'),

-- Pole pockets (10% markup)
('pole_pockets', '2in-top', 'percentage', 10.00, '2 inch Pocket - Top Only - 10% markup'),
('pole_pockets', '3in-top', 'percentage', 10.00, '3 inch Pocket - Top Only - 10% markup'),
('pole_pockets', '4in-top', 'percentage', 10.00, '4 inch Pocket - Top Only - 10% markup'),
('pole_pockets', '2in-top-bottom', 'percentage', 10.00, '2 inch Pockets - Top & Bottom - 10% markup'),
('pole_pockets', '3in-top-bottom', 'percentage', 10.00, '3 inch Pockets - Top & Bottom - 10% markup'),
('pole_pockets', '4in-top-bottom', 'percentage', 10.00, '4 inch Pockets - Top & Bottom - 10% markup'),

-- Grommets (flat rate)
('grommets', 'every-2ft-all-sides', 'flat_rate', 3.00, 'Every 2 ft - All Sides'),
('grommets', 'every-2ft-top-bottom', 'flat_rate', 3.00, 'Every 2 ft - Top & Bottom'),
('grommets', 'every-2ft-left-right', 'flat_rate', 3.00, 'Every 2 ft - Left & Right'),
('grommets', '4-corners-only', 'flat_rate', 3.00, '4 Corners Only'),

-- Webbing (27% markup)
('webbing', '1in-webbing', 'percentage', 27.00, '1 inch Webbing - 27% markup'),
('webbing', '1in-webbing-d-rings', 'percentage', 27.00, '1 inch Webbing w/ D-rings - 27% markup'),
('webbing', '1in-velcro-all-sides', 'percentage', 27.00, '1 inch Velcro - All Sides - 27% markup'),

-- Corner reinforcement (16% markup)
('corners', 'reinforce-top-only', 'percentage', 16.00, 'Reinforce Top Only - 16% markup'),
('corners', 'reinforce-bottom-only', 'percentage', 16.00, 'Reinforce Bottom Only - 16% markup'),
('corners', 'reinforce-all-corners', 'percentage', 16.00, 'Reinforce All Corners - 16% markup'),

-- Rope options (percentage based on rope size and placement)
('rope', '3-16-top-only', 'percentage', 35.00, '3/16 inch Rope - Top Only - 35% markup'),
('rope', '3-16-bottom-only', 'percentage', 35.00, '3/16 inch Rope - Bottom Only - 35% markup'),
('rope', '3-16-top-bottom', 'percentage', 50.00, '3/16 inch Rope - Top & Bottom - 50% markup'),
('rope', '5-16-top-only', 'percentage', 50.00, '5/16 inch Rope - Top Only - 50% markup'),
('rope', '5-16-bottom-only', 'percentage', 50.00, '5/16 inch Rope - Bottom Only - 50% markup'),
('rope', '5-16-top-bottom', 'percentage', 70.00, '5/16 inch Rope - Top & Bottom - 70% markup'),

-- Wind slits (flat rate)
('windslits', 'standard-windslits', 'flat_rate', 8.00, 'Standard Wind Slits'),

-- Turnaround time (flat rate)
('turnaround', 'same-day', 'flat_rate', 15.00, 'Same Day (12pm PST Cutoff)');

-- ========================================
-- 3. UPDATED BANNER PRICING FUNCTION
-- ========================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS calculate_banner_price(DECIMAL, DECIMAL, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER);

-- Create updated banner pricing function that matches Checkout.jsx exactly
CREATE OR REPLACE FUNCTION calculate_banner_price(
    p_width DECIMAL,
    p_height DECIMAL,
    p_material TEXT,
    p_sides INTEGER DEFAULT 1,
    p_pole_pockets TEXT DEFAULT 'none',
    p_hem TEXT DEFAULT 'no-hem',
    p_grommets TEXT DEFAULT 'every-2ft-all-sides',
    p_webbing TEXT DEFAULT 'no-webbing',
    p_corners TEXT DEFAULT 'no-reinforcement',
    p_rope TEXT DEFAULT 'no-rope',
    p_windslits TEXT DEFAULT 'no-windslits',
    p_turnaround TEXT DEFAULT 'next-day',
    p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE (
    base_price DECIMAL,
    sides_cost DECIMAL,
    pole_pocket_cost DECIMAL,
    grommet_cost DECIMAL,
    webbing_cost DECIMAL,
    corners_cost DECIMAL,
    rope_cost DECIMAL,
    windslits_cost DECIMAL,
    turnaround_cost DECIMAL,
    options_total DECIMAL,
    subtotal DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL := 0;
    v_sides_cost DECIMAL := 0;
    v_pole_pocket_cost DECIMAL := 0;
    v_grommet_cost DECIMAL := 0;
    v_webbing_cost DECIMAL := 0;
    v_corners_cost DECIMAL := 0;
    v_rope_cost DECIMAL := 0;
    v_windslits_cost DECIMAL := 0;
    v_turnaround_cost DECIMAL := 0;
    v_options_total DECIMAL := 0;
    v_subtotal DECIMAL := 0;
    v_total_price DECIMAL := 0;
    v_material_price DECIMAL;
    v_sqft DECIMAL;
BEGIN
    -- Calculate square footage
    v_sqft := p_width * p_height;
    
    -- Get material price per square foot
    SELECT price_per_sqft INTO v_material_price 
    FROM banner_material_pricing 
    WHERE material = p_material AND is_active = true;
    
    -- Use default price if material not found
    IF v_material_price IS NULL THEN
        v_material_price := 1.60; -- Default 13oz vinyl price
    END IF;
    
    -- Calculate base price (material price * square footage)
    v_base_price := v_material_price * v_sqft;
    
    -- Calculate sides cost (100% markup for double sided)
    IF p_sides = 2 THEN
        v_sides_cost := v_base_price;
    END IF;
    
    -- Calculate pole pocket cost (10% markup)
    IF p_pole_pockets != 'none' THEN
        v_pole_pocket_cost := v_base_price * 0.10;
    END IF;
    
    -- Calculate grommet cost (flat rate $3.00, except for no-grommets)
    IF p_grommets != 'no-grommets' THEN
        v_grommet_cost := 3.00;
    END IF;
    
    -- Calculate webbing cost (27% markup)
    IF p_webbing != 'no-webbing' THEN
        v_webbing_cost := v_base_price * 0.27;
    END IF;
    
    -- Calculate corners cost (16% markup)
    IF p_corners != 'no-reinforcement' THEN
        v_corners_cost := v_base_price * 0.16;
    END IF;
    
    -- Calculate rope cost (percentage based on rope type and placement)
    CASE p_rope
        WHEN '3-16-top-only' THEN v_rope_cost := v_base_price * 0.35;
        WHEN '3-16-bottom-only' THEN v_rope_cost := v_base_price * 0.35;
        WHEN '3-16-top-bottom' THEN v_rope_cost := v_base_price * 0.50;
        WHEN '5-16-top-only' THEN v_rope_cost := v_base_price * 0.50;
        WHEN '5-16-bottom-only' THEN v_rope_cost := v_base_price * 0.50;
        WHEN '5-16-top-bottom' THEN v_rope_cost := v_base_price * 0.70;
        ELSE v_rope_cost := 0;
    END CASE;
    
    -- Calculate windslits cost (flat rate $8.00)
    IF p_windslits = 'standard-windslits' THEN
        v_windslits_cost := 8.00;
    END IF;
    
    -- Calculate turnaround cost (flat rate $15.00 for same-day)
    IF p_turnaround = 'same-day' THEN
        v_turnaround_cost := 15.00;
    END IF;
    
    -- Calculate totals
    v_options_total := v_sides_cost + v_pole_pocket_cost + v_grommet_cost + v_webbing_cost + v_corners_cost + v_rope_cost + v_windslits_cost + v_turnaround_cost;
    v_subtotal := (v_base_price * p_quantity) + v_options_total;
    v_total_price := v_subtotal;
    
    RETURN QUERY SELECT 
        v_base_price,
        v_sides_cost,
        v_pole_pocket_cost,
        v_grommet_cost,
        v_webbing_cost,
        v_corners_cost,
        v_rope_cost,
        v_windslits_cost,
        v_turnaround_cost,
        v_options_total,
        v_subtotal,
        v_total_price;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 4. HELPER FUNCTIONS
-- ========================================

-- Function to get material price by material type
CREATE OR REPLACE FUNCTION get_material_price(material_type TEXT)
RETURNS DECIMAL AS $$
DECLARE
    material_price DECIMAL;
BEGIN
    SELECT price_per_sqft INTO material_price 
    FROM banner_material_pricing 
    WHERE material = material_type AND is_active = true;
    
    -- Return default price if material not found
    RETURN COALESCE(material_price, 1.60);
END;
$$ LANGUAGE plpgsql;

-- Function to get option pricing
CREATE OR REPLACE FUNCTION get_option_price(
    category TEXT, 
    option_value TEXT, 
    base_price DECIMAL DEFAULT 0
)
RETURNS DECIMAL AS $$
DECLARE
    option_pricing RECORD;
    calculated_price DECIMAL := 0;
BEGIN
    SELECT pricing_type, pricing_value INTO option_pricing
    FROM banner_option_pricing 
    WHERE option_category = category 
      AND option_value = option_value 
      AND is_active = true;
    
    IF option_pricing IS NOT NULL THEN
        CASE option_pricing.pricing_type
            WHEN 'flat_rate' THEN calculated_price := option_pricing.pricing_value;
            WHEN 'percentage' THEN calculated_price := base_price * (option_pricing.pricing_value / 100);
            WHEN 'per_sqft' THEN calculated_price := option_pricing.pricing_value; -- Would need sqft parameter
            ELSE calculated_price := 0;
        END CASE;
    END IF;
    
    RETURN calculated_price;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_banner_material_pricing_material ON banner_material_pricing(material);
CREATE INDEX IF NOT EXISTS idx_banner_option_pricing_lookup ON banner_option_pricing(option_category, option_value);

-- ========================================
-- 6. GRANT PERMISSIONS
-- ========================================

-- Grant permissions to authenticated users
GRANT SELECT ON banner_material_pricing TO authenticated;
GRANT SELECT ON banner_option_pricing TO authenticated;

-- Enable RLS
ALTER TABLE banner_material_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_option_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for material pricing" ON banner_material_pricing
    FOR SELECT USING (true);

CREATE POLICY "Public read access for option pricing" ON banner_option_pricing
    FOR SELECT USING (true);

-- ========================================
-- 7. UPDATE EXISTING BANNER OPTIONS TABLE
-- ========================================

-- Update the existing banner_options table to ensure it matches Checkout.jsx structure
ALTER TABLE banner_options 
    ALTER COLUMN material TYPE TEXT,
    ADD COLUMN IF NOT EXISTS show_advanced_options BOOLEAN DEFAULT false;

-- Update material constraint to match Checkout.jsx materials
ALTER TABLE banner_options DROP CONSTRAINT IF EXISTS banner_options_material_check;
ALTER TABLE banner_options ADD CONSTRAINT banner_options_material_check 
    CHECK (material IN ('13oz-vinyl', '18oz-blackout', 'mesh', 'indoor', 'pole', '9oz-fabric', 'blockout-fabric', 'tension-fabric', 'backlit'));

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Test the pricing function with sample data
SELECT * FROM calculate_banner_price(
    2.0,                    -- width
    4.0,                    -- height  
    '13oz-vinyl',          -- material
    1,                     -- sides (single)
    'none',                -- pole_pockets
    'no-hem',              -- hem
    'every-2ft-all-sides', -- grommets
    'no-webbing',          -- webbing
    'no-reinforcement',    -- corners
    'no-rope',             -- rope
    'no-windslits',        -- windslits
    'next-day',            -- turnaround
    1                      -- quantity
);

-- Test with double-sided banner and options
SELECT * FROM calculate_banner_price(
    4.0,                    -- width
    8.0,                    -- height  
    '18oz-blackout',       -- material
    2,                     -- sides (double)
    '3in-top',             -- pole_pockets
    'all-sides',           -- hem
    'every-2ft-all-sides', -- grommets
    '1in-webbing',         -- webbing
    'reinforce-all-corners', -- corners
    '3-16-top-bottom',     -- rope
    'standard-windslits',  -- windslits
    'same-day',            -- turnaround
    2                      -- quantity
);

-- View all material pricing
SELECT material, price_per_sqft, description FROM banner_material_pricing ORDER BY price_per_sqft;

-- View all option pricing
SELECT 
    option_category,
    option_value,
    pricing_type,
    pricing_value,
    CASE 
        WHEN pricing_type = 'flat_rate' THEN CONCAT('$', pricing_value)
        WHEN pricing_type = 'percentage' THEN CONCAT(pricing_value, '% of base price')
        ELSE CONCAT('$', pricing_value, ' per sqft')
    END as pricing_display
FROM banner_option_pricing 
ORDER BY option_category, pricing_value;
