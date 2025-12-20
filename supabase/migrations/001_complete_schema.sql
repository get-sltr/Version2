-- SLTR Database Schema - Complete Migration
-- Version: 2.0.0
-- Generated: 2025-12-15

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- Position enum for user profiles
DO $$ BEGIN
    CREATE TYPE position_type AS ENUM ('top', 'vers-top', 'versatile', 'vers-bottom', 'bottom', 'side');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tribe enum for community affiliation
DO $$ BEGIN
    CREATE TYPE tribe_type AS ENUM (
        'bear', 'twink', 'jock', 'otter', 'daddy', 'leather', 'poz',
        'discreet', 'clean-cut', 'geek', 'military', 'rugged', 'pup', 'trans', 'queer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Group type enum
DO $$ BEGIN
    CREATE TYPE group_type AS ENUM ('Hangout', 'Party', 'Sports', 'Casual', 'Dinner', 'Drinks', 'Gaming', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Group category enum
DO $$ BEGIN
    CREATE TYPE group_category AS ENUM ('bar', 'restaurant', 'hangout', 'gym', 'cafe', 'outdoors', 'private');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message type enum
DO $$ BEGIN
    CREATE TYPE message_type AS ENUM ('text', 'image', 'tap', 'system', 'album_share');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tap type enum
DO $$ BEGIN
    CREATE TYPE tap_type AS ENUM ('flame', 'wave', 'wink', 'looking');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification type enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'tap', 'message', 'view', 'favorite', 'album_share',
        'group_invite', 'group_join', 'system'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Report reason enum
DO $$ BEGIN
    CREATE TYPE report_reason AS ENUM (
        'spam', 'harassment', 'inappropriate_content', 'fake_profile',
        'underage', 'scam', 'hate_speech', 'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- TABLE: profiles (Main user profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(20),
    age INTEGER CHECK (age >= 18 AND age <= 120),
    position position_type,
    tribes tribe_type[] DEFAULT '{}',
    tags VARCHAR(50)[] DEFAULT '{}',
    bio TEXT,
    photo_url TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    height VARCHAR(20),
    weight VARCHAR(20),
    body_type VARCHAR(30),
    ethnicity VARCHAR(50),
    relationship_status VARCHAR(30),
    looking_for TEXT[] DEFAULT '{}',
    hiv_status VARCHAR(30),
    last_tested DATE,

    -- Location
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location_point GEOGRAPHY(POINT, 4326),
    city VARCHAR(100),
    country VARCHAR(100),

    -- Travel mode
    travel_mode BOOLEAN DEFAULT FALSE,
    travel_lat DOUBLE PRECISION,
    travel_lng DOUBLE PRECISION,
    travel_location_point GEOGRAPHY(POINT, 4326),
    travel_city VARCHAR(100),

    -- Status flags
    is_online BOOLEAN DEFAULT FALSE,
    is_incognito BOOLEAN DEFAULT FALSE,
    is_dtfn BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMPTZ,

    -- Timestamps
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    last_location_update TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-update location_point from lat/lng
CREATE OR REPLACE FUNCTION update_location_point()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
        NEW.location_point = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
    END IF;
    IF NEW.travel_lat IS NOT NULL AND NEW.travel_lng IS NOT NULL THEN
        NEW.travel_location_point = ST_SetSRID(ST_MakePoint(NEW.travel_lng, NEW.travel_lat), 4326)::geography;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_location_point ON profiles;
CREATE TRIGGER trigger_update_location_point
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();

-- ============================================================================
-- TABLE: user_settings (User preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Display preferences
    show_age BOOLEAN DEFAULT TRUE,
    show_distance BOOLEAN DEFAULT TRUE,
    distance_unit VARCHAR(10) DEFAULT 'miles',

    -- Filter preferences
    min_age_filter INTEGER DEFAULT 18,
    max_age_filter INTEGER DEFAULT 99,
    max_distance INTEGER DEFAULT 50,
    position_filters position_type[] DEFAULT '{}',
    tribe_filters tribe_type[] DEFAULT '{}',
    show_online_only BOOLEAN DEFAULT FALSE,

    -- Privacy settings
    incognito_mode BOOLEAN DEFAULT FALSE,
    hide_from_explore BOOLEAN DEFAULT FALSE,
    block_screenshots BOOLEAN DEFAULT FALSE,

    -- Notification settings
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_messages BOOLEAN DEFAULT TRUE,
    push_taps BOOLEAN DEFAULT TRUE,
    push_favorites BOOLEAN DEFAULT TRUE,
    push_views BOOLEAN DEFAULT FALSE,
    email_weekly_digest BOOLEAN DEFAULT TRUE,

    -- Content preferences
    show_nsfw BOOLEAN DEFAULT FALSE,
    pnp_visible BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: saved_phrases (Quick message phrases)
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_phrases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: groups (Events/meetups)
-- ============================================================================
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type group_type NOT NULL DEFAULT 'Hangout',
    category group_category,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT,

    -- Location
    location VARCHAR(200),
    address TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    location_point GEOGRAPHY(POINT, 4326),

    -- Schedule
    event_date DATE,
    event_time TIME,

    -- Capacity
    attendees INTEGER DEFAULT 1,
    max_attendees INTEGER DEFAULT 10,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 99,

    -- Settings
    tags VARCHAR(50)[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for groups location_point
DROP TRIGGER IF EXISTS trigger_update_group_location ON groups;
CREATE TRIGGER trigger_update_group_location
    BEFORE INSERT OR UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_location_point();

-- ============================================================================
-- TABLE: group_members (Group attendance tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, left
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,

    UNIQUE(group_id, user_id)
);

-- ============================================================================
-- TABLE: messages (Direct messages)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    type message_type DEFAULT 'text',

    -- Media attachments
    media_url TEXT,
    media_type VARCHAR(20),

    -- Album share reference
    shared_album_id UUID,

    -- Status
    read_at TIMESTAMPTZ,
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_recipient BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure users can't message themselves
    CHECK (sender_id != recipient_id)
);

-- ============================================================================
-- TABLE: taps (User interactions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS taps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tap_type tap_type DEFAULT 'flame',

    -- Tracking
    viewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate active taps
    UNIQUE(sender_id, recipient_id, tap_type),
    CHECK (sender_id != recipient_id)
);

-- ============================================================================
-- TABLE: favorites (Saved profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    favorited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, favorited_user_id),
    CHECK (user_id != favorited_user_id)
);

-- ============================================================================
-- TABLE: blocked_users (Block records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

-- ============================================================================
-- TABLE: profile_views (Track who viewed profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    viewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CHECK (viewer_id != viewed_id)
);

-- ============================================================================
-- TABLE: notifications (User notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,

    -- Related entities
    from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    tap_id UUID REFERENCES taps(id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,

    -- Content
    title VARCHAR(100),
    body TEXT,
    data JSONB DEFAULT '{}',

    -- Status
    read_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: profile_albums (Photo albums)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    cover_photo_url TEXT,

    -- Expiration for ephemeral albums
    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: profile_photos (Album photos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES profile_albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    caption TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    is_nsfw BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: album_shares (Share albums with specific users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS album_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES profile_albums(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Expiration for temporary shares
    expires_at TIMESTAMPTZ,

    -- Tracking
    viewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(album_id, shared_with_id)
);

-- ============================================================================
-- TABLE: reports (User reports)
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    reported_group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,

    reason report_reason NOT NULL,
    description TEXT,

    -- Admin handling
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    resolution_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_profiles_travel_location ON profiles USING GIST (travel_location_point);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles (is_online) WHERE is_online = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles (last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles (age);
CREATE INDEX IF NOT EXISTS idx_profiles_position ON profiles (position);
CREATE INDEX IF NOT EXISTS idx_profiles_tribes ON profiles USING GIN (tribes);
CREATE INDEX IF NOT EXISTS idx_profiles_tags ON profiles USING GIN (tags);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages (recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    created_at DESC
);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (recipient_id, read_at)
    WHERE read_at IS NULL;

-- Taps indexes
CREATE INDEX IF NOT EXISTS idx_taps_sender ON taps (sender_id);
CREATE INDEX IF NOT EXISTS idx_taps_recipient ON taps (recipient_id);
CREATE INDEX IF NOT EXISTS idx_taps_created_at ON taps (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_taps_unviewed ON taps (recipient_id, viewed_at)
    WHERE viewed_at IS NULL;

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorited ON favorites (favorited_user_id);

-- Blocked users indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users (blocked_id);

-- Profile views indexes
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer ON profile_views (viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views (viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_recent ON profile_views (viewed_id, created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (user_id, read_at)
    WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_host ON groups (host_id);
CREATE INDEX IF NOT EXISTS idx_groups_location ON groups USING GIST (location_point);
CREATE INDEX IF NOT EXISTS idx_groups_date ON groups (event_date) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups (is_active) WHERE is_active = TRUE;

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members (user_id);

-- Albums indexes
CREATE INDEX IF NOT EXISTS idx_profile_albums_user ON profile_albums (user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_album ON profile_photos (album_id);
CREATE INDEX IF NOT EXISTS idx_album_shares_album ON album_shares (album_id);
CREATE INDEX IF NOT EXISTS idx_album_shares_shared_with ON album_shares (shared_with_id);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON reports (reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status) WHERE status = 'pending';

-- ============================================================================
-- FUNCTIONS FOR COMMON QUERIES
-- ============================================================================

-- Function to get nearby profiles
CREATE OR REPLACE FUNCTION get_nearby_profiles(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    max_distance_meters INTEGER DEFAULT 50000,
    result_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    display_name VARCHAR,
    age INTEGER,
    position position_type,
    photo_url TEXT,
    is_online BOOLEAN,
    is_dtfn BOOLEAN,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.display_name,
        p.age,
        p.position,
        p.photo_url,
        p.is_online,
        p.is_dtfn,
        ST_Distance(
            p.location_point,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) as distance_meters
    FROM profiles p
    WHERE p.is_incognito = FALSE
        AND p.location_point IS NOT NULL
        AND ST_DWithin(
            p.location_point,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            max_distance_meters
        )
    ORDER BY distance_meters
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation messages
CREATE OR REPLACE FUNCTION get_conversation(
    user_a UUID,
    user_b UUID,
    msg_limit INTEGER DEFAULT 50,
    before_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    recipient_id UUID,
    content TEXT,
    type message_type,
    media_url TEXT,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.sender_id,
        m.recipient_id,
        m.content,
        m.type,
        m.media_url,
        m.read_at,
        m.created_at
    FROM messages m
    WHERE (
        (m.sender_id = user_a AND m.recipient_id = user_b AND m.deleted_by_sender = FALSE)
        OR (m.sender_id = user_b AND m.recipient_id = user_a AND m.deleted_by_recipient = FALSE)
    )
    AND (before_id IS NULL OR m.created_at < (SELECT created_at FROM messages WHERE id = before_id))
    ORDER BY m.created_at DESC
    LIMIT msg_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
    reader_id UUID,
    sender_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE messages
    SET read_at = NOW()
    WHERE recipient_id = reader_id
        AND sender_id = sender_user_id
        AND read_at IS NULL;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_blocked(
    user_a UUID,
    user_b UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_users
        WHERE (blocker_id = user_a AND blocked_id = user_b)
           OR (blocker_id = user_b AND blocked_id = user_a)
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE taps ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view all non-incognito profiles (except blocked users)
CREATE POLICY profiles_select ON profiles
    FOR SELECT USING (
        is_incognito = FALSE
        OR id = auth.uid()
        OR NOT is_blocked(auth.uid(), id)
    );

-- Users can only update their own profile
CREATE POLICY profiles_update ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY profiles_insert ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- USER SETTINGS POLICIES
CREATE POLICY user_settings_all ON user_settings
    FOR ALL USING (user_id = auth.uid());

-- SAVED PHRASES POLICIES
CREATE POLICY saved_phrases_all ON saved_phrases
    FOR ALL USING (user_id = auth.uid());

-- MESSAGES POLICIES
-- Users can see messages they sent or received (not deleted)
CREATE POLICY messages_select ON messages
    FOR SELECT USING (
        (sender_id = auth.uid() AND deleted_by_sender = FALSE)
        OR (recipient_id = auth.uid() AND deleted_by_recipient = FALSE)
    );

-- Users can send messages (not to blocked users)
CREATE POLICY messages_insert ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND NOT is_blocked(auth.uid(), recipient_id)
    );

-- Users can update read status or delete their messages
CREATE POLICY messages_update ON messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR recipient_id = auth.uid()
    );

-- TAPS POLICIES
CREATE POLICY taps_select ON taps
    FOR SELECT USING (
        sender_id = auth.uid() OR recipient_id = auth.uid()
    );

CREATE POLICY taps_insert ON taps
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND NOT is_blocked(auth.uid(), recipient_id)
    );

CREATE POLICY taps_update ON taps
    FOR UPDATE USING (recipient_id = auth.uid());

CREATE POLICY taps_delete ON taps
    FOR DELETE USING (sender_id = auth.uid());

-- FAVORITES POLICIES
CREATE POLICY favorites_select ON favorites
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY favorites_insert ON favorites
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY favorites_delete ON favorites
    FOR DELETE USING (user_id = auth.uid());

-- BLOCKED USERS POLICIES
CREATE POLICY blocked_users_select ON blocked_users
    FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY blocked_users_insert ON blocked_users
    FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY blocked_users_delete ON blocked_users
    FOR DELETE USING (blocker_id = auth.uid());

-- PROFILE VIEWS POLICIES
-- Users can see who viewed them
CREATE POLICY profile_views_select ON profile_views
    FOR SELECT USING (viewed_id = auth.uid() OR viewer_id = auth.uid());

-- Users can record views
CREATE POLICY profile_views_insert ON profile_views
    FOR INSERT WITH CHECK (viewer_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY notifications_select ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_delete ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- GROUPS POLICIES
-- Anyone can view active groups
CREATE POLICY groups_select ON groups
    FOR SELECT USING (is_active = TRUE OR host_id = auth.uid());

-- Only authenticated users can create groups
CREATE POLICY groups_insert ON groups
    FOR INSERT WITH CHECK (host_id = auth.uid());

-- Only host can update
CREATE POLICY groups_update ON groups
    FOR UPDATE USING (host_id = auth.uid());

-- GROUP MEMBERS POLICIES
CREATE POLICY group_members_select ON group_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM groups WHERE id = group_id AND host_id = auth.uid())
    );

CREATE POLICY group_members_insert ON group_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY group_members_update ON group_members
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM groups WHERE id = group_id AND host_id = auth.uid())
    );

-- ALBUMS POLICIES
-- Users can see their own albums and public albums
CREATE POLICY profile_albums_select ON profile_albums
    FOR SELECT USING (
        user_id = auth.uid()
        OR (is_private = FALSE)
        OR EXISTS (SELECT 1 FROM album_shares WHERE album_id = id AND shared_with_id = auth.uid())
    );

CREATE POLICY profile_albums_insert ON profile_albums
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY profile_albums_update ON profile_albums
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY profile_albums_delete ON profile_albums
    FOR DELETE USING (user_id = auth.uid());

-- PHOTOS POLICIES
CREATE POLICY profile_photos_select ON profile_photos
    FOR SELECT USING (
        user_id = auth.uid()
        OR (is_private = FALSE AND album_id IS NULL)
        OR EXISTS (
            SELECT 1 FROM profile_albums a
            WHERE a.id = album_id
            AND (a.is_private = FALSE OR a.user_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM album_shares s
            WHERE s.album_id = profile_photos.album_id
            AND s.shared_with_id = auth.uid()
        )
    );

CREATE POLICY profile_photos_insert ON profile_photos
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY profile_photos_delete ON profile_photos
    FOR DELETE USING (user_id = auth.uid());

-- ALBUM SHARES POLICIES
CREATE POLICY album_shares_select ON album_shares
    FOR SELECT USING (
        owner_id = auth.uid() OR shared_with_id = auth.uid()
    );

CREATE POLICY album_shares_insert ON album_shares
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY album_shares_update ON album_shares
    FOR UPDATE USING (shared_with_id = auth.uid());

CREATE POLICY album_shares_delete ON album_shares
    FOR DELETE USING (owner_id = auth.uid());

-- REPORTS POLICIES
CREATE POLICY reports_select ON reports
    FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY reports_insert ON reports
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR AUTO-NOTIFICATIONS
-- ============================================================================

-- Function to create notification on new tap
CREATE OR REPLACE FUNCTION notify_on_tap()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, from_user_id, tap_id, title, body)
    VALUES (
        NEW.recipient_id,
        'tap',
        NEW.sender_id,
        NEW.id,
        'New Tap',
        'Someone sent you a tap!'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_tap ON taps;
CREATE TRIGGER trigger_notify_on_tap
    AFTER INSERT ON taps
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_tap();

-- Function to create notification on new message
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify for first message in conversation or after 5 minutes gap
    IF NOT EXISTS (
        SELECT 1 FROM messages
        WHERE sender_id = NEW.sender_id
        AND recipient_id = NEW.recipient_id
        AND created_at > NOW() - INTERVAL '5 minutes'
        AND id != NEW.id
    ) THEN
        INSERT INTO notifications (user_id, type, from_user_id, message_id, title, body)
        VALUES (
            NEW.recipient_id,
            'message',
            NEW.sender_id,
            NEW.id,
            'New Message',
            LEFT(COALESCE(NEW.content, 'Sent you a message'), 50)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_message ON messages;
CREATE TRIGGER trigger_notify_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_message();

-- Function to create notification on favorite
CREATE OR REPLACE FUNCTION notify_on_favorite()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, type, from_user_id, title, body)
    VALUES (
        NEW.favorited_user_id,
        'favorite',
        NEW.user_id,
        'New Favorite',
        'Someone added you to their favorites!'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_favorite ON favorites;
CREATE TRIGGER trigger_notify_on_favorite
    AFTER INSERT ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_favorite();

-- Function to create notification on profile view
CREATE OR REPLACE FUNCTION notify_on_profile_view()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify once per day per viewer
    IF NOT EXISTS (
        SELECT 1 FROM profile_views
        WHERE viewer_id = NEW.viewer_id
        AND viewed_id = NEW.viewed_id
        AND created_at > NOW() - INTERVAL '1 day'
        AND id != NEW.id
    ) THEN
        INSERT INTO notifications (user_id, type, from_user_id, title, body)
        VALUES (
            NEW.viewed_id,
            'view',
            NEW.viewer_id,
            'Profile View',
            'Someone viewed your profile'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_on_view ON profile_views;
CREATE TRIGGER trigger_notify_on_view
    AFTER INSERT ON profile_views
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_profile_view();

-- Function to update group attendee count
CREATE OR REPLACE FUNCTION update_group_attendees()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE groups SET attendees = attendees + 1 WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE groups SET attendees = attendees - 1 WHERE id = OLD.group_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        IF NEW.status = 'approved' THEN
            UPDATE groups SET attendees = attendees + 1 WHERE id = NEW.group_id;
        ELSIF OLD.status = 'approved' AND NEW.status IN ('left', 'rejected') THEN
            UPDATE groups SET attendees = attendees - 1 WHERE id = NEW.group_id;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_group_attendees ON group_members;
CREATE TRIGGER trigger_update_group_attendees
    AFTER INSERT OR UPDATE OR DELETE ON group_members
    FOR EACH ROW
    EXECUTE FUNCTION update_group_attendees();

-- ============================================================================
-- CLEANUP FUNCTIONS (Run via cron/scheduled jobs)
-- ============================================================================

-- Function to clean up expired albums
CREATE OR REPLACE FUNCTION cleanup_expired_albums()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM profile_albums WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old profile views (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_profile_views()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM profile_views WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old notifications (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to set offline users (no activity in 15 minutes)
CREATE OR REPLACE FUNCTION set_inactive_users_offline()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE profiles
    SET is_online = FALSE
    WHERE is_online = TRUE
    AND last_seen < NOW() - INTERVAL '15 minutes';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE profiles IS 'Main user profile data including location, preferences, and status';
COMMENT ON TABLE user_settings IS 'User preferences for filters, notifications, and privacy';
COMMENT ON TABLE messages IS 'Direct messages between users with soft delete support';
COMMENT ON TABLE taps IS 'User interaction signals (flame, wave, wink, looking)';
COMMENT ON TABLE favorites IS 'Saved/favorited profiles with optional notes';
COMMENT ON TABLE blocked_users IS 'User blocking relationships';
COMMENT ON TABLE profile_views IS 'Track profile view history for "who viewed me" feature';
COMMENT ON TABLE notifications IS 'In-app notifications with type-specific references';
COMMENT ON TABLE groups IS 'Group events/meetups with location and capacity';
COMMENT ON TABLE group_members IS 'Group membership tracking with approval status';
COMMENT ON TABLE profile_albums IS 'Photo albums with privacy and expiration settings';
COMMENT ON TABLE profile_photos IS 'Individual photos within albums';
COMMENT ON TABLE album_shares IS 'Track album sharing between users';
COMMENT ON TABLE reports IS 'User reports for moderation';
COMMENT ON TABLE saved_phrases IS 'Quick message phrases for fast responses';
