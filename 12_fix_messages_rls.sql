-- 1. Ensure columns exist (idempotent)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- 2. Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 3. Add Policies (and drop if exists to ensure clean state or use different name)
-- Dropping first to avoid conflicts if they already exist with different definitions
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Corrected Policy: link auth.uid() -> profiles.user_id -> profiles.id -> messages.sender_id
CREATE POLICY "Users can update their own messages"
ON messages
FOR UPDATE
USING (
  sender_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can delete their own messages" ON messages;
CREATE POLICY "Users can delete their own messages"
ON messages
FOR DELETE
USING (
  sender_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);
