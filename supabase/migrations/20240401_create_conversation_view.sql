-- Create a view to get the latest message for each unique conversation pair
CREATE OR REPLACE VIEW conversation_list AS
SELECT DISTINCT ON (
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id)
)
  m.id,
  m.sender_id,
  m.receiver_id,
  m.content,
  m.created_at,
  m.is_read,
  p1.first_name as sender_first_name,
  p1.last_name as sender_last_name,
  p1.avatar_url as sender_avatar_url,
  p2.first_name as receiver_first_name,
  p2.last_name as receiver_last_name,
  p2.avatar_url as receiver_avatar_url
FROM messages m
LEFT JOIN profiles p1 ON m.sender_id = p1.id
LEFT JOIN profiles p2 ON m.receiver_id = p2.id
ORDER BY 
  LEAST(sender_id, receiver_id), 
  GREATEST(sender_id, receiver_id), 
  m.created_at DESC;
