-- Complete RLS Setup for BuyPrintz Platform
-- This sets up proper Row Level Security for all tables

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop policies for all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('user_profiles', 'orders', 'canvas_designs', 'banner_templates', 'user_addresses'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Create service role policies (for backend operations)
CREATE POLICY "service_role_user_profiles" ON user_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_orders" ON orders
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_canvas_designs" ON canvas_designs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_banner_templates" ON banner_templates
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_user_addresses" ON user_addresses
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create user policies for user_profiles
CREATE POLICY "users_view_own_profile" ON user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON user_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON user_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create user policies for orders
CREATE POLICY "users_view_own_orders" ON orders
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_orders" ON orders
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_orders" ON orders
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create user policies for canvas_designs
CREATE POLICY "users_view_own_designs" ON canvas_designs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_designs" ON canvas_designs
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_designs" ON canvas_designs
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_designs" ON canvas_designs
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create user policies for banner_templates
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

-- Create user policies for user_addresses
CREATE POLICY "users_view_own_addresses" ON user_addresses
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_addresses" ON user_addresses
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_addresses" ON user_addresses
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_addresses" ON user_addresses
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Verify all policies are created
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'orders', 'canvas_designs', 'banner_templates', 'user_addresses')
ORDER BY tablename, policyname;
