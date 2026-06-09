import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { startConversation } from '../../services/social/conversations.service';
import { getUnreadCount } from '../../services/social/notifications.service';
import { getProfileById } from '../../services/social/profile.service';
import { getPostsByAuthorId } from '../../services/social/feed.service';
import { getReelsByAuthorId } from '../../services/social/reels.service';
import { getFollowStatus } from '../../services/social/follows.service';
import {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  ProfilePostGrid,
  EditProfileModal,
  AchievementCard,
  ReelCard,
} from '../../components/social';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SocialProfile, SocialPost } from '../../types/social';
import type { Reel } from '../../services/social/reels.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import type { ProfileTab } from '../../components/social/ProfileTabs';

type RouteProps = RouteProp<SocialStackParamList, 'SocialProfile'>;
type NavProp = StackNavigationProp<SocialStackParamList, 'SocialProfile'>;

export default function SocialProfileScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { userId } = route.params ?? {};

  const [currentProfile, setCurrentProfile] = useState<SocialProfile | null>(null);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'following' | 'not_following'>('not_following');
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('posts');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isOwnProfile = !userId || (currentProfile && profile && currentProfile.id === profile.id);

  const loadUnreadCount = useCallback(() => {
    if (isOwnProfile) {
      getUnreadCount().then(setUnreadCount).catch(() => {});
    }
  }, [isOwnProfile]);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      const me = await ensureSocialProfile();
      if (!me) return;
      setProfile(me);
      setFollowStatus('not_following');
    } else {
      const p = await getProfileById(userId);
      setProfile(p);
      if (p && currentProfile && p.id !== currentProfile.id) {
        const status = await getFollowStatus(p.id).catch(() => 'not_following');
        setFollowStatus(status);
      }
    }
  }, [userId, currentProfile?.id]);

  const loadPosts = useCallback(async () => {
    if (!profile) return;
    const result = await getPostsByAuthorId(profile.id);
    setPosts(result.posts);
  }, [profile?.id]);

  const loadReels = useCallback(async () => {
    if (!profile || !currentProfile) return;
    const data = await getReelsByAuthorId(profile.id, 50, currentProfile.id);
    setReels(data);
  }, [profile?.id, currentProfile?.id]);

  const load = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    load().catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (profile) loadPosts().catch(console.error);
  }, [profile?.id]);

  useEffect(() => {
    if (profile && currentProfile && selectedTab === 'reels') {
      loadReels().catch(console.error);
    }
  }, [profile?.id, currentProfile?.id, selectedTab, loadReels]);

  useEffect(() => {
    ensureSocialProfile().then(setCurrentProfile).catch(console.warn);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadProfile(),
      profile ? loadPosts() : Promise.resolve(),
      profile && currentProfile && selectedTab === 'reels' ? loadReels() : Promise.resolve(),
      loadUnreadCount(),
    ]);
    setRefreshing(false);
  }, [loadProfile, loadPosts, loadReels, loadUnreadCount, profile, currentProfile, selectedTab]);

  const handleNotificationPress = useCallback(() => {
    navigation.navigate('SocialNotifications' as never);
  }, [navigation]);

  const handleCreatorDashboardPress = useCallback(() => {
    navigation.navigate('CreatorDashboard' as never);
  }, [navigation]);

  const handleLeaderboardPress = useCallback(() => {
    navigation.navigate('Leaderboard' as never);
  }, [navigation]);

  const handleFollowersPress = () => {
    if (profile) {
      navigation.navigate('Followers', { userId: profile.id, displayName: profile.displayName });
    }
  };

  const handleFollowingPress = () => {
    if (profile) {
      navigation.navigate('Following', { userId: profile.id, displayName: profile.displayName });
    }
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleReelPress = (reelId: string) => {
    const initialIndex = reels.findIndex((r) => r.id === reelId);
    navigation.navigate('ReelDetail', {
      reelId,
      authorId: profile?.id,
      initialIndex: initialIndex >= 0 ? initialIndex : 0,
    });
  };

  const handleMessage = useCallback(async () => {
    if (!profile) return;
    try {
      const myProfile = await ensureSocialProfile();
      if (!myProfile) return;
      const conversationId = await startConversation(myProfile.id, profile.id);
      navigation.navigate('Chat', { conversationId });
    } catch (err) {
      console.error('Failed to start conversation', err);
    }
  }, [profile?.id, navigation]);

  const handleEditSuccess = (updated: SocialProfile) => {
    setProfile(updated);
  };

  const achievementPosts = posts.filter((p) => p.postType === 'achievement');

  if (loading && !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0B5FFF" />
      }
    >
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        insetTop={insets.top}
        onEdit={() => setEditModalVisible(true)}
        onCreatorDashboardPress={isOwnProfile ? handleCreatorDashboardPress : undefined}
        onLeaderboardPress={profile.role === 'teacher' ? handleLeaderboardPress : undefined}
        onMessagePress={!isOwnProfile ? handleMessage : undefined}
        onNotificationPress={isOwnProfile ? handleNotificationPress : undefined}
        onSchoolPagePress={
          profile.role === 'school_admin' && profile.schoolId
            ? () => navigation.navigate('SchoolProfile', { schoolId: profile.schoolId! })
            : undefined
        }
        unreadNotificationCount={unreadCount}
        followStatus={followStatus}
        onFollowStatusChange={(s) => {
          setFollowStatus(s);
          setProfile((p) => p ? { ...p, followerCount: p.followerCount + (s === 'following' ? 1 : -1) } : p);
        }}
      />
      <ProfileStats
        postsCount={profile.postCount}
        followersCount={profile.followerCount}
        followingCount={profile.followingCount}
        xp={profile.xp}
        level={profile.level}
        streakCount={profile.streakCount}
        onFollowersPress={handleFollowersPress}
        onFollowingPress={handleFollowingPress}
      />
      {isOwnProfile && (
        <View style={styles.safetyRow}>
          <Pressable
            style={styles.safetyLink}
            onPress={() => navigation.navigate('BlockedUsers' as never)}
          >
            <Text style={styles.safetyLinkText}>{t('community.blocked.title')}</Text>
          </Pressable>
          <Pressable
            style={styles.safetyLink}
            onPress={() => navigation.navigate('MutedUsers' as never)}
          >
            <Text style={styles.safetyLinkText}>{t('community.muted.title')}</Text>
          </Pressable>
        </View>
      )}
      <ProfileTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        isOwnProfile={isOwnProfile}
      />
      {selectedTab === 'posts' && (
        <ProfilePostGrid posts={posts} loading={loading && posts.length === 0} onPostPress={handlePostPress} />
      )}
      {selectedTab === 'reels' && (
        <View style={styles.reelsGrid}>
          {reels.length > 0 ? (
            reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onPress={() => handleReelPress(reel.id)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {t('community.reels.empty') as string}
              </Text>
            </View>
          )}
        </View>
      )}
      {selectedTab === 'achievements' && (
        <View style={styles.achievements}>
          {achievementPosts.length > 0 ? (
            achievementPosts.map((p) => (
              <AchievementCard
                key={p.id}
                post={p}
                variant="compact"
                onPress={() => handlePostPress(p.id)}
              />
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {t('community.profile.tab_achievements') as string} — {t('community.feed.emptyTitle') as string}
              </Text>
            </View>
          )}
        </View>
      )}
      {selectedTab === 'saved' && isOwnProfile && (
        <View style={styles.empty}>
          {/* TODO: saved posts - Phase 2 */}
        </View>
      )}
      <EditProfileModal
        visible={editModalVisible}
        profile={profile}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
      />
    </ScrollView>
  );
}

const GAP = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  reelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    padding: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievements: {
    padding: 16,
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  safetyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  safetyLink: {
    paddingVertical: 4,
  },
  safetyLinkText: {
    fontSize: 14,
    color: '#0B5FFF',
    fontWeight: '500',
  },
});
