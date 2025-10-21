-- 🎯 COMPLETE STICKER PRICING UPDATE: All Shapes
-- Updates the sticker database with pricing for all shapes and sizes

-- First, let's ensure we have all the shapes properly configured
-- Update shape pricing modifiers (some shapes may have different complexity costs)

-- Circle: Base shape, no additional cost
UPDATE sticker_shapes SET price_modifier = 0.0000 WHERE shape_code = 'circle';

-- Square: Simple shape, no additional cost  
UPDATE sticker_shapes SET price_modifier = 0.0000 WHERE shape_code = 'square';

-- Rectangle: Slightly more complex due to orientation options
UPDATE sticker_shapes SET price_modifier = 0.0000 WHERE shape_code = 'rectangle';

-- Oval: More complex than circle, slight premium
UPDATE sticker_shapes SET price_modifier = 0.0200 WHERE shape_code = 'oval';

-- Triangle: Simple geometric shape, no additional cost
UPDATE sticker_shapes SET price_modifier = 0.0000 WHERE shape_code = 'triangle';

-- Diamond: More complex cutting, slight premium
UPDATE sticker_shapes SET price_modifier = 0.0300 WHERE shape_code = 'diamond';

-- Star: Most complex standard shape, higher premium
UPDATE sticker_shapes SET price_modifier = 0.0500 WHERE shape_code = 'star';

-- Custom: Highest complexity, significant premium
UPDATE sticker_shapes SET price_modifier = 0.2500 WHERE shape_code = 'custom';

-- Update size modifiers for all sizes
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
UPDATE sticker_sizes SET price_modifier = 1.20 WHERE size_code = '6';  -- 6x6: 120% increase
UPDATE sticker_sizes SET price_modifier = 0.00 WHERE size_code = 'custom';  -- Custom gang sheet

-- Create a comprehensive pricing function that handles all shapes and sizes
CREATE OR REPLACE FUNCTION calculate_complete_sticker_price(
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
    subtotal DECIMAL(10,2),
    price_per_unit DECIMAL(10,2)
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
    v_price_per_unit DECIMAL(10,2);
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
            WHEN '6' THEN v_size_multiplier := 1.80;  -- 6x6: 180% increase for 100+
            ELSE v_size_multiplier := v_size.price_modifier;
        END CASE;
    END IF;
    
    -- Calculate size surcharge based on base price per unit
    v_size_surcharge := (v_quantity_tier.price_per_unit * v_size_multiplier) * p_quantity;
    
    -- Calculate subtotal
    v_subtotal := v_base_price + v_material_surcharge + v_finish_surcharge + v_shape_surcharge + v_size_surcharge;
    
    -- Calculate price per unit
    v_price_per_unit := v_subtotal / p_quantity;
    
    -- Return results
    RETURN QUERY SELECT
        v_base_price,
        v_material_surcharge,
        v_finish_surcharge,
        v_shape_surcharge,
        v_size_surcharge,
        v_subtotal,
        v_price_per_unit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main pricing function to use the complete logic
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
    -- Use the complete pricing function
    RETURN QUERY SELECT 
        base_price,
        material_surcharge,
        finish_surcharge,
        shape_surcharge,
        size_surcharge,
        subtotal
    FROM calculate_complete_sticker_price(
        p_quantity, p_material_code, p_finish_code, p_shape_code, p_size_code
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get pricing for all shapes at once (useful for comparison)
CREATE OR REPLACE FUNCTION get_all_shapes_pricing(
    p_quantity INTEGER,
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50),
    p_size_code VARCHAR(50)
) RETURNS TABLE(
    shape_code VARCHAR(50),
    shape_name VARCHAR(100),
    base_price DECIMAL(10,2),
    shape_surcharge DECIMAL(10,2),
    size_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    price_per_unit DECIMAL(10,2)
) AS $$
DECLARE
    shape_record RECORD;
BEGIN
    -- Loop through all active shapes
    FOR shape_record IN 
        SELECT shape_code, name 
        FROM sticker_shapes 
        WHERE is_active = true 
        ORDER BY shape_code
    LOOP
        RETURN QUERY SELECT 
            shape_record.shape_code,
            shape_record.name,
            pricing.base_price,
            pricing.shape_surcharge,
            pricing.size_surcharge,
            pricing.subtotal,
            pricing.price_per_unit
        FROM calculate_complete_sticker_price(
            p_quantity, p_material_code, p_finish_code, 
            shape_record.shape_code, p_size_code
        ) AS pricing;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION calculate_complete_sticker_price IS 'Complete sticker pricing function for all shapes with detailed breakdown';
COMMENT ON FUNCTION calculate_sticker_price IS 'Main sticker pricing function with all shapes support';
COMMENT ON FUNCTION get_all_shapes_pricing IS 'Get pricing comparison for all shapes at once';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '%', '🎯 COMPLETE STICKER PRICING UPDATE: All Shapes Updated!';
    RAISE NOTICE '%', '✅ Circle: Base pricing (no premium)';
    RAISE NOTICE '%', '✅ Square: Base pricing (no premium)';
    RAISE NOTICE '%', '✅ Rectangle: Base pricing (no premium)';
    RAISE NOTICE '%', '✅ Oval: +2% premium for complexity';
    RAISE NOTICE '%', '✅ Triangle: Base pricing (no premium)';
    RAISE NOTICE '%', '✅ Diamond: +3% premium for complexity';
    RAISE NOTICE '%', '✅ Star: +5% premium for complexity';
    RAISE NOTICE '%', '✅ Custom: +25% premium for custom die-cutting';
    RAISE NOTICE '%', '🚀 All shapes ready for accurate pricing!';
END $$;
