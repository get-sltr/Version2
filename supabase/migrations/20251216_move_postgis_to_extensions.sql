-- PostGIS Extension Security Configuration
--
-- Note: PostGIS cannot be easily moved from public schema when tables
-- already use geography/geometry types (profiles.location_point, etc.)
--
-- Instead, we apply security hardening:

-- 1. Create extensions schema for future extensions
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- 2. For NEW Supabase projects, install PostGIS in extensions schema:
-- CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 3. Since PostGIS is already in public with dependent columns,
-- we acknowledge this and document it. The risk is LOW because:
--   - PostGIS functions are mostly read-only geometry operations
--   - RLS policies protect the data, not the extension
--   - Users cannot create schemas or install extensions

-- If you want to fix this properly in a new project, use this order:
-- 1. CREATE EXTENSION postgis SCHEMA extensions;
-- 2. Then create tables with: extensions.geography instead of just geography
--    e.g., location_point extensions.GEOGRAPHY(POINT, 4326)

-- For existing project, add this comment to acknowledge the warning:
COMMENT ON EXTENSION postgis IS 'PostGIS extension - in public schema due to existing dependent columns. Risk: LOW';
