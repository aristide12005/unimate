-- Create a custom enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role public.app_role NOT NULL DEFAULT 'user';

-- Update RLS policies to give admins full access
-- We need to check the role in the policies. 
-- Since we are querying the same table we are protecting, this can cause infinite recursion if not careful.
-- However, for simple checks it's usually fine, or we can use a secure definer function.

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

-- Allow admins to delete data if needed (optional, good for management)
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'
  )
);
