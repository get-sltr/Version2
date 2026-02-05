-- Add column to track when user dismissed the Add to Home Screen splash
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS a2hs_dismissed_at TIMESTAMPTZ;

-- Add comment for clarity
COMMENT ON COLUMN profiles.a2hs_dismissed_at IS 'Timestamp when user dismissed the Add to Home Screen prompt';
