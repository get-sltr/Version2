-- =============================================================================
-- Apple Subscriptions & Notification Log
--
-- Tracks Apple/RevenueCat subscription state server-side for reliable
-- premium status syncing via webhook notifications.
-- =============================================================================

-- Table: apple_subscriptions
-- Maps Apple originalTransactionId to Supabase users and tracks subscription state
CREATE TABLE IF NOT EXISTS apple_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_transaction_id VARCHAR(100) NOT NULL,
    product_id VARCHAR(200),

    -- Subscription state
    -- Values: active, expired, revoked, grace_period, billing_retry, refunded
    status VARCHAR(30) NOT NULL DEFAULT 'active',

    -- When the current period expires
    expires_at TIMESTAMPTZ,

    -- Environment tracking (Production or Sandbox)
    environment VARCHAR(20) DEFAULT 'Production',

    -- Last event that modified this record
    last_event_type VARCHAR(50),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(original_transaction_id)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_apple_sub_user ON apple_subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_apple_sub_txn ON apple_subscriptions (original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_apple_sub_active ON apple_subscriptions (status) WHERE status = 'active';

-- Notification log for idempotency and debugging
-- Every incoming webhook event is logged here before processing
CREATE TABLE IF NOT EXISTS apple_notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- RevenueCat event ID — unique per event, used for idempotency
    event_id VARCHAR(200) UNIQUE NOT NULL,

    -- Event classification
    event_type VARCHAR(50) NOT NULL,

    -- Transaction and user references
    original_transaction_id VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Summary of the event payload (no sensitive data)
    payload_summary JSONB DEFAULT '{}',

    -- Processing result
    processed_successfully BOOLEAN DEFAULT FALSE,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apple_notif_event_id ON apple_notification_log (event_id);
CREATE INDEX IF NOT EXISTS idx_apple_notif_txn ON apple_notification_log (original_transaction_id);
CREATE INDEX IF NOT EXISTS idx_apple_notif_user ON apple_notification_log (user_id);

-- RLS: These tables are server-side only (service role access)
ALTER TABLE apple_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apple_notification_log ENABLE ROW LEVEL SECURITY;

-- No user-facing RLS policies — only service_role can read/write.
-- The webhook API route uses getSupabaseAdmin() which bypasses RLS.
