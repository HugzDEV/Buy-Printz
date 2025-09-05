-- Check Templates Table Status
-- Run this SQL in your Supabase SQL Editor to diagnose template issues

-- Check if banner_templates table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'banner_templates' 
ORDER BY ordinal_position;

-- Check if there are any templates in the table
SELECT COUNT(*) as template_count FROM banner_templates;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'banner_templates';

-- Check existing policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'banner_templates';

-- Check if there are any templates for the current user (if authenticated)
-- This will only work if you're authenticated in Supabase
SELECT id, name, category, is_public, created_at 
FROM banner_templates 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
