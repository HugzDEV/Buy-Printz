-- Supabase Database Function to Enforce 10-Design Limit
-- This enforces the storage limit at the database level for better data integrity
-- Run this SQL in your Supabase SQL Editor

-- Create function to check design count before insert
CREATE OR REPLACE FUNCTION check_design_limit()
RETURNS TRIGGER AS $$
DECLARE
    design_count INTEGER;
    max_designs INTEGER := 10;
BEGIN
    -- Count existing designs for this user
    SELECT COUNT(*) INTO design_count
    FROM canvas_designs 
    WHERE user_id = NEW.user_id;
    
    -- Check if user already has maximum designs
    IF design_count >= max_designs THEN
        RAISE EXCEPTION 'Design limit reached. Maximum % designs allowed per user. Please delete some designs first.', max_designs
            USING HINT = 'Delete existing designs from your dashboard to save new ones';
    END IF;
    
    -- Allow the insert if under limit
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce design limit on INSERT
DROP TRIGGER IF EXISTS enforce_design_limit ON canvas_designs;
CREATE TRIGGER enforce_design_limit
    BEFORE INSERT ON canvas_designs
    FOR EACH ROW
    EXECUTE FUNCTION check_design_limit();

-- Create function to get design count with limit info
CREATE OR REPLACE FUNCTION get_user_design_count(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    design_count INTEGER;
    max_designs INTEGER := 10;
    result JSON;
BEGIN
    -- Count existing designs for this user
    SELECT COUNT(*) INTO design_count
    FROM canvas_designs 
    WHERE user_id = user_uuid;
    
    -- Return count and limit info
    SELECT json_build_object(
        'design_count', design_count,
        'design_limit', max_designs,
        'designs_remaining', max_designs - design_count,
        'at_limit', design_count >= max_designs,
        'near_limit', design_count >= (max_designs - 2)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function for safe design deletion with validation
CREATE OR REPLACE FUNCTION delete_user_design(design_uuid UUID, user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    design_exists BOOLEAN := FALSE;
    design_owner UUID;
    result JSON;
BEGIN
    -- Check if design exists and get owner
    SELECT user_id INTO design_owner
    FROM canvas_designs 
    WHERE id = design_uuid;
    
    IF design_owner IS NULL THEN
        -- Design doesn't exist
        SELECT json_build_object(
            'success', false,
            'error', 'Design not found',
            'error_code', 'DESIGN_NOT_FOUND'
        ) INTO result;
        RETURN result;
    END IF;
    
    IF design_owner != user_uuid THEN
        -- User doesn't own this design
        SELECT json_build_object(
            'success', false,
            'error', 'Not authorized to delete this design',
            'error_code', 'UNAUTHORIZED'
        ) INTO result;
        RETURN result;
    END IF;
    
    -- Delete the design
    DELETE FROM canvas_designs 
    WHERE id = design_uuid AND user_id = user_uuid;
    
    -- Return success with updated count
    SELECT json_build_object(
        'success', true,
        'message', 'Design deleted successfully',
        'design_info', get_user_design_count(user_uuid)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON FUNCTION check_design_limit() IS 'Trigger function that enforces 10-design limit per user before INSERT';
COMMENT ON FUNCTION get_user_design_count(UUID) IS 'Returns design count and limit information for a user';
COMMENT ON FUNCTION delete_user_design(UUID, UUID) IS 'Safely deletes a design with ownership validation';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_design_limit() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_design_count(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION delete_user_design(UUID, UUID) TO anon, authenticated;

-- Create index for better performance on design count queries
CREATE INDEX IF NOT EXISTS idx_canvas_designs_user_count ON canvas_designs(user_id);

-- Example usage (commented out):
-- SELECT get_user_design_count('user-uuid-here');
-- SELECT delete_user_design('design-uuid-here', 'user-uuid-here');

-- Test the limit (commented out - for testing only):
-- SELECT check_design_limit() WHERE user_id = 'test-user';

COMMENT ON TRIGGER enforce_design_limit ON canvas_designs IS 'Automatically enforces 10-design limit per user at database level';
