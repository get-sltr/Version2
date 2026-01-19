-- Add premium subscription fields for Stripe integration

-- Premium status fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_plan VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ;

-- Stripe customer/subscription tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(100);

-- Create index for premium users (for premium-only features)
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles (is_premium) WHERE is_premium = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
