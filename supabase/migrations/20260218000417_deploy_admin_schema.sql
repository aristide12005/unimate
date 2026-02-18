-- 1. Create a custom enum for user roles
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add role column to profiles table
DO $$ BEGIN
    ALTER TABLE public.profiles 
    ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- 3. Update RLS policies to give admins full access

-- Drop existing policies if they exist to avoid conflicts (optional, but safer for re-runs)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )
);

-- Allow admins to delete data if needed
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )
);
