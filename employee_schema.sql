-- employee_schema.sql

-- 1. Create the reports table for Daily Activity Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    done_today TEXT NOT NULL,
    planned_tomorrow TEXT NOT NULL,
    blockers TEXT,
    sentiment TEXT, -- e.g., 'emoji' or 'rating'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure RLS is enabled
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for reports
CREATE POLICY "Employees can view own reports" ON public.reports FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Employees can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = employee_id);


-- 2. Add specific columns to profiles if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='department') THEN
        ALTER TABLE public.profiles ADD COLUMN department TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='job_title') THEN
        ALTER TABLE public.profiles ADD COLUMN job_title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='work_status') THEN
        -- Status like 'In Office', 'Remote', 'On Break'
        ALTER TABLE public.profiles ADD COLUMN work_status TEXT DEFAULT 'Remote';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='supervisor_id') THEN
        ALTER TABLE public.profiles ADD COLUMN supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;


-- 3. Create Channels for organized messaging
CREATE TABLE IF NOT EXISTS public.channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert a default general channel
INSERT INTO public.channels (name, description) VALUES ('General', 'Company wide announcements and general chat');

-- Enable RLS for channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view channels" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);


-- 4. Create Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    agenda JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
