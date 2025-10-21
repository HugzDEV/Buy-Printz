-- 🎯 CUSTOM GANG SHEET PRICING UPDATE
-- Updates pricing for custom gang sheets - sold by sheet size, not individual stickers

-- Custom gang sheets are sold by the sheet, not by individual sticker count
-- 20" x 20" sheet with 17" x 17" printable area = $19.99 per sheet

-- Update the custom shape to have a fixed price per sheet
UPDATE sticker_shapes 
SET price_modifier = 0.00, 
    description = 'Custom gang sheet - 20" x 20" with 17" x 17" printable area',
    supports_orientation = false
WHERE shape_code = 'custom';

-- Update the custom size to reflect the gang sheet pricing
UPDATE sticker_sizes 
SET name = 'Custom Gang Sheet (20" x 20")',
    base_size_inches = 20.00,
    price_modifier = 0.00
WHERE size_code = 'custom';

-- Create a special pricing function for custom gang sheets
CREATE OR REPLACE FUNCTION calculate_custom_gang_sheet_price(
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50)
) RETURNS TABLE(
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    price_per_sheet DECIMAL(10,2)
) AS $$
DECLARE
    v_material RECORD;
    v_finish RECORD;
    v_base_price DECIMAL(10,2) := 19.99;  -- Fixed price per gang sheet
    v_material_surcharge DECIMAL(10,2);
    v_finish_surcharge DECIMAL(10,2);
    v_subtotal DECIMAL(10,2);
BEGIN
    -- Get material pricing
    SELECT * INTO v_material
    FROM sticker_materials
    WHERE material_code = p_material_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid material code: %', p_material_code;
    END IF;
    
    -- Material surcharge is applied per sheet (not per sticker)
    v_material_surcharge := v_material.price_modifier * v_base_price;
    
    -- Get finish pricing
    SELECT * INTO v_finish
    FROM sticker_finishes
    WHERE finish_code = p_finish_code AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid finish code: %', p_finish_code;
    END IF;
    
    -- Finish surcharge is applied per sheet (not per sticker)
    v_finish_surcharge := v_finish.price_modifier * v_base_price;
    
    -- Calculate subtotal
    v_subtotal := v_base_price + v_material_surcharge + v_finish_surcharge;
    
    -- Return results
    RETURN QUERY SELECT
        v_base_price,
        v_material_surcharge,
        v_finish_surcharge,
        v_subtotal,
        v_subtotal;  -- Price per sheet is the same as subtotal
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main pricing function to handle custom gang sheets differently
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
    -- Check if this is a custom gang sheet
    IF p_shape_code = 'custom' AND p_size_code = 'custom' THEN
        -- Use custom gang sheet pricing (quantity doesn't matter)
        RETURN QUERY SELECT 
            pricing.base_price,
            pricing.material_surcharge,
            pricing.finish_surcharge,
            0.00 as shape_surcharge,  -- No shape surcharge for custom
            0.00 as size_surcharge,  -- No size surcharge for custom
            pricing.subtotal
        FROM calculate_custom_gang_sheet_price(p_material_code, p_finish_code) as pricing;
    ELSE
        -- Use standard pricing for all other shapes
        RETURN QUERY SELECT * FROM calculate_complete_sticker_price(
            p_quantity, p_material_code, p_finish_code, p_shape_code, p_size_code
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get gang sheet pricing details
CREATE OR REPLACE FUNCTION get_gang_sheet_pricing(
    p_material_code VARCHAR(50),
    p_finish_code VARCHAR(50)
) RETURNS TABLE(
    sheet_size VARCHAR(50),
    printable_area VARCHAR(50),
    base_price DECIMAL(10,2),
    material_surcharge DECIMAL(10,2),
    finish_surcharge DECIMAL(10,2),
    total_price DECIMAL(10,2),
    price_per_sheet DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY SELECT 
        '20" x 20"' as sheet_size,
        '17" x 17"' as printable_area,
        pricing.base_price,
        pricing.material_surcharge,
        pricing.finish_surcharge,
        pricing.subtotal as total_price,
        pricing.price_per_sheet
    FROM calculate_custom_gang_sheet_price(p_material_code, p_finish_code) as pricing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON FUNCTION calculate_custom_gang_sheet_price IS 'Pricing function for custom gang sheets - sold by sheet, not by sticker count';
COMMENT ON FUNCTION get_gang_sheet_pricing IS 'Get detailed pricing information for gang sheets';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '%', '🎯 CUSTOM GANG SHEET PRICING UPDATE: Complete!';
    RAISE NOTICE '%', '✅ Custom gang sheets: $19.99 per sheet (20" x 20")';
    RAISE NOTICE '%', '✅ Printable area: 17" x 17" with 1.5" margins';
    RAISE NOTICE '%', '✅ Pricing: Per sheet, not per sticker count';
    RAISE NOTICE '%', '✅ Materials and finishes: Applied as percentage of base price';
    RAISE NOTICE '%', '🚀 Custom gang sheet pricing ready!';
END $$;
