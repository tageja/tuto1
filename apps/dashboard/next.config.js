/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Ensure local workspace packages are transpiled for Next.js
  transpilePackages: ['@tuto/ui', '@tuto/api', '@tuto/schemas', '@tuto/i18n'],
  // Use a separate build directory to avoid Windows file-lock issues on .next
  distDir: '.next-web',
}

module.exports = nextConfig


