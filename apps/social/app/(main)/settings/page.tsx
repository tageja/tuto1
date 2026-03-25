import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'Cài đặt | tuto.social' };

export type SettingsUserRow = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  const myProfileId = myProfile?.id as string | undefined;
  if (!myProfileId) redirect('/login');

  const { data: blockIdRows } = await supabase
    .from('social_blocks')
    .select('blocked_id')
    .eq('blocker_id', myProfileId);
  const blockedIds = [...new Set((blockIdRows ?? []).map((r) => r.blocked_id as string))];
  let blockedUsers: SettingsUserRow[] = [];
  if (blockedIds.length > 0) {
    const { data: profs } = await supabase
      .from('social_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', blockedIds);
    blockedUsers = (profs ?? []) as SettingsUserRow[];
  }

  const { data: muteIdRows } = await supabase
    .from('social_mutes')
    .select('muted_id')
    .eq('muter_id', myProfileId);
  const mutedIds = [...new Set((muteIdRows ?? []).map((r) => r.muted_id as string))];
  let mutedUsers: SettingsUserRow[] = [];
  if (mutedIds.length > 0) {
    const { data: profs } = await supabase
      .from('social_profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', mutedIds);
    mutedUsers = (profs ?? []) as SettingsUserRow[];
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text-primary mb-4">Cài đặt</h1>
      <SettingsClient
        myProfileId={myProfileId}
        initialBlocked={blockedUsers}
        initialMuted={mutedUsers}
      />
    </main>
  );
}
