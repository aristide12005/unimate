-- Add contact columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_whatsapp BOOLEAN DEFAULT FALSE;
