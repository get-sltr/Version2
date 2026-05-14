-- Enable RLS on cruising_updates (was missing)
ALTER TABLE cruising_updates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read cruising updates
CREATE POLICY "Authenticated users can read cruising updates"
  ON cruising_updates FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own cruising updates
CREATE POLICY "Users can insert own cruising updates"
  ON cruising_updates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cruising updates
CREATE POLICY "Users can update own cruising updates"
  ON cruising_updates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own cruising updates
CREATE POLICY "Users can delete own cruising updates"
  ON cruising_updates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
