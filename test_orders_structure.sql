-- Test query to see the structure of orders table and shipping_address field
SELECT 
    id,
    status,
    total_amount,
    shipping_address,
    created_at
FROM orders 
LIMIT 5;
