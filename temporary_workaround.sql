-- TEMPORARY WORKAROUND: Make constraint more permissive
-- This will allow the upload to work while we diagnose the issue

-- Drop any existing product_type constraints
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check CASCADE;

-- Create a very permissive constraint temporarily
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type IS NOT NULL AND product_type != '');

-- This will allow any non-null, non-empty product_type
-- We can tighten it later once we know what's happening
