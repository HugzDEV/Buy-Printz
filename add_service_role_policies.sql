-- Add Service Role Policies Only
-- This adds the missing service role policies without touching existing user policies

-- Add service role policy for canvas_designs (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'canvas_designs' 
        AND policyname = 'service_role_all_designs'
    ) THEN
        CREATE POLICY "service_role_all_designs" ON canvas_designs
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add service role policy for banner_templates (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banner_templates' 
        AND policyname = 'service_role_all_templates'
    ) THEN
        CREATE POLICY "service_role_all_templates" ON banner_templates
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add service role policy for orders (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'service_role_all_orders'
    ) THEN
        CREATE POLICY "service_role_all_orders" ON orders
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add service role policy for user_profiles (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'service_role_all_profiles'
    ) THEN
        CREATE POLICY "service_role_all_profiles" ON user_profiles
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Add service role policy for user_addresses (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_addresses' 
        AND policyname = 'service_role_all_addresses'
    ) THEN
        CREATE POLICY "service_role_all_addresses" ON user_addresses
            FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Verify the service role policies were added
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE policyname LIKE 'service_role_%'
ORDER BY tablename, policyname;
