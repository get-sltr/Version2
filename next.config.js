const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.cache = false;

    // Add loader for GLSL shader files
    config.module.rules.push({
      test: /\.(vert|frag|glsl)$/,
      type: 'asset/source'
    });

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'next/dist/next-devtools/userspace/app/segment-explorer-node': path.resolve(
        __dirname,
        'src/shims/segment-explorer-node.tsx'
      ),
    };

    return config;
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self "https://*.daily.co" "https://*.livekit.cloud"), microphone=(self "https://*.daily.co" "https://*.livekit.cloud"), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com https://us.i.posthog.com https://us-assets.i.posthog.com https://onesignal.com https://*.onesignal.com https://api.revenuecat.com https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://events.mapbox.com https://us.i.posthog.com https://us-assets.i.posthog.com https://onesignal.com https://*.onesignal.com https://api.revenuecat.com https://fonts.googleapis.com https://fonts.gstatic.com https://*.livekit.cloud wss://*.livekit.cloud https://api.daily.co https://*.daily.co wss://*.daily.co https://api.foursquare.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
              "media-src 'self' blob: https:",
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.daily.co https://*.livekit.cloud",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // PostHog reverse proxy configuration
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
