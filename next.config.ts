import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.etsystatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.etsystatic.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
