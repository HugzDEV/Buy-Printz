-- Check if template_purchases table already exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'template_purchases' 
AND table_schema = 'public'
ORDER BY ordinal_position;
