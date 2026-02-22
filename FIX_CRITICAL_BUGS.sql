-- FIX CRITICAL BUGS: RLS and Admin Function

-- 1. Unrestricting Profile Access
-- Allow all authenticated users to view profiles (needed for feed author details)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. Securing is_admin function
-- Add SET search_path = public to prevent search_path highjacking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$function$;
