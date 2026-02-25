-- Migration to add Contracts and Listing Availability

-- 1. Add availability status to listings
ALTER TABLE public.listings 
ADD COLUMN availability_status text DEFAULT 'available';

ALTER TABLE public.listings
ADD CONSTRAINT valid_availability_status CHECK (availability_status IN ('available', 'rented', 'unavailable'));

COMMENT ON COLUMN public.listings.availability_status IS 'Whether the room is available, rented out via a signed contract, or temporarily unavailable.';

-- 2. Create the contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id bigint REFERENCES public.listings(id) ON DELETE CASCADE,
    host_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    seeker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    agreed_rules jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT valid_contract_status CHECK (status IN ('pending', 'signed', 'cancelled'))
);

-- Note: We use bigint for listing_id because the listings table uses an integer/bigint identity column, not uuid.

-- Add RLS Policies for Contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
    ON public.contracts
    FOR SELECT
    USING (auth.uid() = host_id OR auth.uid() = seeker_id);

CREATE POLICY "Users can insert contracts if they are involved"
    ON public.contracts
    FOR INSERT
    WITH CHECK (auth.uid() = host_id OR auth.uid() = seeker_id);

CREATE POLICY "Users can update their own contracts"
    ON public.contracts
    FOR UPDATE
    USING (auth.uid() = host_id OR auth.uid() = seeker_id);
