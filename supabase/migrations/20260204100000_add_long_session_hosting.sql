-- Add long_session_visible and is_hosting columns to user_settings
-- long_session_visible: shows "Long Session Preferred" badge on profile
-- is_hosting: shows "HOSTING" badge on profile (user-controlled toggle)

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS long_session_visible BOOLEAN DEFAULT FALSE;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS is_hosting BOOLEAN DEFAULT FALSE;
