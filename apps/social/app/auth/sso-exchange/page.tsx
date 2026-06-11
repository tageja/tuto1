'use client';

/**
 * Fragment-based SSO exchange page (Social / tuto.social).
 *
 * Receives Supabase tokens via URL fragment (#) from another Tuto ecosystem
 * app (tutoglobal.com dashboard). Tokens in the fragment are never sent to
 * the server and do not appear in access logs or browser history payloads.
 *
 * Flow:
 *   dashboard → /auth/sso-exchange#access_token=...&refresh_token=...
 *   → this page reads fragment client-side
 *   → calls supabase.auth.setSession()
 *   → auto-creates social_profile if needed
 *   → redirects to /feed (or redirectTo param)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function SSOExchangePage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function exchange() {
      try {
        const hash = window.location.hash.slice(1);
        if (!hash) {
          router.replace('/feed');
          return;
        }

        const params     = new URLSearchParams(hash);
        const accessToken  = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const redirectTo   = params.get('redirectTo') ?? '/feed';

        if (!accessToken || !refreshToken) {
          router.replace('/feed');
          return;
        }

        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.auth.setSession({
          access_token:  accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.user) {
          console.warn('[SSO Exchange] setSession failed:', error?.message);
          setStatus('error');
          setErrorMsg('Your session link has expired. Continuing as guest…');
          setTimeout(() => router.replace('/feed'), 2000);
          return;
        }

        // Auto-create social_profile if this is a first visit from dashboard
        try {
          const user = data.user;
          const { data: existing } = await supabase
            .from('social_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!existing) {
            const email    = user.email ?? '';
            const metaName = (user.user_metadata?.full_name as string | undefined)
                          ?? (user.user_metadata?.name as string | undefined)
                          ?? '';
            const baseSlug = (metaName || email.split('@')[0])
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '_')
              .slice(0, 24);
            const username    = `${baseSlug}_${Math.random().toString(36).slice(2, 6)}`;
            const displayName = metaName || email.split('@')[0];

            const { data: schoolUser } = await supabase
              .from('school_users')
              .select('role, school_id')
              .eq('user_id', user.id)
              .maybeSingle();

            const roleMap: Record<string, string> = {
              teacher: 'teacher', schoolAdmin: 'schoolAdmin',
              parent: 'parent', student: 'student',
            };
            const role     = roleMap[schoolUser?.role ?? ''] ?? 'parent';
            const schoolId = schoolUser?.school_id ?? null;

            await supabase.from('social_profiles').insert({
              user_id: user.id, username, display_name: displayName,
              role, school_id: schoolId,
            });
          }
        } catch {
          // Non-fatal — user still lands on feed
        }

        history.replaceState(null, '', window.location.pathname + window.location.search);
        router.replace(redirectTo);
      } catch (err) {
        console.error('[SSO Exchange] unexpected error:', err);
        setStatus('error');
        setErrorMsg('Something went wrong. Continuing as guest…');
        setTimeout(() => router.replace('/feed'), 2000);
      }
    }

    void exchange();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFC' }}>
      <div style={{ textAlign: 'center', padding: '32px' }}>
        {status === 'processing' ? (
          <>
            <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#0B5FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#6B7280', fontSize: 15 }}>Joining the community…</p>
          </>
        ) : (
          <>
            <p style={{ color: '#EF4444', fontSize: 15, marginBottom: 8 }}>{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
