-- Add NSFW flags for individual photos
-- Each index corresponds to the same index in photo_urls array
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS photo_nsfw_flags BOOLEAN[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN profiles.photo_nsfw_flags IS 'Boolean array marking which photos in photo_urls are NSFW. Index matches photo_urls index.';
