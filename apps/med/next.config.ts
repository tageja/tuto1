import path from 'path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel runs Next 16 with Turbopack by default. Declaring an explicit (empty)
  // turbopack key satisfies the check that rejects a webpack-only config.
  // react-joyride's missing React 18 exports are tolerated by Turbopack natively
  // (no exportsPresence enforcement); the ClientTourProvider ssr:false boundary
  // ensures joyride never enters the server bundle either way.
  //
  // resolveAlias: ai@6 imports @ai-sdk/gateway which has zod as a peer dep.
  // When @ai-sdk/react is used in a client component, Turbopack bundles the
  // entire ai package including @ai-sdk/gateway. Without an explicit alias,
  // Turbopack fails to resolve 'zod' in the client bundle context.
  turbopack: {
    resolveAlias: {
      zod: path.resolve(__dirname, 'node_modules/zod'),
    },
  },
  webpack(config) {
    // Local dev only (npm run dev --webpack).
    // react-joyride@2.9.3 statically imports unmountComponentAtNode +
    // unstable_renderSubtreeIntoContainer from react-dom, both removed in React 18.
    // Webpack ESM strict mode treats missing named exports as hard errors.
    // Setting exportsPresence:'warn' for the joyride file downgrades this to a warning.
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
