-- Fix RLS policies to allow hosts to send/read group messages
-- Hosts are not automatically in group_members, they are in groups.host_id

-- Drop existing policies
DROP POLICY IF EXISTS "Members can read group messages" ON group_messages;
DROP POLICY IF EXISTS "Members can send group messages" ON group_messages;

-- Recreate with host support
CREATE POLICY "Members and hosts can read group messages"
  ON group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_messages.group_id
      AND groups.host_id = auth.uid()
    )
  );

CREATE POLICY "Members and hosts can send group messages"
  ON group_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = group_messages.group_id
        AND group_members.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM groups
        WHERE groups.id = group_messages.group_id
        AND groups.host_id = auth.uid()
      )
    )
  );
