-- Banner Options Table for Comprehensive Banner Specifications
-- Run this SQL in your Supabase SQL Editor

-- Create banner_options table for detailed banner specifications
CREATE TABLE IF NOT EXISTS banner_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic Dimensions (from editor)
    width DECIMAL(8,2) NOT NULL,
    height DECIMAL(8,2) NOT NULL,
    sides INTEGER DEFAULT 1 CHECK (sides IN (1, 2)),
    
    -- Material (from editor)
    material TEXT NOT NULL CHECK (material IN ('13oz-vinyl', '9oz-fabric', 'backlit', 'blockout', 'indoor', 'mesh', 'pole', 'tension-fabric')),
    
    -- Pole Pockets
    pole_pockets TEXT DEFAULT 'none' CHECK (pole_pockets IN ('none', '2in-top', '3in-top', '4in-top', '2in-top-bottom', '3in-top-bottom', '4in-top-bottom')),
    
    -- Hem Options
    hem TEXT DEFAULT 'no-hem' CHECK (hem IN ('no-hem', 'all-sides')),
    
    -- Grommet Options
    grommets TEXT DEFAULT 'every-2ft-all-sides' CHECK (grommets IN (
        'every-2ft-all-sides',
        'every-2ft-top-bottom',
        'every-2ft-left-right',
        '4-corners-only',
        'no-grommets'
    )),
    
    -- Webbing Options
    webbing TEXT DEFAULT 'no-webbing' CHECK (webbing IN (
        'no-webbing',
        '1in-webbing',
        '1in-webbing-d-rings',
        '1in-velcro-all-sides'
    )),
    
    -- Corner Reinforcement
    corners TEXT DEFAULT 'no-reinforcement' CHECK (corners IN (
        'no-reinforcement',
        'reinforce-top-only',
        'reinforce-bottom-only',
        'reinforce-all-corners'
    )),
    
    -- Rope Options
    rope TEXT DEFAULT 'no-rope' CHECK (rope IN (
        'no-rope',
        '3-16-top-only',
        '3-16-bottom-only',
        '3-16-top-bottom',
        '5-16-top-only',
        '5-16-bottom-only',
        '5-16-top-bottom'
    )),
    
    -- Wind Slits
    windslits TEXT DEFAULT 'no-windslits' CHECK (windslits IN ('no-windslits', 'standard-windslits')),
    
    -- Job Details
    job_name TEXT,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    
    -- Turnaround Time
    turnaround TEXT DEFAULT 'next-day' CHECK (turnaround IN ('next-day', 'same-day')),
    
    -- Pricing (calculated fields)
    base_price DECIMAL(10,2) NOT NULL,
    options_total DECIMAL(10,2) DEFAULT 0,
    turnaround_cost DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banner_options_order_id ON banner_options(order_id);
CREATE INDEX IF NOT EXISTS idx_banner_options_material ON banner_options(material);
CREATE INDEX IF NOT EXISTS idx_banner_options_turnaround ON banner_options(turnaround);

-- Enable Row Level Security
ALTER TABLE banner_options ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for banner_options
CREATE POLICY "Users can view own banner options" ON banner_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = banner_options.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own banner options" ON banner_options
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = banner_options.order_id 
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own banner options" ON banner_options
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = banner_options.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_banner_options_updated_at
    BEFORE UPDATE ON banner_options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create pricing function for banner options
