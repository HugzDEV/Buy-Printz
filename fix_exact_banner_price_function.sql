-- FIX EXACT BANNER PRICE FUNCTION
-- Using the exact signature from your database

ALTER FUNCTION calculate_banner_price(numeric, numeric, text, integer, text, text, text, text, text, text, text, text, integer) SET search_path = '';

-- Verify the fix worked
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
AND p.proname = 'calculate_banner_price'
ORDER BY pg_get_function_identity_arguments(p.oid);
