-- Tin Skinz Database Schema
-- This file contains the SQL schema for Tin Skinz products and orders

-- Tin Skinz Designs Table
CREATE TABLE IF NOT EXISTS tin_skinz_designs (
    id SERIAL PRIMARY KEY,
    design_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    thumbnail_url TEXT NOT NULL,
    back_thumbnail_url TEXT NOT NULL,
    design_url TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tin Skinz Candy Options Table
CREATE TABLE IF NOT EXISTS tin_skinz_candy_options (
    id SERIAL PRIMARY KEY,
    candy_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tin Skinz Orders Table
CREATE TABLE IF NOT EXISTS tin_skinz_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    design_id VARCHAR(50) REFERENCES tin_skinz_designs(design_id),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tin Skinz Pricing Rules Table
CREATE TABLE IF NOT EXISTS tin_skinz_pricing_rules (
    id SERIAL PRIMARY KEY,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER,
    unit_price DECIMAL(10,2) NOT NULL,
    candy_price DECIMAL(10,2) NOT NULL,
    custom_message_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing rules
INSERT INTO tin_skinz_pricing_rules (min_quantity, max_quantity, unit_price, candy_price, custom_message_price) VALUES
(1, 1, 9.99, 3.00, 0.99),  -- 1 tin: $9.99 base, $3.00 candy, $0.99 messaging
(2, 2, 9.99, 3.00, 0.99),  -- 2 tins: same as 1
(3, 3, 6.67, 2.00, 0.99),  -- 3 tins: $19.99/3 = $6.67 base, $24.99-$19.99 = $5.00/3 = $1.67 candy, $0.99 messaging
(4, 19, 6.67, 2.00, 0.99), -- 4-19 tins: same as 3
(20, 50, 6.00, 0.00, 0.99), -- 20-50 tins: $6.00 each, no candy, $0.99 messaging
(51, 99, 5.50, 0.00, 0.00), -- 51-99 tins: $5.50 each, no candy, free messaging
(100, NULL, 4.50, 0.00, 0.00); -- 100+ tins: $4.50 each, no candy, free messaging

-- Insert default candy options
INSERT INTO tin_skinz_candy_options (candy_id, name, price) VALUES
('chocolate-mix', 'Chocolate Mix', 3.00),
('gummy-bears', 'Gummy Bears', 2.00),
('sour-patch', 'Sour Patch Kids', 2.50),
('mints', 'Peppermint Mints', 1.50);

-- Insert sample designs (Abstract Art)
INSERT INTO tin_skinz_designs (design_id, name, category, thumbnail_url, back_thumbnail_url, design_url, base_price) VALUES
('abstract-1', 'Abstract 1', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Double.png', 9.99),
('abstract-2', 'Abstract 2', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Double.png', 9.99),
('abstract-3', 'Abstract 3', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Double.png', 9.99),
('abstract-4', 'Abstract 4', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Double.png', 9.99),
('abstract-5', 'Abstract 5', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Double.png', 9.99),
('abstract-6', 'Abstract 6', 'abstract-art', '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Front.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Back.png', '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Double.png', 9.99);

-- Insert sample designs (Zodiac)
INSERT INTO tin_skinz_designs (design_id, name, category, thumbnail_url, back_thumbnail_url, design_url, base_price) VALUES
('cancer', 'Cancer', 'zodiac', '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Front.png', '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Back.png', '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Double_Both.png', 9.99),
('taurus', 'Taurus', 'zodiac', '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Front.png', '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Back.png', '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Double_Both.png', 9.99),
('leo', 'Leo', 'zodiac', '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Front.png', '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Back.png', '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Double_Both.png', 9.99);

-- Insert sample designs (Animals)
INSERT INTO tin_skinz_designs (design_id, name, category, thumbnail_url, back_thumbnail_url, design_url, base_price) VALUES
('bee', 'Bee', 'animals', '/assets/tin-skinz/designs/Animals/1_Bee_Front.png', '/assets/tin-skinz/designs/Animals/1_Bee_Back.png', '/assets/tin-skinz/designs/Animals/1_Bee_Double_Both.png', 9.99),
('cat', 'Cat', 'animals', '/assets/tin-skinz/designs/Animals/6_Cat_Front.png', '/assets/tin-skinz/designs/Animals/6_Cat_Back.png', '/assets/tin-skinz/designs/Animals/6_Cat_Double_Both.png', 9.99),
('butterfly', 'Butterfly', 'animals', '/assets/tin-skinz/designs/Animals/5_Butterfly_Front.png', '/assets/tin-skinz/designs/Animals/5_Butterfly_Back.png', '/assets/tin-skinz/designs/Animals/5_Butterfly_Double_Both.png', 9.99);

-- Create function to calculate Tin Skinz pricing
CREATE OR REPLACE FUNCTION calculate_tin_skinz_price(
    p_quantity INTEGER,
    p_has_candy BOOLEAN DEFAULT false,
    p_has_custom_message BOOLEAN DEFAULT false
) RETURNS TABLE(
    unit_price DECIMAL(10,2),
    candy_price DECIMAL(10,2),
    custom_message_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.unit_price,
        CASE WHEN p_has_candy THEN pr.candy_price ELSE 0.00 END as candy_price,
        CASE WHEN p_has_custom_message THEN pr.custom_message_price ELSE 0.00 END as custom_message_price,
        (pr.unit_price + 
         CASE WHEN p_has_candy THEN pr.candy_price ELSE 0.00 END + 
         CASE WHEN p_has_custom_message THEN pr.custom_message_price ELSE 0.00 END) * p_quantity as total_price
    FROM tin_skinz_pricing_rules pr
    WHERE pr.is_active = true
    AND p_quantity >= pr.min_quantity
    AND (pr.max_quantity IS NULL OR p_quantity <= pr.max_quantity)
    ORDER BY pr.min_quantity DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tin_skinz_designs_category ON tin_skinz_designs(category);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_designs_active ON tin_skinz_designs(is_active);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_orders_user_id ON tin_skinz_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_orders_status ON tin_skinz_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_tin_skinz_pricing_rules_quantity ON tin_skinz_pricing_rules(min_quantity, max_quantity);
