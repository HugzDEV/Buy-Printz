-- Business Card Tin Schema
-- Supports volume discounts for packs of 100, 250, and 500 units
-- Includes candy selection with volume-based pricing

-- Business Card Tin Products Table
CREATE TABLE IF NOT EXISTS business_card_tin_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    tin_finish VARCHAR(50) NOT NULL DEFAULT 'silver',
    printing_method VARCHAR(100) NOT NULL DEFAULT 'premium-vinyl',
    surface_coverage VARCHAR(50) NOT NULL DEFAULT 'front-back',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Card Tin Volume Discounts Table
CREATE TABLE IF NOT EXISTS business_card_tin_volume_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INTEGER NOT NULL UNIQUE,
    base_price DECIMAL(10,2) NOT NULL,
    tin_finish_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    printing_method_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    surface_coverage_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candy Options Table
CREATE TABLE IF NOT EXISTS candy_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candy_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candy Volume Discounts Table
CREATE TABLE IF NOT EXISTS candy_volume_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Card Tin Orders Table
CREATE TABLE IF NOT EXISTS business_card_tin_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Tin Configuration
    quantity INTEGER NOT NULL,
    tin_finish VARCHAR(50) NOT NULL,
    printing_method VARCHAR(100) NOT NULL,
    surface_coverage VARCHAR(50) NOT NULL,
    job_name VARCHAR(255),
    
    -- Candy Selection
    candy_id VARCHAR(100) REFERENCES candy_options(candy_id),
    candy_quantity INTEGER DEFAULT 0,
    candy_unit_price DECIMAL(10,2) DEFAULT 0.00,
    candy_total_price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Custom Message
    custom_message TEXT,
    custom_message_price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    tin_finish_modifier DECIMAL(10,2) DEFAULT 0.00,
    printing_method_modifier DECIMAL(10,2) DEFAULT 0.00,
    surface_coverage_modifier DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Shipping Information
    shipping_method VARCHAR(100),
    shipping_service_code VARCHAR(50),
    tracking_number VARCHAR(100),
    
    -- Order Status
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- Business Card Tin Order Items Table (for marketplace templates)
CREATE TABLE IF NOT EXISTS business_card_tin_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES business_card_tin_orders(id) ON DELETE CASCADE,
    template_id UUID,
    template_name VARCHAR(255),
    template_price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default volume discount tiers for business card tins (only 100, 250, 500 units)
INSERT INTO business_card_tin_volume_discounts (quantity, base_price, description) VALUES
(100, 399.99, '100 Units - Standard Pack'),
(250, 749.99, '250 Units - Medium Pack'),
(500, 1000.00, '500 Units - Large Pack')
ON CONFLICT (quantity) DO NOTHING;

-- Insert candy options
INSERT INTO candy_options (candy_id, name, base_price, category) VALUES
('strawberry-hard-candy', 'Strawberry Filled Hard Candy', 0.66, 'hard-candy'),
('candy-blocks', 'Candy Blocks', 0.83, 'hard-candy'),
('jolly-ranchers', 'Jolly Ranchers', 0.83, 'hard-candy'),
('jawbreakers', 'Jawbreakers', 0.95, 'hard-candy'),
('peppermint-star-lights', 'Peppermint Star Lights', 0.66, 'mint'),
('soft-peppermint-puffs', 'Soft Peppermint Puffs', 0.87, 'mint'),
('cream-savers-strawberry', 'Cream Savers Strawberry', 1.32, 'cream'),
('fruit-flavored-buttons', 'Fruit Flavored Buttons', 0.66, 'fruit'),
('werthers-original', 'Werthers Original Hard Candy', 2.15, 'premium'),
('hopes-coffee', 'Hopes Coffee', 2.40, 'premium'),
('assorted-starlights', 'Assorted Starlights', 0.66, 'assorted'),
('sour-lemon-balls', 'Sour Lemon Balls', 1.20, 'sour'),
('spearmint-balls', 'Spearmint Balls', 0.66, 'mint'),
('fruit-barrels', 'Fruit Barrels', 0.66, 'fruit'),
('bananarama', 'Bananarama', 0.92, 'fruit'),
('hersheys', 'Hersheys', 1.65, 'chocolate'),
('jordan-almonds', 'Jordan Almonds', 2.25, 'premium'),
('blue-mms', 'Blue M&Ms', 3.00, 'chocolate'),
('hersheys-kisses-pink', 'Hersheys Kisses Pink', 3.00, 'chocolate'),
('pink-mms', 'Pink M&Ms', 3.00, 'chocolate')
ON CONFLICT (candy_id) DO NOTHING;

-- Insert candy volume discount tiers
INSERT INTO candy_volume_discounts (min_quantity, max_quantity, discount_percentage, description) VALUES
(1, 19, 0.00, 'No discount'),
(20, 49, 10.00, '10% off'),
(50, 74, 15.00, '15% off'),
(75, 99, 17.50, '17.5% off'),
(100, 149, 20.00, '20% off'),
(150, 499, 22.50, '22.5% off'),
(500, NULL, 30.00, '30% off')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_card_tin_orders_user_id ON business_card_tin_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_business_card_tin_orders_status ON business_card_tin_orders(status);
CREATE INDEX IF NOT EXISTS idx_business_card_tin_orders_created_at ON business_card_tin_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_business_card_tin_order_items_order_id ON business_card_tin_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_candy_volume_discounts_quantity ON candy_volume_discounts(min_quantity, max_quantity);

-- Enable Row Level Security
ALTER TABLE business_card_tin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_card_tin_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own orders" ON business_card_tin_orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON business_card_tin_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON business_card_tin_orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items" ON business_card_tin_order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM business_card_tin_orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own order items" ON business_card_tin_order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM business_card_tin_orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_business_card_tin_products_updated_at 
    BEFORE UPDATE ON business_card_tin_products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_card_tin_volume_discounts_updated_at 
    BEFORE UPDATE ON business_card_tin_volume_discounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candy_options_updated_at 
    BEFORE UPDATE ON candy_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candy_volume_discounts_updated_at 
    BEFORE UPDATE ON candy_volume_discounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_card_tin_orders_updated_at 
    BEFORE UPDATE ON business_card_tin_orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
