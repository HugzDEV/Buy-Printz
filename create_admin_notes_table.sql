-- Create admin_notes table for tracking customer service notes
CREATE TABLE IF NOT EXISTS public.admin_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_notes_user_id ON public.admin_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_created_by ON public.admin_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_admin_notes_updated_at ON public.admin_notes(updated_at);

-- Enable Row Level Security
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Only admins can view all notes
CREATE POLICY "Admins can view all admin notes"
ON public.admin_notes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.email = 'Brainboxjp@gmail.com'
    )
);

-- Only admins can insert notes
CREATE POLICY "Admins can insert admin notes"
ON public.admin_notes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.email = 'Brainboxjp@gmail.com'
    )
);

-- Only admins can update notes
CREATE POLICY "Admins can update admin notes"
ON public.admin_notes FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.email = 'Brainboxjp@gmail.com'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.email = 'Brainboxjp@gmail.com'
    )
);

-- Only admins can delete notes
CREATE POLICY "Admins can delete admin notes"
ON public.admin_notes FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.user_id = auth.uid() 
        AND users.email = 'Brainboxjp@gmail.com'
    )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_admin_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_admin_notes_updated_at
    BEFORE UPDATE ON public.admin_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_admin_notes_updated_at();

-- Add comment to table
COMMENT ON TABLE public.admin_notes IS 'Stores admin notes for customer service reference';
COMMENT ON COLUMN public.admin_notes.user_id IS 'The user this note is about';
COMMENT ON COLUMN public.admin_notes.note IS 'The admin note content';
COMMENT ON COLUMN public.admin_notes.created_by IS 'Admin who created the note';
COMMENT ON COLUMN public.admin_notes.updated_by IS 'Admin who last updated the note';
