-- Ensure Profiles are visible to everyone (so Listings feed works)
-- If a listing author's profile is hidden, the feed crashes and reverts to mocks.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow ANY authenticated user to view ANY profile basic info
-- (We might want to restrict sensitive fields later, but for now we need visibility)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Also ensure Listings are viewable
DROP POLICY IF EXISTS "Listings are public" ON public.listings;

CREATE POLICY "Listings are public"
ON public.listings FOR SELECT
TO authenticated
USING (true);
