-- Photo Moderation Log Table
-- Logs NSFW scan results for public profile photos
-- Admin-only access - users CANNOT read this table

CREATE TABLE IF NOT EXISTS public.photo_moderation_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  photo_path TEXT NOT NULL,
  scan_passed BOOLEAN NOT NULL,
  model_available BOOLEAN NOT NULL DEFAULT true,
  scores JSONB,
  failed_category TEXT CHECK (failed_category IN ('Porn', 'Hentai', 'Sexy', 'Drawing', 'Neutral')),
  requires_manual_review BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_decision TEXT CHECK (review_decision IN ('approved', 'rejected', 'escalated')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for looking up by user
CREATE INDEX IF NOT EXISTS idx_photo_moderation_log_user_id ON public.photo_moderation_log(user_id);

-- Create index for finding photos needing review
CREATE INDEX IF NOT EXISTS idx_photo_moderation_log_needs_review
  ON public.photo_moderation_log(requires_manual_review, reviewed_at)
  WHERE requires_manual_review = true AND reviewed_at IS NULL;

-- Create index for failed scans
CREATE INDEX IF NOT EXISTS idx_photo_moderation_log_failed
  ON public.photo_moderation_log(scan_passed, created_at)
  WHERE scan_passed = false;

-- Enable RLS
ALTER TABLE public.photo_moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: NO user access - admin only
-- This table should only be accessed via service role key or admin dashboard
-- Users cannot see their own moderation logs

-- Allow insert from authenticated users (for logging their own scans)
CREATE POLICY "Users can insert their own moderation logs"
  ON public.photo_moderation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- No select/update/delete policies for regular users
-- Admin access should use service role key which bypasses RLS

-- Add comment for documentation
COMMENT ON TABLE public.photo_moderation_log IS 'Logs NSFW scan results for profile photos. Admin-only read access.';
COMMENT ON COLUMN public.photo_moderation_log.scores IS 'NSFWJS prediction scores as JSON: {Drawing, Hentai, Neutral, Porn, Sexy}';
COMMENT ON COLUMN public.photo_moderation_log.failed_category IS 'The category that exceeded threshold if scan failed';
COMMENT ON COLUMN public.photo_moderation_log.requires_manual_review IS 'True if model was unavailable or scan errored - needs human review';
