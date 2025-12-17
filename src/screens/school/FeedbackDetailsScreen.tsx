import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useUser } from '../../contexts/UserContext';
import { getCurrentUser } from '../../config/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { FeedbackBadge } from '../../components/school/feedback/FeedbackBadge';
import { FeedbackMessageBubble } from '../../components/school/feedback/FeedbackMessageBubble';
import {
  fetchFeedbackDetail,
  updateFeedbackStatus,
  addFeedbackMessage,
} from '../../services/school/feedback';
import { FeedbackWithMessages } from '../../types/school/feedback';

interface RouteParams {
  feedbackId: string;
}

const FeedbackDetailsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { feedbackId } = (route.params || {}) as RouteParams;
  const { currentSchool } = useSchool();
  const { userType } = useUser();

  const [feedback, setFeedback] = useState<FeedbackWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isAdmin = userType === 'teacher' || userType === 'admin';

  useEffect(() => {
    if (!feedbackId) {
      navigation.goBack();
      return;
    }
    initializeData();
    loadFeedback();
  }, [feedbackId]);

  const initializeData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const loadFeedback = useCallback(async () => {
    if (!feedbackId) return;

    try {
      setLoading(true);
      const data = await fetchFeedbackDetail(feedbackId, isAdmin);
      setFeedback(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Error', 'Failed to load feedback details');
    } finally {
      setLoading(false);
    }
  }, [feedbackId, isAdmin]);

  const handleMarkAsClosed = async () => {
    if (!feedback) return;

    Alert.alert(
      'Mark as Closed',
      'Are you sure you want to mark this feedback as closed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: async () => {
            try {
              setClosing(true);
              const updated = await updateFeedbackStatus(feedbackId, 'closed');
              if (updated) {
                setFeedback((prev) =>
                  prev ? { ...prev, status: 'closed' } : null
                );
                Alert.alert('Success', 'Feedback marked as closed');
              }
            } catch (error: any) {
              console.error('Error closing feedback:', error);
              Alert.alert('Error', error.message || 'Failed to close feedback');
            } finally {
              setClosing(false);
            }
          },
        },
      ]
    );
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !feedback) return;

    try {
      setReplying(true);

      const message = await addFeedbackMessage(feedbackId, replyMessage.trim());
      if (message) {
        // Reload feedback to get updated messages
        await loadFeedback();
        setReplyMessage('');
      }
    } catch (error: any) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', error.message || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const formatDeadline = (deadlineAt: string): string => {
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due in 1 day';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {

    // Styles with dynamic theme

    const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.status.error,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  feedbackCode: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeSpacer: {
    width: 6,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.light,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  dueText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  messagesContainer: {
    marginTop: spacing.sm,
  },
  noMessagesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.light,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  closeButtonDisabled: {
    opacity: 0.6,
  },
  closeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.white,
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.xs,
  },
  replyInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  closedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  closedMessageText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.light,
    fontStyle: 'italic',
  },
});

    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!feedback) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Feedback not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.feedbackCode}>{feedback.code}</Text>
          <Text style={styles.headerSubtitle}>Feedback Details</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* Main Card */}
        <View style={styles.card}>
          <View style={styles.badges}>
            <FeedbackBadge type="category" value={feedback.category} />
            <View style={styles.badgeSpacer} />
            <FeedbackBadge type="status" value={feedback.status} />
          </View>

          <Text style={styles.title}>{feedback.title}</Text>

          <View style={styles.infoRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(feedback.student_name)}
              </Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Student</Text>
              <Text style={styles.infoValue}>
                {feedback.student_name || 'Unknown Student'}
              </Text>
            </View>
          </View>

          {isAdmin && feedback.parent_name && (
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Parent</Text>
                <Text style={styles.infoValue}>{feedback.parent_name}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(feedback.created_at)}</Text>
            </View>
          </View>

          {feedback.deadline_at && (
            <View style={styles.dueBadge}>
              <MaterialIcons name="schedule" size={16} color={colors.primary} />
              <Text style={styles.dueText}>
                {formatDeadline(feedback.deadline_at)}
              </Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{feedback.description}</Text>
        </View>

        {/* Conversation Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          {feedback.messages && feedback.messages.length > 0 ? (
            <View style={styles.messagesContainer}>
              {feedback.messages.map((message) => {
                // Determine if message is from current user
                // This is a simplified check - in production, you'd compare sender_id with current user's DB ID
                const isCurrentUser = message.sender_role === (isAdmin ? 'admin' : 'parent');
                return (
                  <FeedbackMessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
            </View>
          ) : (
            <Text style={styles.noMessagesText}>No messages yet</Text>
          )}
        </View>

        {/* Mark as Closed Button (if not already closed) */}
        {feedback.status !== 'closed' && isAdmin && (
          <TouchableOpacity
            style={[styles.closeButton, closing && styles.closeButtonDisabled]}
            onPress={handleMarkAsClosed}
            disabled={closing}
          >
            {closing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={18} color={colors.white} />
                <Text style={styles.closeButtonText}>Mark as Closed</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        </ScrollView>

        {/* Reply Input - Outside ScrollView to avoid keyboard issues */}
        {feedback.status !== 'closed' && (
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              placeholderTextColor={colors.text.light}
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
              maxLength={1000}
              editable={feedback.status !== 'closed'}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!replyMessage.trim() || replying || feedback.status === 'closed') && styles.sendButtonDisabled,
              ]}
              onPress={handleSendReply}
              disabled={!replyMessage.trim() || replying || feedback.status === 'closed'}
            >
              {replying ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <MaterialIcons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        )}
        {feedback.status === 'closed' && (
          <View style={styles.closedMessage}>
            <MaterialIcons name="lock" size={16} color={colors.text.light} />
            <Text style={styles.closedMessageText}>
              This feedback is closed. No new replies can be added.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default FeedbackDetailsScreen;

