-- Cruising Interactions: Likes, Replies, Reports
-- Posts stick for 8 hours and users can interact with them

-- ============================================
-- LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cruising_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES cruising_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(update_id, user_id) -- One like per user per post
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cruising_likes_update_id ON cruising_likes(update_id);
CREATE INDEX IF NOT EXISTS idx_cruising_likes_user_id ON cruising_likes(user_id);

-- RLS
ALTER TABLE cruising_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON cruising_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON cruising_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unlike their own likes"
  ON cruising_likes FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- REPLIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cruising_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES cruising_updates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cruising_replies_update_id ON cruising_replies(update_id);
CREATE INDEX IF NOT EXISTS idx_cruising_replies_user_id ON cruising_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_cruising_replies_created_at ON cruising_replies(created_at DESC);

-- RLS
ALTER TABLE cruising_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view replies"
  ON cruising_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create replies"
  ON cruising_replies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own replies"
  ON cruising_replies FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cruising_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID NOT NULL REFERENCES cruising_updates(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'offensive', 'harassment', 'fake', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(update_id, reporter_id) -- One report per user per post
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cruising_reports_update_id ON cruising_reports(update_id);
CREATE INDEX IF NOT EXISTS idx_cruising_reports_status ON cruising_reports(status);

-- RLS
ALTER TABLE cruising_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report posts"
  ON cruising_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
  ON cruising_reports FOR SELECT
  USING (reporter_id = auth.uid());

-- ============================================
-- ADD COUNTS TO CRUISING_UPDATES (denormalized for performance)
-- ============================================
ALTER TABLE cruising_updates ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;
ALTER TABLE cruising_updates ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- ============================================
-- TRIGGER: Update like count on cruising_updates
-- ============================================
CREATE OR REPLACE FUNCTION update_cruising_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cruising_updates SET like_count = like_count + 1 WHERE id = NEW.update_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cruising_updates SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.update_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_cruising_like_count ON cruising_likes;
CREATE TRIGGER trigger_update_cruising_like_count
  AFTER INSERT OR DELETE ON cruising_likes
  FOR EACH ROW EXECUTE FUNCTION update_cruising_like_count();

-- ============================================
-- TRIGGER: Update reply count on cruising_updates
-- ============================================
CREATE OR REPLACE FUNCTION update_cruising_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cruising_updates SET reply_count = reply_count + 1 WHERE id = NEW.update_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE cruising_updates SET reply_count = GREATEST(0, reply_count - 1) WHERE id = OLD.update_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_cruising_reply_count ON cruising_replies;
CREATE TRIGGER trigger_update_cruising_reply_count
  AFTER INSERT OR DELETE ON cruising_replies
  FOR EACH ROW EXECUTE FUNCTION update_cruising_reply_count();
