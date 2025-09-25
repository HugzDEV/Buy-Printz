-- Check for existing functions that might reference user_id
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition LIKE '%user_id%'
ORDER BY routine_name;
