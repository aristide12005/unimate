const fs = require('fs');

async function runQuery() {
    const payload = {
        query: `
            -- 1. Add missing columns to the existing reports table
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS date DATE NOT NULL DEFAULT CURRENT_DATE;
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS done_today TEXT NOT NULL DEFAULT '';
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS planned_tomorrow TEXT NOT NULL DEFAULT '';
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS blockers TEXT;
            ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS sentiment TEXT;

            -- 2. Drop the old policies if they exist so we can recreate them clean (optional, but good for safety)
            DROP POLICY IF EXISTS "Employees can view own reports" ON public.reports;
            DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
            DROP POLICY IF EXISTS "Employees can insert own reports" ON public.reports;

            -- 3. Apply the policies from employee_schema.sql
            ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
            CREATE POLICY "Employees can view own reports" ON public.reports FOR SELECT USING (auth.uid() = employee_id);
            CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
              EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
            );
            CREATE POLICY "Employees can insert own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = employee_id);
        `
    };

    try {
        const response = await fetch('https://api.supabase.com/v1/projects/hcttznfhzzxibftkkrcy/database/query', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sbp_316ce359cb185711fadd0998aa517c1405858365`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Error:', response.status, err);
            process.exit(1);
        }

        const data = await response.json();
        console.log('Success:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch exception:', e);
        process.exit(1);
    }
}

runQuery();
