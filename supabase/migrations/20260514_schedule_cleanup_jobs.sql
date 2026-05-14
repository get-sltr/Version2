-- Schedule cleanup jobs using pg_cron (must be enabled in Supabase dashboard first)
-- Run: SELECT cron.schedule(...) after enabling the pg_cron extension

-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Clean up expired albums every hour
SELECT cron.schedule(
  'cleanup-expired-albums',
  '0 * * * *',
  $$SELECT cleanup_expired_albums()$$
);

-- Clean up old profile views (>30 days) daily at 3 AM UTC
SELECT cron.schedule(
  'cleanup-old-profile-views',
  '0 3 * * *',
  $$SELECT cleanup_old_profile_views()$$
);

-- Clean up old notifications (>30 days) daily at 3:15 AM UTC
SELECT cron.schedule(
  'cleanup-old-notifications',
  '15 3 * * *',
  $$SELECT cleanup_old_notifications()$$
);

-- Set inactive users offline every 5 minutes
SELECT cron.schedule(
  'set-inactive-users-offline',
  '*/5 * * * *',
  $$SELECT set_inactive_users_offline()$$
);
