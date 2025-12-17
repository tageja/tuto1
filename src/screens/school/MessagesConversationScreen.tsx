import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { getCurrentUser } from '../../config/supabase';
import {
  fetchThreadMessages,
  fetchThreadParticipants,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageIds,
  enrichMessagesWithSenders,
  MessageRecord,
  ThreadParticipant,
} from '../../services/school/messages';
import { ChatBubble } from '../../components/messages/ChatBubble';
import { ChatDateSeparator } from '../../components/messages/ChatDateSeparator';
import { ChatInputBar } from '../../components/messages/ChatInputBar';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageGroup {
  date: string;
  dateLabel: string;
  messages: MessageRecord[];
}

interface RouteParams {
  threadId: string;
  userRole?: 'admin' | 'parent';
}

const MessagesConversationScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { threadId, userRole = 'parent' } = (route.params || {}) as RouteParams;
  const { currentSchool, isSchoolMode } = useSchool();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [participants, setParticipants] = useState<ThreadParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userDbId, setUserDbId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!isSchoolMode || !currentSchool || !threadId) {
      navigation.goBack();
      return;
    }
    initializeData();
  }, [isSchoolMode, currentSchool, threadId]);

  const initializeData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);

        // Get user's database ID
        const { supabase } = await import('../../config/supabase');
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        if (userData) {
          console.log('👤 Current user DB ID:', userData.id);
          setUserDbId(userData.id);
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const loadMessages = useCallback(async (cursor?: string | null) => {
    if (!threadId) return;

    try {
      setLoading(true);
      const result = await fetchThreadMessages(threadId, cursor, 50);
      
      // Load participants
      const participantData = await fetchThreadParticipants(threadId);
      console.log('📋 Participants loaded:', participantData.length, participantData);
      setParticipants(participantData);

      // Enrich messages with sender info
      const enriched = await enrichMessagesWithSenders(
        result.messages,
        participantData
      );
      console.log('📨 Messages enriched:', enriched.length, 'first message sender:', enriched[0]?.sender);

      if (cursor) {
        // Loading more - prepend to existing messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = enriched.filter((m) => !existingIds.has(m.id));
          return [...newMessages, ...prev];
        });
      } else {
        // Initial load
        setMessages(enriched);
      }

      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  // Load messages after userDbId is set
  useEffect(() => {
    if (threadId && userDbId) {
      console.log('🔄 Loading messages for thread:', threadId, 'userDbId:', userDbId);
      loadMessages();
    }
  }, [threadId, userDbId, loadMessages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (!threadId || !userDbId || messages.length === 0) return;

    const markAsRead = async () => {
      try {
        const unreadIds = await getUnreadMessageIds(threadId, userDbId);
        if (unreadIds.length > 0) {
          await markMessagesAsRead(threadId, unreadIds);
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markAsRead();
  }, [threadId, userDbId, messages.length]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length, loading]);

  const handleSend = async (messageText: string) => {
    if (!threadId || !messageText.trim()) return;

    try {
      setSending(true);

      // Optimistic update
      const tempMessage: MessageRecord = {
        id: `temp-${Date.now()}`,
        thread_id: threadId,
        sender_id: userDbId || '',
        body: messageText,
        attachments: [],
        sent_at: new Date().toISOString(),
        sender: participants.find((p) => p.user_id === userDbId)?.users || undefined,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send message
      const sentMessage = await sendMessage(threadId, messageText);
      if (sentMessage) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...sentMessage, sender: tempMessage.sender }
              : msg
          )
        );

        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && nextCursor && !loading) {
      loadMessages(nextCursor);
    }
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Options',
      'Choose an action',
      [
        { text: 'View Profile', onPress: () => {} },
        { text: 'Mute Notifications', onPress: () => {} },
        { text: 'Search in Conversation', onPress: () => {} },
        ...(userRole === 'admin'
          ? [
              { text: 'Archive', onPress: () => {} },
              {
                text: 'Delete Conversation',
                style: 'destructive',
                onPress: () => {
                  Alert.alert(
                    'Delete Conversation',
                    'Are you sure you want to delete this conversation?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => {} },
                    ]
                  );
                },
              },
            ]
          : []),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupMessagesByDate = (msgs: MessageRecord[]): MessageGroup[] => {
    const groups: Record<string, MessageRecord[]> = {};
    msgs.forEach((message) => {
      const dateKey = new Date(message.sent_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([day, dayMessages]) => ({
      date: day,
      dateLabel: formatDate(dayMessages[0].sent_at),
      messages: dayMessages,
    }));
  };

  const getOtherParticipant = (): ThreadParticipant | null => {
    if (!userDbId) {
      console.log('⚠️ getOtherParticipant: userDbId not set');
      return null;
    }
    if (participants.length === 0) {
      console.log('⚠️ getOtherParticipant: no participants loaded');
      return null;
    }
    const other = participants.find((p) => p.user_id !== userDbId) || null;
    console.log('👥 Other participant:', other?.users?.name || 'Unknown', 'userDbId:', userDbId);
    return other;
  };

  const getParticipantInitials = (participant: ThreadParticipant | null): string => {
    if (!participant?.users) return '??';
    const name = participant.users.name || participant.users.email || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getParticipantName = (participant: ThreadParticipant | null): string => {
    if (!participant?.users) return 'Unknown';
    return participant.users.name || participant.users.email || 'Unknown';
  };

  const getParticipantRole = (participant: ThreadParticipant | null): string => {
    if (!participant) return 'Participant';
    return participant.role || 'Participant';
  };

  const otherParticipant = getOtherParticipant();
  const participantName = getParticipantName(otherParticipant);
  const participantRole = getParticipantRole(otherParticipant);
  const participantInitials = getParticipantInitials(otherParticipant);

  const messageGroups = groupMessagesByDate(messages);

  const renderItem = ({ item }: { item: MessageGroup }) => (
    <View>
      <ChatDateSeparator date={item.dateLabel} />
      {item.messages.map((message) => {
        const isOutgoing = message.sender_id === userDbId;
        const senderName = isOutgoing
          ? 'You'
          : message.sender?.name || message.sender?.email || 'Unknown';
        const timestamp = formatTime(message.sent_at);


        // Styles with dynamic theme


        const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  avatarContainer: {
    marginRight: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    fontFamily: typography.fontFamily.semiBold,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: spacing.sm,
  },
  headerName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    marginBottom: 2,
  },
  headerRole: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  },
  headerActions: {
    flexDirection: 'row',
    marginRight: spacing.xs,
  },
  headerIcon: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  messagesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});


        return (
          <ChatBubble
            key={message.id}
            message={message.body}
            timestamp={timestamp}
            sender={senderName}
            isOutgoing={isOutgoing}
            showSender={false}
          />
        );
      })}
    </View>
  );

  if (!isSchoolMode || !currentSchool || !threadId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{participantInitials}</Text>
          </View>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {participantName}
          </Text>
          <Text style={styles.headerRole} numberOfLines={1}>
            {participantRole}
          </Text>
        </View>

        {userRole === 'admin' && (
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
              <MaterialIcons name="phone" size={20} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
              <MaterialIcons name="videocam" size={20} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <MaterialIcons name="more-vert" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messageGroups}
              renderItem={renderItem}
              keyExtractor={(item) => item.date}
              contentContainerStyle={styles.messagesContainer}
              inverted={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                hasMore ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
            <ChatInputBar
              onSend={handleSend}
              placeholder="Type a message..."
              showAttachment={userRole === 'admin'}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default MessagesConversationScreen;

