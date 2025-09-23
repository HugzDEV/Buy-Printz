-- Sync authenticated users from Supabase auth to our users table
-- This needs to be run with elevated permissions to access auth.users

-- First, let's see what's in auth.users (this will only work with elevated permissions)
-- You may need to run this in the Supabase dashboard with service role permissions

-- Create a function to sync auth users (requires elevated permissions)
CREATE OR REPLACE FUNCTION sync_auth_users_to_public()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Insert all auth users into our public users table
    INSERT INTO users (user_id, email, full_name, is_creator, is_active, created_at, metadata)
    SELECT 
        au.id,
        au.email,
        COALESCE(
            au.raw_user_meta_data->>'full_name',
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'display_name'
        ),
        FALSE, -- Default to not creator, will be updated below
        TRUE,
        au.created_at,
        au.raw_user_meta_data
    FROM auth.users au
    WHERE au.id NOT IN (SELECT user_id FROM users)
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    
    GET DIAGNOSTICS user_count = ROW_COUNT;
    
    -- Update creator status for users who are in creators table
    UPDATE users 
    SET is_creator = TRUE, updated_at = NOW()
    WHERE user_id IN (SELECT user_id FROM creators);
    
    RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative approach: Manual insert for known users
-- Since we can't access auth.users directly, let's manually add the users we know exist

-- Add the Brainboxjp user (we know this one exists)
INSERT INTO users (user_id, email, full_name, is_creator, is_active, created_at)
VALUES (
    '7be0211e-34c8-4357-946a-60b835586a89'::UUID,
    'brainboxjp@gmail.com',
    'Brainboxjp',
    TRUE,
    TRUE,
    NOW() - INTERVAL '30 days'
) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    is_creator = EXCLUDED.is_creator,
    updated_at = NOW();

-- Add other known users (you can add more as needed)
-- Replace these with actual user IDs and emails from your auth panel

-- Example: Add a few more users based on what you see in the auth panel
-- You'll need to get the actual UUIDs from the Supabase auth panel

-- Show current status
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_creator THEN 1 END) as creators,
    COUNT(CASE WHEN NOT is_creator THEN 1 END) as regular_users,
    COUNT(CASE WHEN email LIKE '%@buyprintz.com' THEN 1 END) as buyprintz_users,
    COUNT(CASE WHEN email LIKE '%@gmail.com' THEN 1 END) as gmail_users
FROM users;
