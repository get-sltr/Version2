-- Add all missing profile fields for complete public profile display
-- This ensures every user has these columns available when they sign up

-- Identity fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns VARCHAR(30);

-- Expectations fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meet_at TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accepts_nsfw BOOLEAN DEFAULT FALSE;

-- Health fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS health_practices TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vaccinations TEXT[] DEFAULT '{}';

-- About field (alias for bio - ensure both exist)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS about TEXT;

-- Social links
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS spotify_top_songs TEXT[] DEFAULT '{}';

-- Update the position column to allow free-form text (not just enum)
-- This makes it more flexible for users
ALTER TABLE profiles ALTER COLUMN position TYPE VARCHAR(50);

-- Create indexes for commonly filtered fields
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles (gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN (looking_for) WHERE looking_for != '{}';
CREATE INDEX IF NOT EXISTS idx_profiles_meet_at ON profiles USING GIN (meet_at) WHERE meet_at != '{}';
