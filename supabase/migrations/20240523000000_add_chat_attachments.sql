-- Create new columns for messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachment_type text; -- 'image', 'video', 'document'

-- Create Chat Attachments Bucket
insert into storage.buckets (id, name, public)
values ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- Allow Authenticated Users to Upload
create policy "Authenticated users can upload chat attachments"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'chat-attachments' );

-- Allow Visual Access
create policy "Anyone can view chat attachments"
on storage.objects for select
to public
using ( bucket_id = 'chat-attachments' );

-- Allow Users to Delete their Own files (Optional but good practice)
create policy "Users can delete own chat attachments"
on storage.objects for delete
to authenticated
using ( bucket_id = 'chat-attachments' AND auth.uid() = owner );
