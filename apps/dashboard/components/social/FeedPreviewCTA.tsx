'use client';

import { useCallback } from 'react';
import { useRouter }   from 'next/navigation';
import { supabase }    from '../../lib/supabase';

const SOCIAL_URL = process.env.NEXT_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001';

export function FeedPreviewViewAll() {
  const router = useRouter();

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirectTo=/community');
      return;
    }
    const params = new URLSearchParams({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
    });
    window.location.href = `${SOCIAL_URL}/auth/sso?${params.toString()}`;
  }, [router]);

  return (
    <a
      href={`${SOCIAL_URL}/feed`}
      onClick={handleClick}
      className="text-sm font-semibold text-primary hover:underline cursor-pointer"
    >
      Xem thêm →
    </a>
  );
}

export function FeedPreviewJoinCTA() {
  const router = useRouter();

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login?redirectTo=/community');
      return;
    }
    const params = new URLSearchParams({
      access_token:  session.access_token,
      refresh_token: session.refresh_token,
    });
    window.location.href = `${SOCIAL_URL}/auth/sso?${params.toString()}`;
  }, [router]);

  return (
    <a
      href={`${SOCIAL_URL}/feed`}
      onClick={handleClick}
      className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer"
    >
      Tham gia tuto.social
      <span>→</span>
    </a>
  );
}
