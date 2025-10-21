-- 🎯 STICKER PRICING UPDATE: Correct Pricing Structure
-- Updates the sticker database with the correct pricing tiers and size modifiers

-- Clear existing quantity tiers and insert new ones
DELETE FROM sticker_quantity_tiers;

-- Insert new quantity tiers with correct pricing for 1x1 (base size)
INSERT INTO sticker_quantity_tiers (quantity, base_price, price_per_unit) VALUES
(50, 51.00, 1.02),      -- 50 count: $1.02 each
(100, 80.00, 0.80),     -- 100 count: $0.80 each  
(200, 140.00, 0.70),    -- 200 count: $0.70 each
(300, 180.00, 0.60),    -- 300 count: $0.60 each
(400, 208.00, 0.52),    -- 400 count: $0.52 each
(500, 200.00, 0.40),    -- 500 count: $0.40 each
(1000, 250.00, 0.25),   -- 1000 count: $0.25 each
(2000, 440.00, 0.22),    -- 2000 count: $0.22 each
(3000, 570.00, 0.19),    -- 3000 count: $0.19 each
(5000, 850.00, 0.17),    -- 5000 count: $0.17 each
(10000, 1500.00, 0.15);  -- 10000 count: $0.15 each

-- Update size modifiers for different sizes
-- Base size is 1x1, so we need to calculate the correct modifiers

-- For 50 count tier (least discounts):
-- 2x2 = 15% increase, 3x3 = 32% increase, 4x4 = 50% increase, 5x5 = 85% increase
-- For 100+ count tiers:
-- 2x2 = 22% increase, 3x3 = 40% increase, 4x4 = 90% increase, 5x5 = 132% increase

UPDATE sticker_sizes SET price_modifier = 0.00 WHERE size_code = '1';  -- 1x1 base size
UPDATE sticker_sizes SET price_modifier = 0.15 WHERE size_code = '2';  -- 2x2: 15% increase
UPDATE sticker_sizes SET price_modifier = 0.32 WHERE size_code = '3';  -- 3x3: 32% increase  
UPDATE sticker_sizes SET price_modifier = 0.50 WHERE size_code = '4';  -- 4x4: 50% increase
UPDATE sticker_sizes SET price_modifier = 0.85 WHERE size_code = '5';  -- 5x5: 85% increase
UPDATE sticker_sizes SET price_modifier = 0.00 WHERE size_code = '6';  -- 6x6: same as 5x5 for now
UPDATE sticker_sizes SET price_modifier = 0.00 WHERE size_code = 'custom';  -- Custom gang sheet

-- Create a new pricing function that handles size-based pricing correctly
CREATE OR REPLACE FUNCTION calculate_sticker_price_v2(
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
    v_size_multiplier DECIMAL(5,4);
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
    
    -- Get size pricing with special logic for different quantity tiers
    SELECT * INTO v_size
    FROM sticker_sizes
    WHERE size_code = p_size_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid size code: %', p_size_code;
    END IF;
    
    -- Calculate size multiplier based on quantity tier
    -- For 50 count: use base modifiers
    -- For 100+ count: use higher modifiers
    IF p_quantity = 50 THEN
        -- 50 count tier uses base modifiers
        v_size_multiplier := v_size.price_modifier;
    ELSE
        -- 100+ count tiers use higher modifiers
        CASE p_size_code
            WHEN '2' THEN v_size_multiplier := 0.22;  -- 2x2: 22% increase for 100+
            WHEN '3' THEN v_size_multiplier := 0.40;  -- 3x3: 40% increase for 100+
            WHEN '4' THEN v_size_multiplier := 0.90;  -- 4x4: 90% increase for 100+
            WHEN '5' THEN v_size_multiplier := 1.32;  -- 5x5: 132% increase for 100+
            ELSE v_size_multiplier := v_size.price_modifier;
        END CASE;
    END IF;
    
    -- Calculate size surcharge based on base price per unit
    v_size_surcharge := (v_quantity_tier.price_per_unit * v_size_multiplier) * p_quantity;
    
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

-- Update the existing pricing function to use the new logic
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
BEGIN
    -- Use the new v2 function
    RETURN QUERY SELECT * FROM calculate_sticker_price_v2(
        p_quantity, p_material_code, p_finish_code, p_shape_code, p_size_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION calculate_sticker_price_v2 IS 'Updated sticker pricing function with correct size modifiers for different quantity tiers';
COMMENT ON FUNCTION calculate_sticker_price IS 'Main sticker pricing function that uses the updated v2 logic';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '%', '🎯 STICKER PRICING UPDATE: Database updated successfully!';
    RAISE NOTICE '%', '✅ Quantity tiers: Updated with correct pricing (50-10000 count)';
    RAISE NOTICE '%', '✅ Size modifiers: Updated with tier-based pricing';
    RAISE NOTICE '%', '✅ Pricing functions: Updated with new logic';
    RAISE NOTICE '%', '🚀 Ready for accurate sticker pricing!';
END $$;
