-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- Array of {name, url, type, size}
  report_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Policies for daily_reports
-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON daily_reports FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Admins can insert their own reports
CREATE POLICY "Admins can insert own reports"
ON daily_reports FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
  auth.uid() = user_id
);

-- Admins can update their own reports (optional, e.g., only for today)
CREATE POLICY "Admins can update own reports"
ON daily_reports FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' AND
  auth.uid() = user_id
);

-- Storage bucket for report attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-attachments', 'report-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Admins can upload report attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'report-attachments' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can view report attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'report-attachments' AND
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
