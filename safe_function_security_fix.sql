-- SAFE FUNCTION SECURITY FIXES
-- This version checks if functions exist before trying to alter them

-- Function to safely set search_path for a function
CREATE OR REPLACE FUNCTION safe_set_search_path(func_name TEXT, func_args TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Check if function exists
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = func_name
        AND (func_args = '' OR pg_get_function_identity_arguments(p.oid) = func_args)
    ) THEN
        -- Function exists, try to alter it
        BEGIN
            EXECUTE format('ALTER FUNCTION %I(%s) SET search_path = ''''', func_name, func_args);
            result := 'SUCCESS: ' || func_name || '(' || func_args || ')';
        EXCEPTION WHEN OTHERS THEN
            result := 'ERROR: ' || func_name || '(' || func_args || ') - ' || SQLERRM;
        END;
    ELSE
        result := 'SKIP: ' || func_name || '(' || func_args || ') - Function does not exist';
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Now safely fix all functions
DO $$
DECLARE
    result TEXT;
    results TEXT[] := '{}';
BEGIN
    RAISE NOTICE '🔧 Safely fixing function search_path settings...';
    RAISE NOTICE '';
    
    -- List of functions to fix (name, arguments)
    results := array_append(results, safe_set_search_path('update_pending_orders_updated_at', ''));
    results := array_append(results, safe_set_search_path('update_business_card_tins_updated_at', ''));
    results := array_append(results, safe_set_search_path('get_creator_asset_url', 'text'));
    results := array_append(results, safe_set_search_path('update_creator_stats_on_purchase', 'uuid'));
    results := array_append(results, safe_set_search_path('move_pending_to_orders', ''));
    results := array_append(results, safe_set_search_path('cleanup_expired_pending_orders', ''));
    results := array_append(results, safe_set_search_path('update_blog_category_count', ''));
    results := array_append(results, safe_set_search_path('calculate_tent_price', 'varchar, jsonb'));
    results := array_append(results, safe_set_search_path('check_design_limit', 'uuid, text'));
    results := array_append(results, safe_set_search_path('get_user_design_count', 'uuid'));
    results := array_append(results, safe_set_search_path('delete_user_design', 'uuid, uuid'));
    results := array_append(results, safe_set_search_path('get_tent_pricing', 'varchar'));
    results := array_append(results, safe_set_search_path('cleanup_expired_canvas_states', ''));
    results := array_append(results, safe_set_search_path('update_tradeshow_tents_updated_at', ''));
    results := array_append(results, safe_set_search_path('update_creator_followers_count', ''));
    results := array_append(results, safe_set_search_path('calculate_banner_price', 'varchar, jsonb'));
    results := array_append(results, safe_set_search_path('get_material_price', 'varchar'));
    results := array_append(results, safe_set_search_path('get_option_price', 'varchar'));
    results := array_append(results, safe_set_search_path('notify_followers_new_template', 'uuid'));
    results := array_append(results, safe_set_search_path('calculate_tin_skinz_price', 'varchar, jsonb'));
    results := array_append(results, safe_set_search_path('calculate_candy_discount', 'integer'));
    results := array_append(results, safe_set_search_path('validate_tent_order', ''));
    results := array_append(results, safe_set_search_path('update_tin_skinz_creator_stats', 'uuid'));
    results := array_append(results, safe_set_search_path('update_tin_skinz_design_view_count', 'uuid'));
    results := array_append(results, safe_set_search_path('sync_auth_users', ''));
    results := array_append(results, safe_set_search_path('update_user_login', 'uuid'));
    results := array_append(results, safe_set_search_path('get_user_by_auth_id', 'uuid'));
    results := array_append(results, safe_set_search_path('sync_auth_users_to_public', ''));
    results := array_append(results, safe_set_search_path('handle_new_user', ''));
    results := array_append(results, safe_set_search_path('get_tent_order_summary', 'uuid'));
    results := array_append(results, safe_set_search_path('handle_user_update', ''));
    results := array_append(results, safe_set_search_path('handle_user_delete', ''));
    results := array_append(results, safe_set_search_path('sync_user_from_auth', 'uuid'));
    results := array_append(results, safe_set_search_path('sync_all_auth_users', ''));
    results := array_append(results, safe_set_search_path('ensure_single_default_address', 'uuid'));
    results := array_append(results, safe_set_search_path('update_updated_at_column', ''));
    results := array_append(results, safe_set_search_path('update_admin_notes_updated_at', ''));
    
    -- Report results
    RAISE NOTICE 'Results:';
    FOR i IN 1..array_length(results, 1) LOOP
        RAISE NOTICE '%', results[i];
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ Function security fixes completed safely!';
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS safe_set_search_path(TEXT, TEXT);
