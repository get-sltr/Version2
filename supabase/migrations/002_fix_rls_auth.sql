-- Fix RLS policies for authentication
-- Run this to fix login issues

-- Drop problematic policies
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;

-- Recreate with auth-friendly policies

-- Users can ALWAYS read their own profile (needed for auth)
-- Users can read other non-incognito, non-blocked profiles
CREATE POLICY profiles_select ON profiles
    FOR SELECT USING (
        id = auth.uid()  -- Always allow reading own profile
        OR (
            is_incognito = FALSE
            AND (auth.uid() IS NULL OR NOT EXISTS (
                SELECT 1 FROM blocked_users
                WHERE (blocker_id = auth.uid() AND blocked_id = profiles.id)
                   OR (blocker_id = profiles.id AND blocked_id = auth.uid())
            ))
        )
    );

-- Users can insert their own profile
CREATE POLICY profiles_insert ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update ON profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Also fix user_settings - allow upsert on signup
DROP POLICY IF EXISTS user_settings_all ON user_settings;

CREATE POLICY user_settings_select ON user_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_settings_insert ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY user_settings_update ON user_settings
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY user_settings_delete ON user_settings
    FOR DELETE USING (user_id = auth.uid());

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Also allow anon for initial auth checks
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON profiles TO anon;
