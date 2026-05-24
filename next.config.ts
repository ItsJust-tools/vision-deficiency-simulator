import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {
      rules: {
        '.next/**': {
          dependencies: [
            '../../node_modules/html-to-image',
            '../../node_modules/@emnapi/runtime',
            '../../node_modules/@playwright/test',
            '../../node_modules/lz-string',
          ],
          builtDependencies: [
            'next',
            'caniuse-lite',
            '@playwright/test',
            'react',
            'react-dom',
            'html-to-image',
          ],
        },
      },
    },
  },
};

export default nextConfig;
