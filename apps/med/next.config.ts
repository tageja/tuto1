import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack(config) {
    // react-joyride@2.9.3 statically imports unmountComponentAtNode +
    // unstable_renderSubtreeIntoContainer from react-dom, both removed in React 18.
    // Webpack ESM strict mode treats missing named exports as hard errors.
    // Setting exportsPresence:'warn' for the joyride file downgrades this to a warning
    // so the rest of the build (including the homepage) is not blocked.
    config.module.rules.push({
      include: /node_modules[\\/]react-joyride/,
      parser: { exportsPresence: 'warn' },
    })
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'fkjeggdxqifqqwhuqpgm.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
