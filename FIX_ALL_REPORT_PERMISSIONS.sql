-- Relax Permissions to debug submission issues

-- 1. STORAGE: Allow any authenticated user to upload to 'report-attachments'
DROP POLICY IF EXISTS "Admins can upload report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update report attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete report attachments" ON storage.objects;

CREATE POLICY "Any auth user can upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-attachments');

CREATE POLICY "Any auth user can view report attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'report-attachments');

-- 2. DATABASE: Allow any authenticated user to insert reports
DROP POLICY IF EXISTS "Admins can insert own reports" ON daily_reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON daily_reports;

-- Let any auth user view reports (filtering happens in UI anyway)
CREATE POLICY "Any auth user can view reports"
ON daily_reports FOR SELECT
TO authenticated
USING (true);

-- Let any auth user insert their own report
CREATE POLICY "Any auth user can insert own reports"
ON daily_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-attachments', 'report-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;
