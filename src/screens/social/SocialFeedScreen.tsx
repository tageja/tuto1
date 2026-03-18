import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ensureSocialProfile }           from '../../services/social/auth.service';
import { getFeedPosts }                  from '../../services/social/feed.service';
import { reactToPost, removeReaction, savePost, unsavePost } from '../../services/social/interactions.service';
import { PostCard, PostCardSkeleton, FeedHeader } from '../../components/social';
import type { SocialPost, ReactionType, SocialProfile } from '../../types/social';
import type { FeedTab }                  from '../../services/social/feed.service';
import type { SocialStackParamList }     from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'SocialFeed'>;

const SKELETON_COUNT = 5;

export default function SocialFeedScreen() {
  const navigation = useNavigation<NavProp>();

  const [profile, setProfile]       = useState<SocialProfile | null>(null);
  const [activeTab, setActiveTab]   = useState<FeedTab>('school');
  const [posts, setPosts]           = useState<SocialPost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const cursorRef                   = useRef<string | null>(null);

  // ── Init: ensure profile exists ─────────────────────────────────────────
  useEffect(() => {
    ensureSocialProfile().then((p) => setProfile(p)).catch(console.warn);
  }, []);

  // ── Load feed ────────────────────────────────────────────────────────────
  const loadFeed = useCallback(async (tab: FeedTab, reset = false) => {
    if (!reset && (loadingMore || !hasMore)) return;
    if (reset) {
      cursorRef.current = null;
      setHasMore(true);
    }

    try {
      const result = await getFeedPosts({
        tab,
        schoolId:        profile?.schoolId,
        currentProfileId: profile?.id,
        limit:           20,
        cursor:          reset ? undefined : (cursorRef.current ?? undefined),
      });

      cursorRef.current = result.nextCursor;
      setHasMore(result.hasMore);

      if (reset) {
        setPosts(result.posts);
      } else {
        setPosts((prev) => [...prev, ...result.posts]);
      }
    } catch (err) {
      console.error('Feed load error', err);
    }
  }, [profile, loadingMore, hasMore]);

  // Initial load + tab change
  useEffect(() => {
    setLoading(true);
    loadFeed(activeTab, true).finally(() => setLoading(false));
  }, [activeTab, profile]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(activeTab, true);
    setRefreshing(false);
  }, [activeTab, loadFeed]);

  const handleEndReached = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadFeed(activeTab, false);
    setLoadingMore(false);
  }, [activeTab, loadFeed, loadingMore, hasMore]);

  // ── Reactions ────────────────────────────────────────────────────────────
  const handleReact = useCallback(async (postId: string, type: ReactionType) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const wasReacted  = p.userReaction === type;
        const prevReaction = p.userReaction;
        const reactions   = { ...p.reactions };

        if (prevReaction) reactions[prevReaction] = Math.max(0, reactions[prevReaction] - 1);
        if (!wasReacted) reactions[type] += 1;

        return {
          ...p,
          reactions,
          userReaction: wasReacted ? undefined : type,
        };
      }),
    );

    try {
      if (posts.find((p) => p.id === postId)?.userReaction === type) {
        await removeReaction(postId);
      } else {
        await reactToPost(postId, type);
      }
    } catch (err) {
      // Revert on failure
      handleRefresh();
    }
  }, [posts, handleRefresh]);

  const handleSave = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, saved: !p.saved, savesCount: p.savesCount + (p.saved ? -1 : 1) } : p,
      ),
    );
    const post = posts.find((p) => p.id === postId);
    try {
      if (post?.saved) await unsavePost(postId);
      else await savePost(postId);
    } catch (err) {
      handleRefresh();
    }
  }, [posts, handleRefresh]);

  // ── Render helpers ───────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: SocialPost }) => (
      <PostCard
        post={item}
        currentUserId={profile?.id}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        onReact={(type) => handleReact(item.id, type)}
        onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
        onShare={() => {}}
        onSave={() => handleSave(item.id)}
      />
    ),
    [profile, navigation, handleReact, handleSave],
  );

  const renderHeader = (
    <FeedHeader
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      authorAvatarUrl={profile?.avatarUrl}
      authorInitial={profile?.displayName?.charAt(0).toUpperCase()}
      onComposerPress={() => navigation.navigate('CreatePost')}
    />
  );

  const renderFooter = loadingMore ? (
    <ActivityIndicator size="small" color="#0B5FFF" style={{ paddingVertical: 16 }} />
  ) : null;

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader}
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyFeed />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0B5FFF" />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

function EmptyFeed() {
  return (
    <View style={styles.empty}>
      <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
      <Text style={styles.emptySubtext}>Hãy là người đầu tiên chia sẻ!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#F9FAFC',
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 12,
  },
  fab: {
    position:        'absolute',
    bottom:          24,
    right:           20,
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#0B5FFF',
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       6,
    shadowColor:     '#0B5FFF',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.35,
    shadowRadius:    8,
  },
  empty: {
    alignItems:  'center',
    paddingTop:  80,
    gap:         12,
  },
  emptyText: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color:    '#9CA3AF',
  },
});
