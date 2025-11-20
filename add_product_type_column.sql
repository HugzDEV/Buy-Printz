-- Add product_type column to creator_templates table
-- This script adds the missing product_type column that the new file upload endpoint requires

-- Add product_type column to creator_templates table
ALTER TABLE creator_templates 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'banner';

-- Update existing records to have a default product_type
UPDATE creator_templates 
SET product_type = 'banner' 
WHERE product_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE creator_templates 
ALTER COLUMN product_type SET NOT NULL;

-- Add constraint to ensure valid product types (using DO block to handle IF NOT EXISTS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'creator_templates_product_type_check'
    ) THEN
        ALTER TABLE creator_templates 
        ADD CONSTRAINT creator_templates_product_type_check 
        CHECK (product_type IN ('banner', 'tin_skinz', 'tent'));
    END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_creator_templates_product_type 
ON creator_templates(product_type);

-- Add composite index for creator_id and product_type
CREATE INDEX IF NOT EXISTS idx_creator_templates_creator_product 
ON creator_templates(creator_id, product_type);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'creator_templates' 
AND column_name = 'product_type';
