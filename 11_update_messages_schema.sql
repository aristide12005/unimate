
-- Add is_edited and is_deleted columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow updating these fields (if not already covered by general update policy)
-- Assuming existing policies cover updates for sender. If not, we might need to add/tweak them.
-- For now, let's just make sure the columns exist.
