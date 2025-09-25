-- Check the update_creator_stats_on_purchase function definition
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'update_creator_stats_on_purchase';
