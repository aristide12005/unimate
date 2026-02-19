-- Enable RLS for Listings (if not already)
ALTER TABLE IF EXISTS public.listings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (Idempotency)
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;

-- 1. View Policy: Anyone can view listings
CREATE POLICY "Anyone can view listings"
ON public.listings FOR SELECT
USING (true);

-- 2. Create Policy: Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
ON public.listings FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = author_id
);

-- 3. Update Policy: Users can update their own listings
CREATE POLICY "Users can update their own listings"
ON public.listings FOR UPDATE
TO authenticated
USING (
    auth.uid() = author_id
)
WITH CHECK (
    auth.uid() = author_id
);

-- 4. Delete Policy: Users can delete their own listings
CREATE POLICY "Users can delete their own listings"
ON public.listings FOR DELETE
TO authenticated
USING (
    auth.uid() = author_id
);
