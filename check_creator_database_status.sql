-- BuyPrintz Creator Marketplace Database Status Check
-- Run this script in your Supabase SQL Editor to check the current status

-- =============================================
-- CHECK TABLE EXISTENCE
-- =============================================
SELECT 
    'Table Status Check' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('creators', 'creator_templates', 'template_purchases') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('creators', 'creator_templates', 'template_purchases')
ORDER BY table_name;

-- =============================================
-- CHECK ROW LEVEL SECURITY STATUS
-- =============================================
SELECT 
    'RLS Status Check' as check_type,
    tablename as table_name,
    CASE 
        WHEN rowsecurity = true THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('creators', 'creator_templates', 'template_purchases')
ORDER BY tablename;

-- =============================================
-- CHECK INDEXES
-- =============================================
SELECT 
    'Index Check' as check_type,
    tablename as table_name,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('creators', 'creator_templates', 'template_purchases')
GROUP BY tablename
ORDER BY tablename;

-- =============================================
-- CHECK POLICIES
-- =============================================
SELECT 
    'Policy Check' as check_type,
    tablename as table_name,
    policyname as policy_name,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('creators', 'creator_templates', 'template_purchases')
ORDER BY tablename, policyname;

-- =============================================
-- CHECK TRIGGERS
-- =============================================
SELECT 
    'Trigger Check' as check_type,
    event_object_table as table_name,
    trigger_name,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as trigger_status
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
AND event_object_table IN ('creators', 'creator_templates', 'template_purchases')
ORDER BY event_object_table, trigger_name;

-- =============================================
-- SUMMARY
-- =============================================
WITH table_check AS (
    SELECT COUNT(*) as table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('creators', 'creator_templates', 'template_purchases')
),
rls_check AS (
    SELECT COUNT(*) as rls_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('creators', 'creator_templates', 'template_purchases')
    AND rowsecurity = true
),
policy_check AS (
    SELECT COUNT(DISTINCT tablename) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('creators', 'creator_templates', 'template_purchases')
)
SELECT 
    'SUMMARY' as check_type,
    CASE 
        WHEN tc.table_count = 3 AND rc.rls_count = 3 AND pc.policy_count = 3 
        THEN '🎉 ALL SYSTEMS GO - Creator marketplace is fully set up!'
        ELSE '⚠️ SETUP REQUIRED - Run supabase_creator_marketplace_update.sql'
    END as overall_status,
    tc.table_count || '/3 tables' as tables_status,
    rc.rls_count || '/3 RLS enabled' as rls_status,
    pc.policy_count || '/3 tables with policies' as policies_status
FROM table_check tc, rls_check rc, policy_check pc;
