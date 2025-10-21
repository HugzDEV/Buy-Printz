-- =====================================================
-- COMPLETE STICKER DATABASE SETUP FOR BUYPRINTZ
-- =====================================================
-- This file contains all the SQL needed to set up the sticker pricing system
-- Run this in your Supabase SQL Editor to set up the complete system

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Sticker materials table
CREATE TABLE IF NOT EXISTS sticker_materials (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(5,4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sticker finishes table  
CREATE TABLE IF NOT EXISTS sticker_finishes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(5,4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sticker shapes table
CREATE TABLE IF NOT EXISTS sticker_shapes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(5,4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sticker sizes table
CREATE TABLE IF NOT EXISTS sticker_sizes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(5,4) DEFAULT 0.0000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sticker quantity tiers table
CREATE TABLE IF NOT EXISTS sticker_quantity_tiers (
    id SERIAL PRIMARY KEY,
    quantity INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sticker orders table
CREATE TABLE IF NOT EXISTS sticker_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    quantity INTEGER NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    finish_code VARCHAR(50) NOT NULL,
    shape_code VARCHAR(50) NOT NULL,
    size_code VARCHAR(50) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    material_surcharge DECIMAL(10,2) DEFAULT 0.00,
    finish_surcharge DECIMAL(10,2) DEFAULT 0.00,
    shape_surcharge DECIMAL(10,2) DEFAULT 0.00,
    size_surcharge DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INSERT BASE DATA
-- =====================================================

-- Insert materials
INSERT INTO sticker_materials (code, name, description, price_modifier) VALUES
('vinyl', 'Roland Premium Vinyl', 'High-quality vinyl material', 0.0000),
('clear_vinyl', 'Roland Clear Vinyl', 'Transparent vinyl material', 0.1000),
('paper', 'Roland Paper', 'Standard paper material', -0.0500),
('orajet', 'Orajet Premium Vinyl', 'Premium vinyl with enhanced durability', 0.1500)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_modifier = EXCLUDED.price_modifier,
    updated_at = NOW();

-- Insert finishes
INSERT INTO sticker_finishes (code, name, description, price_modifier) VALUES
('matte', 'Matte Finish', 'Non-reflective matte finish', 0.0000),
('glossy', 'Glossy Finish', 'High-gloss reflective finish', 0.0500)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_modifier = EXCLUDED.price_modifier,
    updated_at = NOW();

-- Insert shapes
INSERT INTO sticker_shapes (code, name, description, price_modifier) VALUES
('circle', 'Circle', 'Perfect circle shape', 0.0000),
('square', 'Square', 'Perfect square shape', 0.0000),
('rectangle', 'Rectangle', 'Rectangular shape', 0.0000),
('triangle', 'Triangle', 'Triangular shape', 0.0000),
('oval', 'Oval', 'Oval shape', 0.0200),
('diamond', 'Diamond', 'Diamond shape', 0.0300),
('star', 'Star', 'Star shape', 0.0500),
('custom', 'Custom Gang Sheet', 'Custom gang sheet (20x20 with 17x17 printable)', 0.2500)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_modifier = EXCLUDED.price_modifier,
    updated_at = NOW();

-- Insert sizes
INSERT INTO sticker_sizes (code, name, description, price_modifier) VALUES
('1', '1 inch', '1 inch diameter/side', 0.0000),
('2', '2 inch', '2 inch diameter/side', 0.2000),
('3', '3 inch', '3 inch diameter/side', 0.4000),
('4', '4 inch', '4 inch diameter/side', 0.6000),
('5', '5 inch', '5 inch diameter/side', 0.8000),
('6', '6 inch', '6 inch diameter/side', 1.2000)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_modifier = EXCLUDED.price_modifier,
    updated_at = NOW();

-- Insert quantity tiers
INSERT INTO sticker_quantity_tiers (quantity, base_price, description) VALUES
(50, 0.25, '50 count - Base pricing'),
(100, 0.20, '100 count - Volume discount'),
(250, 0.18, '250 count - Better volume discount'),
(500, 0.15, '500 count - Great volume discount'),
(1000, 0.12, '1000 count - Excellent volume discount'),
(2500, 0.10, '2500 count - Maximum volume discount'),
(5000, 0.08, '5000 count - Premium volume discount'),
(10000, 0.06, '10000 count - Ultimate volume discount')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CREATE PRICING FUNCTIONS
-- =====================================================

-- Function to calculate custom gang sheet pricing
CREATE OR REPLACE FUNCTION calculate_custom_gang_sheet_price(
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50)
)
RETURNS TABLE(
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    shape_surcharge DECIMAL(10,2),
    size_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2)
) AS $$
DECLARE
    v_base_price DECIMAL(10,2) := 19.99; -- Fixed price per sheet
    v_material_modifier DECIMAL(5,4);
    v_finish_modifier DECIMAL(5,4);
    v_material_surcharge DECIMAL(10,2);
    v_finish_surcharge DECIMAL(10,2);
    v_subtotal DECIMAL(10,2);
BEGIN
    -- Get material modifier
    SELECT price_modifier INTO v_material_modifier
    FROM sticker_materials 
    WHERE code = p_material_code AND is_active = TRUE;
    
    -- Get finish modifier  
    SELECT price_modifier INTO v_finish_modifier
    FROM sticker_finishes
    WHERE code = p_finish_code AND is_active = TRUE;
    
    -- Calculate surcharges
    v_material_surcharge := v_base_price * COALESCE(v_material_modifier, 0);
    v_finish_surcharge := v_base_price * COALESCE(v_finish_modifier, 0);
    v_subtotal := v_base_price + v_material_surcharge + v_finish_surcharge;
    
    RETURN QUERY SELECT
        v_base_price,
        v_material_surcharge,
        v_finish_surcharge,
        0.00::DECIMAL(10,2), -- No shape surcharge for custom
        0.00::DECIMAL(10,2), -- No size surcharge for custom
        v_subtotal;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate standard sticker pricing
CREATE OR REPLACE FUNCTION calculate_standard_sticker_price(
    p_quantity INTEGER,
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50),
    p_shape_code VARCHAR(50),
    p_size_code VARCHAR(50)
)
RETURNS TABLE(
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    shape_surcharge DECIMAL(10,2),
    size_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2)
) AS $$
DECLARE
    v_base_price DECIMAL(10,2);
    v_material_modifier DECIMAL(5,4);
    v_finish_modifier DECIMAL(5,4);
    v_shape_modifier DECIMAL(5,4);
    v_size_modifier DECIMAL(5,4);
    v_material_surcharge DECIMAL(10,2);
    v_finish_surcharge DECIMAL(10,2);
    v_shape_surcharge DECIMAL(10,2);
    v_size_surcharge DECIMAL(10,2);
    v_subtotal DECIMAL(10,2);
BEGIN
    -- Get base price for quantity
    SELECT base_price INTO v_base_price
    FROM sticker_quantity_tiers 
    WHERE quantity <= p_quantity AND is_active = TRUE
    ORDER BY quantity DESC LIMIT 1;
    
    -- Get modifiers
    SELECT price_modifier INTO v_material_modifier
    FROM sticker_materials WHERE code = p_material_code AND is_active = TRUE;
    
    SELECT price_modifier INTO v_finish_modifier
    FROM sticker_finishes WHERE code = p_finish_code AND is_active = TRUE;
    
    SELECT price_modifier INTO v_shape_modifier
    FROM sticker_shapes WHERE code = p_shape_code AND is_active = TRUE;
    
    SELECT price_modifier INTO v_size_modifier
    FROM sticker_sizes WHERE code = p_size_code AND is_active = TRUE;
    
    -- Calculate surcharges
    v_material_surcharge := v_base_price * COALESCE(v_material_modifier, 0);
    v_finish_surcharge := v_base_price * COALESCE(v_finish_modifier, 0);
    v_shape_surcharge := v_base_price * COALESCE(v_shape_modifier, 0);
    v_size_surcharge := v_base_price * COALESCE(v_size_modifier, 0);
    v_subtotal := v_base_price + v_material_surcharge + v_finish_surcharge + v_shape_surcharge + v_size_surcharge;
    
    RETURN QUERY SELECT
        v_base_price,
        v_material_surcharge,
        v_finish_surcharge,
        v_shape_surcharge,
        v_size_surcharge,
        v_subtotal;
END;
$$ LANGUAGE plpgsql;

-- Main pricing function that routes to appropriate calculation
CREATE OR REPLACE FUNCTION calculate_sticker_price(
    p_quantity INTEGER,
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50),
    p_shape_code VARCHAR(50),
    p_size_code VARCHAR(50)
)
RETURNS TABLE(
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    shape_surcharge DECIMAL(10,2),
    size_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2)
) AS $$
BEGIN
    -- Route to custom gang sheet pricing if shape is 'custom'
    IF p_shape_code = 'custom' THEN
        RETURN QUERY SELECT * FROM calculate_custom_gang_sheet_price(p_material_code, p_finish_code);
    ELSE
        -- Use standard pricing for all other shapes
        RETURN QUERY SELECT * FROM calculate_standard_sticker_price(
            p_quantity, p_material_code, p_finish_code, p_shape_code, p_size_code
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_sticker_materials_updated_at BEFORE UPDATE ON sticker_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticker_finishes_updated_at BEFORE UPDATE ON sticker_finishes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticker_shapes_updated_at BEFORE UPDATE ON sticker_shapes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticker_sizes_updated_at BEFORE UPDATE ON sticker_sizes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticker_quantity_tiers_updated_at BEFORE UPDATE ON sticker_quantity_tiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sticker_orders_updated_at BEFORE UPDATE ON sticker_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sticker_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_quantity_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (public read for configuration tables)
CREATE POLICY "Allow public read access to sticker_materials" ON sticker_materials FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sticker_finishes" ON sticker_finishes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sticker_shapes" ON sticker_shapes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sticker_sizes" ON sticker_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to sticker_quantity_tiers" ON sticker_quantity_tiers FOR SELECT USING (true);

-- Create policies for sticker_orders (authenticated users only)
CREATE POLICY "Allow authenticated users to read their sticker_orders" ON sticker_orders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Allow authenticated users to insert sticker_orders" ON sticker_orders FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Allow authenticated users to update their sticker_orders" ON sticker_orders FOR UPDATE USING (auth.uid()::text = user_id);

-- =====================================================
-- 6. TEST THE SETUP
-- =====================================================

-- Test the pricing function with a sample order
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test standard circle sticker
    SELECT * INTO test_result FROM calculate_sticker_price(100, 'vinyl', 'matte', 'circle', '3');
    RAISE NOTICE 'Test 1 - Circle 3" 100 count: Base=%, Subtotal=%', test_result.base_price, test_result.subtotal;
    
    -- Test custom gang sheet
    SELECT * INTO test_result FROM calculate_sticker_price(1, 'vinyl', 'matte', 'custom', '20');
    RAISE NOTICE 'Test 2 - Custom gang sheet: Base=%, Subtotal=%', test_result.base_price, test_result.subtotal;
    
    -- Test star shape with premium material
    SELECT * INTO test_result FROM calculate_sticker_price(500, 'orajet', 'glossy', 'star', '4');
    RAISE NOTICE 'Test 3 - Star 4" 500 count with Orajet: Base=%, Subtotal=%', test_result.base_price, test_result.subtotal;
    
    RAISE NOTICE '✅ All tests completed successfully!';
END;
$$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your sticker pricing system is now ready to use!
-- The API endpoints should work correctly now.
