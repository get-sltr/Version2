-- Fix mutable search_path security issue on all functions
-- This prevents potential privilege escalation attacks

-- Fix update_timestamp function
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Fix update_last_seen function
CREATE OR REPLACE FUNCTION public.update_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET last_seen = NOW(), is_online = true WHERE id = auth.uid();
  RETURN NEW;
END;
$$;

-- Fix update_location_point function (from 001_complete_schema.sql)
CREATE OR REPLACE FUNCTION public.update_location_point()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix is_blocked function
CREATE OR REPLACE FUNCTION public.is_blocked(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = user_a AND blocked_id = user_b)
       OR (blocker_id = user_b AND blocked_id = user_a)
  );
END;
$$;

-- Fix get_nearby_profiles function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_nearby_profiles') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.get_nearby_profiles(
      user_lat DOUBLE PRECISION,
      user_lng DOUBLE PRECISION,
      radius_miles INTEGER DEFAULT 50,
      max_results INTEGER DEFAULT 100
    )
    RETURNS SETOF public.profiles
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    DECLARE
      user_point GEOGRAPHY;
    BEGIN
      user_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

      RETURN QUERY
      SELECT p.*
      FROM public.profiles p
      WHERE p.is_incognito = FALSE
        AND p.location_point IS NOT NULL
        AND ST_DWithin(p.location_point, user_point, radius_miles * 1609.34)
        AND p.id != auth.uid()
        AND NOT public.is_blocked(auth.uid(), p.id)
      ORDER BY ST_Distance(p.location_point, user_point)
      LIMIT max_results;
    END;
    $func$';
  END IF;
END;
$$;

-- Fix notify functions if they exist
DO $$
BEGIN
  -- Fix notify_on_tap
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_on_tap') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.notify_on_tap()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      INSERT INTO public.notifications (user_id, type, from_user_id, reference_id)
      VALUES (NEW.recipient_id, ''tap'', NEW.sender_id, NEW.id::text);
      RETURN NEW;
    END;
    $func$';
  END IF;
END;
$$;

DO $$
BEGIN
  -- Fix notify_on_message
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_on_message') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.notify_on_message()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      -- Only notify if no recent notification from same sender (5 min throttle)
      IF NOT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE user_id = NEW.recipient_id
          AND from_user_id = NEW.sender_id
          AND type = ''message''
          AND created_at > NOW() - INTERVAL ''5 minutes''
      ) THEN
        INSERT INTO public.notifications (user_id, type, from_user_id, reference_id)
        VALUES (NEW.recipient_id, ''message'', NEW.sender_id, NEW.id::text);
      END IF;
      RETURN NEW;
    END;
    $func$';
  END IF;
END;
$$;

DO $$
BEGIN
  -- Fix notify_on_favorite
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'notify_on_favorite') THEN
    EXECUTE '
    CREATE OR REPLACE FUNCTION public.notify_on_favorite()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      INSERT INTO public.notifications (user_id, type, from_user_id, reference_id)
      VALUES (NEW.favorited_id, ''favorite'', NEW.user_id, NEW.id::text);
      RETURN NEW;
    END;
    $func$';
  END IF;
END;
$$;
