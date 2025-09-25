-- Create minimal analytics and shipping tables
-- This version only creates tables and indexes, no sample data or complex operations

-- Template purchases table for tracking template sales
CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON public.template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON public.template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_created_at ON public.template_purchases(created_at);

-- Add missing columns to orders table for shipping functionality
DO $$ 
BEGIN
    -- Add tracking_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
    
    -- Add shipping_method if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_method') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_method TEXT;
    END IF;
    
    -- Add shipping_cost if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipping_cost') THEN
        ALTER TABLE public.orders ADD COLUMN shipping_cost DECIMAL(10,2) DEFAULT 0.00;
    END IF;
    
    -- Add product_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'product_type') THEN
        ALTER TABLE public.orders ADD COLUMN product_type TEXT DEFAULT 'banner';
    END IF;
    
    -- Add order_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'order_number') THEN
        ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    END IF;
END $$;

-- Create indexes for shipping fields
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON public.orders(shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_product_type ON public.orders(product_type);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
