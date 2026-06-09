import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Pressable,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { getUnreadCount } from '../../services/social/notifications.service';

import { ensureSocialProfile }           from '../../services/social/auth.service';
import { getFeedPosts }                  from '../../services/social/feed.service';
import { incrementViewCount }            from '../../services/social/analytics.service';
import { reactToPost, removeReaction, savePost, unsavePost } from '../../services/social/interactions.service';
import { reportContent, blockUser, muteUser, getBlockedUsers, getMutedUsers } from '../../services/social/moderation.service';
import { PostCard, PostCardSkeleton, FeedHeader, CreatePostModal, StoryBar, ReportModal, BlockUserModal, MuteUserModal } from '../../components/social';
import { sharePost } from '../../components/social';
import type { SocialPost, ReactionType, SocialProfile } from '../../types/social';
import type { FeedTab }                  from '../../services/social/feed.service';
import type { SocialStackParamList }     from '../../navigation/SocialStack';
import type { SocialTabParamList }      from '../../navigation/SocialTabs';
import { promptSocialSignIn }            from '../../utils/socialAuthGate';
import { openCourses }                   from '../../services/ecosystem';

type NavProp = StackNavigationProp<SocialStackParamList> & {
  navigate: (name: keyof SocialTabParamList | keyof SocialStackParamList, params?: object) => void;
};

const SKELETON_COUNT = 5;

