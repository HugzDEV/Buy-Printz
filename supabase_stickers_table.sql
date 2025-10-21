-- 🎯 STICKER EMPIRE: CUSTOM STICKERS DATABASE SETUP
-- Creates comprehensive sticker tables with pricing logic for our sticker empire!

-- Create sticker_products table (master product catalog)
CREATE TABLE IF NOT EXISTS sticker_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('standard-shapes', 'custom-gang-sheet')),
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_materials table
CREATE TABLE IF NOT EXISTS sticker_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    material_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Per unit modifier
    durability_months INTEGER,
    indoor_outdoor VARCHAR(20) CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_finishes table
CREATE TABLE IF NOT EXISTS sticker_finishes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    finish_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Per unit modifier
    properties JSONB DEFAULT '{}', -- {waterproof: true, uvResistant: true, removable: false}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_shapes table
CREATE TABLE IF NOT EXISTS sticker_shapes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shape_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_modifier DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Per unit modifier
    supports_orientation BOOLEAN DEFAULT false, -- For rectangle/oval
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_sizes table
CREATE TABLE IF NOT EXISTS sticker_sizes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    size_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    base_size_inches DECIMAL(5,2) NOT NULL, -- Base size in inches
    price_modifier DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Per unit modifier
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_quantity_tiers table
CREATE TABLE IF NOT EXISTS sticker_quantity_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quantity INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    price_per_unit DECIMAL(10,4) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sticker_orders table (main orders table)
CREATE TABLE IF NOT EXISTS sticker_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Product specifications
    product_code VARCHAR(50) NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    finish_code VARCHAR(50) NOT NULL,
    shape_code VARCHAR(50) NOT NULL,
    size_code VARCHAR(50) NOT NULL,
    orientation VARCHAR(20) DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
    
    -- Quantity and pricing
    quantity INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    material_surcharge DECIMAL(10,2) DEFAULT 0.00,
    finish_surcharge DECIMAL(10,2) DEFAULT 0.00,
    shape_surcharge DECIMAL(10,2) DEFAULT 0.00,
    size_surcharge DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Design data
    canvas_data JSONB NOT NULL DEFAULT '{}',
    surface_elements JSONB NOT NULL DEFAULT '{}',
    marketplace_templates JSONB DEFAULT '[]',
    
    -- Job details
    job_name VARCHAR(200),
    special_instructions TEXT,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'designing', 'ready_for_production', 'in_production', 'completed', 'shipped', 'cancelled')),
    production_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sticker_orders_user_id ON sticker_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_order_id ON sticker_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON sticker_orders(status);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_created_at ON sticker_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_product_code ON sticker_orders(product_code);

-- Enable Row Level Security on all tables
ALTER TABLE sticker_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_quantity_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sticker_products (public read access)
CREATE POLICY "Anyone can view active sticker products" ON sticker_products
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_materials (public read access)
CREATE POLICY "Anyone can view active sticker materials" ON sticker_materials
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_finishes (public read access)
CREATE POLICY "Anyone can view active sticker finishes" ON sticker_finishes
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_shapes (public read access)
CREATE POLICY "Anyone can view active sticker shapes" ON sticker_shapes
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_sizes (public read access)
CREATE POLICY "Anyone can view active sticker sizes" ON sticker_sizes
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_quantity_tiers (public read access)
CREATE POLICY "Anyone can view active quantity tiers" ON sticker_quantity_tiers
    FOR SELECT USING (is_active = true);

-- RLS Policies for sticker_orders (user access only)
CREATE POLICY "Users can view their own sticker orders" ON sticker_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sticker orders" ON sticker_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sticker orders" ON sticker_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role policies for all tables
CREATE POLICY "Service role full access on sticker_products" ON sticker_products
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_materials" ON sticker_materials
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_finishes" ON sticker_finishes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_shapes" ON sticker_shapes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_sizes" ON sticker_sizes
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_quantity_tiers" ON sticker_quantity_tiers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sticker_orders" ON sticker_orders
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_sticker_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sticker_products_updated_at
    BEFORE UPDATE ON sticker_products
    FOR EACH ROW EXECUTE FUNCTION update_sticker_updated_at();

CREATE TRIGGER update_sticker_orders_updated_at
    BEFORE UPDATE ON sticker_orders
    FOR EACH ROW EXECUTE FUNCTION update_sticker_updated_at();

