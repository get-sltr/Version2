-- Add expired reviewer account for App Store review (Issue 4)
-- This account has an expired subscription so the reviewer can test the purchase flow.

DO $$
DECLARE
  reviewer_user_id UUID;
BEGIN
  -- Only insert if the user doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'reviewer-expired@primalgay.com'
  ) THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud,
      role
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'reviewer-expired@primalgay.com',
      crypt('PrimalExpired2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"dob":"1990-06-15","age":35,"age_verified":true}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    )
    RETURNING id INTO reviewer_user_id;

    -- Insert profile with expired premium
    INSERT INTO profiles (
      id,
      display_name,
      age,
      position,
      bio,
      photo_url,
      lat,
      lng,
      is_premium,
      premium_until,
      last_seen,
      is_online,
      created_at
    ) VALUES (
      reviewer_user_id,
      'ReviewerExpired',
      35,
      'Versatile',
      'App Store review account (expired subscription)',
      '/images/5.jpg',
      34.0522,    -- Los Angeles
      -118.2437,
      false,
      now() - interval '30 days',  -- expired 30 days ago
      now(),
      false,
      now()
    );
  END IF;
END $$;
