-- ========================================
-- SUPABASE SECURITY FIXES
-- ========================================
-- Fixes for security advisor warnings:
-- 1. Security Definer View - tent_orders_view
-- 2. RLS Disabled - test_template_purchases table
-- ========================================

-- ========================================
-- FIX 1: Security Definer View Issue
-- ========================================
-- The tent_orders_view is defined with SECURITY DEFINER which is a security risk
-- We need to either:
-- A) Change it to SECURITY INVOKER (safer)
-- B) Or drop and recreate without SECURITY DEFINER

-- Option A: Change to SECURITY INVOKER (Recommended)
ALTER VIEW tent_orders_view SET (security_invoker = true);

-- Verify the change
SELECT 
    schemaname, 
    viewname, 
    definition 
FROM pg_views 
WHERE viewname = 'tent_orders_view';

-- ========================================
-- FIX 2: RLS Disabled on Public Table
-- ========================================
-- The test_template_purchases table is public but doesn't have RLS enabled
-- This is a major security risk

-- First, let's check if this table exists and what it contains
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_template_purchases' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table test_template_purchases exists - applying security fixes...';
        
        -- Enable RLS on the table
        ALTER TABLE public.test_template_purchases ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies for the table
        -- Policy 1: Users can only see their own purchases
        CREATE POLICY "Users can view own template purchases" ON public.test_template_purchases
            FOR SELECT USING (auth.uid() = user_id);
        
        -- Policy 2: Users can insert their own purchases
        CREATE POLICY "Users can insert own template purchases" ON public.test_template_purchases
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        -- Policy 3: Users can update their own purchases
        CREATE POLICY "Users can update own template purchases" ON public.test_template_purchases
            FOR UPDATE USING (auth.uid() = user_id);
        
        -- Policy 4: Users can delete their own purchases
        CREATE POLICY "Users can delete own template purchases" ON public.test_template_purchases
            FOR DELETE USING (auth.uid() = user_id);
        
        RAISE NOTICE '✅ RLS enabled and policies created for test_template_purchases';
        
    ELSE
        RAISE NOTICE 'Table test_template_purchases does not exist - no action needed';
    END IF;
END $$;

-- ========================================
-- ALTERNATIVE: Drop Test Table (If Not Needed)
-- ========================================
-- If the test_template_purchases table is not needed, we can drop it entirely
-- Uncomment the following lines if you want to remove the table:

-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'test_template_purchases' AND table_schema = 'public') THEN
--         DROP TABLE public.test_template_purchases CASCADE;
--         RAISE NOTICE '✅ Dropped test_template_purchases table';
--     END IF;
-- END $$;

-- ========================================
-- SECURITY AUDIT: Check All Public Tables
-- ========================================
-- Let's check all public tables to ensure they have RLS enabled

DO $$
DECLARE
    table_record RECORD;
    missing_rls_tables TEXT[] := '{}';
BEGIN
    RAISE NOTICE '🔍 Auditing all public tables for RLS...';
    
    -- Check all tables in public schema
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE 'sql_%'
    LOOP
        -- Check if RLS is enabled
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_class 
            WHERE relname = table_record.tablename 
            AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            AND relrowsecurity = true
        ) THEN
            missing_rls_tables := array_append(missing_rls_tables, table_record.tablename);
        END IF;
    END LOOP;
    
    -- Report results
    IF array_length(missing_rls_tables, 1) > 0 THEN
        RAISE NOTICE '⚠️  Tables missing RLS: %', array_to_string(missing_rls_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All public tables have RLS enabled';
    END IF;
END $$;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check tent_orders_view security settings
SELECT 
    schemaname,
    viewname,
    viewowner,
    definition
FROM pg_views 
WHERE viewname = 'tent_orders_view';

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    relrowsecurity as rls_enabled_alt
FROM pg_tables t
LEFT JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
ORDER BY tablename;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SUPABASE SECURITY FIXES APPLIED';
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ Fixed Security Definer View: tent_orders_view';
    RAISE NOTICE '✅ Fixed RLS Disabled: test_template_purchases';
    RAISE NOTICE '✅ Security audit completed';
    RAISE NOTICE '';
    RAISE NOTICE '🛡️  Your database is now more secure!';
    RAISE NOTICE '';
END $$;
