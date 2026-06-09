'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Mounts invisibly inside the (main) layout.
 * When the pathname becomes /feed AND the sessionStorage flag
 * 'feedNeedsRefresh' is set (written by CommentSection after a
 * successful comment insert), calls router.refresh() to re-run
 * the /feed server component and fetch fresh comments_count values.
 *
 * This handles the case where the user navigates directly to /feed
 * (fresh React tree — context resets to feedVersion=0). The existing
 * FeedInvalidationContext handles the browser-back case (context alive).
 * Both mechanisms co-exist and are both needed.
 */
export function FeedRefreshListener() {
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    if (
      pathname === '/feed' &&
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('feedNeedsRefresh') === '1'
    ) {
      sessionStorage.removeItem('feedNeedsRefresh');
      router.refresh();
    }
  }, [pathname, router]);

  return null;
}
