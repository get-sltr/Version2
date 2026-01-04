-- Group Messages Table
-- Simple table for group chat messages

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(50) DEFAULT 'text',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(group_id, created_at DESC);

-- RLS Policies
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Members can read messages from groups they belong to
CREATE POLICY "Members can read group messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Members can send messages to groups they belong to
CREATE POLICY "Members can send group messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON group_messages FOR DELETE
  USING (sender_id = auth.uid());
