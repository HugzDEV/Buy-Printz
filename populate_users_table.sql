-- Populate users table with existing data from creators and orders
-- Run this after creating the users table

-- First, add users from creators table
INSERT INTO users (user_id, email, full_name, is_creator, is_active, created_at)
SELECT 
    c.user_id,
    'creator_' || SUBSTRING(c.user_id::text, 1, 8) || '@buyprintz.com',
    c.display_name,
    TRUE,
    c.is_active,
    c.created_at
FROM creators c
WHERE c.user_id NOT IN (SELECT user_id FROM users)
ON CONFLICT (user_id) DO UPDATE SET
    is_creator = TRUE,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Then, add users from orders table who aren't already in users table
INSERT INTO users (user_id, email, is_creator, is_active, created_at)
SELECT DISTINCT
    o.user_id,
    'user_' || SUBSTRING(o.user_id::text, 1, 8) || '@buyprintz.com',
    FALSE,
    TRUE,
    MIN(o.created_at)
FROM orders o
WHERE o.user_id NOT IN (SELECT user_id FROM users)
GROUP BY o.user_id
ON CONFLICT (user_id) DO NOTHING;

-- Update creator status for users who are in creators table
UPDATE users 
SET is_creator = TRUE, updated_at = NOW()
WHERE user_id IN (SELECT user_id FROM creators);

-- Show the results
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_creator THEN 1 END) as creators,
    COUNT(CASE WHEN NOT is_creator THEN 1 END) as regular_users
FROM users;
