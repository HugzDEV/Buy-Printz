-- Fix creator_templates product_type constraint
-- The constraint might have been created with wrong values

-- Step 1: Check what product types currently exist
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;

-- Step 2: Update any invalid product types to valid ones
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

-- Step 3: Set default for any remaining invalid types
UPDATE creator_templates 
SET product_type = 'banner' 
WHERE product_type NOT IN ('banner', 'tin_skinz', 'tent');

-- Step 4: Drop the existing constraint
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;

-- Step 5: Add the correct constraint with proper product types
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type IN ('banner', 'tin_skinz', 'tent'));

-- Step 6: Verify the constraint was added and data is clean
SELECT conname, consrc 
FROM pg_constraint 
WHERE conname = 'creator_templates_product_type_check';

-- Step 7: Verify all data now conforms to the constraint
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;
