-- Verify Backend Authentication
-- This script helps verify that the backend can access the database properly

-- Check current authentication context
SELECT 
    current_user as current_db_user,
    session_user as session_db_user,
    current_setting('role') as current_role;

-- Test if we can access the tables (this should work with service role)
SELECT 'canvas_designs' as table_name, COUNT(*) as row_count FROM canvas_designs
UNION ALL
SELECT 'banner_templates' as table_name, COUNT(*) as row_count FROM banner_templates
UNION ALL
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM user_profiles
UNION ALL
SELECT 'user_addresses' as table_name, COUNT(*) as row_count FROM user_addresses;

-- Check RLS status on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'orders', 'canvas_designs', 'banner_templates', 'user_addresses')
ORDER BY tablename;

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'orders', 'canvas_designs', 'banner_templates', 'user_addresses')
ORDER BY tablename, policyname;
