import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp }          from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { getPostById }                from '../../services/social/posts.service';
import { addComment, getComments, reactToPost, removeReaction, savePost, unsavePost }
                                      from '../../services/social/interactions.service';
import { ensureSocialProfile }        from '../../services/social/auth.service';
import { PostCard }                   from '../../components/social';
import type { SocialPost, SocialComment, ReactionType } from '../../types/social';
import type { SocialStackParamList }  from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'PostDetail'>;
type NavProp    = StackNavigationProp<SocialStackParamList, 'PostDetail'>;

export default function PostDetailScreen() {
  const route      = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { postId } = route.params;

  const [post, setPost]           = useState<SocialPost | null>(null);
  const [comments, setComments]   = useState<SocialComment[]>([]);
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [inputText, setInputText] = useState('');
  const [profileId, setProfileId] = useState<string | undefined>();
  const inputRef                  = useRef<TextInput>(null);

  useEffect(() => {
    let mounted = true;
    ensureSocialProfile().then((p) => { if (mounted) setProfileId(p?.id); }).catch(console.warn);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPostById(postId),
      getComments(postId),
    ]).then(([p, c]) => {
      setPost(p);
      setComments(c);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [postId]);

  const handleReact = useCallback(async (type: ReactionType) => {
    if (!post) return;
    const wasReacted = post.userReaction === type;

    setPost((prev) => {
      if (!prev) return prev;
      const reactions = { ...prev.reactions };
      if (prev.userReaction) reactions[prev.userReaction] = Math.max(0, reactions[prev.userReaction] - 1);
      if (!wasReacted) reactions[type] += 1;
      return { ...prev, reactions, userReaction: wasReacted ? undefined : type };
    });

    try {
      if (wasReacted) await removeReaction(postId);
      else await reactToPost(postId, type);
    } catch {
      const refreshed = await getPostById(postId);
      setPost(refreshed);
    }
  }, [post, postId]);

  const handleSave = useCallback(async () => {
    if (!post) return;
    setPost((prev) => prev ? { ...prev, saved: !prev.saved } : prev);
    try {
      if (post.saved) await unsavePost(postId);
      else await savePost(postId);
    } catch {
      const refreshed = await getPostById(postId);
      setPost(refreshed);
    }
  }, [post, postId]);

  const handleSendComment = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    setSending(true);
    setInputText('');
    try {
      const newComment = await addComment({ postId, content: text });
      setComments((prev) => [...prev, newComment]);
      setPost((prev) => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);
    } catch (err) {
      console.error('Comment error', err);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, postId]);

  const renderComment = useCallback(({ item }: { item: SocialComment }) => (
    <View style={[styles.commentRow, item.isPinned && styles.pinnedComment]}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentInitial}>
          {item.author.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentBody}>
        {item.isPinned && (
          <View style={styles.pinnedBadge}>
            <MaterialIcons name="push-pin" size={11} color="#F59E0B" />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
        <Text style={styles.commentAuthor}>{item.author.displayName}</Text>
        <Text style={styles.commentContent}>{item.content}</Text>
        <Text style={styles.commentTime}>{formatRelative(item.createdAt)}</Text>
      </View>
    </View>
  ), []);

  if (loading || !post) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={
          <View style={styles.postWrapper}>
            <PostCard
              post={post}
              currentUserId={profileId}
              onReact={handleReact}
              onSave={handleSave}
            />
            <View style={styles.commentsSectionHeader}>
              <Text style={styles.commentsSectionTitle}>
                Bình luận ({post.commentsCount})
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.noComments}>Chưa có bình luận. Hãy là người đầu tiên!</Text>
        }
      />

      {/* Sticky comment input */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Viết bình luận..."
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSendComment}
        />
        <Pressable
          style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSendComment}
          disabled={!inputText.trim() || sending}
        >
          <MaterialIcons
            name={sending ? 'hourglass-top' : 'send'}
            size={20}
            color="#fff"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'vừa xong';
  if (mins < 60) return `${mins}p`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#F9FAFC',
  },
  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  postWrapper: {
    paddingHorizontal: 12,
    paddingTop:        8,
  },
  commentsSectionHeader: {
    paddingTop:    16,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  commentsSectionTitle: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#111827',
  },
  commentRow: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    paddingHorizontal: 20,
    paddingVertical:   10,
    gap:               10,
  },
  pinnedComment: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  commentAvatar: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  commentInitial: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#6B7280',
  },
  commentBody: {
    flex: 1,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
    marginBottom:  2,
  },
  pinnedText: {
    fontSize: 11,
    color:    '#F59E0B',
    fontWeight: '600',
  },
  commentAuthor: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#111827',
    marginBottom: 2,
  },
  commentContent: {
    fontSize:   14,
    color:      '#374151',
    lineHeight: 20,
  },
  commentTime: {
    fontSize:  11,
    color:     '#9CA3AF',
    marginTop: 4,
  },
  noComments: {
    textAlign: 'center',
    color:     '#9CA3AF',
    fontSize:  14,
    padding:   24,
  },
  inputBar: {
    flexDirection:     'row',
    alignItems:        'flex-end',
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor:   '#fff',
    borderTopWidth:    1,
    borderTopColor:    '#F3F4F6',
    gap:               10,
  },
  input: {
    flex:              1,
    minHeight:         40,
    maxHeight:         100,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical:   9,
    fontSize:          15,
    color:             '#111827',
    backgroundColor:   '#F9FAFC',
  },
  sendBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: '#0B5FFF',
    alignItems:      'center',
    justifyContent:  'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
});
