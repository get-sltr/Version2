-- =============================================================================
-- Fix profile_views table - add missing column, constraint, and RLS policies
-- =============================================================================

-- Add seen_at column if it doesn't exist
ALTER TABLE profile_views
ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ DEFAULT NULL;

-- Add unique constraint on viewer_id + viewed_id for upsert to work
-- First, remove any duplicates
DELETE FROM profile_views a
USING profile_views b
WHERE a.id > b.id
  AND a.viewer_id = b.viewer_id
  AND a.viewed_id = b.viewed_id;

-- Create the unique constraint (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profile_views_viewer_viewed_unique'
  ) THEN
    ALTER TABLE profile_views
    ADD CONSTRAINT profile_views_viewer_viewed_unique
    UNIQUE (viewer_id, viewed_id);
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS profile_views_select ON profile_views;
DROP POLICY IF EXISTS profile_views_insert ON profile_views;
DROP POLICY IF EXISTS profile_views_update ON profile_views;

-- Users can view records where they are the viewer or the viewed person
CREATE POLICY profile_views_select ON profile_views
    FOR SELECT USING (viewed_id = auth.uid() OR viewer_id = auth.uid());

-- Users can insert views where they are the viewer
CREATE POLICY profile_views_insert ON profile_views
    FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- Users can update their own view records (for seen_at)
CREATE POLICY profile_views_update ON profile_views
    FOR UPDATE USING (viewed_id = auth.uid());

-- Create index on seen_at for efficient unseen count queries
CREATE INDEX IF NOT EXISTS idx_profile_views_unseen
ON profile_views (viewed_id, seen_at)
WHERE seen_at IS NULL;
