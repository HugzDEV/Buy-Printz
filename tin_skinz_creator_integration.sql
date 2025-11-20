-- Tin Skinz Creator Integration Database Update
-- This script adds creator functionality to the Tin Skinz system

-- =============================================
-- UPDATE TIN SKINZ DESIGNS TABLE
-- =============================================

-- Add creator fields to existing tin_skinz_designs table
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id) ON DELETE SET NULL;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS is_creator_design BOOLEAN DEFAULT false;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS creator_earnings DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE tin_skinz_designs ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- =============================================
-- TIN SKINZ CREATOR DESIGNS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS tin_skinz_creator_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    design_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    back_thumbnail_url TEXT NOT NULL,
    design_url TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    creator_earnings DECIMAL(10,2) DEFAULT 0.00,
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tin_skinz_creator_designs_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    CONSTRAINT tin_skinz_creator_designs_price_positive CHECK (base_price > 0),
    CONSTRAINT tin_skinz_creator_designs_rating_range CHECK (rating >= 0.00 AND rating <= 5.00),
    CONSTRAINT tin_skinz_creator_designs_earnings_positive CHECK (creator_earnings >= 0.00)
);

-- =============================================
-- TIN SKINZ DESIGN PURCHASES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS tin_skinz_design_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    design_id VARCHAR(50) NOT NULL,
    creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
    design_price DECIMAL(10,2) NOT NULL,
    creator_earnings DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL,
    custom_message TEXT,
    candy_id VARCHAR(50) REFERENCES tin_skinz_candy_options(candy_id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    candy_price DECIMAL(10,2) DEFAULT 0,
    custom_message_price DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    shipping_address JSONB,
    billing_address JSONB,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT tin_skinz_design_purchases_quantity_positive CHECK (quantity > 0),
    CONSTRAINT tin_skinz_design_purchases_price_positive CHECK (design_price > 0),
    CONSTRAINT tin_skinz_design_purchases_earnings_positive CHECK (creator_earnings >= 0)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Tin Skinz creator designs indexes
CREATE INDEX IF NOT EXISTS idx_tin_skinz_creator_designs_creator ON tin_skinz_creator_designs(creator_id);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_creator_designs_category ON tin_skinz_creator_designs(category);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_creator_designs_approved ON tin_skinz_creator_designs(is_approved, is_active);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_creator_designs_sales ON tin_skinz_creator_designs(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_creator_designs_rating ON tin_skinz_creator_designs(rating DESC);

-- Tin Skinz design purchases indexes
CREATE INDEX IF NOT EXISTS idx_tin_skinz_design_purchases_user ON tin_skinz_design_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_design_purchases_creator ON tin_skinz_design_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_design_purchases_design ON tin_skinz_design_purchases(design_id);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_design_purchases_date ON tin_skinz_design_purchases(purchased_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE tin_skinz_creator_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tin_skinz_design_purchases ENABLE ROW LEVEL SECURITY;

-- Tin Skinz creator designs policies
CREATE POLICY "Anyone can view approved creator designs" ON tin_skinz_creator_designs
    FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Creators can view their own designs" ON tin_skinz_creator_designs
    FOR SELECT USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can insert their own designs" ON tin_skinz_creator_designs
    FOR INSERT WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Creators can update their own designs" ON tin_skinz_creator_designs
    FOR UPDATE USING (auth.uid()::text = creator_id::text);

-- Tin Skinz design purchases policies
CREATE POLICY "Users can view their own purchases" ON tin_skinz_design_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON tin_skinz_design_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update creator earnings and sales count
CREATE OR REPLACE FUNCTION update_tin_skinz_creator_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update creator earnings and sales count
        UPDATE creators 
        SET 
            total_earnings = total_earnings + NEW.creator_earnings,
            templates_sold = templates_sold + NEW.quantity
        WHERE id = NEW.creator_id;
        
        -- Update design sales count
        UPDATE tin_skinz_creator_designs 
        SET 
            sales_count = sales_count + NEW.quantity,
            creator_earnings = creator_earnings + NEW.creator_earnings
        WHERE design_id = NEW.design_id;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating creator stats
DROP TRIGGER IF EXISTS trigger_update_tin_skinz_creator_stats ON tin_skinz_design_purchases;
CREATE TRIGGER trigger_update_tin_skinz_creator_stats
    AFTER INSERT ON tin_skinz_design_purchases
    FOR EACH ROW EXECUTE FUNCTION update_tin_skinz_creator_stats();

-- Function to update design view count
CREATE OR REPLACE FUNCTION update_tin_skinz_design_view_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This would be called from the API when a design is viewed
    UPDATE tin_skinz_creator_designs 
    SET view_count = view_count + 1 
    WHERE design_id = NEW.design_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================

-- Note: This would be populated through the application
-- But here's the structure for reference:

/*
-- Example of a creator design
INSERT INTO tin_skinz_creator_designs (
    creator_id, design_id, name, category, description,
    thumbnail_url, back_thumbnail_url, design_url, base_price
) VALUES (
    'creator-uuid', 'creator-design-1', 'My Custom Design', 'custom',
    'A beautiful custom design for tin skinz',
    '/uploads/tin-skinz/thumbnails/design-1-front.jpg',
    '/uploads/tin-skinz/thumbnails/design-1-back.jpg',
    '/uploads/tin-skinz/designs/design-1-full.jpg',
    12.99
);
*/
