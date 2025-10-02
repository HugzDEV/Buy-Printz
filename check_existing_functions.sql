-- CHECK EXISTING FUNCTIONS
-- This will show you which functions actually exist in your database

SELECT 
    n.nspname as schema_name,
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
AND p.prokind = 'f'  -- Only functions, not procedures
ORDER BY p.proname;
