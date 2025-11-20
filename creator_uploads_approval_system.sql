-- ========================================
-- CREATOR UPLOADS PENDING/APPROVAL SYSTEM
-- ========================================
-- This system allows creators to upload templates that require admin approval
-- before being published to the marketplace
-- ========================================

-- ========================================
-- CREATOR UPLOADS TABLE
-- ========================================
-- Stores creator uploads that are pending approval

CREATE TABLE IF NOT EXISTS creator_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_description TEXT,
    template_category TEXT,
    template_tags TEXT[],
    template_data JSONB NOT NULL, -- Konva canvas data
    thumbnail_url TEXT,
    preview_images TEXT[], -- Array of preview image URLs
    product_type TEXT NOT NULL CHECK (product_type IN ('banner', 'tin', 'tent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    rejection_reason TEXT,
    revision_notes TEXT,
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATOR UPLOAD COMMENTS TABLE
-- ========================================
-- Allows admins to leave comments on uploads during review

CREATE TABLE IF NOT EXISTS creator_upload_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES creator_uploads(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    comment_type TEXT NOT NULL DEFAULT 'general' CHECK (comment_type IN ('general', 'revision_request', 'approval_note', 'rejection_reason')),
    is_internal BOOLEAN DEFAULT false, -- Internal admin notes vs public comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATOR UPLOAD REVISIONS TABLE
-- ========================================
-- Tracks revision history for uploads

CREATE TABLE IF NOT EXISTS creator_upload_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID NOT NULL REFERENCES creator_uploads(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    template_data JSONB NOT NULL,
    revision_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Creator uploads indexes
CREATE INDEX IF NOT EXISTS idx_creator_uploads_creator_id ON creator_uploads(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_uploads_status ON creator_uploads(status);
CREATE INDEX IF NOT EXISTS idx_creator_uploads_product_type ON creator_uploads(product_type);
CREATE INDEX IF NOT EXISTS idx_creator_uploads_submitted_at ON creator_uploads(submitted_at);
CREATE INDEX IF NOT EXISTS idx_creator_uploads_reviewed_at ON creator_uploads(reviewed_at);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_creator_upload_comments_upload_id ON creator_upload_comments(upload_id);
CREATE INDEX IF NOT EXISTS idx_creator_upload_comments_commenter_id ON creator_upload_comments(commenter_id);
CREATE INDEX IF NOT EXISTS idx_creator_upload_comments_created_at ON creator_upload_comments(created_at);

-- Revisions indexes
CREATE INDEX IF NOT EXISTS idx_creator_upload_revisions_upload_id ON creator_upload_revisions(upload_id);
CREATE INDEX IF NOT EXISTS idx_creator_upload_revisions_revision_number ON creator_upload_revisions(upload_id, revision_number);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE creator_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_upload_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_upload_revisions ENABLE ROW LEVEL SECURITY;

-- Creator uploads policies
CREATE POLICY "Creators can view own uploads" ON creator_uploads
    FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can insert own uploads" ON creator_uploads
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own pending uploads" ON creator_uploads
    FOR UPDATE USING (auth.uid() = creator_id AND status = 'pending');

CREATE POLICY "Admins can view all uploads" ON creator_uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND is_admin = true
        )
    );

-- Comments policies
CREATE POLICY "Users can view comments on their uploads" ON creator_upload_comments
    FOR SELECT USING (
        auth.uid() = commenter_id OR
        EXISTS (
            SELECT 1 FROM creator_uploads 
            WHERE id = upload_id AND creator_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Users can insert comments" ON creator_upload_comments
    FOR INSERT WITH CHECK (auth.uid() = commenter_id);

-- Revisions policies
CREATE POLICY "Creators can view own upload revisions" ON creator_upload_revisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM creator_uploads 
            WHERE id = upload_id AND creator_id = auth.uid()
        )
    );

CREATE POLICY "Creators can insert revisions for own uploads" ON creator_upload_revisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM creator_uploads 
            WHERE id = upload_id AND creator_id = auth.uid()
        )
    );

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_creator_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_creator_uploads_updated_at
    BEFORE UPDATE ON creator_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_creator_uploads_updated_at();

-- ========================================
-- FUNCTIONS FOR UPLOAD MANAGEMENT
-- ========================================

-- Function to submit a creator upload
CREATE OR REPLACE FUNCTION submit_creator_upload(
    p_creator_id UUID,
    p_template_name TEXT,
    p_template_description TEXT DEFAULT NULL,
    p_template_category TEXT DEFAULT NULL,
    p_template_tags TEXT[] DEFAULT NULL,
    p_template_data JSONB,
    p_thumbnail_url TEXT DEFAULT NULL,
    p_preview_images TEXT[] DEFAULT NULL,
    p_product_type TEXT
)
RETURNS UUID AS $$
DECLARE
    upload_id UUID;
BEGIN
    -- Validate product type
    IF p_product_type NOT IN ('banner', 'tin', 'tent') THEN
        RAISE EXCEPTION 'Invalid product type: %', p_product_type;
    END IF;
    
    -- Insert the upload
    INSERT INTO creator_uploads (
        creator_id, template_name, template_description, template_category,
        template_tags, template_data, thumbnail_url, preview_images, product_type
    ) VALUES (
        p_creator_id, p_template_name, p_template_description, p_template_category,
        p_template_tags, p_template_data, p_thumbnail_url, p_preview_images, p_product_type
    ) RETURNING id INTO upload_id;
    
    RETURN upload_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to approve an upload
CREATE OR REPLACE FUNCTION approve_creator_upload(
    p_upload_id UUID,
    p_reviewer_id UUID,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the upload status
    UPDATE creator_uploads 
    SET 
        status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        approved_at = NOW(),
        admin_notes = p_admin_notes
    WHERE id = p_upload_id AND status = 'pending';
    
    -- Check if update was successful
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to reject an upload
CREATE OR REPLACE FUNCTION reject_creator_upload(
    p_upload_id UUID,
    p_reviewer_id UUID,
    p_rejection_reason TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the upload status
    UPDATE creator_uploads 
    SET 
        status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        rejection_reason = p_rejection_reason,
        admin_notes = p_admin_notes
    WHERE id = p_upload_id AND status = 'pending';
    
    -- Check if update was successful
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to request revision
CREATE OR REPLACE FUNCTION request_upload_revision(
    p_upload_id UUID,
    p_reviewer_id UUID,
    p_revision_notes TEXT,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the upload status
    UPDATE creator_uploads 
    SET 
        status = 'revision_requested',
        reviewed_at = NOW(),
        reviewed_by = p_reviewer_id,
        revision_notes = p_revision_notes,
        admin_notes = p_admin_notes
    WHERE id = p_upload_id AND status = 'pending';
    
    -- Check if update was successful
    IF FOUND THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to get uploads by status
CREATE OR REPLACE FUNCTION get_uploads_by_status(
    p_status TEXT,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    upload_id UUID,
    creator_id UUID,
    creator_name TEXT,
    template_name TEXT,
    template_description TEXT,
    product_type TEXT,
    status TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cu.id as upload_id,
        cu.creator_id,
        c.creator_name,
        cu.template_name,
        cu.template_description,
        cu.product_type,
        cu.status,
        cu.submitted_at,
        cu.reviewed_at
    FROM creator_uploads cu
    JOIN creators c ON cu.creator_id = c.id
    WHERE cu.status = p_status
    ORDER BY cu.submitted_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ========================================
-- GRANT PERMISSIONS
-- ========================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON creator_uploads TO authenticated;
GRANT SELECT, INSERT ON creator_upload_comments TO authenticated;
GRANT SELECT, INSERT ON creator_upload_revisions TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION submit_creator_upload TO authenticated;
GRANT EXECUTE ON FUNCTION approve_creator_upload TO authenticated;
GRANT EXECUTE ON FUNCTION reject_creator_upload TO authenticated;
GRANT EXECUTE ON FUNCTION request_upload_revision TO authenticated;
GRANT EXECUTE ON FUNCTION get_uploads_by_status TO authenticated;

-- ========================================
-- SUCCESS MESSAGE
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎨 CREATOR UPLOADS APPROVAL SYSTEM CREATED';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ Tables: creator_uploads, creator_upload_comments, creator_upload_revisions';
    RAISE NOTICE '✅ RLS: Enabled with proper policies';
    RAISE NOTICE '✅ Functions: submit, approve, reject, request_revision, get_by_status';
    RAISE NOTICE '✅ Permissions: Granted to authenticated users';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for creator template submissions!';
    RAISE NOTICE '';
END $$;
