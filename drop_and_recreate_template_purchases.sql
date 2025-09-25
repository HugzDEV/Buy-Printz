-- Drop the existing template_purchases table and recreate it
-- This will remove any existing triggers or constraints that might be causing issues

-- First, drop the table if it exists
DROP TABLE IF EXISTS public.template_purchases CASCADE;

-- Now create the table fresh
CREATE TABLE public.template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    creator_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_template_purchases_template_id ON public.template_purchases(template_id);
CREATE INDEX idx_template_purchases_user_id ON public.template_purchases(user_id);
CREATE INDEX idx_template_purchases_creator_id ON public.template_purchases(creator_id);
CREATE INDEX idx_template_purchases_created_at ON public.template_purchases(created_at);
