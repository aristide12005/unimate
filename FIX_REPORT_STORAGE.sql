-- Create a secure function to check admin status
-- SECURITY DEFINER allows this function to bypass RLS on the profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-attachments', 'report-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Admins can upload report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete report attachments" ON storage.objects;

-- Re-create policies using the secure function
CREATE POLICY "Admins can upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments' AND
  public.is_admin()
);

CREATE POLICY "Admins can view report attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments' AND
  public.is_admin()
);

CREATE POLICY "Admins can update report attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'report-attachments' AND public.is_admin()
);

CREATE POLICY "Admins can delete report attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-attachments' AND public.is_admin()
);
