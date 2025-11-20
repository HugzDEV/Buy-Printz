-- Check what product types currently exist in creator_templates table
SELECT 
    product_type,
    COUNT(*) as count
FROM creator_templates 
GROUP BY product_type
ORDER BY count DESC;

-- Check for any NULL product_type values
SELECT 
    id,
    name,
    product_type,
    created_at
FROM creator_templates 
WHERE product_type IS NULL OR product_type NOT IN ('banner', 'tin_skinz', 'tent')
ORDER BY created_at DESC;
