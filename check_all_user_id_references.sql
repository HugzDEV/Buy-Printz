-- Check for any database objects that reference user_id
SELECT 
    'FUNCTION' as object_type,
    routine_name as object_name,
    routine_definition as definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_definition LIKE '%user_id%'

UNION ALL

SELECT 
    'TRIGGER' as object_type,
    trigger_name as object_name,
    action_statement as definition
FROM information_schema.triggers 
WHERE event_object_schema = 'public'
AND action_statement LIKE '%user_id%'

UNION ALL

SELECT 
    'CONSTRAINT' as object_type,
    constraint_name as object_name,
    check_clause as definition
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public'
AND check_clause LIKE '%user_id%';