-- Insert base product data
INSERT INTO sticker_products (product_code, name, description, category, base_price) VALUES
('standard-shapes', 'Standard Shape Stickers', 'Professional vinyl stickers in 7 standard shapes', 'standard-shapes', 0.00),
('custom-gang-sheet', 'Custom Gang Sheet Stickers', 'Large 20" x 20" gang sheets for custom die-cutting', 'custom-gang-sheet', 15.00)
ON CONFLICT (product_code) DO NOTHING;

-- Insert material data
INSERT INTO sticker_materials (material_code, name, description, price_modifier, durability_months, indoor_outdoor) VALUES
('vinyl', 'Roland Premium Vinyl', 'Professional-grade vinyl with 3-5 year outdoor durability', 0.0000, 60, 'both'),
('paper', 'Roland Paper', 'High-quality paper stickers for indoor use', -0.1000, 12, 'indoor'),
('clear-vinyl', 'Roland Clear Vinyl', 'Transparent vinyl for window applications', 0.1500, 36, 'both'),
('orajet-premium', 'Orajet Premium Vinyl', 'Premium vinyl with enhanced durability', 0.0500, 72, 'both')
ON CONFLICT (material_code) DO NOTHING;

-- Insert finish data
INSERT INTO sticker_finishes (finish_code, name, description, price_modifier, properties) VALUES
('matte', 'Matte Finish', 'Indoor/outdoor use, non-reflective', 0.0000, '{"waterproof": false, "uvResistant": false, "removable": false}'),
('glossy', 'Glossy Finish', 'Waterproof, UV resistant, permanent', 0.0500, '{"waterproof": true, "uvResistant": true, "removable": false}'),
('satin', 'Satin Finish', 'Semi-gloss finish', 0.0300, '{"waterproof": false, "uvResistant": false, "removable": false}')
ON CONFLICT (finish_code) DO NOTHING;

-- Insert shape data
INSERT INTO sticker_shapes (shape_code, name, description, price_modifier, supports_orientation) VALUES
('circle', 'Circle', 'Perfect circle stickers', 0.0000, false),
('square', 'Square', 'Square stickers', 0.0000, false),
('rectangle', 'Rectangle', 'Rectangular stickers with orientation options', 0.0000, true),
('oval', 'Oval', 'Oval stickers with orientation options', 0.0000, true),
('triangle', 'Triangle', 'Triangular stickers', 0.0000, false),
('diamond', 'Diamond', 'Diamond-shaped stickers', 0.0000, false),
('star', 'Star', 'Star-shaped stickers', 0.0000, false),
('custom', 'Custom Shape', 'Custom die-cut shapes', 0.2500, false)
ON CONFLICT (shape_code) DO NOTHING;

-- Insert size data
INSERT INTO sticker_sizes (size_code, name, base_size_inches, price_modifier) VALUES
('1', '1 inch', 1.00, 0.0000),
('2', '2 inch', 2.00, 0.0000),
('3', '3 inch', 3.00, 0.0000),
('4', '4 inch', 4.00, 0.0000),
('5', '5 inch', 5.00, 0.0000),
('6', '6 inch', 6.00, 0.0000),
('custom', 'Custom Gang Sheet', 20.00, 0.0000)
ON CONFLICT (size_code) DO NOTHING;

-- Insert quantity tier data
INSERT INTO sticker_quantity_tiers (quantity, base_price, price_per_unit) VALUES
(50, 29.99, 0.5998),
(100, 49.99, 0.4999),
(250, 99.99, 0.39996),
(500, 179.99, 0.35998),
(1000, 299.99, 0.29999)
ON CONFLICT DO NOTHING;

-- Create comprehensive pricing function
CREATE OR REPLACE FUNCTION calculate_sticker_price(
    p_quantity INTEGER,
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50),
    p_shape_code VARCHAR(50),
    p_size_code VARCHAR(50)
) RETURNS TABLE(
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    shape_surcharge DECIMAL(10,2),
    size_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2)
) AS $$
DECLARE
    v_quantity_tier RECORD;
    v_material RECORD;
    v_finish RECORD;
    v_shape RECORD;
    v_size RECORD;
    v_base_price DECIMAL(10,2);
    v_material_surcharge DECIMAL(10,2);
    v_finish_surcharge DECIMAL(10,2);
    v_shape_surcharge DECIMAL(10,2);
    v_size_surcharge DECIMAL(10,2);
    v_subtotal DECIMAL(10,2);
