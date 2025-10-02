-- QUICK SECURITY FIXES FOR SUPABASE
-- Run this in your Supabase SQL Editor

-- Fix 1: Change tent_orders_view to SECURITY INVOKER
ALTER VIEW tent_orders_view SET (security_invoker = true);

-- Fix 2: Enable RLS on test_template_purchases table
ALTER TABLE public.test_template_purchases ENABLE ROW LEVEL SECURITY;

-- Fix 3: Add RLS policies for test_template_purchases
CREATE POLICY "Users can view own template purchases" ON public.test_template_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own template purchases" ON public.test_template_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own template purchases" ON public.test_template_purchases
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own template purchases" ON public.test_template_purchases
    FOR DELETE USING (auth.uid() = user_id);
