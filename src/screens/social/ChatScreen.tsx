import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import {
  getMessages,
  sendMessage,
  markConversationRead,
  mapMessage,
  fetchSenderProfile,
  getConversationOtherParticipant,
  getGroupParticipants,
} from '../../services/social/conversations.service';
import { MessageBubble, MessageInput, TypingIndicator } from '../../components/social';
import { socialSupabase } from '../../services/social/api.client';
import type { Message } from '../../services/social/conversations.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'Chat'>;
type NavProp = StackNavigationProp<SocialStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const { conversationId } = route.params ?? {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string; displayName?: string } | null>(null);
  const [otherName, setOtherName] = useState('Chat');
  const [otherLastRead, setOtherLastRead] = useState<string | null>(null);
  const [conversationType, setConversationType] = useState<'1:1' | 'group'>('1:1');
  const [groupTitle, setGroupTitle] = useState('');
  const [participantCount, setParticipantCount] = useState(0);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState<{ displayName: string } | null>(null);
  const listRef = useRef<FlatList | null>(null);
  const channelRef = useRef<ReturnType<typeof socialSupabase.channel> | null>(null);

  const load = useCallback(async () => {
    if (!conversationId) return;
    const p = await ensureSocialProfile();
    if (!p) return;
    setProfile(p);
    try {
      const msgs = await getMessages(conversationId);
      setMessages(msgs);
      if (msgs.length > 0) {
        const lastFromOther = [...msgs].reverse().find((m) => m.senderId !== p.id);
        if (lastFromOther) setOtherName(lastFromOther.sender.displayName);
        else setOtherName(msgs[0].sender.displayName);
      } else {
        const other = await getConversationOtherParticipant(conversationId, p.id);
        if (other) setOtherName(other.displayName);
      }
      const { data: convData } = await socialSupabase
        .from('social_conversations')
        .select('type, title')
        .eq('id', conversationId)
        .single();
      const type = (convData?.type as '1:1' | 'group') ?? '1:1';
      setConversationType(type);
      if (type === 'group') {
        setGroupTitle((convData?.title as string) ?? 'Nhóm');
        const parts = await getGroupParticipants(conversationId);
        setParticipantCount(parts.length);
      }
      const { data: participants } = await socialSupabase
        .from('social_conversation_participants')
        .select('profile_id, last_read_at')
        .eq('conversation_id', conversationId);
      const otherPart = participants?.find((row) => (row as { profile_id: string }).profile_id !== p.id);
      setOtherLastRead((otherPart?.last_read_at as string) ?? null);
      await markConversationRead(conversationId, p.id);
    } catch (err) {
      console.error('Chat load error', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleContentSizeChange = useCallback(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    if (!conversationId || !profile) return;

    const title =
      conversationType === 'group'
        ? `${groupTitle || 'Nhóm'} (${participantCount})`
        : otherName;

    navigation.setOptions({
      headerShown: true,
      title,
      headerBackTitle: '',
      headerTintColor: '#0B5FFF',
      headerRight:
        conversationType === 'group'
          ? () => (
              <Pressable
                onPress={() => navigation.navigate('GroupChatInfo', { conversationId })}
                style={{ marginRight: 16 }}
              >
                <MaterialIcons name="info-outline" size={24} color="#0B5FFF" />
              </Pressable>
            )
          : undefined,
    });
  }, [conversationId, profile, otherName, conversationType, groupTitle, participantCount, navigation]);

  useEffect(() => {
    if (!conversationId || !profile) return;

    const channel = socialSupabase.channel(`chat:${conversationId}`);
    channelRef.current = channel;
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const row = payload.new as Record<string, unknown>;
          const senderId = row.sender_id as string;
          const sender = await fetchSenderProfile(senderId);
          const newMsg = mapMessage({
            ...row,
            sender: {
              id: sender.id,
              display_name: sender.displayName,
              avatar_url: sender.avatarUrl,
            },
          } as Parameters<typeof mapMessage>[0]);
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'social_conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as { profile_id: string; last_read_at?: string };
          if (row.profile_id !== profile?.id && row.last_read_at) {
            setOtherLastRead(row.last_read_at);
          }
        },
      )
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { profileId: typingProfileId, displayName: typingName, typing } = payload.payload as {
          profileId?: string;
          displayName?: string;
          typing?: boolean;
        };
        if (typingProfileId !== profile?.id && typing && typingName) {
          setTypingUser({ displayName: typingName });
        } else if (typingProfileId !== profile?.id && !typing) {
          setTypingUser(null);
        }
      })
      .subscribe();

    return () => {
      channelRef.current = null;
      socialSupabase.removeChannel(channel);
    };
  }, [conversationId, profile?.id]);

  const handleTypingChange = useCallback(
    (isTyping: boolean) => {
      const ch = channelRef.current;
      if (!ch || !profile) return;
      ch.send({
        type: 'broadcast',
        event: 'typing',
        payload: { profileId: profile.id, displayName: profile.displayName ?? 'Someone', typing: isTyping },
      });
      if (!isTyping) setTypingUser(null);
    },
    [profile?.id, otherName],
  );

  const handleSend = useCallback(
    async (text: string) => {
      if (!profile || !conversationId || sending) return;
      setSending(true);
      try {
        const msg = await sendMessage(conversationId, profile.id, text);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error('Send error', err);
      } finally {
        setSending(false);
      }
    },
    [profile?.id, conversationId, sending],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const prev = messages[index - 1];
      const isOwn = item.senderId === profile?.id;
      const showSender =
        conversationType === 'group' ? !isOwn : !prev || prev.senderId !== item.senderId;
      const readAt =
        isOwn && otherLastRead && item.createdAt <= otherLastRead ? otherLastRead : undefined;
      return (
        <MessageBubble
          message={item}
          isOwn={isOwn}
          showSender={showSender && !isOwn}
          readAt={readAt}
        />
      );
    },
    [messages, profile?.id, otherLastRead, conversationType],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onContentSizeChange={handleContentSizeChange}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('community.messages.empty_chat') as string}</Text>
          </View>
        }
        ListFooterComponent={
          typingUser ? <TypingIndicator displayName={typingUser.displayName} /> : null
        }
      />
      <MessageInput
        onSend={handleSend}
        disabled={!profile || sending}
        onTypingChange={handleTypingChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
