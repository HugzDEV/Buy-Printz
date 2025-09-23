-- Create users table to track user information
-- This will sync with Supabase auth.users and provide accessible user data

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL, -- Links to auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    is_creator BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_creator ON users(is_creator);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Create a function to automatically create user records when auth.users are created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (user_id, email, full_name, avatar_url, metadata)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user records
-- Note: This requires the trigger to be created in the auth schema
-- You may need to run this in the Supabase dashboard SQL editor with elevated permissions

-- Alternative: Create a function to sync existing auth users
CREATE OR REPLACE FUNCTION sync_auth_users()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- This function would need to be run with elevated permissions
    -- to access auth.users table
    INSERT INTO users (user_id, email, full_name, avatar_url, metadata)
    SELECT 
        au.id,
        au.email,
        COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data
    FROM auth.users au
    WHERE au.id NOT IN (SELECT user_id FROM users)
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    
    GET DIAGNOSTICS user_count = ROW_COUNT;
    RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user login time
CREATE OR REPLACE FUNCTION update_user_login(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET last_login = NOW(), updated_at = NOW()
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user by auth ID
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_user_id UUID)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email VARCHAR,
    full_name VARCHAR,
    avatar_url TEXT,
    is_creator BOOLEAN,
    is_active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.user_id, u.email, u.full_name, u.avatar_url, 
           u.is_creator, u.is_active, u.last_login, u.created_at, u.updated_at
    FROM users u
    WHERE u.user_id = auth_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Allow service role to manage all users (for admin functions)
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample data if the table is empty (for testing)
INSERT INTO users (user_id, email, full_name, is_creator, is_active)
SELECT 
    '7be0211e-34c8-4357-946a-60b835586a89'::UUID,
    'brainboxjp@gmail.com',
    'Brainboxjp',
    TRUE,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_id = '7be0211e-34c8-4357-946a-60b835586a89'::UUID);

-- Add comments for documentation
COMMENT ON TABLE users IS 'User information table that syncs with Supabase auth.users';
COMMENT ON COLUMN users.user_id IS 'Links to auth.users.id';
COMMENT ON COLUMN users.is_creator IS 'Whether user is registered as a creator';
COMMENT ON COLUMN users.metadata IS 'Additional user metadata from auth';
