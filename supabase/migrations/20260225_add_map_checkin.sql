-- Add map check-in field to profiles (Issue 6)
-- When non-null and recent (within 1 hour), user appears on the map to others.
-- Null or expired = user does NOT appear as a map marker.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS map_checked_in_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of checked-in users
CREATE INDEX IF NOT EXISTS idx_profiles_map_checked_in_at
  ON profiles (map_checked_in_at)
  WHERE map_checked_in_at IS NOT NULL;

COMMENT ON COLUMN profiles.map_checked_in_at IS 'Timestamp of manual map check-in. User appears on map only when this is within the last hour.';
