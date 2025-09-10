import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { useAirtable } from '../hooks/useAirtable';
import { useUser } from '../contexts/UserContext';
import { Backend } from '../services/backend';

interface CommentsScreenProps {
  navigation: any;
  route: { params: { postId: string } };
}

export const CommentsScreen: React.FC<CommentsScreenProps> = ({ navigation, route }) => {
  const { postId } = route.params;
  const { addComment, getComments } = useAirtable();
  const { userData } = useUser();
  const [text, setText] = useState('');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; createdAt: string }[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchComments = async () => {
    try {
      console.log(`[${new Date().toISOString()}] [COMMENTS_SCREEN] Fetching comments for post:`, postId);
      const response = await Backend.getFeedComments(postId, 1, 50) as any;
      const formattedComments = response.records?.map((record: any) => ({
        id: record.id,
        author: record.fields['Author Name'] || 'Unknown User',
        text: record.fields['Content'] || '',
        createdAt: record.fields['Created At'] || new Date().toISOString(),
      })) || [];
      setComments(formattedComments);
      console.log(`[${new Date().toISOString()}] [COMMENTS_SCREEN] Loaded ${formattedComments.length} comments`);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    
    console.log(`[${new Date().toISOString()}] [COMMENT] Adding comment: ${trimmed}`);
    
    try {
      const response = await Backend.addFeedComment(postId, trimmed);
      if (response) {
        setText('');
        // Refresh comments to show the new one with proper timestamp
        await fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <MaterialIcons name="person" size={20} color={colors.text.secondary} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={styles.commentAuthor}>{item.author}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
              {item.createdAt && (
                <Text style={styles.commentTime}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: spacing.lg }}
        ListEmptyComponent={() => (
          <View style={styles.empty}> 
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={[styles.emptyText, { marginTop: 4, fontSize: typography.fontSize.sm }]}>Be the first to comment!</Text>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchComments();
          setRefreshing(false);
        }}
        inverted
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            placeholderTextColor={colors.text.secondary}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialIcons name="send" size={20} color={colors.background.primary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  commentAuthor: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  commentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  commentTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  empty: { alignItems: 'center', marginTop: spacing.xl },
  emptyText: { 
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    fontFamily: 'Inter',
    writingDirection: 'ltr',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    color: colors.text.primary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: spacing.sm,
    borderRadius: 20,
  },
});

