-- IMMEDIATE FIX: Update existing data and fix constraint
-- This will fix the current issue with existing 'tin' values and allow 'tin_skinz'

-- Step 1: Update existing 'tin' values to 'tin_skinz'
UPDATE creator_templates 
SET product_type = 'tin_skinz' 
WHERE product_type = 'tin';

-- Step 2: Drop the existing constraint completely
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;

-- Step 3: Add the correct constraint that allows all valid types
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type IN ('banner', 'tin_skinz', 'tent'));

-- Step 4: Verify the fix worked
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;
