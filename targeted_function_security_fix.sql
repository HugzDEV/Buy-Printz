-- TARGETED FUNCTION SECURITY FIX
-- Based on your actual function list, fixing only the ones that need it

-- Functions that need search_path fixes (NEEDS FIX status)
ALTER FUNCTION calculate_banner_price(numeric, numeric, text, text, text, text, text, text, text, text, text) SET search_path = '';
ALTER FUNCTION calculate_banner_price(numeric, numeric, text, integer, text, text, text, text, text, text, text, integer) SET search_path = '';
ALTER FUNCTION calculate_candy_discount(integer) SET search_path = '';
ALTER FUNCTION calculate_tent_price(character varying, boolean, jsonb, jsonb) SET search_path = '';
ALTER FUNCTION calculate_tin_skinz_price(integer, boolean, boolean) SET search_path = '';
ALTER FUNCTION check_design_limit() SET search_path = '';
ALTER FUNCTION delete_user_design(uuid, uuid) SET search_path = '';
ALTER FUNCTION ensure_single_default_address() SET search_path = '';
ALTER FUNCTION get_creator_asset_url(text) SET search_path = '';
ALTER FUNCTION get_material_price(text) SET search_path = '';
ALTER FUNCTION get_option_price(text, text, numeric) SET search_path = '';
ALTER FUNCTION get_tent_order_summary(uuid) SET search_path = '';
ALTER FUNCTION get_tent_pricing(character varying, boolean, boolean, boolean) SET search_path = '';
ALTER FUNCTION get_user_by_auth_id(uuid) SET search_path = '';
ALTER FUNCTION get_user_design_count(uuid) SET search_path = '';
ALTER FUNCTION move_pending_to_orders(uuid) SET search_path = '';
ALTER FUNCTION notify_followers_new_template() SET search_path = '';
ALTER FUNCTION sync_user_from_auth(uuid) SET search_path = '';
ALTER FUNCTION update_creator_stats_on_purchase() SET search_path = '';
ALTER FUNCTION update_tin_skinz_creator_stats() SET search_path = '';
ALTER FUNCTION update_tin_skinz_design_view_count() SET search_path = '';
ALTER FUNCTION update_user_login(uuid) SET search_path = '';

-- Verification query to check results
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proconfig IS NULL OR NOT (p.proconfig::text LIKE '%search_path=%') 
        THEN 'NEEDS FIX' 
        ELSE 'SECURE' 
    END as security_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
AND p.proname IN (
    'calculate_banner_price', 'calculate_candy_discount', 'calculate_tent_price',
    'calculate_tin_skinz_price', 'check_design_limit', 'delete_user_design',
    'ensure_single_default_address', 'get_creator_asset_url', 'get_material_price',
    'get_option_price', 'get_tent_order_summary', 'get_tent_pricing',
    'get_user_by_auth_id', 'get_user_design_count', 'move_pending_to_orders',
    'notify_followers_new_template', 'sync_user_from_auth', 'update_creator_stats_on_purchase',
    'update_tin_skinz_creator_stats', 'update_tin_skinz_design_view_count', 'update_user_login'
)
ORDER BY p.proname, pg_get_function_identity_arguments(p.oid);
