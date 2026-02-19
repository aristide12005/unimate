-- Contracts RLS Fix
-- The previous policy only allowed HOSTS to create contracts.
-- We need to allow STUDENTS to create contracts (Request Arrangement) as well.

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Hosts can create contracts" ON public.contracts;
DROP POLICY IF EXISTS "Authenticated users can create contracts" ON public.contracts;

-- Create comprehensive INSERT policy
CREATE POLICY "Authenticated users can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow if user is the Host OR the Student
    auth.uid() = host_id OR auth.uid() = student_id
);
