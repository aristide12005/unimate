-- Migration: Add contact info to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'whatsapp'; -- 'whatsapp' or 'phone'
