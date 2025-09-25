-- Create template_purchases table with the structure expected by existing functions
CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    creator_id UUID NOT NULL, -- Required by update_creator_stats_on_purchase function
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    creator_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Required by update_creator_stats_on_purchase function
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON public.template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON public.template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_creator_id ON public.template_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_created_at ON public.template_purchases(created_at);
