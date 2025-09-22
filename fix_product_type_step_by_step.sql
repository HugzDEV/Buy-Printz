-- STEP 1: Check what product types currently exist
-- Run this first to see what data we're working with
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;

-- STEP 2: Update invalid product types (run after step 1)
-- Map common invalid types to valid ones
UPDATE creator_templates 
SET product_type = 'banner' 
WHERE product_type IS NULL OR product_type = '';

UPDATE creator_templates 
SET product_type = 'tin_skinz' 
WHERE product_type = 'tin' OR product_type = 'business_card_tin';

UPDATE creator_templates 
SET product_type = 'tent' 
WHERE product_type = 'tradeshow_tent';

-- Set default for any remaining invalid types
UPDATE creator_templates 
SET product_type = 'banner' 
WHERE product_type NOT IN ('banner', 'tin_skinz', 'tent');

-- STEP 3: Drop the existing constraint
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;

-- STEP 4: Add the correct constraint
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type IN ('banner', 'tin_skinz', 'tent'));

-- STEP 5: Verify everything is working
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;
