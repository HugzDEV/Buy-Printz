-- Fix creator_templates product_type constraint
-- The constraint might have been created with wrong values

-- Drop the existing constraint
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;

-- Add the correct constraint with proper product types
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type IN ('banner', 'tin_skinz', 'tent'));

-- Verify the constraint was added
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'creator_templates_product_type_check';
