-- Add missing columns to messages table for image and profile sharing

ALTER TABLE "public"."messages" 
ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "shared_profile_id" UUID;