BEGIN
    -- Get quantity tier pricing
    SELECT * INTO v_quantity_tier
    FROM sticker_quantity_tiers
    WHERE quantity = p_quantity AND is_active = true
    ORDER BY quantity DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid quantity: %', p_quantity;
    END IF;
    
    v_base_price := v_quantity_tier.base_price;
    
    -- Get material pricing
    SELECT * INTO v_material
    FROM sticker_materials
    WHERE material_code = p_material_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid material code: %', p_material_code;
    END IF;
    
    v_material_surcharge := v_material.price_modifier * p_quantity;
    
    -- Get finish pricing
    SELECT * INTO v_finish
    FROM sticker_finishes
    WHERE finish_code = p_finish_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid finish code: %', p_finish_code;
    END IF;
    
    v_finish_surcharge := v_finish.price_modifier * p_quantity;
    
    -- Get shape pricing
    SELECT * INTO v_shape
    FROM sticker_shapes
    WHERE shape_code = p_shape_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid shape code: %', p_shape_code;
    END IF;
    
    v_shape_surcharge := v_shape.price_modifier * p_quantity;
    
    -- Get size pricing
    SELECT * INTO v_size
    FROM sticker_sizes
    WHERE size_code = p_size_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid size code: %', p_size_code;
    END IF;
    
    v_size_surcharge := v_size.price_modifier * p_quantity;
    
    -- Calculate subtotal
    v_subtotal := v_base_price + v_material_surcharge + v_finish_surcharge + v_shape_surcharge + v_size_surcharge;
    
    -- Return results
    RETURN QUERY SELECT
        v_base_price,
        v_material_surcharge,
        v_finish_surcharge,
        v_shape_surcharge,
        v_size_surcharge,
        v_subtotal;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get sticker product details
CREATE OR REPLACE FUNCTION get_sticker_product_details()
RETURNS TABLE(
    product_code VARCHAR(50),
    product_name VARCHAR(100),
    category VARCHAR(50),
    base_price DECIMAL(10,2),
    materials JSONB,
    finishes JSONB,
    shapes JSONB,
    sizes JSONB,
    quantity_tiers JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.product_code,
        sp.name,
        sp.category,
        sp.base_price,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'code', sm.material_code,
                'name', sm.name,
                'description', sm.description,
                'price_modifier', sm.price_modifier,
                'durability_months', sm.durability_months,
                'indoor_outdoor', sm.indoor_outdoor
            )
        ) FROM sticker_materials sm WHERE sm.is_active = true) as materials,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'code', sf.finish_code,
                'name', sf.name,
                'description', sf.description,
                'price_modifier', sf.price_modifier,
                'properties', sf.properties
            )
        ) FROM sticker_finishes sf WHERE sf.is_active = true) as finishes,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'code', ss.shape_code,
                'name', ss.name,
                'description', ss.description,
                'price_modifier', ss.price_modifier,
                'supports_orientation', ss.supports_orientation
            )
        ) FROM sticker_shapes ss WHERE ss.is_active = true) as shapes,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'code', ssz.size_code,
                'name', ssz.name,
                'base_size_inches', ssz.base_size_inches,
                'price_modifier', ssz.price_modifier
            )
        ) FROM sticker_sizes ssz WHERE ssz.is_active = true) as sizes,
        (SELECT jsonb_agg(
            jsonb_build_object(
                'quantity', sqt.quantity,
                'base_price', sqt.base_price,
                'price_per_unit', sqt.price_per_unit
            )
        ) FROM sticker_quantity_tiers sqt WHERE sqt.is_active = true ORDER BY sqt.quantity) as quantity_tiers
    FROM sticker_products sp
    WHERE sp.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE sticker_products IS 'Master catalog of sticker products';
COMMENT ON TABLE sticker_materials IS 'Available sticker materials with pricing modifiers';
COMMENT ON TABLE sticker_finishes IS 'Available sticker finishes with properties and pricing';
COMMENT ON TABLE sticker_shapes IS 'Available sticker shapes with orientation support';
COMMENT ON TABLE sticker_sizes IS 'Available sticker sizes with base dimensions';
COMMENT ON TABLE sticker_quantity_tiers IS 'Quantity-based pricing tiers for stickers';
COMMENT ON TABLE sticker_orders IS 'Individual sticker orders with full specifications and pricing';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎯 STICKER EMPIRE: Database setup completed successfully!';
    RAISE NOTICE '✅ Tables: sticker_products, sticker_materials, sticker_finishes, sticker_shapes, sticker_sizes, sticker_quantity_tiers, sticker_orders';
    RAISE NOTICE '✅ Functions: calculate_sticker_price(), get_sticker_product_details()';
    RAISE NOTICE '✅ RLS Policies: Applied for security';
    RAISE NOTICE '✅ Data: Base product data inserted';
    RAISE NOTICE '🚀 Ready to dominate the sticker market!';
END $$;
