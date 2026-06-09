// tuto.social — Conversations / Messaging service
// 1:1 chats, messages, Supabase Realtime

import { socialSupabase } from './api.client';

export interface ConversationPreview {
  id: string;
  type: '1:1' | 'group';
  title?: string;
  avatarUrl?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  otherParticipant?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    username: string;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  messageType: 'text' | 'image' | 'video' | 'system';
  mediaUrl?: string;
  isDeleted: boolean;
  replyToId?: string;
  createdAt: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface DbParticipantRow {
  conversation_id: string;
  last_read_at?: string;
  conversation?: {
    id: string;
    type: string;
    title?: string;
    avatar_url?: string;
    last_message_at?: string;
    last_message_preview?: string;
    participants?: Array<{
      profile_id: string;
      last_read_at?: string;
      profile?: {
        id: string;
        display_name?: string;
        avatar_url?: string;
        username?: string;
      };
    }>;
  };
}

interface DbMessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: string;
  media_url?: string;
  is_deleted: boolean;
  reply_to_id?: string;
  created_at: string;
  sender?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export async function getConversations(myProfileId: string): Promise<ConversationPreview[]> {
  const { data, error } = await socialSupabase
    .from('social_conversation_participants')
    .select(
      `
      conversation_id, last_read_at,
      conversation:social_conversations(
        id, type, title, avatar_url, last_message_at, last_message_preview
      )
    `,
    )
    .eq('profile_id', myProfileId);

  if (error) throw error;

  const rows = data ?? [];
  const convIds = rows.map((r) => (r as { conversation_id: string }).conversation_id);
  if (convIds.length === 0) return [];

  const { data: participantsData } = await socialSupabase
    .from('social_conversation_participants')
    .select(
      `
      conversation_id, profile_id, last_read_at,
      profile:social_profiles(id, display_name, avatar_url, username)
    `,
    )
    .in('conversation_id', convIds);

  const participantsByConv = new Map<string, Array<Record<string, unknown>>>();
  for (const p of participantsData ?? []) {
    const cid = (p as { conversation_id: string }).conversation_id;
    if (!participantsByConv.has(cid)) participantsByConv.set(cid, []);
    participantsByConv.get(cid)!.push(p);
  }

  const result: ConversationPreview[] = [];
  for (const row of rows) {
    const r = row as { conversation_id: string; last_read_at?: string; conversation?: Record<string, unknown> };
    const conv = r.conversation;
    if (!conv) continue;

    const participants = participantsByConv.get(r.conversation_id) ?? [];
    const other = participants.find((p) => (p.profile_id as string) !== myProfileId);
    const otherProfile = other?.profile as Record<string, unknown> | undefined;
    const myPart = participants.find((p) => (p.profile_id as string) === myProfileId);
    const lastReadAt = (myPart?.last_read_at as string) ?? null;
    const lastMsgAt = conv.last_message_at as string | undefined;
    const unread =
      lastReadAt && lastMsgAt ? (new Date(lastMsgAt) > new Date(lastReadAt) ? 1 : 0) : 0;

    result.push({
      id: conv.id as string,
      type: (conv.type as '1:1' | 'group') ?? '1:1',
      title: conv.title as string | undefined,
      avatarUrl: conv.avatar_url as string | undefined,
      lastMessageAt: lastMsgAt,
      lastMessagePreview: conv.last_message_preview as string | undefined,
      unreadCount: unread,
      otherParticipant: otherProfile
        ? {
            id: otherProfile.id as string,
            displayName: (otherProfile.display_name as string) ?? 'Unknown',
            avatarUrl: otherProfile.avatar_url as string | undefined,
            username: (otherProfile.username as string) ?? '',
          }
        : undefined,
    });
  }

  result.sort((a, b) => {
    const aAt = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bAt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bAt - aAt;
  });

  return result;
}

export async function getMessages(
  conversationId: string,
  limit = 50,
): Promise<Message[]> {
  const { data, error } = await socialSupabase
    .from('social_messages')
    .select(
      `
      id, conversation_id, sender_id, content, message_type, media_url,
      is_deleted, reply_to_id, created_at,
      sender:social_profiles!social_messages_sender_id_fkey(
        id, display_name, avatar_url
      )
    `,
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => mapMessage(row as DbMessageRow));
}

export function mapMessage(row: DbMessageRow | Record<string, unknown>): Message {
  const r = row as DbMessageRow;
  const s = r.sender ?? {};
  return {
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    content: r.content,
    messageType: (r.message_type as Message['messageType']) ?? 'text',
    mediaUrl: r.media_url,
    isDeleted: r.is_deleted ?? false,
    replyToId: r.reply_to_id,
    createdAt: r.created_at,
    sender: {
      id: (s as { id: string }).id ?? r.sender_id,
      displayName: ((s as { display_name?: string }).display_name as string) ?? 'Unknown',
      avatarUrl: (s as { avatar_url?: string }).avatar_url,
    },
  };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<Message> {
  const { data, error } = await socialSupabase
    .from('social_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: 'text',
    })
    .select(
      `
      id, conversation_id, sender_id, content, message_type, media_url,
      is_deleted, reply_to_id, created_at,
      sender:social_profiles!social_messages_sender_id_fkey(
        id, display_name, avatar_url
      )
    `,
    )
    .single();

  if (error) throw error;
  return mapMessage(data as DbMessageRow);
}

export async function markConversationRead(
  conversationId: string,
  profileId: string,
): Promise<void> {
  await socialSupabase
    .from('social_conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', profileId);
}

export async function startConversation(
  myProfileId: string,
  otherProfileId: string,
): Promise<string> {
  const { data: myConvs } = await socialSupabase
    .from('social_conversation_participants')
    .select('conversation_id')
    .eq('profile_id', myProfileId);

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((c) => c.conversation_id);
    const { data: shared } = await socialSupabase
      .from('social_conversation_participants')
      .select('conversation_id')
      .eq('profile_id', otherProfileId)
      .in('conversation_id', myConvIds);

    if (shared && shared.length > 0) {
      return shared[0].conversation_id;
    }
  }

