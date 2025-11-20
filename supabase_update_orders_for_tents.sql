-- 🚀 GALACTIC FEDERATION: UPDATE ORDERS TABLE FOR TENT SUPPORT
-- Updates the orders table to support our new tent product types

-- Add new product types to the existing product_type constraint
-- First, drop the existing constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_product_type_check;

-- Add the new constraint with tent support
ALTER TABLE orders ADD CONSTRAINT orders_product_type_check 
    CHECK (product_type IN ('banner', 'business_card_tin', 'tradeshow_tent'));

-- Add tent-specific fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_size VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_material VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_frame_type VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_print_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tent_accessories JSONB DEFAULT '[]';

-- Add comments for the new columns
COMMENT ON COLUMN orders.tent_size IS 'Tent size for tradeshow tent orders (10x10, 10x20)';
COMMENT ON COLUMN orders.tent_type IS 'Tent type (event-tent, etc.)';
COMMENT ON COLUMN orders.tent_material IS 'Tent material specification';
COMMENT ON COLUMN orders.tent_frame_type IS 'Tent frame type specification';
COMMENT ON COLUMN orders.tent_print_method IS 'Tent printing method';
COMMENT ON COLUMN orders.tent_accessories IS 'Selected tent accessories as JSONB array';

-- Create indexes for the new tent columns
CREATE INDEX IF NOT EXISTS idx_orders_tent_size ON orders(tent_size) WHERE product_type = 'tradeshow_tent';
CREATE INDEX IF NOT EXISTS idx_orders_tent_type ON orders(tent_type) WHERE product_type = 'tradeshow_tent';

-- Update the orders table to support tent-specific metadata
-- Add a generic metadata field for product-specific data
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_metadata JSONB DEFAULT '{}';

COMMENT ON COLUMN orders.product_metadata IS 'Product-specific metadata (tent surfaces, tin finishes, banner options, etc.)';

-- Create a function to validate tent orders
CREATE OR REPLACE FUNCTION validate_tent_order()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a tent order, validate tent-specific fields
    IF NEW.product_type = 'tradeshow_tent' THEN
        -- Validate tent size
        IF NEW.tent_size IS NULL OR NEW.tent_size NOT IN ('10x10', '10x20') THEN
            RAISE EXCEPTION 'Invalid tent size for tradeshow tent order';
        END IF;
        
        -- Validate tent type
        IF NEW.tent_type IS NULL THEN
            NEW.tent_type := 'event-tent';
        END IF;
        
        -- Validate material
        IF NEW.tent_material IS NULL THEN
            NEW.tent_material := '6oz-tent-fabric';
        END IF;
        
        -- Validate frame type
        IF NEW.tent_frame_type IS NULL THEN
            NEW.tent_frame_type := '40mm-aluminum-hex';
        END IF;
        
        -- Validate print method
        IF NEW.tent_print_method IS NULL THEN
            NEW.tent_print_method := 'dye-sublimation';
        END IF;
        
        -- Ensure accessories is an array
        IF NEW.tent_accessories IS NULL THEN
            NEW.tent_accessories := '[]';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tent order validation
DROP TRIGGER IF EXISTS validate_tent_order_trigger ON orders;
CREATE TRIGGER validate_tent_order_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_tent_order();

-- Create a view for tent orders with all related data
CREATE OR REPLACE VIEW tent_orders_view AS
SELECT 
    o.id as order_id,
    o.user_id,
    o.product_type,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    o.tent_size,
    o.tent_type,
    o.tent_material,
    o.tent_frame_type,
    o.tent_print_method,
    o.tent_accessories,
    o.product_metadata,
    tt.id as tent_id,
    tt.surface_designs,
    tt.base_price,
    tt.accessories_total,
    tt.file_setup
FROM orders o
LEFT JOIN tradeshow_tents tt ON o.id = tt.order_id
WHERE o.product_type = 'tradeshow_tent';

-- Add RLS policy for the view
ALTER VIEW tent_orders_view SET (security_invoker = true);

-- Create a function to get tent order summary
CREATE OR REPLACE FUNCTION get_tent_order_summary(order_uuid UUID)
RETURNS TABLE (
    order_id UUID,
    tent_size VARCHAR,
    tent_type VARCHAR,
    material VARCHAR,
    frame_type VARCHAR,
    print_method VARCHAR,
    accessories JSONB,
    base_price DECIMAL,
    accessories_total DECIMAL,
    total_price DECIMAL,
    surface_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.tent_size,
        o.tent_type,
        o.tent_material,
        o.tent_frame_type,
        o.tent_print_method,
        o.tent_accessories,
        tt.base_price,
        tt.accessories_total,
        tt.total_price,
        CASE 
            WHEN tt.surface_designs IS NOT NULL THEN 
                jsonb_array_length(jsonb_object_keys(tt.surface_designs))
            ELSE 0
        END as surface_count
    FROM orders o
    LEFT JOIN tradeshow_tents tt ON o.id = tt.order_id
    WHERE o.id = order_uuid AND o.product_type = 'tradeshow_tent';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON tent_orders_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_tent_order_summary(UUID) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🚀 GALACTIC FEDERATION: Orders table updated for tent support!';
    RAISE NOTICE '✅ Product types: banner, business_card_tin, tradeshow_tent';
    RAISE NOTICE '✅ Tent columns: Added tent-specific fields';
    RAISE NOTICE '✅ Validation: Tent order validation trigger active';
    RAISE NOTICE '✅ Views: tent_orders_view created';
    RAISE NOTICE '✅ Functions: get_tent_order_summary() available';
    RAISE NOTICE '🌙 Orders table ready for tent empire!';
END $$;
