-- FORCE FIX: Completely remove and recreate the constraint
-- This will definitely fix the constraint issue

-- Step 1: Check current constraint definition
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'creator_templates_product_type_check';

-- Step 2: Force drop the constraint (multiple ways to ensure it's gone)
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check;
ALTER TABLE creator_templates DROP CONSTRAINT IF EXISTS creator_templates_product_type_check CASCADE;

-- Step 3: Update any existing invalid data
UPDATE creator_templates 
SET product_type = 'tin_skinz' 
WHERE product_type = 'tin';

UPDATE creator_templates 
SET product_type = 'banner' 
WHERE product_type IS NULL OR product_type = '';

-- Step 4: Verify no invalid data exists
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
WHERE product_type NOT IN ('banner', 'tin_skinz', 'tent')
GROUP BY product_type;

-- Step 5: Create the constraint with explicit syntax
ALTER TABLE creator_templates 
ADD CONSTRAINT creator_templates_product_type_check 
CHECK (product_type = 'banner' OR product_type = 'tin_skinz' OR product_type = 'tent');

-- Step 6: Verify the constraint was created correctly
SELECT 
    conname,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'creator_templates_product_type_check';

-- Step 7: Test the constraint by checking all data
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;
