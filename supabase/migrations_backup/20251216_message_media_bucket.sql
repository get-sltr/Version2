-- Create message-media storage bucket for image sharing in messages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-media',
  'message-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload message images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view message images (public bucket)
CREATE POLICY "Anyone can view message images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'message-media');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own message images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
