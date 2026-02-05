-- Add column to store OneSignal player ID for push notifications
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onesignal_player_id TEXT;

-- Add columns for push notification prompt tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_prompt_dismissed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_enabled_at TIMESTAMPTZ;

-- Add index for faster lookups when sending notifications
CREATE INDEX IF NOT EXISTS idx_profiles_onesignal_player_id ON profiles(onesignal_player_id) WHERE onesignal_player_id IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN profiles.onesignal_player_id IS 'OneSignal subscription ID for sending push notifications';
COMMENT ON COLUMN profiles.push_prompt_dismissed_at IS 'When user dismissed the push notification prompt';
COMMENT ON COLUMN profiles.push_enabled_at IS 'When user enabled push notifications';
