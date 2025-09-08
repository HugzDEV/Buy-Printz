-- BuyPrintz Creator Marketplace Database Schema
-- Phase 1: Foundation Tables

-- =============================================
-- CREATORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    templates_sold INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT creators_display_name_length CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50),
    CONSTRAINT creators_bio_length CHECK (char_length(bio) <= 500),
    CONSTRAINT creators_rating_range CHECK (rating >= 0.00 AND rating <= 5.00),
    CONSTRAINT creators_earnings_positive CHECK (total_earnings >= 0.00),
    CONSTRAINT creators_templates_sold_positive CHECK (templates_sold >= 0)
);

-- =============================================
-- CREATOR TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS creator_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    canvas_data JSONB NOT NULL,
    preview_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    is_approved BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT creator_templates_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    CONSTRAINT creator_templates_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 500),
    CONSTRAINT creator_templates_price_range CHECK (price >= 3.00 AND price <= 25.00),
    CONSTRAINT creator_templates_rating_range CHECK (rating >= 0.00 AND rating <= 5.00),
    CONSTRAINT creator_templates_sales_positive CHECK (sales_count >= 0),
    CONSTRAINT creator_templates_views_positive CHECK (view_count >= 0)
);

-- =============================================
-- TEMPLATE PURCHASES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS template_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES creator_templates(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    price_paid DECIMAL(8,2) NOT NULL,
    commission_amount DECIMAL(8,2) NOT NULL,
    creator_earnings DECIMAL(8,2) NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT template_purchases_price_positive CHECK (price_paid > 0.00),
    CONSTRAINT template_purchases_commission_positive CHECK (commission_amount >= 0.00),
    CONSTRAINT template_purchases_earnings_positive CHECK (creator_earnings >= 0.00),
    CONSTRAINT template_purchases_commission_rate CHECK (commission_amount = price_paid * 0.20),
    CONSTRAINT template_purchases_earnings_calculation CHECK (creator_earnings = price_paid * 0.80)
);

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    meta_description TEXT,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT blog_posts_title_length CHECK (char_length(title) >= 5 AND char_length(title) <= 200),
    CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT blog_posts_content_length CHECK (char_length(content) >= 100),
    CONSTRAINT blog_posts_excerpt_length CHECK (char_length(excerpt) <= 300),
    CONSTRAINT blog_posts_views_positive CHECK (view_count >= 0)
);

-- =============================================
-- BLOG CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3b82f6',
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT blog_categories_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50),
    CONSTRAINT blog_categories_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT blog_categories_post_count_positive CHECK (post_count >= 0)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Creators indexes
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_verified ON creators(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_creators_active ON creators(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_creators_earnings ON creators(total_earnings DESC);

-- Creator templates indexes
CREATE INDEX IF NOT EXISTS idx_creator_templates_creator_id ON creator_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_templates_category ON creator_templates(category);
CREATE INDEX IF NOT EXISTS idx_creator_templates_approved ON creator_templates(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_creator_templates_featured ON creator_templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_creator_templates_price ON creator_templates(price);
CREATE INDEX IF NOT EXISTS idx_creator_templates_sales ON creator_templates(sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_creator_templates_rating ON creator_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_creator_templates_created ON creator_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_templates_tags ON creator_templates USING GIN(tags);

-- Template purchases indexes
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_buyer_id ON template_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_creator_id ON template_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_purchased_at ON template_purchases(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_purchases_status ON template_purchases(status);

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Creators policies
CREATE POLICY "Users can view all active creators" ON creators
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view their own creator profile" ON creators
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own creator profile" ON creators
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile" ON creators
    FOR UPDATE USING (auth.uid() = user_id);

-- Creator templates policies
CREATE POLICY "Anyone can view approved templates" ON creator_templates
    FOR SELECT USING (is_approved = true AND is_active = true);

CREATE POLICY "Creators can view their own templates" ON creator_templates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = creator_templates.creator_id 
            AND creators.user_id = auth.uid()
        )
    );

CREATE POLICY "Creators can create templates" ON creator_templates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = creator_templates.creator_id 
            AND creators.user_id = auth.uid()
        )
    );

CREATE POLICY "Creators can update their own templates" ON creator_templates
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = creator_templates.creator_id 
            AND creators.user_id = auth.uid()
        )
    );

