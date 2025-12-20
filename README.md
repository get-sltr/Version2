# Version2 — Local Setup & Mapbox Integration

This is a Next.js app with Mapbox integration. The map features are implemented using `react-map-gl` and `mapbox-gl`.

## Setup

1) Install dependencies

```bash
npm install
# If you haven't installed `react-map-gl` or `mapbox-gl` yet:
npm install react-map-gl mapbox-gl
# Optional for TypeScript
npm install -D @types/mapbox-gl
```

2) Add Mapbox token (DO NOT COMMIT)

Create a `.env.local` file at the project root and add your Mapbox public token (the one you pasted):

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token_here
```

> We provide `.env.local.example` as a template — but do not commit your real token.
Make sure your `.gitignore` excludes `.env.local` (we've added it to `.gitignore` in this repo).

3) Start development server

```bash
npm run dev
```

4) Open the Map
## Database & tiles

- We provide a simple PostGIS migration `migrations/001_create_profiles.sql` to create `profiles` and `groups` with spatial indexes.
- To create the DB tables and enable PostGIS, run:

```bash
# Create PostGIS extension and create tables
psql $DATABASE_URL -f migrations/001_create_profiles.sql
```

Make sure `DATABASE_URL` is set in your environment before running the migration. The Next.js tile API route uses the `pg` client to query the database and return vector tiles.

Navigate to `/map` to view the integrated Mapbox map.

## Notes & Tips

- If you run into build/runtime issues with `mapbox-gl` (Web Worker errors), refer to Mapbox and Next.js docs or ask me to add a `next.config.js` Webpack patch so we can handle mapbox's worker correctly.
	- A common fix for Next.js builds is to add a small Webpack alias in `next.config.js`:
		```js
		// next.config.js
		const nextConfig = {
			webpack: (config) => {
				config.resolve.alias['mapbox-gl$'] = 'mapbox-gl/dist/mapbox-gl.js';
				return config;
			}
		}
		module.exports = nextConfig;
		```
- Marker pins use black rims and theme-aware popup text to match the app's visual style.
 - Marker pins use black rims and theme-aware popup text to match the app's visual style.
 - For large marker counts (20k+), the map uses clustering and `Source`/`Layer` so rendering remains fast. Avoid DOM markers for large datasets.
 - If you need to support millions of points, consider server-side tiling (Vector Tiles) or a server-side clustering preprocessor.
 - We've added lazy source loading (sources load after the initial map idle to reduce early tile requests), prefetching of tiles around viewport, retry logic for failed tiles, and a tile error overlay with a retry button.
 - If a tile ever fails, the client will attempt to fetch it again and refresh the map style; the server sets caching headers to ensure proper CDN caching.
- For large numbers of markers we can add clustering support — ask me to implement it and I’ll add it next.

## Security

- Mapbox public tokens (`pk.*`) are safe to use on client side, but still keep them private in source control. Use `NEXT_PUBLIC_` variables in `.env.local`.

If you'd like, I can add a small utility to toggle between map styles, or a button to center on the user's current location.# Version2