CREATE OR REPLACE FUNCTION calculate_banner_price(
    p_width DECIMAL,
    p_height DECIMAL,
    p_material TEXT,
    p_pole_pockets TEXT,
    p_hem TEXT,
    p_grommets TEXT,
    p_webbing TEXT,
    p_corners TEXT,
    p_rope TEXT,
    p_windslits TEXT,
    p_turnaround TEXT
) RETURNS TABLE(
    base_price DECIMAL,
    options_total DECIMAL,
    turnaround_cost DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL := 0;
    v_options_total DECIMAL := 0;
    v_turnaround_cost DECIMAL := 0;
    v_total_price DECIMAL := 0;
    v_sqft DECIMAL;
BEGIN
    -- Calculate square footage
    v_sqft := p_width * p_height;
    
    -- Base price calculation (per square foot)
    CASE p_material
        WHEN '13oz-vinyl' THEN v_base_price := 2.50 * v_sqft;
        WHEN '9oz-fabric' THEN v_base_price := 3.00 * v_sqft;
        WHEN 'backlit' THEN v_base_price := 4.50 * v_sqft;
        WHEN 'blockout' THEN v_base_price := 3.50 * v_sqft;
        WHEN 'indoor' THEN v_base_price := 2.00 * v_sqft;
        WHEN 'mesh' THEN v_base_price := 3.25 * v_sqft;
        WHEN 'pole' THEN v_base_price := 2.75 * v_sqft;
        WHEN 'tension-fabric' THEN v_base_price := 5.00 * v_sqft;
        ELSE v_base_price := 2.50 * v_sqft; -- Default to 13oz vinyl
    END CASE;
    
    -- Options pricing
    -- Pole Pockets
    CASE p_pole_pockets
        WHEN '2in-top' THEN v_options_total := v_options_total + 8.00;
        WHEN '3in-top' THEN v_options_total := v_options_total + 10.00;
        WHEN '4in-top' THEN v_options_total := v_options_total + 12.00;
        WHEN '2in-top-bottom' THEN v_options_total := v_options_total + 15.00;
        WHEN '3in-top-bottom' THEN v_options_total := v_options_total + 18.00;
        WHEN '4in-top-bottom' THEN v_options_total := v_options_total + 22.00;
    END CASE;
    
    -- Hem
    IF p_hem = 'all-sides' THEN
        v_options_total := v_options_total + 12.00;
    END IF;
    
    -- Grommets
    CASE p_grommets
        WHEN 'every-2ft-all-sides' THEN v_options_total := v_options_total + 15.00;
        WHEN 'every-2ft-top-bottom' THEN v_options_total := v_options_total + 12.00;
        WHEN 'every-2ft-left-right' THEN v_options_total := v_options_total + 10.00;
        WHEN '4-corners-only' THEN v_options_total := v_options_total + 8.00;
    END CASE;
    
    -- Webbing
    CASE p_webbing
        WHEN '1in-webbing' THEN v_options_total := v_options_total + 18.00;
        WHEN '1in-webbing-d-rings' THEN v_options_total := v_options_total + 25.00;
        WHEN '1in-velcro-all-sides' THEN v_options_total := v_options_total + 22.00;
    END CASE;
    
    -- Corners
    CASE p_corners
        WHEN 'reinforce-top-only' THEN v_options_total := v_options_total + 8.00;
        WHEN 'reinforce-bottom-only' THEN v_options_total := v_options_total + 8.00;
        WHEN 'reinforce-all-corners' THEN v_options_total := v_options_total + 15.00;
    END CASE;
    
    -- Rope
    CASE p_rope
        WHEN '3-16-top-only' THEN v_options_total := v_options_total + 12.00;
        WHEN '3-16-bottom-only' THEN v_options_total := v_options_total + 12.00;
        WHEN '3-16-top-bottom' THEN v_options_total := v_options_total + 20.00;
        WHEN '5-16-top-only' THEN v_options_total := v_options_total + 15.00;
        WHEN '5-16-bottom-only' THEN v_options_total := v_options_total + 15.00;
        WHEN '5-16-top-bottom' THEN v_options_total := v_options_total + 25.00;
    END CASE;
    
    -- Wind Slits
    IF p_windslits = 'standard-windslits' THEN
        v_options_total := v_options_total + 8.00;
    END IF;
    
    -- Turnaround
    IF p_turnaround = 'same-day' THEN
        v_turnaround_cost := 8.00;
    END IF;
    
    -- Calculate total
    v_total_price := v_base_price + v_options_total + v_turnaround_cost;
    
    RETURN QUERY SELECT v_base_price, v_options_total, v_turnaround_cost, v_total_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON banner_options TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_banner_price TO anon, authenticated;

-- Insert sample pricing data for reference
COMMENT ON TABLE banner_options IS 'Comprehensive banner specifications and pricing for BuyPrintz orders';
COMMENT ON COLUMN banner_options.material IS 'Banner material type with corresponding base pricing';
COMMENT ON COLUMN banner_options.pole_pockets IS 'Pole pocket specifications with size and placement options';
COMMENT ON COLUMN banner_options.grommets IS 'Grommet placement and spacing options';
COMMENT ON COLUMN banner_options.webbing IS 'Webbing and D-ring options for hanging';
COMMENT ON COLUMN banner_options.turnaround IS 'Production turnaround time with associated costs';
