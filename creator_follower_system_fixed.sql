-- BuyPrintz Creator Follower System Database Update (Fixed Version)
-- This script adds follower functionality to the creator marketplace

-- =============================================
-- UPDATE CREATORS TABLE
-- =============================================

-- Add followers column to existing creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;

-- Add constraint for followers count (safe method)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'creators_followers_positive'
    ) THEN
        ALTER TABLE creators ADD CONSTRAINT creators_followers_positive 
            CHECK (followers_count >= 0);
    END IF;
END $$;

-- =============================================
-- CREATOR FOLLOWERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS creator_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique follower relationships
    UNIQUE(creator_id, follower_user_id)
);

-- =============================================
-- CREATOR NOTIFICATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS creator_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('new_template', 'template_sale', 'creator_update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    template_id UUID REFERENCES creator_templates(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATOR FOLLOWING PREFERENCES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS creator_following_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    notify_new_templates BOOLEAN DEFAULT true,
    notify_sales BOOLEAN DEFAULT false,
    notify_updates BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(follower_user_id, creator_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Creator followers indexes
CREATE INDEX IF NOT EXISTS idx_creator_followers_creator ON creator_followers(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_followers_follower ON creator_followers(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_creator_followers_created ON creator_followers(followed_at);

-- Creator notifications indexes
CREATE INDEX IF NOT EXISTS idx_creator_notifications_follower ON creator_notifications(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_creator_notifications_creator ON creator_notifications(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_notifications_unread ON creator_notifications(follower_user_id, is_read) WHERE is_read = false;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE creator_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_following_preferences ENABLE ROW LEVEL SECURITY;

-- Creator followers policies
CREATE POLICY "Users can view their own follows" ON creator_followers
    FOR SELECT USING (auth.uid() = follower_user_id);

CREATE POLICY "Users can follow creators" ON creator_followers
    FOR INSERT WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow creators" ON creator_followers
    FOR DELETE USING (auth.uid() = follower_user_id);

-- Creator notifications policies
CREATE POLICY "Users can view their own notifications" ON creator_notifications
    FOR SELECT USING (auth.uid() = follower_user_id);

CREATE POLICY "Users can mark notifications as read" ON creator_notifications
    FOR UPDATE USING (auth.uid() = follower_user_id);

-- Creator following preferences policies
CREATE POLICY "Users can manage their following preferences" ON creator_following_preferences
    FOR ALL USING (auth.uid() = follower_user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update followers count
CREATE OR REPLACE FUNCTION update_creator_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE creators 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.creator_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE creators 
        SET followers_count = followers_count - 1 
        WHERE id = OLD.creator_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update followers count
DROP TRIGGER IF EXISTS trigger_update_followers_count ON creator_followers;
CREATE TRIGGER trigger_update_followers_count
    AFTER INSERT OR DELETE ON creator_followers
    FOR EACH ROW EXECUTE FUNCTION update_creator_followers_count();

-- Function to create notifications for new templates
CREATE OR REPLACE FUNCTION notify_followers_new_template()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if template is approved and active
    IF NEW.is_approved = true AND NEW.is_active = true THEN
        INSERT INTO creator_notifications (creator_id, follower_user_id, notification_type, title, message, template_id)
        SELECT 
            NEW.creator_id,
            cf.follower_user_id,
            'new_template',
            'New Template Available!',
            'Your followed creator ' || c.display_name || ' just released a new template: ' || NEW.name,
            NEW.id
        FROM creator_followers cf
        JOIN creators c ON c.id = NEW.creator_id
        JOIN creator_following_preferences cfp ON cfp.follower_user_id = cf.follower_user_id 
            AND cfp.creator_id = NEW.creator_id
        WHERE cfp.notify_new_templates = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new template notifications
DROP TRIGGER IF EXISTS trigger_notify_new_template ON creator_templates;
CREATE TRIGGER trigger_notify_new_template
    AFTER UPDATE ON creator_templates
    FOR EACH ROW EXECUTE FUNCTION notify_followers_new_template();

-- =============================================
-- INITIALIZE FOLLOWERS COUNT
-- =============================================

-- Update existing creators with current follower count
UPDATE creators 
SET followers_count = (
    SELECT COUNT(*) 
    FROM creator_followers 
    WHERE creator_followers.creator_id = creators.id
);
