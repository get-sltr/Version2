-- Rejected Photo Hashes
-- Stores perceptual hashes of photos that were rejected by moderation.
-- When a user uploads a photo, we compute its hash and check against this table.
-- If a match is found, the upload is blocked automatically.

CREATE TABLE IF NOT EXISTS public.rejected_photo_hashes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash TEXT NOT NULL,
  original_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  original_photo_path TEXT,
  rejected_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT DEFAULT 'nsfw',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast hash lookups
CREATE INDEX idx_rejected_photo_hashes_hash ON public.rejected_photo_hashes(hash);

-- Unique constraint to avoid duplicate hashes
CREATE UNIQUE INDEX idx_rejected_photo_hashes_unique ON public.rejected_photo_hashes(hash);

-- RLS: Only service role can read/write (admin operations only)
ALTER TABLE public.rejected_photo_hashes ENABLE ROW LEVEL SECURITY;

-- No policies for regular users — only accessible via service role key
COMMENT ON TABLE public.rejected_photo_hashes IS 'Stores hashes of rejected photos to prevent re-upload';