export default function SocialFeedScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [profile, setProfile]       = useState<SocialProfile | null>(null);
  const [activeTab, setActiveTab]   = useState<FeedTab>('school');
  const [posts, setPosts]           = useState<SocialPost[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [reportModal, setReportModal] = useState<{ postId: string } | null>(null);
  const [blockModal, setBlockModal] = useState<{ authorId: string; authorName: string } | null>(null);
  const [muteModal, setMuteModal] = useState<{ authorId: string; authorName: string } | null>(null);
  const [excludeIds, setExcludeIds] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const cursorRef                   = useRef<string | null>(null);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: SocialPost }[] }) => {
      viewableItems.forEach(({ item }) => {
        if (item?.id) incrementViewCount('post', item.id);
      });
    },
  ).current;

  // ── Init: ensure profile exists ─────────────────────────────────────────
  useEffect(() => {
    ensureSocialProfile().then((p) => setProfile(p)).catch(console.warn);
  }, []);

  // ── Load blocked+muted for feed filtering ───────────────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([getBlockedUsers(profile.id), getMutedUsers(profile.id)]).then(
      ([blocked, muted]) => {
        const ids = new Set([
          ...blocked.map((b) => b.id),
          ...muted.map((m) => m.id),
        ]);
        setExcludeIds(ids);
      },
    ).catch(console.warn);
  }, [profile?.id]);

  // ── Notification bell unread count ──────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }, []),
  );

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
        excludeAuthorIds: excludeIds.size > 0 ? Array.from(excludeIds) : undefined,
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
  }, [profile, loadingMore, hasMore, excludeIds]);

  // Initial load + tab change + excludeIds (blocked/muted)
  useEffect(() => {
    setLoading(true);
    loadFeed(activeTab, true).finally(() => setLoading(false));
  }, [activeTab, profile, excludeIds.size]);

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
    if (!profile) {
      promptSocialSignIn(navigation, 'Đăng nhập để bày tỏ cảm xúc với bài viết.');
      return;
    }
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
  }, [posts, handleRefresh, profile, navigation]);

  const handleSave = useCallback(async (postId: string) => {
    if (!profile) {
      promptSocialSignIn(navigation, 'Đăng nhập để lưu bài viết.');
      return;
    }
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
  }, [posts, handleRefresh, profile, navigation]);

  // ── Ecosystem switcher: School Dashboard + Courses (subtle, always visible) ─
  const handleEcosystem = useCallback(() => {
    Alert.alert('Hệ sinh thái Tuto', 'Chuyển đến ứng dụng khác trong hệ sinh thái Tuto.', [
      {
        text: 'Trường học (LMS)',
        onPress: () => navigation.navigate('Welcome' as never),
      },
      {
        text: 'Học tại nhà (Khoá học)',
        onPress: () => { void openCourses(); },
      },
      { text: 'Đóng', style: 'cancel' },
    ]);
  }, [navigation]);

  // ── Render helpers ───────────────────────────────────────────────────────
  const handleNewPost = useCallback((post: SocialPost) => {
    setPosts((prev) => [post, ...prev]);
    setCreatePostVisible(false);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: SocialPost }) => (
      <PostCard
        post={item}
        currentUserId={profile?.id}
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        onReact={(type) => handleReact(item.id, type)}
        onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
        onShare={() => sharePost(item.id, item.content)}
        onSave={() => handleSave(item.id)}
        onAuthorPress={() => navigation.navigate('SocialProfile', { userId: item.author.id })}
        onSchoolPress={
          item.schoolId
            ? (schoolId) => navigation.navigate('SchoolProfile', { schoolId })
            : undefined
        }
        onReport={() => setReportModal({ postId: item.id })}
        onBlockUser={() => setBlockModal({ authorId: item.author.id, authorName: item.author.displayName })}
        onMuteUser={() => setMuteModal({ authorId: item.author.id, authorName: item.author.displayName })}
      />
    ),
    [profile, navigation, handleReact, handleSave],
  );

  const renderHeader = (
    <>
      {/* ── Top bar: Tuto logo + notification bell ────────────────────── */}
      <View style={styles.topBar}>
        <Image
          source={require('../../../assets/images/tuto-logo.png')}
          style={styles.topBarLogo}
          resizeMode="contain"
        />
        <Pressable
          style={styles.bellBtn}
          onPress={() => navigation.navigate('SocialNotifications')}
          hitSlop={8}
        >
          <MaterialIcons
            name={unreadCount > 0 ? 'notifications' : 'notifications-none'}
            size={26}
            color="#111827"
          />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <StoryBar currentProfile={profile} />
      <FeedHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        authorAvatarUrl={profile?.avatarUrl}
        authorInitial={profile?.displayName?.charAt(0).toUpperCase()}
        onComposerPress={() => {
          if (!profile) { promptSocialSignIn(navigation, 'Đăng nhập để đăng bài.'); return; }
          setCreatePostVisible(true);
        }}
        onAvatarPress={() => profile && navigation.navigate('SocialProfile', { userId: profile.id })}
        onSearchPress={() => navigation.navigate('Search')}
        onEcosystemPress={handleEcosystem}
        onBackPress={() => navigation.getParent()?.getParent()?.navigate('HomeTab' as never)}
      />
    </>
  );

  const renderFooter = loadingMore ? (
    <ActivityIndicator size="small" color="#0B5FFF" style={{ paddingVertical: 16 }} />
  ) : null;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {renderHeader}
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
        <CreatePostModal
          visible={createPostVisible}
          onClose={() => setCreatePostVisible(false)}
          onSuccess={handleNewPost}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<EmptyFeed t={t} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0B5FFF" />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      {/* FAB — navigates to full-screen CreatePost for complex post types */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          if (!profile) { promptSocialSignIn(navigation, 'Đăng nhập để đăng bài.'); return; }
          navigation.navigate('CreatePost');
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Quick compose modal (bottom sheet) */}
      <CreatePostModal
        visible={createPostVisible}
        onClose={() => setCreatePostVisible(false)}
        onSuccess={handleNewPost}
      />

      {/* Report / Block / Mute modals */}
      <ReportModal
        visible={!!reportModal}
        onClose={() => setReportModal(null)}
        targetType="post"
        targetId={reportModal?.postId ?? ''}
        onReport={async (params) => { await reportContent(params); }}
      />
      {blockModal && profile && (
        <BlockUserModal
          visible
          onClose={() => setBlockModal(null)}
          displayName={blockModal.authorName}
          onConfirm={async () => {
            await blockUser(profile.id, blockModal.authorId);
          }}
          onSuccess={() => {
            setExcludeIds((prev) => new Set([...prev, blockModal.authorId]));
            setPosts((prev) => prev.filter((p) => p.author.id !== blockModal.authorId));
          }}
        />
      )}
      {muteModal && profile && (
        <MuteUserModal
          visible
          onClose={() => setMuteModal(null)}
          displayName={muteModal.authorName}
          onConfirm={async () => {
            await muteUser(profile.id, muteModal.authorId);
          }}
          onSuccess={() => {
            setExcludeIds((prev) => new Set([...prev, muteModal.authorId]));
            setPosts((prev) => prev.filter((p) => p.author.id !== muteModal.authorId));
          }}
        />
      )}
    </View>
  );
}

function EmptyFeed({ t }: { t: (key: string) => unknown }) {
  return (
    <View style={styles.empty}>
      <MaterialIcons name="people-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>{t('community.feed.emptyTitle') as string}</Text>
      <Text style={styles.emptySubtext}>{t('community.feed.emptySubtitle') as string}</Text>
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
  topBar: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: 16,
    paddingVertical:   10,
    backgroundColor:  '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  topBarLogo: {
    width:  80,
    height: 32,
  },
  bellBtn: {
    padding: 4,
  },
  bellBadge: {
    position:        'absolute',
    top:             2,
    right:           2,
    backgroundColor: '#EF4444',
    borderRadius:    8,
    minWidth:        16,
    height:          16,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color:      '#FFFFFF',
    fontSize:   10,
    fontWeight: '700',
    lineHeight: 14,
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
