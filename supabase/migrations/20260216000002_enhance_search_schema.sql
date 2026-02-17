-- Migration: Add fields for advanced search
-- 1. Add price_amount to listings for numeric range filtering
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS price_amount NUMERIC;

-- 2. Add features to listings for amenities (WiFi, AC, etc.)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS features TEXT[];

-- 3. Backfill price_amount from price string
-- Removes all non-numeric characters and casts to numeric
UPDATE public.listings 
SET price_amount = CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS NUMERIC) 
WHERE price_amount IS NULL AND price ~ '[0-9]';
