-- Comprehensive RLS Fix for Contracts (Handling Profile Indirection)
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;

-- 2. Drop updated policies to clean slate
DROP POLICY IF EXISTS "Authenticated users can create contracts" ON public.contracts;
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Parties can update their contracts" ON public.contracts;

-- 3. Create Robust INSERT Policy
-- Allows insert if the user owns the profile listed as host_id OR student_id
CREATE POLICY "Authenticated users can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND (id = host_id OR id = student_id)
    )
);

-- 4. Create Robust SELECT Policy
CREATE POLICY "Users can view their own contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND (id = host_id OR id = student_id)
    )
    OR public.is_admin()
);

-- 5. Create Robust UPDATE Policy
CREATE POLICY "Parties can update their contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND (id = host_id OR id = student_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid()
        AND (id = host_id OR id = student_id)
    )
);
