'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Props {
  myProfileId: string;
}

type ConvRow = {
  conversation_id: string;
  last_read_at: string | null;
  conversation: {
    id: string;
    type: string;
    title: string | null;
    avatar_url: string | null;
    last_message_at: string | null;
    last_message_preview: string | null;
  } | null;
};

type OtherRow = {
  conversation_id: string;
  profile: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    username: string;
  } | null;
};

export type ConversationPreview = {
  id: string;
  type: string;
  title: string;
  avatarUrl: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_read_at: string | null;
  unread: boolean;
};

function formatListTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) {
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function isUnread(lastMsg: string | null, lastRead: string | null): boolean {
  if (!lastMsg) return false;
  if (!lastRead) return true;
  return new Date(lastMsg) > new Date(lastRead);
}

async function loadPreviews(myProfileId: string): Promise<ConversationPreview[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: participantRows, error: pErr } = await supabase
    .from('social_conversation_participants')
    .select(
      'conversation_id, last_read_at, conversation:social_conversations(id, type, title, avatar_url, last_message_at, last_message_preview)',
    )
    .eq('profile_id', myProfileId);

  if (pErr || !participantRows?.length) return [];

  const rows = participantRows as unknown as ConvRow[];
  const convIds = rows.map((r) => r.conversation_id);

  const { data: otherParticipants } = await supabase
    .from('social_conversation_participants')
    .select('conversation_id, profile:social_profiles(id, display_name, avatar_url, username)')
    .in('conversation_id', convIds)
    .neq('profile_id', myProfileId);

  const others = (otherParticipants ?? []) as unknown as OtherRow[];
  const otherByConv = new Map<
    string,
    { display_name: string; avatar_url: string | null; username: string }
  >();
  for (const o of others) {
    const p = o.profile;
    if (!p || otherByConv.has(o.conversation_id)) continue;
    otherByConv.set(o.conversation_id, {
      display_name: p.display_name ?? p.username,
      avatar_url: p.avatar_url,
      username: p.username,
    });
  }

  const previews: ConversationPreview[] = [];
  for (const row of rows) {
    const conv = row.conversation;
    if (!conv) continue;
    const lastRead = row.last_read_at;
    const unread = isUnread(conv.last_message_at, lastRead);

    let title = conv.title?.trim() || 'Nhóm';
    let avatarUrl = conv.avatar_url;
    if (conv.type === '1:1') {
      const other = otherByConv.get(row.conversation_id);
      if (other) {
        title = other.display_name || `@${other.username}`;
        avatarUrl = other.avatar_url;
      }
    }

    previews.push({
      id: conv.id,
      type: conv.type,
      title,
      avatarUrl,
      last_message_at: conv.last_message_at,
      last_message_preview: conv.last_message_preview,
      last_read_at: lastRead,
      unread,
    });
  }

  previews.sort((a, b) => {
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return tb - ta;
  });

  return previews;
}

export default function ConversationList({ myProfileId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = pathname?.startsWith('/messages/') ? pathname.split('/')[2] : null;

  const [search, setSearch] = useState('');
  const [previews, setPreviews] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function refetch() {
      const next = await loadPreviews(myProfileId);
      if (cancelled) return;
      setPreviews(next);
      setLoading(false);
      return next;
    }

    void (async () => {
      setLoading(true);
      await refetch();
      if (cancelled) return;

      const handler = () => {
        void refetch();
      };
      channel = supabase
        .channel(`my-conversations:${myProfileId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'social_conversations' },
          handler,
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'social_conversations' },
          handler,
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [myProfileId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return previews;
    return previews.filter((p) => p.title.toLowerCase().includes(q));
  }, [previews, search]);

  return (
    <div className="flex flex-col h-full min-h-0 border-b md:border-b-0 border-gray-100">
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-lg font-bold text-text-primary mb-2">Tin nhắn</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm cuộc trò chuyện…"
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Tìm cuộc trò chuyện"
        />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <p className="text-sm text-text-secondary p-4 text-center">Đang tải…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-text-secondary p-4 text-center">Chưa có cuộc trò chuyện nào</p>
        ) : (
          <ul>
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => router.push(`/messages/${c.id}`)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-surface transition-colors border-b border-gray-50',
                    activeId === c.id && 'bg-blue-50',
                  )}
                >
                  <Avatar src={c.avatarUrl} name={c.title} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          c.unread ? 'font-bold text-text-primary' : 'font-medium text-text-primary',
                        )}
                      >
                        {c.title}
                      </span>
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {formatListTime(c.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-text-secondary truncate flex-1">
                        {c.last_message_preview ?? ' '}
                      </p>
                      {c.unread && (
                        <span
                          className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                          aria-label="Chưa đọc"
                        />
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
