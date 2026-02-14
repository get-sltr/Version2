import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

// Route handler for /api/tiles/:type/:z/:x/:y.pbf
// Uses PostGIS ST_AsMVT to return vector tiles for 'profiles' or 'groups'

// Optimized pool configuration for serverless environments
// Note: In production, consider using a connection pooler like PgBouncer
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Reduced for serverless - each instance gets its own pool
  idleTimeoutMillis: 10000, // Close idle connections faster
  connectionTimeoutMillis: 5000,
});

// Valid tile types - used for validation
const VALID_TILE_TYPES = ['profiles', 'groups'] as const;
type TileType = (typeof VALID_TILE_TYPES)[number];

function tile2lon(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180;
}

function tile2lat(y: number, z: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

// Separate SQL query functions to avoid dynamic table names (prevents SQL injection)
function getProfilesTileSQL(): string {
  return `WITH
    tile AS (
      SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) AS geom
    ),
    pts AS (
      SELECT id, name, age, image, ST_Transform(geom, 3857) AS g3857
      FROM profiles
      WHERE geom && (SELECT geom FROM tile)
    ),
    clusters AS (
      SELECT *, ST_ClusterDBSCAN(g3857, eps := 100, minpoints := 2) OVER () AS cluster_id
      FROM pts
    ),
    cluster_centroids AS (
      SELECT cluster_id, count(*) AS count, ST_Transform(ST_Centroid(ST_Collect(g3857)), 4326) AS geom
      FROM clusters WHERE cluster_id IS NOT NULL
      GROUP BY cluster_id
    ),
    unclustered AS (
      SELECT id, name, age, image, ST_Transform(g3857, 4326) AS geom
      FROM clusters WHERE cluster_id IS NULL
    ),
    q AS (
      SELECT 'cluster'::text AS kind, NULL::int AS id, NULL::text AS name, count AS cnt, geom FROM cluster_centroids
      UNION ALL
      SELECT 'point'::text AS kind, id, name, NULL::int AS cnt, geom FROM unclustered
    )
    SELECT ST_AsMVT(q, $5, 4096, 'geom') AS mvt FROM q;`;
}

function getGroupsTileSQL(): string {
  return `WITH
    tile AS (
      SELECT ST_MakeEnvelope($1, $2, $3, $4, 4326) AS geom
    ),
    q AS (
      SELECT
        g.id,
        g.name,
        g.type::text,
        g.category::text,
        g.attendees,
        g.max_attendees,
        p.photo_url as host_image,
        ST_AsMVTGeom(g.location_point::geometry, (SELECT geom FROM tile), 4096, 256, true) AS geom
      FROM groups g
      LEFT JOIN profiles p ON g.host_id = p.id
      WHERE g.location_point IS NOT NULL
        AND g.is_active = TRUE
        AND g.location_point::geometry && (SELECT geom FROM tile)
    )
    SELECT ST_AsMVT(q, $5, 4096, 'geom') AS mvt FROM q;`;
}

function isValidTileType(type: string): type is TileType {
  return VALID_TILE_TYPES.includes(type as TileType);
}

interface TileParams {
  type: string;
  z: string;
  x: string;
  y: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<TileParams> }
) {
  // Rate limiting first (before auth to prevent enumeration)
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'tiles');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  // Authentication - tiles contain user location data
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const { type, z, x, y } = await params;

  // Validate tile type using type guard
  if (!isValidTileType(type)) {
    return NextResponse.json(
      { error: 'Invalid tile type' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const zi = parseInt(z, 10);
  const xi = parseInt(x, 10);
  const yi = parseInt(y, 10);

  // Guard against out-of-range zooms and invalid coordinates
  if (isNaN(zi) || isNaN(xi) || isNaN(yi) || zi < 0 || zi > 18) {
    return NextResponse.json(
      { error: 'Invalid tile coordinates' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate tile coordinates are within bounds for zoom level
  const maxTile = Math.pow(2, zi);
  if (xi < 0 || xi >= maxTile || yi < 0 || yi >= maxTile) {
    return NextResponse.json(
      { error: 'Tile coordinates out of bounds' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Compute tile bbox in lon/lat (EPSG:4326)
  const minLon = tile2lon(xi, zi);
  const maxLon = tile2lon(xi + 1, zi);
  const minLat = tile2lat(yi + 1, zi);
  const maxLat = tile2lat(yi, zi);

  // Select SQL based on type - no dynamic table names
  const sql = type === 'profiles' ? getProfilesTileSQL() : getGroupsTileSQL();
  const layerName = type;

  let client;
  try {
    client = await pool.connect();
    const res = await client.query(sql, [minLon, minLat, maxLon, maxLat, layerName]);

    const mvt = res.rows[0]?.mvt || null;
    if (!mvt) {
      return new NextResponse('', {
        status: 204,
        headers: rateLimitHeaders(rateLimitResult),
      });
    }

    return new NextResponse(mvt, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-protobuf',
        // Shorter cache for authenticated data - user locations change frequently
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        ...rateLimitHeaders(rateLimitResult),
      },
    });
  } catch (err) {
    console.error('tile error', err);
    return NextResponse.json(
      { error: 'Internal error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export const runtime = 'nodejs';
