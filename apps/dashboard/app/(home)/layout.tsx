import { Suspense }         from 'react';
import FeedPreview          from '../../components/social/FeedPreview';
import TrendingEducators    from '../../components/social/TrendingEducators';

/**
 * Server layout for the home route group.
 * Adds the social section (FeedPreview + TrendingEducators) below the main
 * page content without requiring the client-heavy page.tsx to be a server
 * component.
 *
 * Note: Next.js renders layout AROUND the page. To insert sections between
 * existing page sections we wrap the page output as children and append our
 * server components after.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* Social community sections — server-rendered, no auth required */}
      <Suspense fallback={null}>
        <FeedPreview />
      </Suspense>
      <Suspense fallback={null}>
        <TrendingEducators />
      </Suspense>
    </>
  );
}
