-- Check RLS Policies Status
-- Run this SQL in your Supabase SQL Editor to check current RLS setup

-- Check if service role policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('canvas_designs', 'banner_templates', 'orders', 'user_profiles', 'user_addresses')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('canvas_designs', 'banner_templates', 'orders', 'user_profiles', 'user_addresses')
ORDER BY tablename;

-- Test if we can insert a template (this will show the exact error)
-- Uncomment the line below to test (replace with actual user_id)
-- INSERT INTO banner_templates (user_id, name, canvas_data) VALUES ('your-user-id-here', 'test', '{}');
