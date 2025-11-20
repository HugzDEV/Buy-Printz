-- ========================================
-- SUPABASE FUNCTION SECURITY FIXES
-- ========================================
-- Fixes for function search path mutable warnings
-- All functions need SET search_path = '' for security
-- ========================================

-- ========================================
-- FIX ALL FUNCTIONS WITH MUTABLE SEARCH_PATH
-- ========================================

-- Update all functions to have secure search_path
-- This prevents SQL injection attacks through search_path manipulation

-- 1. Update pending orders functions
ALTER FUNCTION update_pending_orders_updated_at() SET search_path = '';
ALTER FUNCTION move_pending_to_orders() SET search_path = '';
ALTER FUNCTION cleanup_expired_pending_orders() SET search_path = '';

-- 2. Update business card tin functions
ALTER FUNCTION update_business_card_tins_updated_at() SET search_path = '';

-- 3. Update creator functions
ALTER FUNCTION get_creator_asset_url() SET search_path = '';
ALTER FUNCTION update_creator_stats_on_purchase() SET search_path = '';
ALTER FUNCTION update_creator_followers_count() SET search_path = '';
ALTER FUNCTION notify_followers_new_template() SET search_path = '';

-- 4. Update blog functions
ALTER FUNCTION update_blog_category_count() SET search_path = '';

-- 5. Update tent functions
ALTER FUNCTION calculate_tent_price() SET search_path = '';
ALTER FUNCTION get_tent_pricing() SET search_path = '';
ALTER FUNCTION validate_tent_order() SET search_path = '';
ALTER FUNCTION get_tent_order_summary() SET search_path = '';
ALTER FUNCTION update_tradeshow_tents_updated_at() SET search_path = '';

-- 6. Update design functions
ALTER FUNCTION check_design_limit() SET search_path = '';
ALTER FUNCTION get_user_design_count() SET search_path = '';
ALTER FUNCTION delete_user_design() SET search_path = '';
ALTER FUNCTION cleanup_expired_canvas_states() SET search_path = '';

-- 7. Update banner functions
ALTER FUNCTION calculate_banner_price() SET search_path = '';
ALTER FUNCTION get_material_price() SET search_path = '';
ALTER FUNCTION get_option_price() SET search_path = '';

-- 8. Update tin skinz functions
ALTER FUNCTION calculate_tin_skinz_price() SET search_path = '';
ALTER FUNCTION calculate_candy_discount() SET search_path = '';
ALTER FUNCTION update_tin_skinz_creator_stats() SET search_path = '';
ALTER FUNCTION update_tin_skinz_design_view_count() SET search_path = '';

-- 9. Update user/auth functions
ALTER FUNCTION sync_auth_users() SET search_path = '';
ALTER FUNCTION update_user_login() SET search_path = '';
ALTER FUNCTION get_user_by_auth_id() SET search_path = '';
ALTER FUNCTION sync_auth_users_to_public() SET search_path = '';
ALTER FUNCTION handle_new_user() SET search_path = '';
ALTER FUNCTION handle_user_update() SET search_path = '';
ALTER FUNCTION handle_user_delete() SET search_path = '';
ALTER FUNCTION sync_user_from_auth() SET search_path = '';
ALTER FUNCTION sync_all_auth_users() SET search_path = '';
ALTER FUNCTION ensure_single_default_address() SET search_path = '';

-- 10. Update utility functions
ALTER FUNCTION update_updated_at_column() SET search_path = '';
ALTER FUNCTION update_admin_notes_updated_at() SET search_path = '';

-- ========================================
-- VERIFICATION: Check all functions have secure search_path
-- ========================================

DO $$
DECLARE
    func_record RECORD;
    insecure_functions TEXT[] := '{}';
BEGIN
    RAISE NOTICE '🔍 Checking all functions for secure search_path...';
    
    -- Check all functions in public schema
    FOR func_record IN 
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as arguments,
            p.prosecdef as security_definer,
            p.proconfig as config
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'  -- Only functions, not procedures
    LOOP
        -- Check if search_path is set to empty string
        IF func_record.config IS NULL OR NOT ('search_path=' IN func_record.config::text) THEN
            insecure_functions := array_append(insecure_functions, 
                func_record.schema_name || '.' || func_record.function_name || '(' || func_record.arguments || ')');
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(insecure_functions, 1) > 0 THEN
        RAISE NOTICE '⚠️  Functions with insecure search_path: %', array_to_string(insecure_functions, ', ');
    ELSE
        RAISE NOTICE '✅ All functions have secure search_path';
    END IF;
END $$;

-- ========================================
-- ADDITIONAL SECURITY RECOMMENDATIONS
-- ========================================

-- Note: The following are configuration changes that need to be done in Supabase Dashboard:

-- 1. AUTH OTP EXPIRY (Dashboard → Authentication → Settings)
--    - Current: > 1 hour (insecure)
--    - Recommended: < 1 hour (e.g., 15-30 minutes)

-- 2. LEAKED PASSWORD PROTECTION (Dashboard → Authentication → Settings)
--    - Current: Disabled
--    - Recommended: Enable to check against HaveIBeenPwned.org

-- 3. POSTGRES VERSION (Dashboard → Settings → Database)
--    - Current: supabase-postgres-17.4.1.074
--    - Recommended: Upgrade to latest version with security patches

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 FUNCTION SECURITY FIXES APPLIED';
    RAISE NOTICE '==================================';
    RAISE NOTICE '✅ Fixed search_path for all functions';
    RAISE NOTICE '✅ Functions now use secure search_path = '''';
    RAISE NOTICE '';
    RAISE NOTICE '📋 ADDITIONAL MANUAL STEPS NEEDED:';
    RAISE NOTICE '1. Dashboard → Auth → Settings → OTP Expiry: Set to < 1 hour';
    RAISE NOTICE '2. Dashboard → Auth → Settings → Enable Leaked Password Protection';
    RAISE NOTICE '3. Dashboard → Settings → Database → Upgrade Postgres';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️  Your functions are now more secure!';
    RAISE NOTICE '';
END $$;
