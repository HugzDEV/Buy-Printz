-- Fix custom gang sheet pricing to handle quantity=1 correctly
-- Custom gang sheets should use fixed pricing regardless of quantity

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
    -- Special handling for custom gang sheets
    IF p_shape_code = 'custom' THEN
        -- Fixed pricing for custom gang sheets
        v_base_price := 19.99;
        
        -- Get material pricing
        SELECT * INTO v_material
        FROM sticker_materials
        WHERE material_code = p_material_code AND is_active = true;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid material code: %', p_material_code;
        END IF;
        
        v_material_surcharge := v_base_price * v_material.price_modifier;
        
        -- Get finish pricing
        SELECT * INTO v_finish
        FROM sticker_finishes
        WHERE finish_code = p_finish_code AND is_active = true;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid finish code: %', p_finish_code;
        END IF;
        
        v_finish_surcharge := v_base_price * v_finish.price_modifier;
        
        -- No shape or size surcharge for custom gang sheets
        v_shape_surcharge := 0.00;
        v_size_surcharge := 0.00;
        
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
    ELSE
        -- Standard pricing for all other shapes
        -- Get quantity tier pricing
        SELECT * INTO v_quantity_tier
        FROM sticker_quantity_tiers
        WHERE quantity <= p_quantity AND is_active = true
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
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function with both custom and standard shapes
DO $$
DECLARE
    test_result RECORD;
BEGIN
    -- Test custom gang sheet
    SELECT * INTO test_result FROM calculate_sticker_price(1, 'vinyl', 'matte', 'custom', 'custom');
    RAISE NOTICE 'Custom gang sheet test: Base=%, Subtotal=%', test_result.base_price, test_result.subtotal;
    
    -- Test standard shape
    SELECT * INTO test_result FROM calculate_sticker_price(100, 'vinyl', 'matte', 'circle', '3');
    RAISE NOTICE 'Standard shape test: Base=%, Subtotal=%', test_result.base_price, test_result.subtotal;
    
    RAISE NOTICE '✅ All tests completed successfully!';
END;
$$;
