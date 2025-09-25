-- Step 4: Create indexes for shipping fields in orders table
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON public.orders(shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_product_type ON public.orders(product_type);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
