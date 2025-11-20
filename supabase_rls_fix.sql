-- Temporary fix for RLS issues during development
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS temporarily on problematic tables
-- This allows the service role key to work without RLS blocking operations

-- Disable RLS on orders table temporarily
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on canvas_designs table temporarily  
ALTER TABLE canvas_designs DISABLE ROW LEVEL SECURITY;

-- Disable RLS on canvas_states table (if it exists)
-- If the table doesn't exist, this will error - ignore it
ALTER TABLE canvas_states DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_preferences table (if it exists)
-- If the table doesn't exist, this will error - ignore it  
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Disable RLS on banner_templates table (if it exists)
-- If the table doesn't exist, this will error - ignore it
ALTER TABLE banner_templates DISABLE ROW LEVEL SECURITY;

-- Disable RLS on design_history table (if it exists)
-- If the table doesn't exist, this will error - ignore it
ALTER TABLE design_history DISABLE ROW LEVEL SECURITY;

-- Keep user_profiles and user_addresses with RLS enabled for security
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_addresses DISABLE ROW LEVEL SECURITY;

-- Create missing tables that the backend expects

-- Create canvas_states table if it doesn't exist
CREATE TABLE IF NOT EXISTS canvas_states (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_id TEXT,
    canvas_data JSONB NOT NULL,
    banner_settings JSONB,
    is_checkout_session BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    default_banner_type TEXT DEFAULT 'vinyl-13oz',
    default_banner_size TEXT DEFAULT '2ft x 4ft',
    editor_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create banner_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS banner_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Custom',
    description TEXT DEFAULT '',
    canvas_data JSONB NOT NULL,
    banner_type TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create design_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS design_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    design_id UUID REFERENCES canvas_designs(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    version_number INTEGER NOT NULL,
    canvas_data JSONB NOT NULL,
    changes_description TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to orders table if they don't exist
-- These may cause errors if columns already exist - ignore those errors
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_material TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_finish TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_size TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS banner_category TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS print_options JSONB DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_info JSONB;

-- Add missing columns to canvas_designs table if they don't exist
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS banner_type TEXT;
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS banner_material TEXT;
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS banner_finish TEXT;
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS banner_size TEXT;
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS banner_category TEXT;
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#ffffff';
ALTER TABLE canvas_designs ADD COLUMN IF NOT EXISTS print_options JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_states_user_id ON canvas_states(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_states_session_id ON canvas_states(session_id);
CREATE INDEX IF NOT EXISTS idx_canvas_states_expires_at ON canvas_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_templates_user_id ON banner_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_templates_is_public ON banner_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_design_history_design_id ON design_history(design_id);
CREATE INDEX IF NOT EXISTS idx_design_history_user_id ON design_history(user_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add triggers for updated_at on new tables
-- Drop triggers first if they exist, then create them
DROP TRIGGER IF EXISTS update_canvas_states_updated_at ON canvas_states;
CREATE TRIGGER update_canvas_states_updated_at
    BEFORE UPDATE ON canvas_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_banner_templates_updated_at ON banner_templates;
CREATE TRIGGER update_banner_templates_updated_at
    BEFORE UPDATE ON banner_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
