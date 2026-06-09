import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import {
  getCreatorStats,
  incrementViewCount,
  type CreatorStats,
  type PostSummary,
  type ReelSummary,
} from '../../services/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import { getXpProgressForLevel } from '../../components/social/AchievementBadge';

type NavProp = StackNavigationProp<SocialStackParamList>;

const CARD_WIDTH = 140;
const CARD_GAP = 12;
const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#9CA3AF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

export default function CreatorDashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<{ id: string; role: string } | null>(null);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const p = await ensureSocialProfile();
    if (!p) return;
    setProfile(p);
    try {
      const s = await getCreatorStats(p.id);
      setStats(s);
    } catch (err) {
      console.error('Creator stats load error', err);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handlePostPress = useCallback(
    (postId: string) => {
      incrementViewCount('post', postId);
      navigation.navigate('PostDetail', { postId });
    },
    [navigation],
  );

  const handleReelPress = useCallback(
    (reelId: string) => {
      incrementViewCount('reel', reelId);
      navigation.navigate('ReelDetail', { reelId });
    },
    [navigation],
  );

  if (loading && !stats) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (!profile || !stats) {
    return null;
  }

  const { current, needed, level } = getXpProgressForLevel(stats.xp);
  const progress = needed > 0 ? current / needed : 1;
  const showStreak = stats.streakCount >= 3;
  const isTeacher = profile.role === 'teacher';

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F59E0B" />
      }
    >
      {/* Header: XP progress + level + streak */}
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.levelPill}>
            <MaterialIcons name="emoji-events" size={18} color="#fff" />
            <Text style={styles.levelText}>
              {t('community.creator.level') as string} {level}
            </Text>
          </View>
          {showStreak && (
            <View style={styles.streakPill}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>
                {stats.streakCount} {t('community.creator.streak') as string}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>{stats.xp} XP</Text>
          {needed > 0 && (
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatTile label={t('community.creator.posts') as string} value={stats.totalPosts} />
        <StatTile label={t('community.creator.reels') as string} value={stats.totalReels} />
        <StatTile label={t('community.creator.views') as string} value={stats.totalViews} />
        <StatTile label={t('community.creator.likes') as string} value={stats.totalLikes} />
      </View>

      {/* Top posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('community.creator.topPosts') as string}</Text>
        {stats.topPosts.length === 0 ? (
          <Text style={styles.emptyText}>{t('community.creator.noPosts') as string}</Text>
        ) : (
          <FlatList
            data={stats.topPosts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TopPostCard post={item} onPress={() => handlePostPress(item.id)} />
            )}
          />
        )}
      </View>

      {/* Top reels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('community.creator.topReels') as string}</Text>
        {stats.topReels.length === 0 ? (
          <Text style={styles.emptyText}>{t('community.creator.noReels') as string}</Text>
        ) : (
          <FlatList
            data={stats.topReels}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <TopReelCard reel={item} onPress={() => handleReelPress(item.id)} />
            )}
          />
        )}
      </View>

      {/* Shield section (teachers only) */}
      {isTeacher && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('community.creator.shieldSection') as string}</Text>
          <View style={styles.shieldRow}>
            <MaterialIcons name="shield" size={28} color={SHIELD_RANK_COLORS[stats.shieldRank] ?? SHIELD_RANK_COLORS.beginner} />
            <Text style={styles.shieldCount}>{stats.shieldCount}</Text>
            <View
              style={[
                styles.rankPill,
                { backgroundColor: SHIELD_RANK_COLORS[stats.shieldRank] ?? SHIELD_RANK_COLORS.beginner },
              ]}
            >
              <Text style={styles.rankText}>{stats.shieldRank}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard CTA — for all roles */}
      <View style={styles.section}>
        <Pressable
          style={styles.leaderboardCta}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <MaterialIcons name="emoji-events" size={22} color="#F59E0B" />
          <Text style={styles.leaderboardCtaText}>
            {(t('community.leaderboard.cta') as string)} →
          </Text>
        </Pressable>
      </View>

      <View style={{ height: insets.bottom + 24 }} />
    </ScrollView>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{formatCount(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TopPostCard({ post, onPress }: { post: PostSummary; onPress: () => void }) {
  const thumbUri = post.media_urls?.[0];
  return (
    <Pressable style={styles.topCard} onPress={onPress}>
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <MaterialIcons name="article" size={32} color="#9CA3AF" />
        </View>
      )}
      <Text style={styles.cardContent} numberOfLines={2}>
        {post.content || '—'}
      </Text>
      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="visibility" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{post.view_count}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="favorite" size={14} color="#6B7280" />
          <Text style={styles.metaText}>{post.likes_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function TopReelCard({ reel, onPress }: { reel: ReelSummary; onPress: () => void }) {
  const thumbUri = reel.thumbnail_url ?? reel.video_url;
  return (
    <Pressable style={styles.topCard} onPress={onPress}>
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
          <MaterialIcons name="videocam" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.playOverlay}>
        <MaterialIcons name="play-circle-filled" size={28} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={[styles.cardMeta, styles.reelCardMeta]}>
        <View style={styles.metaItem}>
          <MaterialIcons name="visibility" size={14} color="#fff" />
          <Text style={[styles.metaText, styles.metaTextLight]}>{reel.view_count}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="favorite" size={14} color="#fff" />
          <Text style={[styles.metaText, styles.metaTextLight]}>{reel.likes_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
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
  header: {
    padding: 20,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  xpRow: {
    gap: 8,
  },
  xpLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -8,
    borderRadius: 16,
    padding: 16,
    gap: 0,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  horizontalList: {
    gap: CARD_GAP,
    paddingRight: 16,
  },
  topCard: {
    width: CARD_WIDTH,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    fontSize: 12,
    color: '#374151',
    marginTop: 6,
    maxHeight: 32,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    position: 'absolute',
    bottom: 4,
    left: 0,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaTextLight: {
    color: '#fff',
  },
  reelCardMeta: {
    position: 'absolute',
    bottom: 6,
    left: 0,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  shieldCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rankPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  leaderboardCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  leaderboardCtaText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F59E0B',
  },
});
