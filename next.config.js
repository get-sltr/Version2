const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

module.exports = nextConfig;
