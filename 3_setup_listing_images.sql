-- Storage Bucket Setup for 'listing-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own listing images" ON storage.objects;

-- Upload Policy
CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'listing-images' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text 
        OR public.is_admin()
    )
);

-- View Policy (Public Read)
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'listing-images');

-- Delete Policy
CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'listing-images' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text 
        OR public.is_admin()
    )
);