  const { data: conv, error: convError } = await socialSupabase
    .from('social_conversations')
    .insert({ type: '1:1', created_by: myProfileId })
    .select('id')
    .single();

  if (convError) throw convError;
  const convId = (conv as { id: string }).id;

  await socialSupabase.from('social_conversation_participants').insert([
    { conversation_id: convId, profile_id: myProfileId },
    { conversation_id: convId, profile_id: otherProfileId },
  ]);

  return convId;
}

export async function getConversationOtherParticipant(
  conversationId: string,
  myProfileId: string,
): Promise<{ displayName: string } | null> {
  const { data, error } = await socialSupabase
    .from('social_conversation_participants')
    .select('profile_id')
    .eq('conversation_id', conversationId)
    .neq('profile_id', myProfileId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const otherId = (data as { profile_id: string }).profile_id;
  const sender = await fetchSenderProfile(otherId);
  return { displayName: sender.displayName };
}

export async function fetchSenderProfile(senderId: string): Promise<{
  id: string;
  displayName: string;
  avatarUrl?: string;
}> {
  const { data, error } = await socialSupabase
    .from('social_profiles')
    .select('id, display_name, avatar_url')
    .eq('id', senderId)
    .maybeSingle();

  if (error || !data) {
    return { id: senderId, displayName: 'Unknown' };
  }
  return {
    id: data.id,
    displayName: (data.display_name as string) ?? 'Unknown',
    avatarUrl: data.avatar_url as string | undefined,
  };
}

export async function createGroupConversation(
  _creatorProfileId: string,
  participantIds: string[],
  title: string,
): Promise<string> {
  // Use a SECURITY DEFINER RPC so the DB resolves the creator from auth.uid()
  // and inserts conversation + participants atomically, bypassing RLS.
  const { data, error } = await socialSupabase.rpc('create_group_conversation', {
    p_title: title,
    p_participant_ids: participantIds,
  });

  if (error) throw error;
  return data as string;
}

export async function getGroupParticipants(conversationId: string): Promise<
  { id: string; displayName: string; avatarUrl?: string; username: string; role: string }[]
> {
  const { data, error } = await socialSupabase
    .from('social_conversation_participants')
    .select(
      `
      role,
      profile:social_profiles(id, display_name, avatar_url, username)
    `,
    )
    .eq('conversation_id', conversationId);

  if (error) throw error;
  return (data ?? []).map((row) => {
    const p = (row as { profile: Record<string, unknown> }).profile;
    return {
      id: (p?.id as string) ?? '',
      displayName: (p?.display_name as string) ?? 'Unknown',
      avatarUrl: p?.avatar_url as string | undefined,
      username: (p?.username as string) ?? '',
      role: ((row as { role: string }).role as string) ?? 'member',
    };
  });
}

export async function leaveConversation(
  conversationId: string,
  profileId: string,
): Promise<void> {
  const { error } = await socialSupabase
    .from('social_conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('profile_id', profileId);
  if (error) throw error;
}
