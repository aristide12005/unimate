-- Enable RLS
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

-- Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Reports
CREATE POLICY "Users can create their own reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports"
ON public.reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Storage Bucket Setup for 'report-attachments'
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-attachments', 'report-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies using a Helper Function for Admin Check (Best Practice)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Upload Policy: Users can upload to their own folder, Admins everywhere
CREATE POLICY "Authenticated users can upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'report-attachments' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text 
        OR public.is_admin()
    )
);

-- View Policy: Users can view their own, Admins view all
CREATE POLICY "Authenticated users can view report attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'report-attachments' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text 
        OR public.is_admin()
    )
);

-- Delete Policy: Users can delete their own, Admins delete all
CREATE POLICY "Authenticated users can delete report attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'report-attachments' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text 
        OR public.is_admin()
    )
);
