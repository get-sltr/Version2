-- Add location columns to existing cruising_updates table
-- These columns enable distance-based sorting

ALTER TABLE cruising_updates ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE cruising_updates ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cruising_updates_created_at ON cruising_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cruising_updates_expires_at ON cruising_updates(expires_at);

-- Enable RLS if not already enabled
ALTER TABLE cruising_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active updates" ON cruising_updates;
DROP POLICY IF EXISTS "Users can create own updates" ON cruising_updates;
DROP POLICY IF EXISTS "Users can delete own updates" ON cruising_updates;

-- Create RLS policies
CREATE POLICY "Anyone can read active updates"
  ON cruising_updates FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users can create own updates"
  ON cruising_updates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own updates"
  ON cruising_updates FOR DELETE
  USING (user_id = auth.uid());
