-- 🚀 GALACTIC FEDERATION: TRADESHOW TENTS DATABASE EXPANSION
-- Creates the tradeshow_tents table for our tent empire!

-- Create tradeshow_tents table
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
    surface_designs JSONB NOT NULL DEFAULT '{}', -- {canopy_front: {...}, canopy_back: {...}, sidewall_left: {...}, etc.}
    
    -- Accessories
    accessories JSONB DEFAULT '[]', -- Selected accessories array
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    accessories_total DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- File Setup and Specifications
    file_setup JSONB NOT NULL DEFAULT '{}', -- File specifications and requirements
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_order_id ON tradeshow_tents(order_id);
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_tent_size ON tradeshow_tents(tent_size);
CREATE INDEX IF NOT EXISTS idx_tradeshow_tents_created_at ON tradeshow_tents(created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE tradeshow_tents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tent orders
CREATE POLICY "Users can view own tent orders" ON tradeshow_tents
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can insert their own tent orders
CREATE POLICY "Users can insert own tent orders" ON tradeshow_tents
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can update their own tent orders
CREATE POLICY "Users can update own tent orders" ON tradeshow_tents
    FOR UPDATE USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can delete their own tent orders
CREATE POLICY "Users can delete own tent orders" ON tradeshow_tents
    FOR DELETE USING (
        order_id IN (
            SELECT id FROM orders WHERE user_id = auth.uid()
        )
    );

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service role full access" ON tradeshow_tents
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger
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

-- Add comments for documentation
COMMENT ON TABLE tradeshow_tents IS 'Stores tradeshow tent orders with multi-surface designs and accessories';
COMMENT ON COLUMN tradeshow_tents.tent_size IS 'Tent size: 10x10 or 10x20 feet';
COMMENT ON COLUMN tradeshow_tents.surface_designs IS 'JSONB object containing designs for all 7 tent surfaces (4 canopy + 2 sidewalls + 1 backwall)';
COMMENT ON COLUMN tradeshow_tents.accessories IS 'JSONB array of selected accessories (carrying-bag, sandbags, ropes-stakes, full-wall, half-wall)';
COMMENT ON COLUMN tradeshow_tents.file_setup IS 'JSONB object containing file specifications and print requirements';

-- Insert sample tent configurations for reference
INSERT INTO tradeshow_tents (
    order_id,
    tent_size,
    tent_type,
    material,
    frame_type,
    print_method,
    surface_designs,
    accessories,
    base_price,
    accessories_total,
    total_price,
    file_setup
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Placeholder order_id
    '10x10',
    'event-tent',
    '6oz-tent-fabric',
    '40mm-aluminum-hex',
    'dye-sublimation',
    '{
        "canopy_front": {"width": 1160, "height": 789, "design": null},
        "canopy_back": {"width": 1160, "height": 789, "design": null},
        "canopy_left": {"width": 1160, "height": 789, "design": null},
        "canopy_right": {"width": 1160, "height": 789, "design": null},
        "sidewall_left": {"width": 1110, "height": 390, "design": null},
        "sidewall_right": {"width": 1110, "height": 390, "design": null},
        "backwall": {"width": 1110, "height": 780, "design": null}
    }',
    '["carrying-bag", "sandbags"]',
    299.99,
    74.98,
    374.97,
    '{
        "file_formats": ["JPEG", "PDF"],
        "color_space": "CMYK",
        "resolution": "150dpi",
        "max_file_size": "300MB",
        "surface_specs": {
            "canopy": {"width": 1160, "height": 789, "shape": "triangular"},
            "sidewalls": {"width": 1110, "height": 390, "shape": "rectangular"},
            "backwall": {"width": 1110, "height": 780, "shape": "rectangular"}
        }
    }'
) ON CONFLICT DO NOTHING;

-- Clean up the sample data (remove placeholder)
DELETE FROM tradeshow_tents WHERE order_id = '00000000-0000-0000-0000-000000000000';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚀 GALACTIC FEDERATION: Tradeshow Tents table created successfully!';
    RAISE NOTICE '✅ Table: tradeshow_tents';
    RAISE NOTICE '✅ Indexes: Created for performance';
    RAISE NOTICE '✅ RLS Policies: Applied for security';
    RAISE NOTICE '✅ Triggers: Updated_at trigger active';
    RAISE NOTICE '🌙 Ready to conquer the tent empire!';
END $$;
