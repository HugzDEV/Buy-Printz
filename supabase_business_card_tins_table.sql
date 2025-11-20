-- Business Card Tins Table Setup
-- This table stores business card tin specifications and designs

-- Create the business_card_tins table
CREATE TABLE IF NOT EXISTS business_card_tins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Tin specifications
    quantity INTEGER NOT NULL CHECK (quantity IN (100, 250, 500)),
    surface_coverage VARCHAR(20) NOT NULL CHECK (surface_coverage IN ('front-back', 'all-sides')),
    tin_finish VARCHAR(20) NOT NULL CHECK (tin_finish IN ('silver', 'black', 'gold')),
    printing_method VARCHAR(50) NOT NULL CHECK (printing_method IN ('premium-vinyl', 'premium-clear-vinyl')),
    
    -- Design data for each surface
    surface_designs JSONB NOT NULL DEFAULT '{}', -- {front: {...}, back: {...}, inside: {...}, lid: {...}}
    
    -- Sticker specifications
    sticker_specifications JSONB NOT NULL DEFAULT '{}', -- Vinyl sticker print specs
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    finish_surcharge DECIMAL(10,2) DEFAULT 0.00,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Status and metadata
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'designing', 'ready_for_production', 'in_production', 'completed', 'shipped')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_card_tins_user_id ON business_card_tins(user_id);
CREATE INDEX IF NOT EXISTS idx_business_card_tins_order_id ON business_card_tins(order_id);
CREATE INDEX IF NOT EXISTS idx_business_card_tins_status ON business_card_tins(status);
CREATE INDEX IF NOT EXISTS idx_business_card_tins_created_at ON business_card_tins(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_business_card_tins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_card_tins_updated_at
    BEFORE UPDATE ON business_card_tins
    FOR EACH ROW
    EXECUTE FUNCTION update_business_card_tins_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE business_card_tins ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own tin orders
CREATE POLICY "Users can view their own business card tins" ON business_card_tins
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own tin orders
CREATE POLICY "Users can insert their own business card tins" ON business_card_tins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tin orders (for design changes)
CREATE POLICY "Users can update their own business card tins" ON business_card_tins
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tin orders
CREATE POLICY "Users can delete their own business card tins" ON business_card_tins
    FOR DELETE USING (auth.uid() = user_id);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can do everything on business card tins" ON business_card_tins
    FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE business_card_tins IS 'Stores business card tin specifications, designs, and order details';
COMMENT ON COLUMN business_card_tins.quantity IS 'Number of tins to produce (100, 250, or 500)';
COMMENT ON COLUMN business_card_tins.surface_coverage IS 'Which surfaces to print on: front-back or all-sides';
COMMENT ON COLUMN business_card_tins.tin_finish IS 'Tin finish: silver (base), black (+$0.25), gold (+$0.50)';
COMMENT ON COLUMN business_card_tins.printing_method IS 'Printing method: premium-vinyl or premium-clear-vinyl';
COMMENT ON COLUMN business_card_tins.surface_designs IS 'JSON object containing design data for each surface (front, back, inside, lid) - Tin size: 3.74" x 2.25" x 0.78" deep';
COMMENT ON COLUMN business_card_tins.sticker_specifications IS 'JSON object containing vinyl sticker print specifications';
COMMENT ON COLUMN business_card_tins.base_price IS 'Base price before finish surcharge';
COMMENT ON COLUMN business_card_tins.finish_surcharge IS 'Additional cost for premium finishes (black/gold)';
COMMENT ON COLUMN business_card_tins.total_price IS 'Final price including all surcharges';

-- Insert sample data for testing (optional)
-- INSERT INTO business_card_tins (
--     order_id,
--     user_id,
--     quantity,
--     surface_coverage,
--     tin_finish,
--     printing_method,
--     surface_designs,
--     sticker_specifications,
--     base_price,
--     finish_surcharge,
--     total_price
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual order_id
--     '00000000-0000-0000-0000-000000000000', -- Replace with actual user_id
--     100,
--     'front-back',
--     'silver',
--     'premium-vinyl',
--     '{"front": {"elements": [], "canvasSize": {"width": 350, "height": 250}}, "back": {"elements": [], "canvasSize": {"width": 350, "height": 250}}}',
--     '{"dpi": 300, "colorMode": "CMYK", "material": "premium-vinyl"}',
--     399.99,
--     0.00,
--     399.99
-- );

-- ✅ Business Card Tins table created successfully!
-- 📋 Table includes:
--    - Tin specifications (quantity, finish, surface coverage)
--    - Design data for each surface
--    - Pricing calculations
--    - RLS policies for security
--    - Indexes for performance
