-- Add thumbnail column to banner_templates table
-- This column will store base64 encoded thumbnail images generated from Konva canvas

ALTER TABLE banner_templates 
ADD COLUMN thumbnail TEXT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN banner_templates.thumbnail IS 'Base64 encoded thumbnail image generated from Konva canvas (JPEG format, 0.5 pixelRatio)';

-- Create an index for faster queries when filtering by templates with/without thumbnails
CREATE INDEX IF NOT EXISTS idx_banner_templates_thumbnail 
ON banner_templates (thumbnail) 
WHERE thumbnail IS NOT NULL;
