-- Migration: Add custom_conditions to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_conditions TEXT;
