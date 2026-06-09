import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTeacherLeaderboard, type LeaderboardEntry } from '../../services/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import SubjectChip from '../../components/social/SubjectChip';
import RoleBadge from '../../components/social/RoleBadge';

type NavProp = StackNavigationProp<SocialStackParamList>;

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#6B7280',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // gold, silver, bronze
const PAGE_SIZE = 20;

export default function LeaderboardScreen() {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);

  const load = useCallback(async (reset = false) => {
    const off = reset ? 0 : offsetRef.current;
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const data = await getTeacherLeaderboard(PAGE_SIZE, off);
      setHasMore(data.length === PAGE_SIZE);

      if (reset) {
        setEntries(data);
        offsetRef.current = PAGE_SIZE;
      } else {
        setEntries((prev) => [...prev, ...data]);
        offsetRef.current = off + PAGE_SIZE;
      }
    } catch (err) {
      console.error('Leaderboard load error', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    offsetRef.current = 0;
    await load(true);
    setRefreshing(false);
  }, [load]);

  const handleEndReached = useCallback(() => {
    if (!loadingMore && hasMore && entries.length > 0) {
      load(false);
    }
  }, [loadingMore, hasMore, entries.length, load]);

  const handlePress = useCallback(
    (entry: LeaderboardEntry) => {
      navigation.navigate('SocialProfile', { userId: entry.id });
    },
    [navigation],
  );

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (loading && entries.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('community.leaderboard.title') as string}</Text>
          <Text style={styles.subtitle}>{t('community.leaderboard.subtitle') as string}</Text>
        </View>
        <View style={styles.empty}>
          <MaterialIcons name="shield" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>{t('community.leaderboard.empty') as string}</Text>
        </View>
      </View>
    );
  }

  const renderPodiumItem = (entry: LeaderboardEntry, rank: number) => (
    <Pressable
      key={entry.id}
      style={styles.podiumCard}
      onPress={() => handlePress(entry)}
    >
      <View
        style={[
          styles.podiumAvatarWrap,
          { borderColor: PODIUM_COLORS[rank - 1], borderWidth: 3 },
        ]}
      >
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>
              {entry.displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.podiumRank}>#{rank}</Text>
      <Text style={styles.podiumName} numberOfLines={1}>
        {entry.displayName}
      </Text>
      <Text style={styles.podiumShields}>{entry.shieldCount} shields</Text>
      <View
        style={[
          styles.rankPill,
          { backgroundColor: SHIELD_RANK_COLORS[entry.shieldRank] ?? SHIELD_RANK_COLORS.beginner },
        ]}
      >
        <Text style={styles.rankPillText}>{entry.shieldRank}</Text>
      </View>
    </Pressable>
  );

  const renderRow = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const rank = index + 4;
    return (
      <Pressable style={styles.row} onPress={() => handlePress(item)}>
        <Text style={styles.rowRank}>{rank}</Text>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.rowAvatar} />
        ) : (
          <View style={[styles.rowAvatar, styles.avatarFallback]}>
            <Text style={styles.rowAvatarText}>
              {item.displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={styles.rowContent}>
          <View style={styles.rowNameRow}>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.displayName}
            </Text>
            <RoleBadge role="teacher" isVerified={item.isVerified} compact />
          </View>
          {item.subjects.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.subjectsRow}
              contentContainerStyle={styles.subjectsContent}
            >
              {item.subjects.slice(0, 3).map((s) => (
                <SubjectChip key={s} label={s} />
              ))}
            </ScrollView>
          )}
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowShieldCount}>{item.shieldCount}</Text>
          <View
            style={[
              styles.rowRankPill,
              { backgroundColor: SHIELD_RANK_COLORS[item.shieldRank] ?? SHIELD_RANK_COLORS.beginner },
            ]}
          >
            <Text style={styles.rankPillText}>{item.shieldRank}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('community.leaderboard.title') as string}</Text>
        <Text style={styles.subtitle}>{t('community.leaderboard.subtitle') as string}</Text>
      </View>

      {/* Top 3 podium */}
      <View style={styles.podium}>
        {top3[1] && renderPodiumItem(top3[1], 2)}
        {top3[0] && renderPodiumItem(top3[0], 1)}
        {top3[2] && renderPodiumItem(top3[2], 3)}
      </View>

      {/* Rest of list */}
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#F59E0B" />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="small" color="#F59E0B" style={{ paddingVertical: 16 }} />
          ) : null
        }
      />
    </View>
  );
}

const AVATAR_SIZE = 56;
const ROW_AVATAR = 44;

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
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
  },
  podiumCard: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 120,
  },
  podiumAvatarWrap: {
    borderRadius: AVATAR_SIZE / 2 + 4,
    padding: 4,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6B7280',
  },
  podiumRank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  podiumShields: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rankPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  rankPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  rowRank: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    width: 24,
  },
  rowAvatar: {
    width: ROW_AVATAR,
    height: ROW_AVATAR,
    borderRadius: ROW_AVATAR / 2,
  },
  rowAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  rowContent: {
    flex: 1,
  },
  rowNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subjectsRow: {
    marginTop: 4,
  },
  subjectsContent: {
    gap: 4,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowShieldCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  rowRankPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
  },
});
