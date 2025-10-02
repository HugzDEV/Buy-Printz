-- CHECK EXISTING CALCULATE_BANNER_PRICE FUNCTIONS
-- This will show us exactly what functions exist

SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.prosecdef as security_definer,
    p.proconfig as config,
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
