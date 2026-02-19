-- Comprehensive RLS Fix for Contracts
-- Run this in Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE IF EXISTS public.contracts ENABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies for contracts to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own contracts" ON public.contracts;
DROP POLICY IF EXISTS "Hosts can create contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can create contracts" ON public.contracts;
DROP POLICY IF EXISTS "Parties can update their contracts" ON public.contracts;

-- 3. Create Permissive INSERT Policy (Critical for "Request Arrangement")
CREATE POLICY "Authenticated users can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow creation if the user is one of the parties
    auth.uid() = host_id OR auth.uid() = student_id
);

-- 4. Create Permissive SELECT Policy (Critical for .select() return)
CREATE POLICY "Users can view their own contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
    host_id = auth.uid() 
    OR student_id = auth.uid()
    OR public.is_admin()
);

-- 5. Create UDPATE Policy
CREATE POLICY "Parties can update their contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (
    host_id = auth.uid() OR student_id = auth.uid()
)
WITH CHECK (
    host_id = auth.uid() OR student_id = auth.uid()
);
