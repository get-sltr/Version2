-- Create profile-media storage bucket for photo albums
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-media',
  'profile-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-media bucket
CREATE POLICY "Users can upload to profile-media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own files in profile-media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own files in profile-media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile-media"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-media');
