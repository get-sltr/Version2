-- Add missing profile columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tribes text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS position text;
