-- Temporarily Disable RLS for Testing
-- WARNING: This disables security! Only use for testing and re-enable after fixing

-- Disable RLS on banner_templates table
ALTER TABLE banner_templates DISABLE ROW LEVEL SECURITY;

-- Disable RLS on canvas_designs table  
ALTER TABLE canvas_designs DISABLE ROW LEVEL SECURITY;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('canvas_designs', 'banner_templates')
ORDER BY tablename;

-- To re-enable RLS after testing, run:
-- ALTER TABLE banner_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE canvas_designs ENABLE ROW LEVEL SECURITY;
