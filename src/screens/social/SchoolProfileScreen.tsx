import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { getFollowStatus } from '../../services/social/follows.service';
import {
  getSchoolProfile,
  getSchoolStaff,
  getSchoolAnnouncements,
  getSchoolAchievementSpotlights,
} from '../../services/social/profile.service';
import { reactToPost, removeReaction, savePost, unsavePost } from '../../services/social/interactions.service';
import { sharePost } from '../../components/social';
import {
  PostCard,
  AchievementCard,
  FollowButton,
} from '../../components/social';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SchoolProfile, StaffMember } from '../../services/social/profile.service';
import type { SocialPost, SocialProfile } from '../../types/social';
import type { ReactionType } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'SchoolProfile'>;
type NavProp = StackNavigationProp<SocialStackParamList, 'SchoolProfile'>;

type SchoolTab = 'announcements' | 'staff' | 'achievements';

const COVER_HEIGHT = 140;
const AVATAR_SIZE = 72;

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#9CA3AF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

export default function SchoolProfileScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { schoolId } = route.params ?? {};

  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [announcements, setAnnouncements] = useState<SocialPost[]>([]);
  const [achievements, setAchievements] = useState<SocialPost[]>([]);
  const [currentProfile, setCurrentProfile] = useState<SocialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [followStatus, setFollowStatus] = useState<'following' | 'not_following'>('not_following');
  const [selectedTab, setSelectedTab] = useState<SchoolTab>('announcements');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [tabDataLoaded, setTabDataLoaded] = useState<Record<SchoolTab, boolean>>({
    announcements: false,
    staff: false,
    achievements: false,
  });

  const coverHeight = COVER_HEIGHT + insets.top;

  const loadSchoolProfile = useCallback(async () => {
    if (!schoolId) return null;
    const p = await getSchoolProfile(schoolId);
    setSchoolProfile(p);
    return p;
  }, [schoolId]);

  const loadFollowStatus = useCallback(async () => {
    if (!schoolProfile || !currentProfile) return;
    const status = await getFollowStatus(schoolProfile.id).catch(() => 'not_following');
    setFollowStatus(status);
  }, [schoolProfile?.id, currentProfile?.id]);

  const loadAnnouncements = useCallback(async () => {
    if (!schoolId) return;
    const data = await getSchoolAnnouncements(schoolId, 20);
    setAnnouncements(data);
    setTabDataLoaded((prev) => ({ ...prev, announcements: true }));
  }, [schoolId]);

  const loadStaff = useCallback(async () => {
    if (!schoolId) return;
    const data = await getSchoolStaff(schoolId);
    setStaff(data);
    setTabDataLoaded((prev) => ({ ...prev, staff: true }));
  }, [schoolId]);

  const loadAchievements = useCallback(async () => {
    if (!schoolId) return;
    const data = await getSchoolAchievementSpotlights(schoolId, 12);
    setAchievements(data);
    setTabDataLoaded((prev) => ({ ...prev, achievements: true }));
  }, [schoolId]);

  useEffect(() => {
    ensureSocialProfile().then(setCurrentProfile).catch(console.warn);
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    loadSchoolProfile()
      .then((p) => {
        if (p && currentProfile) {
          getFollowStatus(p.id).then(setFollowStatus).catch(() => setFollowStatus('not_following'));
        }
      })
      .finally(() => setLoading(false));
  }, [schoolId, currentProfile?.id]);

  useEffect(() => {
    if (schoolProfile && currentProfile && schoolProfile.id !== currentProfile.id) {
      loadFollowStatus();
    }
  }, [schoolProfile?.id, currentProfile?.id, loadFollowStatus]);

  useEffect(() => {
    if (selectedTab === 'announcements' && !tabDataLoaded.announcements && schoolId) {
      loadAnnouncements().catch(console.error);
    }
  }, [selectedTab, tabDataLoaded.announcements, schoolId, loadAnnouncements]);

  useEffect(() => {
    if (selectedTab === 'staff' && !tabDataLoaded.staff && schoolId) {
      loadStaff().catch(console.error);
    }
  }, [selectedTab, tabDataLoaded.staff, schoolId, loadStaff]);

  useEffect(() => {
    if (selectedTab === 'achievements' && !tabDataLoaded.achievements && schoolId) {
      loadAchievements().catch(console.error);
    }
  }, [selectedTab, tabDataLoaded.achievements, schoolId, loadAchievements]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const p = await loadSchoolProfile();
    if (p && currentProfile) {
      getFollowStatus(p.id).then(setFollowStatus).catch(() => {});
    }
    if (tabDataLoaded.announcements) await loadAnnouncements();
    if (tabDataLoaded.staff) await loadStaff();
    if (tabDataLoaded.achievements) await loadAchievements();
    setRefreshing(false);
  }, [loadSchoolProfile, loadAnnouncements, loadStaff, loadAchievements, currentProfile, tabDataLoaded]);

  const handleReact = useCallback(async (postId: string, type: ReactionType) => {
    try {
      const post = announcements.find((p) => p.id === postId) ?? achievements.find((p) => p.id === postId);
      if (post?.userReaction) {
        await removeReaction(postId);
      } else {
        await reactToPost(postId, type);
      }
      handleRefresh();
    } catch {
      handleRefresh();
    }
  }, [announcements, achievements, handleRefresh]);

  const handleSave = useCallback(async (postId: string) => {
    const post = announcements.find((p) => p.id === postId) ?? achievements.find((p) => p.id === postId);
    try {
      if (post?.saved) await unsavePost(postId);
      else await savePost(postId);
    } catch {
      handleRefresh();
    }
  }, [announcements, achievements, handleRefresh]);

  // ── Error: school not found ─────────────────────────────────────────────
  if (!schoolId || (!loading && !schoolProfile)) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="school" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>{t('community.school.notFound') as string}</Text>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="#0B5FFF" />
          <Text style={styles.backBtnText}>{t('community.school.back') as string}</Text>
        </Pressable>
      </View>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading && !schoolProfile) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  if (!schoolProfile) return null;

  const TABS: { key: SchoolTab; labelKey: string }[] = [
    { key: 'announcements', labelKey: 'community.school.announcements' },
    { key: 'staff', labelKey: 'community.school.staff' },
    { key: 'achievements', labelKey: 'community.school.achievements' },
  ];

  const renderAnnouncement = ({ item }: { item: SocialPost }) => (
    <PostCard
      post={item}
      currentUserId={currentProfile?.id}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      onReact={(type) => handleReact(item.id, type)}
      onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
      onShare={() => sharePost(item.id, item.content)}
      onSave={() => handleSave(item.id)}
      onAuthorPress={() => navigation.navigate('SocialProfile', { userId: item.author.id })}
    />
  );

  const renderStaffRow = ({ item }: { item: StaffMember }) => (
    <Pressable
      style={styles.staffRow}
      onPress={() => navigation.navigate('SocialProfile', { userId: item.id })}
    >
      {item.avatarUrl ? (
        <Image source={{ uri: item.avatarUrl }} style={styles.staffAvatar} />
      ) : (
        <View style={[styles.staffAvatar, styles.avatarFallback]}>
          <Text style={styles.avatarInitial}>{item.displayName?.charAt(0) ?? '?'}</Text>
        </View>
      )}
      <View style={styles.staffInfo}>
        <Text style={styles.staffName} numberOfLines={1}>{item.displayName}</Text>
        <View style={styles.staffMeta}>
          {item.isVerified && (
            <MaterialIcons name="verified" size={14} color="#0B5FFF" style={styles.verifiedIcon} />
          )}
          <View style={[styles.shieldPill, { backgroundColor: SHIELD_RANK_COLORS[item.shieldRank] ?? '#9CA3AF' }]}>
            <MaterialIcons name="shield" size={12} color="#fff" />
            <Text style={styles.shieldText}>{item.shieldCount}</Text>
          </View>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );

  const renderAchievement = ({ item }: { item: SocialPost }) => (
    <View style={styles.achievementCell}>
      <AchievementCard
        post={item}
        variant="compact"
        onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
        onReact={(type) => handleReact(item.id, type)}
        onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
        onShare={() => sharePost(item.id, item.content)}
      />
    </View>
  );

  const gridGap = 8;
  const achievementCellWidth = (width - 32 - gridGap) / 2;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0B5FFF" />
      }
    >
      {/* Cover */}
      <View style={[styles.coverWrap, { height: coverHeight }]}>
        <Pressable
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={18} color="#fff" />
        </Pressable>
        {schoolProfile.coverUrl ? (
          <Image source={{ uri: schoolProfile.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={['#0B5FFF', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          />
        )}
      </View>

      {/* Avatar + header */}
      <View style={[styles.header, { paddingTop: AVATAR_SIZE / 2 + 16 }]}>
        <View style={styles.avatarWrap}>
          {schoolProfile.avatarUrl ? (
            <Image source={{ uri: schoolProfile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{schoolProfile.displayName?.charAt(0) ?? '?'}</Text>
            </View>
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>{schoolProfile.displayName}</Text>
          {schoolProfile.isVerified && (
            <MaterialIcons name="verified" size={22} color="#0B5FFF" style={styles.verifiedBadge} />
          )}
        </View>
        <View style={styles.followRow}>
          <Text style={styles.followerCount}>
            {(t('community.school.followersCount') as string).replace('{count}', String(schoolProfile.followerCount))}
          </Text>
          {currentProfile && schoolProfile.id !== currentProfile.id && (
            <FollowButton
              targetProfileId={schoolProfile.id}
              initialStatus={followStatus}
              onStatusChange={(s) => {
                setFollowStatus(s);
                setSchoolProfile((p) => p ? { ...p, followerCount: p.followerCount + (s === 'following' ? 1 : -1) } : p);
              }}
              size="small"
            />
          )}
        </View>
      </View>

      {/* Bio */}
      {schoolProfile.bio ? (
        <View style={styles.bioWrap}>
          <Text
            style={styles.bio}
            numberOfLines={bioExpanded ? undefined : 3}
            onPress={() => setBioExpanded(!bioExpanded)}
          >
            {schoolProfile.bio}
          </Text>
          {schoolProfile.bio.length > 80 && (
            <Pressable onPress={() => setBioExpanded(!bioExpanded)}>
              <Text style={styles.seeMore}>
                {bioExpanded
                  ? (t('community.school.seeLess') as string)
                  : (t('community.school.seeMore') as string)}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{schoolProfile.postCount} {(t('community.creator.posts') as string) || 'Posts'}</Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.statText}>
          {(t('community.school.followersCount') as string).replace('{count}', String(schoolProfile.followerCount))}
        </Text>
        <Text style={styles.statDot}>·</Text>
        <Text style={styles.statText}>
          {(t('community.school.staffCount') as string).replace('{count}', String(staff.length))}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t(tab.labelKey as never) as string}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.tabIndicator} />

      {/* Tab content */}
      {selectedTab === 'announcements' && (
        <View style={styles.tabContent}>
          {!tabDataLoaded.announcements ? (
            <ActivityIndicator size="small" color="#0B5FFF" style={{ paddingVertical: 24 }} />
          ) : announcements.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="campaign" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('community.school.noAnnouncements') as string}</Text>
            </View>
          ) : (
            announcements.map((item) => (
              <View key={item.id} style={styles.announcementItem}>
                {item.isPinned && (
                  <MaterialIcons name="push-pin" size={16} color="#F59E0B" style={styles.pinIcon} />
                )}
                {renderAnnouncement({ item })}
              </View>
            ))
          )}
        </View>
      )}

      {selectedTab === 'staff' && (
        <View style={styles.tabContent}>
          {!tabDataLoaded.staff ? (
            <ActivityIndicator size="small" color="#0B5FFF" style={{ paddingVertical: 24 }} />
          ) : staff.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="people" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('community.school.noStaff') as string}</Text>
            </View>
          ) : (
            staff.map((item) => (
              <View key={item.id}>{renderStaffRow({ item })}</View>
            ))
          )}
        </View>
      )}

      {selectedTab === 'achievements' && (
        <View style={styles.tabContent}>
          {!tabDataLoaded.achievements ? (
            <ActivityIndicator size="small" color="#0B5FFF" style={{ paddingVertical: 24 }} />
          ) : achievements.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="emoji-events" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>{t('community.school.noAchievements') as string}</Text>
            </View>
          ) : (
            <View style={[styles.achievementsGrid, { gap: gridGap }]}>
              {achievements.map((item) => (
                <View key={item.id} style={[styles.achievementCell, { width: achievementCellWidth }]}>
                  <AchievementCard
                    post={item}
                    variant="compact"
                    onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                    onReact={(type) => handleReact(item.id, type)}
                    onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
                    onShare={() => sharePost(item.id, item.content)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  backBtnText: {
    fontSize: 16,
    color: '#0B5FFF',
    fontWeight: '600',
  },
  coverWrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  avatarWrap: {
    position: 'absolute',
    left: 16,
    top: -AVATAR_SIZE / 2,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#6B7280',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  verifiedBadge: {
    marginLeft: 2,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followerCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  bioWrap: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  seeMore: {
    fontSize: 14,
    color: '#0B5FFF',
    fontWeight: '500',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statDot: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0B5FFF',
    marginBottom: -1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0B5FFF',
    fontWeight: '700',
  },
  tabIndicator: {
    height: 0,
  },
  tabContent: {
    padding: 16,
    paddingTop: 16,
  },
  announcementItem: {
    position: 'relative',
    marginBottom: 8,
  },
  pinIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  staffAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  staffMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  verifiedIcon: {
    marginRight: 2,
  },
  shieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  shieldText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementCell: {
    marginBottom: 8,
  },
});
