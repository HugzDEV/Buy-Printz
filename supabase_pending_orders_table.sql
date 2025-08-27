-- Create pending_orders table for orders that haven't been paid yet
-- This separates incomplete orders from completed orders in the main orders table

CREATE TABLE IF NOT EXISTS pending_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_type VARCHAR(100) NOT NULL DEFAULT 'banner',
    banner_type VARCHAR(100),
    banner_category VARCHAR(100),
    banner_material VARCHAR(100),
    banner_finish VARCHAR(100),
    banner_size VARCHAR(100),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    canvas_data JSONB,
    canvas_image TEXT,
    order_details JSONB,
    customer_info JSONB,
    shipping_info JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_intent_id VARCHAR(255),
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours') -- Auto-expire after 24 hours
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_orders_user_id ON pending_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_created_at ON pending_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_orders_expires_at ON pending_orders(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own pending orders
CREATE POLICY "Users can view own pending orders" ON pending_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own pending orders
CREATE POLICY "Users can insert own pending orders" ON pending_orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending orders
CREATE POLICY "Users can update own pending orders" ON pending_orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own pending orders
CREATE POLICY "Users can delete own pending orders" ON pending_orders
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pending_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_pending_orders_updated_at
    BEFORE UPDATE ON pending_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_pending_orders_updated_at();

-- Function to move pending order to completed orders table
CREATE OR REPLACE FUNCTION move_pending_to_orders(pending_order_id UUID)
RETURNS UUID AS $$
DECLARE
    new_order_id UUID;
    pending_order_record pending_orders%ROWTYPE;
BEGIN
    -- Get the pending order
    SELECT * INTO pending_order_record FROM pending_orders WHERE id = pending_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending order not found: %', pending_order_id;
    END IF;
    
    -- Insert into orders table with paid status
    INSERT INTO orders (
        user_id, product_type, banner_type, banner_category, banner_material,
        banner_finish, banner_size, width, height, quantity, total_amount,
        canvas_data, canvas_image, order_details, customer_info, shipping_info,
        status, payment_intent_id, session_id, created_at
    ) VALUES (
        pending_order_record.user_id,
        pending_order_record.product_type,
        pending_order_record.banner_type,
        pending_order_record.banner_category,
        pending_order_record.banner_material,
        pending_order_record.banner_finish,
        pending_order_record.banner_size,
        pending_order_record.width,
        pending_order_record.height,
        pending_order_record.quantity,
        pending_order_record.total_amount,
        pending_order_record.canvas_data,
        pending_order_record.canvas_image,
        pending_order_record.order_details,
        pending_order_record.customer_info,
        pending_order_record.shipping_info,
        'paid', -- Set status to paid when moving to orders
        pending_order_record.payment_intent_id,
        pending_order_record.session_id,
        pending_order_record.created_at
    ) RETURNING id INTO new_order_id;
    
    -- Delete from pending_orders
    DELETE FROM pending_orders WHERE id = pending_order_id;
    
    RETURN new_order_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired pending orders (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_pending_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM pending_orders 
    WHERE expires_at < NOW() 
    AND status IN ('pending', 'incomplete');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired orders (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-pending-orders', '0 */6 * * *', 'SELECT cleanup_expired_pending_orders();');

COMMENT ON TABLE pending_orders IS 'Stores orders that have been created but not yet paid for';
COMMENT ON FUNCTION move_pending_to_orders(UUID) IS 'Moves a pending order to the main orders table when payment is completed';
COMMENT ON FUNCTION cleanup_expired_pending_orders() IS 'Removes expired pending orders that have not been paid within 24 hours';
