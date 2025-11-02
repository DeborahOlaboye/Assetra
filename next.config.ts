import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable Turbopack, use webpack
  turbopack: {},

  webpack: (config, { isServer }) => {
    // External modules that cause issues with bundling
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Resolve fallbacks for React Native dependencies used by MetaMask SDK
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'react-native': false,
    };

    // Fix file watcher issue - don't watch home directory
    if (!isServer) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '/home/akande/node_modules/**',
          '/home/akande/Documents/**',
          '/home/akande/Videos/**',
          '/home/akande/Downloads/**',
          '/home/akande/*.mkv',
        ],
      };
    }

    return config;
  },
};

export default nextConfig;
