DO $$ 
BEGIN
    -- 1. Ensure the ROLE enum and column exist
    -- This ensures your database schema supports roles.
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin');
    END IF;

    -- Add role column safely if it's missing
    ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL DEFAULT 'user';

    -- 2. Create or Update Admin Profile for YOU specifically
    -- Why insert? Because diagnostics showed 'Raw Profile: null' (meaning NO profile exists).
    INSERT INTO public.profiles (user_id, username, first_name, last_name, role)
    VALUES (
        '39e17c66-8aed-4c93-b829-91370741ecb2', -- Your Specific User ID
        'admin_aristide',                       -- Username (must be unique)
        'Aristide',                             -- First Name
        'Admin',                                -- Last Name
        'admin'                                 -- The Role!
    )
    ON CONFLICT (user_id) DO UPDATE SET 
        role = 'admin';  -- If profile exists, just make sure role is admin

END $$;
