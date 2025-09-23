-- Check what tables currently exist in your Supabase database
-- Run this in your Supabase SQL editor to see all current tables

-- List all tables in the public schema
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for any tables that might have been renamed
-- Look for tables with similar names
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
    AND (
        tablename LIKE '%template%' OR
        tablename LIKE '%creator%' OR
        tablename LIKE '%order%' OR
        tablename LIKE '%user%' OR
        tablename LIKE '%canvas%' OR
        tablename LIKE '%design%' OR
        tablename LIKE '%banner%' OR
        tablename LIKE '%tin%' OR
        tablename LIKE '%business%' OR
        tablename LIKE '%shipping%'
    )
ORDER BY tablename;

-- Check table structure for key tables (if they exist)
-- This will help identify if columns are missing or renamed

-- Check orders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check creators table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'creators' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check creator_templates table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'creator_templates' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check banner_templates table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'banner_templates' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check canvas_states table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'canvas_states' AND table_schema = 'public'
ORDER BY ordinal_position;
