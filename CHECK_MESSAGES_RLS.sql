-- check_messages_rls.sql

-- Enable RLS on messages if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow Admins to read ALL messages
CREATE POLICY "Admins can read all messages"
ON messages
FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR
  (sender_id = auth.uid() OR receiver_id = auth.uid()) -- Regular users can only see their own
);

-- Policy to allow Admins to insert messages to ANYONE
CREATE POLICY "Admins can send messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR
  (sender_id = auth.uid()) -- Regular users sending as themselves
);

-- Policy to allow Admins to update messages (e.g. mark as ready)
CREATE POLICY "Admins can update messages"
ON messages
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR
  (sender_id = auth.uid() OR receiver_id = auth.uid())
);
