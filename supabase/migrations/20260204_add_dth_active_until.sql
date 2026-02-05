-- Add dth_active_until column to profiles
-- Replaces the old is_dtfn boolean with a timestamp for expirable DTH status
-- When dth_active_until > now(), user is DTH active; NULL or past = inactive

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dth_active_until TIMESTAMPTZ;

-- Migrate any existing is_dtfn=true users to have a 2-hour window from now
UPDATE profiles
SET dth_active_until = NOW() + INTERVAL '2 hours'
WHERE is_dtfn = TRUE AND (dth_active_until IS NULL);

-- Index for filtering DTH-active users efficiently
CREATE INDEX IF NOT EXISTS idx_profiles_dth_active
ON profiles (dth_active_until)
WHERE dth_active_until IS NOT NULL;
