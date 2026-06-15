/** @type {import('next').NextConfig} */
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://school.tuto.asia';

const nextConfig = {
  typescript:  { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' },
    ],
  },
  // Phase 4 safety net: tutoglobal.com is now the company site. Old dashboard
  // deep links that users may have bookmarked are 308-redirected to the dashboard
  // at school.tuto.asia so nothing breaks. Query strings are preserved by default.
  async redirects() {
    return [
      { source: '/admin/:path*',     destination: `${DASHBOARD_URL}/admin/:path*`,     permanent: true },
      { source: '/teacher/:path*',   destination: `${DASHBOARD_URL}/teacher/:path*`,   permanent: true },
      { source: '/parent/:path*',    destination: `${DASHBOARD_URL}/parent/:path*`,    permanent: true },
      { source: '/login/:path*',     destination: `${DASHBOARD_URL}/login/:path*`,     permanent: true },
      { source: '/investors/:path*', destination: `${DASHBOARD_URL}/investors/:path*`, permanent: true },
    ];
  },
};

module.exports = nextConfig;
