-- 🏕️ ATTACH TENT ORDER VALIDATION TRIGGER
-- This script ensures the validate_tent_order trigger is properly attached to the orders table

-- ========================================
-- 1. DROP EXISTING TRIGGER IF IT EXISTS
-- ========================================

DROP TRIGGER IF EXISTS validate_tent_order_trigger ON orders;

-- ========================================
-- 2. CREATE THE TRIGGER
-- ========================================

-- Attach the validate_tent_order function as a trigger on the orders table
CREATE TRIGGER validate_tent_order_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_tent_order();

-- ========================================
-- 3. VERIFY TRIGGER CREATION
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
-- 4. SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '🏕️ TENT ORDER VALIDATION TRIGGER ATTACHED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Trigger Details:';
    RAISE NOTICE '   - Name: validate_tent_order_trigger';
    RAISE NOTICE '   - Table: orders';
    RAISE NOTICE '   - Event: BEFORE INSERT OR UPDATE';
    RAISE NOTICE '   - Function: validate_tent_order()';
    RAISE NOTICE '';
    RAISE NOTICE '✅ The trigger will now validate:';
    RAISE NOTICE '   - tent_size must be 10x10 or 10x20 for tradeshow_tent orders';
    RAISE NOTICE '   - Set default values for missing tent fields';
    RAISE NOTICE '';
    RAISE NOTICE '🌙 TENT ORDER VALIDATION READY! 🏕️';
END $$;
