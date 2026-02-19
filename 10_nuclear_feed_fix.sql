-- NUCLEAR OPTION: DISABLE RLS RESTRICTIONS FOR DEBUGGING
-- This ensures that lack of visibility is NOT due to policies.

-- 1. Profiles: Allow ALL operations for authenticated users
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Debug: Profiles Public" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Listings: Allow ALL operations for authenticated users
DROP POLICY IF EXISTS "Listings are public" ON public.listings;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.listings;
CREATE POLICY "Debug: Listings Public" ON public.listings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Check for specific user (Optional: replace with your Auth ID to verify specific visibility)
-- SELECT * FROM public.listings;
