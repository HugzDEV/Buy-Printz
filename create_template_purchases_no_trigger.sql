-- Create template_purchases table and temporarily disable the trigger
-- This will prevent the trigger from firing during table creation

-- First, create the table
CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temporarily disable the trigger that's causing the issue
ALTER TABLE public.template_purchases DISABLE TRIGGER update_stats_on_purchase;
