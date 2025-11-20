-- SAFE FINAL FUNCTION SECURITY FIX
-- Only fixes functions that actually exist

-- Try to fix the 12-parameter version, but handle if it doesn't exist
DO $$
BEGIN
    -- Check if the 12-parameter function exists
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'calculate_banner_price'
        AND pg_get_function_identity_arguments(p.oid) = 'p_width numeric, p_height numeric, p_material text, p_sides integer, p_pole_pockets text, p_hem text, p_grommets text, p_webbing text, p_corners text, p_rope text, p_windslits text, p_turnaround text, p_quantity integer'
    ) THEN
        -- Function exists, try to fix it
        BEGIN
            ALTER FUNCTION calculate_banner_price(numeric, numeric, text, integer, text, text, text, text, text, text, text, integer) SET search_path = '';
            RAISE NOTICE 'SUCCESS: Fixed 12-parameter calculate_banner_price function';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: Could not fix 12-parameter function: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'SKIP: 12-parameter calculate_banner_price function does not exist';
    END IF;
END $$;

-- Verify all calculate_banner_price functions
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
