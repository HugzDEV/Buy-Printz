-- 🏕️ COMPLETE TENT ORDER VALIDATION FIX
-- This script ensures the validate_tent_order function and trigger are properly set up

-- ========================================
-- 1. DROP EXISTING TRIGGER AND FUNCTION
-- ========================================

DROP TRIGGER IF EXISTS validate_tent_order_trigger ON orders;
DROP FUNCTION IF EXISTS validate_tent_order();

-- ========================================
-- 2. RECREATE THE VALIDATION FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION validate_tent_order()
RETURNS TRIGGER AS $$
BEGIN
    -- Only validate tradeshow tent orders
    IF NEW.product_type = 'tradeshow_tent' THEN
        -- Check if tent_size is valid
        IF NEW.tent_size IS NULL OR NEW.tent_size NOT IN ('10x10', '10x20') THEN
            RAISE EXCEPTION 'Invalid tent size for tradeshow tent order. Must be 10x10 or 10x20, got: %', COALESCE(NEW.tent_size, 'NULL');
        END IF;
        
        -- Set default values for missing tent fields
        IF NEW.tent_type IS NULL THEN NEW.tent_type := 'event-tent'; END IF;
        IF NEW.tent_material IS NULL THEN NEW.tent_material := '6oz-tent-fabric'; END IF;
        IF NEW.tent_frame_type IS NULL THEN NEW.tent_frame_type := '40mm-aluminum-hex'; END IF;
        IF NEW.tent_print_method IS NULL THEN NEW.tent_print_method := 'dye-sublimation'; END IF;
        IF NEW.tent_accessories IS NULL THEN NEW.tent_accessories := '[]'; END IF;
        IF NEW.tent_reinforced_strip_color IS NULL THEN NEW.tent_reinforced_strip_color := 'white'; END IF;
        IF NEW.tent_package IS NULL THEN NEW.tent_package := 'complete-tent'; END IF;
        IF NEW.tent_wall_option IS NULL THEN NEW.tent_wall_option := 'no-walls'; END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 3. CREATE THE TRIGGER
-- ========================================

CREATE TRIGGER validate_tent_order_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_tent_order();

-- ========================================
-- 4. VERIFY TRIGGER CREATION
-- ========================================

-- Check if the trigger was created successfully
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'validate_tent_order_trigger';

-- ========================================
-- 5. TEST THE TRIGGER WITH A SAMPLE INSERT
-- ========================================

-- Test the trigger with a valid tent order (this will be rolled back)
DO $$
BEGIN
    -- This should work without errors
    INSERT INTO orders (
        user_id, 
        product_type, 
        tent_size, 
        tent_type, 
        tent_material, 
        tent_frame_type, 
        tent_print_method, 
        tent_accessories, 
        tent_reinforced_strip_color, 
        tent_package, 
        tent_wall_option,
        total_amount,
        status
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', -- Test user ID
        'tradeshow_tent',
        '10x10',
        'event-tent',
        '6oz-tent-fabric',
        '40mm-aluminum-hex',
        'dye-sublimation',
        '[]',
        'white',
        'complete-tent',
        'no-walls',
        100.00,
        'pending'
    );
    
    -- If we get here, the trigger is working
    RAISE NOTICE '✅ TEST PASSED: Valid tent order inserted successfully';
    
    -- Clean up the test record
    DELETE FROM orders WHERE user_id = '00000000-0000-0000-0000-000000000000';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ TEST FAILED: %', SQLERRM;
END $$;

-- ========================================
-- 6. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🏕️ TENT ORDER VALIDATION COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Function: validate_tent_order() - RECREATED';
    RAISE NOTICE '✅ Trigger: validate_tent_order_trigger - ATTACHED';
    RAISE NOTICE '';
    RAISE NOTICE '✅ The trigger will now validate:';
    RAISE NOTICE '   - tent_size must be 10x10 or 10x20 for tradeshow_tent orders';
    RAISE NOTICE '   - Set default values for missing tent fields';
    RAISE NOTICE '   - Provide detailed error messages for debugging';
    RAISE NOTICE '';
    RAISE NOTICE '🌙 TENT ORDER VALIDATION READY! 🏕️';
END $$;
