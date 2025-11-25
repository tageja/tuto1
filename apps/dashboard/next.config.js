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
    ],
  },
  // Ensure local workspace packages are transpiled for Next.js
  transpilePackages: ['@tuto/ui', '@tuto/api', '@tuto/schemas', '@tuto/i18n'],
  // Use a separate build directory to avoid Windows file-lock issues on .next
  distDir: '.next-web',
}

module.exports = nextConfig


