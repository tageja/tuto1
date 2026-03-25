import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect, notFound } from 'next/navigation';
import ChatView, { type ChatMessageVM } from '../ChatView';
import ConversationList from '../ConversationList';

interface Props {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params;
  if (!conversationId || typeof conversationId !== 'string') notFound();

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

  const { data: participation } = await supabase
    .from('social_conversation_participants')
    .select('profile_id')
    .eq('conversation_id', conversationId)
    .eq('profile_id', myProfileId)
    .maybeSingle();

  if (!participation) redirect('/messages');

  await supabase
    .from('social_conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', myProfileId);

  const { data: messageRows } = await supabase
    .from('social_messages')
    .select(
      `
    id, conversation_id, sender_id, content, message_type, is_deleted, created_at,
    sender:social_profiles!social_messages_sender_id_fkey(id, display_name, avatar_url, username)
  `,
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(50);

  const chronological = [...(messageRows ?? [])].reverse();

  const initialMessages: ChatMessageVM[] = chronological.map((row) => {
    const r = row as Record<string, unknown>;
    const s = r.sender as
      | { id: string; display_name: string | null; avatar_url: string | null; username: string }
      | null
      | Array<{ id: string; display_name: string | null; avatar_url: string | null; username: string }>;
    const sender = Array.isArray(s) ? s[0] ?? null : s;
    return {
      id: r.id as string,
      conversation_id: r.conversation_id as string,
      sender_id: r.sender_id as string,
      content: (r.content as string | null) ?? null,
      message_type: (r.message_type as string) ?? 'text',
      is_deleted: !!(r.is_deleted as boolean),
      created_at: r.created_at as string,
      sender: sender
        ? {
            id: sender.id,
            display_name: sender.display_name,
            avatar_url: sender.avatar_url,
            username: sender.username,
          }
        : null,
    };
  });

  const { data: convRow } = await supabase
    .from('social_conversations')
    .select('id, type, title, avatar_url')
    .eq('id', conversationId)
    .single();

  const conv = convRow as {
    id: string;
    type: string;
    title: string | null;
    avatar_url: string | null;
  } | null;

  if (!conv) notFound();

  const isGroup = conv.type === 'group';
  let conversationTitle = conv.title?.trim() || 'Nhóm';
  let conversationAvatarUrl = conv.avatar_url;

  if (conv.type === '1:1') {
    const { data: otherParticipant } = await supabase
      .from('social_conversation_participants')
      .select('profile:social_profiles(id, display_name, avatar_url, username)')
      .eq('conversation_id', conversationId)
      .neq('profile_id', myProfileId)
      .limit(1)
      .maybeSingle();

    const prof = otherParticipant?.profile as
      | { display_name: string | null; avatar_url: string | null; username: string }
      | null
      | undefined;
    const p = Array.isArray(prof) ? prof[0] : prof;
    if (p) {
      conversationTitle = p.display_name?.trim() || `@${p.username}`;
      conversationAvatarUrl = p.avatar_url;
    }
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Desktop sidebar — single ConvList instance, never mounted twice */}
      <aside className="hidden md:flex w-80 flex-shrink-0 border-r border-gray-100 flex-col bg-white overflow-y-auto">
        <ConversationList myProfileId={myProfileId} />
      </aside>

      {/* Chat view — full width on mobile, flex-1 on desktop */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ChatView
          initialMessages={initialMessages}
          conversationId={conversationId}
          myProfileId={myProfileId}
          conversationTitle={conversationTitle}
          conversationAvatarUrl={conversationAvatarUrl}
          isGroup={isGroup}
        />
      </div>
    </div>
  );
}
