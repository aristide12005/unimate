-- Add Lifestyle and Languages to Profiles for Compatibility Matching

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS lifestyle JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';

-- Example Lifestyle JSON Structure:
-- {
--   "smoker": false,
--   "has_pets": false,
--   "sleep_schedule": "early_bird",  -- 'early_bird', 'night_owl', 'flexible'
--   "cleanliness": "tidy",           -- 'messy', 'tidy', 'spotless'
--   "guests_frequency": "occasional" -- 'never', 'occasional', 'frequent'
-- }
