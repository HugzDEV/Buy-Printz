-- Supabase Templates Table Setup
-- Run this SQL in your Supabase SQL Editor
-- This script handles existing tables and policies gracefully

-- Create banner_templates table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS banner_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Custom',
    description TEXT DEFAULT '',
    canvas_data JSONB NOT NULL,
    banner_type TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_banner_templates_user_id ON banner_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_templates_created_at ON banner_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banner_templates_is_public ON banner_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_banner_templates_category ON banner_templates(category);

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE banner_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can view public templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can update own templates" ON banner_templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON banner_templates;

-- Create RLS policies for banner_templates
-- Allow service role to bypass RLS for backend operations
CREATE POLICY "Service role can manage all templates" ON banner_templates
    FOR ALL USING (auth.role() = 'service_role');

-- User-facing policies (for direct frontend access)
CREATE POLICY "Users can view own templates" ON banner_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON banner_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own templates" ON banner_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON banner_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON banner_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at (only if it doesn't exist)
DROP TRIGGER IF EXISTS update_banner_templates_updated_at ON banner_templates;
CREATE TRIGGER update_banner_templates_updated_at
    BEFORE UPDATE ON banner_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
