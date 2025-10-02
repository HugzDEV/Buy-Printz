-- SAFE CREATOR UPLOADS SETUP
-- Handles existing policies and tables gracefully

-- Step 1: Add is_admin column to user_profiles (if it doesn't exist)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Create creator uploads table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS creator_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_description TEXT,
    template_data JSONB NOT NULL,
    thumbnail_url TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('banner', 'tin', 'tent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable RLS (if not already enabled)
ALTER TABLE creator_uploads ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Creators can view own uploads" ON creator_uploads;
DROP POLICY IF EXISTS "Creators can insert own uploads" ON creator_uploads;
DROP POLICY IF EXISTS "Admins can view all uploads" ON creator_uploads;
DROP POLICY IF EXISTS "Authenticated users can view all uploads" ON creator_uploads;

-- Create fresh policies
CREATE POLICY "Creators can view own uploads" ON creator_uploads
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own uploads" ON creator_uploads
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins can view all uploads" ON creator_uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Step 5: Create or replace functions
CREATE OR REPLACE FUNCTION submit_creator_upload(
    p_creator_id UUID,
    p_template_name TEXT,
    p_template_data JSONB,
    p_product_type TEXT
)
RETURNS UUID AS $$
DECLARE
    upload_id UUID;
BEGIN
    INSERT INTO creator_uploads (creator_id, template_name, template_data, product_type)
    VALUES (p_creator_id, p_template_name, p_template_data, p_product_type)
    RETURNING id INTO upload_id;
    RETURN upload_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION approve_creator_upload(p_upload_id UUID, p_reviewer_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE creator_uploads 
    SET status = 'approved', reviewed_at = NOW(), reviewed_by = p_reviewer_id
    WHERE id = p_upload_id AND status = 'pending';
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION reject_creator_upload(p_upload_id UUID, p_reviewer_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE creator_uploads 
    SET status = 'rejected', reviewed_at = NOW(), reviewed_by = p_reviewer_id, rejection_reason = p_reason
    WHERE id = p_upload_id AND status = 'pending';
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Step 6: Grant permissions
GRANT SELECT, INSERT, UPDATE ON creator_uploads TO authenticated;
GRANT EXECUTE ON FUNCTION submit_creator_upload TO authenticated;
GRANT EXECUTE ON FUNCTION approve_creator_upload TO authenticated;
GRANT EXECUTE ON FUNCTION reject_creator_upload TO authenticated;
