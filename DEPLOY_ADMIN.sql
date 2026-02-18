-- 1. Create a custom enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- 2. Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';

-- 3. Update RLS policies to give admins full access

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

-- 4. OPTIONAL: Set yourself as admin (Replace with your email)
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
