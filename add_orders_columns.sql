-- Step 3: Add missing columns to orders table for shipping functionality
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