-- Template purchases policies
CREATE POLICY "Users can view their own purchases" ON template_purchases
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Creators can view purchases of their templates" ON template_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = template_purchases.creator_id 
            AND creators.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create purchases" ON template_purchases
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can view their own blog posts" ON blog_posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can create blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Blog categories policies
CREATE POLICY "Anyone can view blog categories" ON blog_categories
    FOR SELECT USING (true);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_templates_updated_at BEFORE UPDATE ON creator_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update creator stats when template is sold
CREATE OR REPLACE FUNCTION update_creator_stats_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Update creator's total earnings and templates sold
    UPDATE creators 
    SET 
        total_earnings = total_earnings + NEW.creator_earnings,
        templates_sold = templates_sold + 1
    WHERE id = NEW.creator_id;
    
    -- Update template's sales count
    UPDATE creator_templates 
    SET sales_count = sales_count + 1
    WHERE id = NEW.template_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply purchase trigger
CREATE TRIGGER update_stats_on_purchase AFTER INSERT ON template_purchases
    FOR EACH ROW EXECUTE FUNCTION update_creator_stats_on_purchase();

-- Function to update blog category post count
CREATE OR REPLACE FUNCTION update_blog_category_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_published = true THEN
        UPDATE blog_categories 
        SET post_count = post_count + 1 
        WHERE name = NEW.category;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_published = false AND NEW.is_published = true THEN
            UPDATE blog_categories 
            SET post_count = post_count + 1 
            WHERE name = NEW.category;
        ELSIF OLD.is_published = true AND NEW.is_published = false THEN
            UPDATE blog_categories 
            SET post_count = post_count - 1 
            WHERE name = NEW.category;
        ELSIF OLD.category != NEW.category THEN
            UPDATE blog_categories 
            SET post_count = post_count - 1 
            WHERE name = OLD.category;
            UPDATE blog_categories 
            SET post_count = post_count + 1 
            WHERE name = NEW.category;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.is_published = true THEN
        UPDATE blog_categories 
        SET post_count = post_count - 1 
        WHERE name = OLD.category;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply blog category count trigger
CREATE TRIGGER update_blog_category_count_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_blog_category_count();

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Creator Success Stories', 'creator-success-stories', 'Inspiring stories of creators building their design business', '#8b5cf6'),
('Small Business Case Studies', 'small-business-case-studies', 'Real examples of how templates help small businesses grow', '#10b981'),
('Design Education', 'design-education', 'Tips, tutorials, and best practices for design', '#f59e0b'),
('Industry Insights', 'industry-insights', 'Market trends and analysis for the creator economy', '#3b82f6'),
('Platform Updates', 'platform-updates', 'New features and improvements to BuyPrintz', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- COMMENTS AND DOCUMENTATION
-- =============================================

COMMENT ON TABLE creators IS 'Independent designers and creators who sell templates on the marketplace';
COMMENT ON TABLE creator_templates IS 'Templates created by creators and sold in the marketplace';
COMMENT ON TABLE template_purchases IS 'Records of template purchases with commission tracking';
COMMENT ON TABLE blog_posts IS 'Blog content for SEO, community building, and creator spotlights';
COMMENT ON TABLE blog_categories IS 'Categories for organizing blog content';

COMMENT ON COLUMN creators.total_earnings IS 'Total earnings from template sales (80% of purchase price)';
COMMENT ON COLUMN creators.rating IS 'Average rating from template buyers (0.00-5.00)';
COMMENT ON COLUMN creator_templates.price IS 'Template price in USD (3.00-25.00 range)';
COMMENT ON COLUMN creator_templates.canvas_data IS 'JSON data containing all design elements and canvas configuration';
COMMENT ON COLUMN template_purchases.commission_amount IS 'BuyPrintz commission (20% of purchase price)';
COMMENT ON COLUMN template_purchases.creator_earnings IS 'Creator earnings (80% of purchase price)';
