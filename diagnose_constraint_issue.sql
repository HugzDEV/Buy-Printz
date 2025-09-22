-- DIAGNOSTIC: Find all constraints on creator_templates table
-- This will help us identify what's actually blocking the insert

-- Check all constraints on the creator_templates table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'creator_templates'::regclass;

-- Check specifically for product_type related constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'creator_templates'::regclass
AND pg_get_constraintdef(oid) ILIKE '%product_type%';

-- Check the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'creator_templates' 
AND column_name = 'product_type';

-- Check current data
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;
