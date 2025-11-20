-- Fix Templates RLS Policy
-- Run this SQL in your Supabase SQL Editor to fix the RLS issue

-- Drop the service role policy if it exists
DROP POLICY IF EXISTS "Service role can manage all templates" ON banner_templates;

-- Create the service role policy to allow backend operations
CREATE POLICY "Service role can manage all templates" ON banner_templates
    FOR ALL USING (auth.role() = 'service_role');

-- Verify the policies exist
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'banner_templates'
ORDER BY policyname;
