-- Add photo_approved column to profiles
-- When false, profile photo is hidden from grid/map until admin approves.
-- Default true so existing users are unaffected.
-- Only set to false when client-side NSFW scan is skipped (native platforms).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_approved BOOLEAN DEFAULT true;

-- Index for efficient filtering in grid/map queries
CREATE INDEX IF NOT EXISTS idx_profiles_photo_approved ON profiles (photo_approved) WHERE photo_approved = false;
