-- Add thumbnail_url column to banner_templates table
-- This column will store URLs to thumbnail image files (replacing base64 storage)

ALTER TABLE banner_templates 
ADD COLUMN thumbnail_url TEXT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN banner_templates.thumbnail_url IS 'URL path to thumbnail image file stored in /assets/images/user_templates/ directory';

-- Create an index for faster queries when filtering by templates with/without thumbnails
CREATE INDEX IF NOT EXISTS idx_banner_templates_thumbnail_url 
ON banner_templates (thumbnail_url) 
WHERE thumbnail_url IS NOT NULL;

-- Optional: If you want to remove the old thumbnail column (uncomment the line below)
-- ALTER TABLE banner_templates DROP COLUMN thumbnail;
