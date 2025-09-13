-- 🚀 GALACTIC FEDERATION: UPDATE TENT PRICING
-- Update tent pricing to reflect correct carrying bag pricing and standard bag inclusion

-- ========================================
-- 1. UPDATE TENT PRICING FUNCTION
-- ========================================

-- Update the function to calculate tent pricing with correct accessory prices
CREATE OR REPLACE FUNCTION calculate_tent_price(
    p_tent_size VARCHAR,
    p_accessories JSONB DEFAULT '[]'
)
RETURNS TABLE (
    base_price DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL;
    v_accessories_total DECIMAL := 0;
    v_accessory JSONB;
BEGIN
    -- Set base price based on tent size (reseller pricing)
    IF p_tent_size = '10x10' THEN
        v_base_price := 599.99;
    ELSIF p_tent_size = '10x20' THEN
        v_base_price := 599.99;
    ELSE
        RAISE EXCEPTION 'Invalid tent size: %', p_tent_size;
    END IF;
    
    -- Calculate accessories total with reseller pricing
    FOR v_accessory IN SELECT jsonb_array_elements(p_accessories)
    LOOP
        CASE v_accessory::text
            WHEN '"carrying-bag-wheels"' THEN v_accessories_total := v_accessories_total + 74.99;
            WHEN '"full-wall"' THEN v_accessories_total := v_accessories_total + 230.00;
            WHEN '"half-wall"' THEN v_accessories_total := v_accessories_total + 175.00;
            WHEN '"frame-only"' THEN v_accessories_total := v_accessories_total + 299.99;
        END CASE;
    END LOOP;
    
    RETURN QUERY SELECT v_base_price, v_accessories_total, v_base_price + v_accessories_total;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 2. ADD CANOPY-ONLY PRICING FUNCTION
-- ========================================

-- Function to calculate canopy-only pricing
CREATE OR REPLACE FUNCTION calculate_canopy_only_price(
    p_tent_size VARCHAR,
    p_accessories JSONB DEFAULT '[]'
)
RETURNS TABLE (
    base_price DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL := 325.00; -- Canopy only base price
    v_accessories_total DECIMAL := 0;
    v_accessory JSONB;
BEGIN
    -- Canopy only is always $325.00 regardless of size
    
    -- Calculate accessories total for canopy-only orders
    FOR v_accessory IN SELECT jsonb_array_elements(p_accessories)
    LOOP
        CASE v_accessory::text
            WHEN '"carrying-bag-wheels"' THEN v_accessories_total := v_accessories_total + 74.99;
            WHEN '"full-wall"' THEN v_accessories_total := v_accessories_total + 230.00;
            WHEN '"half-wall"' THEN v_accessories_total := v_accessories_total + 175.00;
            WHEN '"frame-only"' THEN v_accessories_total := v_accessories_total + 299.99;
            -- Sandbags are charged for canopy-only orders
            WHEN '"sandbags"' THEN v_accessories_total := v_accessories_total + 74.99;
        END CASE;
    END LOOP;
    
    RETURN QUERY SELECT v_base_price, v_accessories_total, v_base_price + v_accessories_total;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🚀 GALACTIC FEDERATION: RESELLER TENT PRICING UPDATE COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Reseller tent pricing:';
    RAISE NOTICE '   - Complete tent includes standard bag (FREE)';
    RAISE NOTICE '   - Complete tent includes ropes & stakes (FREE)';
    RAISE NOTICE '   - Carrying Bag w/ Wheels: $74.99 (upgrade from standard bag)';
    RAISE NOTICE '   - Full Wall: $230.00';
    RAISE NOTICE '   - Half Wall: $175.00';
    RAISE NOTICE '   - Frame Only: $299.99';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Base tent prices:';
    RAISE NOTICE '   - 10x10 Complete Tent: $599.99 (includes bag, ropes & stakes)';
    RAISE NOTICE '   - 10x20 Complete Tent: $599.99 (includes bag, ropes & stakes)';
    RAISE NOTICE '   - Canopy Only: $325.00 (sandbags charged separately)';
    RAISE NOTICE '';
    RAISE NOTICE '🌙 RESELLER TENT PRICING UPDATED FOR GALACTIC DOMINATION! 🚀';
END $$;
