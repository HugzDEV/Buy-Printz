-- Step 1: Create template_purchases table only
CREATE TABLE IF NOT EXISTS public.template_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    user_id UUID NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add indexes for template_purchases
CREATE INDEX IF NOT EXISTS idx_template_purchases_template_id ON public.template_purchases(template_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_user_id ON public.template_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_template_purchases_created_at ON public.template_purchases(created_at);
