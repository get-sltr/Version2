-- Migration: Create profiles and groups tables with PostGIS geometry columns

CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age SMALLINT NOT NULL,
  position TEXT,
  online BOOLEAN DEFAULT TRUE,
  distance INT DEFAULT 0,
  geom geometry(Point, 4326)
);

-- Create spatial index for profiles
CREATE INDEX IF NOT EXISTS profiles_geom_idx ON profiles USING GIST (geom);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  host TEXT,
  hostimage TEXT,
  attendees SMALLINT DEFAULT 0,
  maxattendees SMALLINT DEFAULT 0,
  location TEXT,
  time TEXT,
  geom geometry(Point, 4326)
);

-- Create spatial index for groups
CREATE INDEX IF NOT EXISTS groups_geom_idx ON groups USING GIST (geom);

-- Example insert (uncomment for seed):
-- INSERT INTO profiles (name, age, position, online, distance, geom) VALUES ('Alex', 29, 'Top', true, 250, ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326));
*** End Patch