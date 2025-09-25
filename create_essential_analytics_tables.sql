-- Create essential analytics tables for admin panel

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

-- Enable Row Level Security
ALTER TABLE public.template_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own template purchases"
ON public.template_purchases FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create template purchases"
ON public.template_purchases FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

-- Admin can view all template purchases
CREATE POLICY "Admins can view all template purchases"
ON public.template_purchases FOR SELECT
TO authenticated
USING (true); -- Allow all authenticated users for development

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_template_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the update_template_purchases_updated_at function on update
CREATE TRIGGER template_purchases_updated_at_trigger
BEFORE UPDATE ON public.template_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_template_purchases_updated_at();

-- Add shipping fields to orders table if they don't exist
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
END $$;

-- Create indexes for shipping fields
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shipping_method ON public.orders(shipping_method);
CREATE INDEX IF NOT EXISTS idx_orders_product_type ON public.orders(product_type);
