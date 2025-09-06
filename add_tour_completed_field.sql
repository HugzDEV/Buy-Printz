-- Add tour_completed field to user_profiles table
-- This allows us to track tour completion in the database instead of localStorage

-- Add the tour_completed field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

-- Add an index for better performance when checking tour completion
CREATE INDEX IF NOT EXISTS idx_user_profiles_tour_completed ON user_profiles(tour_completed);

-- Update existing users to have tour_completed = false (they haven't seen the tour yet)
UPDATE user_profiles 
SET tour_completed = FALSE 
WHERE tour_completed IS NULL;

-- Add a comment to document the field
COMMENT ON COLUMN user_profiles.tour_completed IS 'Tracks whether the user has completed the onboarding tour';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'tour_completed';
