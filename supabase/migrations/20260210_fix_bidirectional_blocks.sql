-- Fix Bidirectional Blocking
-- Users should not see each other after either one blocks the other

-- 1. Add policy to allow users to see if they've been blocked
-- This allows querying blocks where blocked_user_id = current_user
CREATE POLICY "Users can see if they are blocked"
  ON public.blocks
  FOR SELECT
  TO authenticated
  USING (blocked_user_id = auth.uid());

-- 2. Create a function to get all blocked user IDs (both directions)
-- This is more efficient than two separate queries
CREATE OR REPLACE FUNCTION public.get_all_blocked_ids()
RETURNS TABLE(blocked_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  -- Users I have blocked
  SELECT blocked_user_id AS blocked_id
  FROM public.blocks
  WHERE user_id = auth.uid()

  UNION

  -- Users who have blocked me
  SELECT user_id AS blocked_id
  FROM public.blocks
  WHERE blocked_user_id = auth.uid()
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_all_blocked_ids() TO authenticated;

-- 3. Add index for faster blocked_user_id lookups
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_user_id
  ON public.blocks(blocked_user_id);

-- 4. Add unique constraint to prevent duplicate blocks
ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_unique_pair
  UNIQUE (user_id, blocked_user_id);

-- Comment for documentation
COMMENT ON FUNCTION public.get_all_blocked_ids() IS
  'Returns all user IDs that should be hidden from the current user (users they blocked + users who blocked them)';
