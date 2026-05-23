import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Vercel runs Next 16 with Turbopack by default. Declaring an explicit (empty)
  // turbopack key satisfies the check that rejects a webpack-only config.
  // react-joyride's missing React 18 exports are tolerated by Turbopack natively
  // (no exportsPresence enforcement); the ClientTourProvider ssr:false boundary
  // ensures joyride never enters the server bundle either way.
  //
  // resolveAlias: ai@6 imports @ai-sdk/gateway at the top of its index bundle.
  // @ai-sdk/gateway is server-only and has zod as a peer dependency.
  // When @ai-sdk/react is used in a client component, Turbopack bundles the
  // entire ai package including @ai-sdk/gateway, which then fails to find
  // 'zod' in the client bundle context with "Module not found: Can't resolve".
  // Fix: replace @ai-sdk/gateway with a browser stub in the client bundle.
  // The stub exports the same symbols as empty/null values so the ai package
  // initialises without errors; gateway features are never invoked client-side.
  turbopack: {
    resolveAlias: {
      '@ai-sdk/gateway': {
        browser: './src/stubs/ai-sdk-gateway',
      },
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
