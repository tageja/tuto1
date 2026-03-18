/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'fkjeggdxqifqqwhuqpgm.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'static.kiddihub.com',
      },
      {
        protocol: 'https',
        hostname: 's3.kiddihub.com',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },
  // Ensure local workspace packages are transpiled for Next.js
  transpilePackages: ['@tuto/ui', '@tuto/api', '@tuto/schemas', '@tuto/i18n', '@tuto/shared'],
}

module.exports = nextConfig


