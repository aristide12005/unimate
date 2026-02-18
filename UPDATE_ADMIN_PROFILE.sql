-- 1. Add columns if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. (Optional) If you want to backfill existing admins
UPDATE public.profiles 
SET position = 'Administrator', first_name = 'Admin', last_name = 'User'
WHERE role = 'admin' AND position IS NULL; 