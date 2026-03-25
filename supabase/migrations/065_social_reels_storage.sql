-- Migration: 065_social_reels_storage.sql
-- Storage bucket for reel video uploads

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-reels',
  'social-reels',
  true,
  104857600,
  ARRAY['video/mp4', 'video/quicktime', 'video/webm', 'video/mov']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload to their own profile folder
CREATE POLICY "reels_storage_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'social-reels' AND (storage.foldername(name))[1] IN (SELECT id::text FROM social_profiles WHERE user_id = auth.uid()));

CREATE POLICY "reels_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-reels');

CREATE POLICY "reels_storage_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'social-reels' AND (storage.foldername(name))[1] IN (SELECT id::text FROM social_profiles WHERE user_id = auth.uid()));
