-- Re-enable RLS After Testing
-- Run this after testing to restore security

-- Re-enable RLS on banner_templates table
ALTER TABLE banner_templates ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on canvas_designs table
ALTER TABLE canvas_designs ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('canvas_designs', 'banner_templates')
ORDER BY tablename;
