-- Run this in your Supabase SQL Editor to add support for multiple room images

ALTER TABLE listings ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
