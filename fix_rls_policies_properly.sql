-- Fix RLS Policies Properly for BuyPrintz Platform
-- This ensures RLS is enabled with proper service role access

-- First, let's check current policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('canvas_designs', 'banner_templates')
ORDER BY tablename, policyname;

-- Drop all existing policies to recreate them properly
DROP POLICY IF EXISTS "Service role can manage all designs" ON canvas_designs;
DROP POLICY IF EXISTS "Users can view own designs" ON canvas_designs;
DROP POLICY IF EXISTS "Users can insert own designs" ON canvas_designs;
DROP POLICY IF EXISTS "Users can update own designs" ON canvas_designs;
DROP POLICY IF EXISTS "Users can delete own designs" ON canvas_designs;

DROP POLICY IF EXISTS "Service role can manage all templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can view own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can view public templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON banner_templates;

-- Create new policies with proper precedence
-- Service role policies (highest priority - for backend operations)
CREATE POLICY "service_role_all_designs" ON canvas_designs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_templates" ON banner_templates
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- User policies (for frontend direct access)
CREATE POLICY "users_view_own_designs" ON canvas_designs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_designs" ON canvas_designs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_designs" ON canvas_designs
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_designs" ON canvas_designs
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_view_own_templates" ON banner_templates
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_view_public_templates" ON banner_templates
    FOR SELECT TO authenticated USING (is_public = true);

CREATE POLICY "users_insert_own_templates" ON banner_templates
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_templates" ON banner_templates
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_templates" ON banner_templates
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Verify the new policies
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('canvas_designs', 'banner_templates')
ORDER BY tablename, policyname;
