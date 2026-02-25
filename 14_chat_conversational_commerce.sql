-- Migration to add Rich Messages to Chat

ALTER TABLE public.messages 
ADD COLUMN message_type text DEFAULT 'text',
ADD COLUMN payload jsonb DEFAULT NULL,
ADD COLUMN status text DEFAULT NULL;

-- Add check constraints to ensure valid data
ALTER TABLE public.messages
ADD CONSTRAINT valid_message_type CHECK (message_type IN ('text', 'listing_share', 'condition_proposal'));

ALTER TABLE public.messages
ADD CONSTRAINT valid_message_status CHECK (status IN ('pending', 'accepted', 'declined') OR status IS NULL);

-- Add comment explaining the new columns
COMMENT ON COLUMN public.messages.message_type IS 'Type of message: text, listing_share, or condition_proposal';
COMMENT ON COLUMN public.messages.payload IS 'JSON data for rich messages containing listing info or condition text';
COMMENT ON COLUMN public.messages.status IS 'Status of condition_proposal: pending, accepted, declined';
