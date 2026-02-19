-- Contracts Table
CREATE TYPE contract_status AS ENUM ('pending', 'signed', 'active', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.profiles(id),
    student_id UUID NOT NULL REFERENCES public.profiles(id),
    listing_id BIGINT NOT NULL REFERENCES public.listings(id),
    status contract_status DEFAULT 'pending',
    terms JSONB NOT NULL,
    contract_pdf_url TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Contracts
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (
    host_id = auth.uid() 
    OR student_id = auth.uid()
    OR public.is_admin() -- Access via helper function
);

CREATE POLICY "Hosts can create contracts"
ON public.contracts FOR INSERT
TO authenticated
WITH CHECK (
    host_id = auth.uid()
);

CREATE POLICY "Parties can update their contracts"
ON public.contracts FOR UPDATE
TO authenticated
USING (
    host_id = auth.uid() 
    OR student_id = auth.uid()
)
WITH CHECK (
    host_id = auth.uid() 
    OR student_id = auth.uid()
);

-- JSONB Housing Rules Migration
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS housing_rules JSONB DEFAULT '{}'::jsonb;
