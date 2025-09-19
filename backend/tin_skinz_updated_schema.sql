-- Updated Tin Skinz Schema with new pricing tiers and candy options

-- Drop existing tables if they exist (for clean update)
DROP TABLE IF EXISTS tin_skinz_order_items CASCADE;
DROP TABLE IF EXISTS tin_skinz_orders CASCADE;
DROP TABLE IF EXISTS tin_skinz_candy_options CASCADE;
DROP TABLE IF EXISTS tin_skinz_designs CASCADE;

-- Create tin_skinz_designs table
CREATE TABLE tin_skinz_designs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    back_thumbnail_url TEXT,
    design_url TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 9.99,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tin_skinz_candy_options table with real candy options
CREATE TABLE tin_skinz_candy_options (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert real candy options
INSERT INTO tin_skinz_candy_options (id, name, base_price) VALUES
('strawberry-hard-candy', 'Strawberry Filled Hard Candy', 0.66),
('candy-blocks', 'Candy Blocks', 0.83),
('jolly-ranchers', 'Jolly Ranchers', 0.83),
('jawbreakers', 'Jawbreakers', 0.95),
('peppermint-star-lights', 'Peppermint Star Lights', 0.66),
('soft-peppermint-puffs', 'Soft Peppermint Puffs', 0.87),
('cream-savers-strawberry', 'Cream Savers Strawberry', 1.32),
('fruit-flavored-buttons', 'Fruit Flavored Buttons', 0.66),
('werthers-original', 'Werther''s Original Hard Candy', 2.15),
('hopes-coffee', 'Hope''s Coffee', 2.40),
('assorted-starlights', 'Assorted Starlights', 0.66),
('sour-lemon-balls', 'Sour Lemon Balls', 1.20),
('spearmint-balls', 'Spearmint Balls', 0.66),
('fruit-barrels', 'Fruit Barrels', 0.66),
('bananarama', 'Bananarama', 0.92),
('hersheys', 'Hershey''s', 1.65),
('jordan-almonds', 'Jordan Almonds', 2.25),
('blue-mms', 'Blue M&Ms', 3.00),
('hersheys-kisses-pink', 'Hershey''s Kisses Pink', 3.00),
('pink-mms', 'Pink M&Ms', 3.00);

-- Create tin_skinz_orders table
CREATE TABLE tin_skinz_orders (
    id TEXT PRIMARY KEY,
    design_id TEXT NOT NULL REFERENCES tin_skinz_designs(id),
    custom_message TEXT,
    candy_id TEXT REFERENCES tin_skinz_candy_options(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    candy_unit_price DECIMAL(10,2) DEFAULT 0,
    message_unit_price DECIMAL(10,2) DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tin_skinz_order_items table (for future expansion)
CREATE TABLE tin_skinz_order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES tin_skinz_orders(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('tin', 'candy', 'message')),
    item_id TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated pricing function with new tiers
CREATE OR REPLACE FUNCTION calculate_tin_skinz_price(
    p_quantity INTEGER,
    p_has_candy BOOLEAN DEFAULT FALSE,
    p_has_custom_message BOOLEAN DEFAULT FALSE
) RETURNS TABLE (
    unit_price DECIMAL(10,2),
    candy_price DECIMAL(10,2),
    custom_message_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
) AS $$
DECLARE
    base_price DECIMAL(10,2);
    message_price DECIMAL(10,2);
BEGIN
    -- Determine base price based on quantity
    CASE 
        WHEN p_quantity BETWEEN 1 AND 2 THEN base_price := 9.99;
        WHEN p_quantity BETWEEN 3 AND 6 THEN base_price := 8.99;
        WHEN p_quantity BETWEEN 7 AND 10 THEN base_price := 8.50;
        WHEN p_quantity BETWEEN 11 AND 19 THEN base_price := 8.00;
        WHEN p_quantity BETWEEN 20 AND 49 THEN base_price := 6.50;
        WHEN p_quantity BETWEEN 50 AND 74 THEN base_price := 6.00;
        WHEN p_quantity BETWEEN 75 AND 99 THEN base_price := 5.50;
        WHEN p_quantity BETWEEN 100 AND 149 THEN base_price := 5.00;
        WHEN p_quantity BETWEEN 150 AND 499 THEN base_price := 4.00;
        WHEN p_quantity BETWEEN 500 AND 1000 THEN base_price := 3.50;
        ELSE RAISE EXCEPTION 'Invalid quantity: %', p_quantity;
    END CASE;
    
    -- Determine message price based on quantity
    CASE 
        WHEN p_quantity BETWEEN 1 AND 49 THEN message_price := 0.99;
        WHEN p_quantity BETWEEN 50 AND 74 THEN message_price := 0.50;
        WHEN p_quantity BETWEEN 75 AND 99 THEN message_price := 0.25;
        WHEN p_quantity >= 100 THEN message_price := 0.00;
        ELSE message_price := 0.99;
    END CASE;
    
    RETURN QUERY SELECT 
        base_price,
        CASE WHEN p_has_candy THEN 0.00 ELSE 0.00 END, -- Candy pricing handled separately
        CASE WHEN p_has_custom_message THEN message_price ELSE 0.00 END,
        (base_price + CASE WHEN p_has_custom_message THEN message_price ELSE 0.00 END) * p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Create candy discount function
CREATE OR REPLACE FUNCTION calculate_candy_discount(
    p_quantity INTEGER
) RETURNS DECIMAL(3,3) AS $$
BEGIN
    CASE 
        WHEN p_quantity BETWEEN 1 AND 19 THEN RETURN 0.000; -- No discount
        WHEN p_quantity BETWEEN 20 AND 49 THEN RETURN 0.100; -- 10% off
        WHEN p_quantity BETWEEN 50 AND 74 THEN RETURN 0.150; -- 15% off
        WHEN p_quantity BETWEEN 75 AND 99 THEN RETURN 0.175; -- 17.5% off
        WHEN p_quantity BETWEEN 100 AND 149 THEN RETURN 0.200; -- 20% off
        WHEN p_quantity BETWEEN 150 AND 499 THEN RETURN 0.225; -- 22.5% off
        WHEN p_quantity BETWEEN 500 AND 1000 THEN RETURN 0.300; -- 30% off
        ELSE RETURN 0.000;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE tin_skinz_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tin_skinz_candy_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE tin_skinz_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tin_skinz_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to tin_skinz_designs" ON tin_skinz_designs FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tin_skinz_candy_options" ON tin_skinz_candy_options FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to tin_skinz_orders" ON tin_skinz_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access to tin_skinz_order_items" ON tin_skinz_order_items FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_tin_skinz_designs_category ON tin_skinz_designs(category);
CREATE INDEX idx_tin_skinz_orders_status ON tin_skinz_orders(status);
CREATE INDEX idx_tin_skinz_orders_created_at ON tin_skinz_orders(created_at);
CREATE INDEX idx_tin_skinz_order_items_order_id ON tin_skinz_order_items(order_id);
