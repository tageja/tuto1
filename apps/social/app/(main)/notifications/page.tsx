import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

export const metadata = {
  title: 'Thông báo | tuto.social',
};

export default async function NotificationsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: myProfile } = await supabase
    .from('social_profiles')
    .select('username')
    .eq('user_id', user.id)
    .single();

  const { data: notifRows } = await supabase
    .from('social_notifications')
    .select('id, type, read, created_at, post_id, data, actor_id')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const actorIds = [...new Set((notifRows ?? []).map((r) => r.actor_id).filter(Boolean) as string[])];

  let actorMap: Record<string, { id: string; username: string; display_name: string; avatar_url: string | null }> = {};
  if (actorIds.length > 0) {
    const { data: actorRows } = await supabase
      .from('social_profiles')
      .select('id, user_id, username, display_name, avatar_url')
      .in('user_id', actorIds);

    actorMap = (actorRows ?? []).reduce(
      (acc, row) => {
        acc[row.user_id as string] = {
          id: row.id as string,
          username: (row.username as string) ?? '',
          display_name: (row.display_name as string) ?? '',
          avatar_url: row.avatar_url as string | null,
        };
        return acc;
      },
      {} as Record<string, { id: string; username: string; display_name: string; avatar_url: string | null }>,
    );
  }

  const notifications = (notifRows ?? []).map((n) => {
    const actor = n.actor_id ? actorMap[n.actor_id as string] : null;
    return {
      id: n.id,
      type: n.type,
      read: n.read,
      created_at: n.created_at,
      post_id: n.post_id,
      data: (n.data as Record<string, unknown>) ?? {},
      actor: actor
        ? { id: actor.id, username: actor.username, display_name: actor.display_name, avatar_url: actor.avatar_url }
        : null,
    };
  });

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-text-primary mb-4">Thông báo</h1>
      <NotificationsClient
        initialNotifications={notifications}
        userId={user.id}
        profileUsername={myProfile?.username ?? ''}
      />
    </main>
  );
}
