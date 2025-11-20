-- Supabase Storage Setup for Creator Assets
-- This script creates the storage bucket and policies for creator logos and assets

-- Create the creator-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'creator-assets',
    'creator-assets',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the creator-assets bucket

-- Policy: Anyone can view public creator assets
CREATE POLICY "Public creator assets are viewable by everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'creator-assets');

-- Policy: Authenticated users can upload creator assets
CREATE POLICY "Authenticated users can upload creator assets" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'creator-assets' 
    AND auth.role() = 'authenticated'
);

-- Policy: Users can update their own creator assets
CREATE POLICY "Users can update their own creator assets" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'creator-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own creator assets
CREATE POLICY "Users can delete their own creator assets" ON storage.objects
FOR DELETE USING (
    bucket_id = 'creator-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create a function to get creator asset URL
CREATE OR REPLACE FUNCTION get_creator_asset_url(asset_path TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT public_url 
        FROM storage.objects 
        WHERE bucket_id = 'creator-assets' 
        AND name = asset_path
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_creator_asset_url(TEXT) TO authenticated;
