-- Automatic sync of authenticated users to public users table
-- This creates triggers to automatically add users when they sign up

-- First, make sure the users table exists (run create_users_table.sql first)

-- Create a function that will be called when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the new user into our public users table
    INSERT INTO public.users (user_id, email, full_name, is_creator, is_active, created_at, metadata)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name'
        ),
        FALSE, -- Default to not creator
        TRUE,
        NEW.created_at,
        NEW.raw_user_meta_data
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the user in our public users table
    UPDATE public.users 
    SET 
        email = NEW.email,
        full_name = COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'display_name',
            users.full_name
        ),
        metadata = NEW.raw_user_meta_data,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle user deletions
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark user as inactive instead of deleting
    UPDATE public.users 
    SET is_active = FALSE, updated_at = NOW()
    WHERE user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual triggers need to be created in the auth schema
-- You'll need to run these in the Supabase dashboard with elevated permissions:

/*
-- Run these commands in Supabase SQL editor with service role permissions:

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for user updates
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create trigger for user deletions
CREATE TRIGGER on_auth_user_deleted
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();
*/

-- Alternative: Create a webhook-based approach
-- This function can be called from your application when users sign up
CREATE OR REPLACE FUNCTION public.sync_user_from_auth(auth_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This function can be called from your app when a user signs up
    -- It will fetch the user data from auth.users and insert into public.users
    
    INSERT INTO public.users (user_id, email, full_name, is_creator, is_active, created_at, metadata)
    SELECT 
        au.id,
        au.email,
        COALESCE(
            au.raw_user_meta_data->>'full_name',
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'display_name'
        ),
        FALSE,
        TRUE,
        au.created_at,
        au.raw_user_meta_data
    FROM auth.users au
    WHERE au.id = auth_user_id
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to sync all existing auth users
CREATE OR REPLACE FUNCTION public.sync_all_auth_users()
RETURNS INTEGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Sync all existing auth users
    INSERT INTO public.users (user_id, email, full_name, is_creator, is_active, created_at, metadata)
    SELECT 
        au.id,
        au.email,
        COALESCE(
            au.raw_user_meta_data->>'full_name',
            au.raw_user_meta_data->>'name',
            au.raw_user_meta_data->>'display_name'
        ),
        FALSE,
        TRUE,
        au.created_at,
        au.raw_user_meta_data
    FROM auth.users au
    WHERE au.id NOT IN (SELECT user_id FROM public.users)
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        metadata = EXCLUDED.metadata,
        updated_at = NOW();
    
    GET DIAGNOSTICS user_count = ROW_COUNT;
    
    -- Update creator status for users who are in creators table
    UPDATE public.users 
    SET is_creator = TRUE, updated_at = NOW()
    WHERE user_id IN (SELECT user_id FROM public.creators);
    
    RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the sync function
SELECT public.sync_all_auth_users() as users_synced;
