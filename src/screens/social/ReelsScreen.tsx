import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { incrementViewCount } from '../../services/social/analytics.service';
import { getReelsFeed, toggleReelLike } from '../../services/social/reels.service';
import ReelItem from '../../components/social/ReelItem';
import type { Reel } from '../../services/social/reels.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SKELETON_COUNT = 3;

export default function ReelsScreen() {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();
  const tabBarHeight = useBottomTabBarHeight();
  const { t } = useLanguage();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<{ id: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 70,
  }).current;

  const loadReels = useCallback(async (reset = false) => {
    if (!profile) return;
    try {
      const data = await getReelsFeed(20, profile.id);
      setReels(data);
    } catch (err) {
      console.error('Reels load error', err);
    }
  }, [profile?.id]);

  const init = useCallback(async () => {
    const p = await ensureSocialProfile();
    setProfile(p ?? null);
    if (p) {
      setLoading(true);
      try {
        const data = await getReelsFeed(20, p.id);
        setReels(data);
      } catch (err) {
        console.error('Reels init error', err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, []);

  // Reload reels whenever the screen comes back into focus (e.g. after creating one)
  useEffect(() => {
    if (isFocused && profile) {
      loadReels(true);
    }
  }, [isFocused]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReels(true);
    setRefreshing(false);
  }, [loadReels]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null; item: Reel }[] }) => {
      const idx = viewableItems[0]?.index ?? 0;
      setActiveIndex(idx);
      viewableItems.forEach((v) => {
        if (v.item?.id) incrementViewCount('reel', v.item.id);
      });
    }
  ).current;

  const handleLike = useCallback(
    async (reel: Reel) => {
      if (!profile) return;
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id
            ? {
                ...r,
                isLiked: !r.isLiked,
                likeCount: r.likeCount + (r.isLiked ? -1 : 1),
              }
            : r,
        ),
      );
      try {
        await toggleReelLike(reel.id, profile.id, reel.isLiked);
      } catch (err) {
        setReels((prev) =>
          prev.map((r) =>
            r.id === reel.id
              ? { ...r, isLiked: reel.isLiked, likeCount: reel.likeCount }
              : r,
          ),
        );
      }
    },
    [profile?.id],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelItem
        reel={item}
        isActive={isFocused && index === activeIndex}
        onLike={() => handleLike(item)}
        onComment={() => {}} // TODO Phase 2: open comment bottom sheet
        bottomOffset={tabBarHeight}
        onAuthorPress={() =>
          navigation.navigate('SocialProfile', { userId: item.author.id })
        }
      />
    ),
    [activeIndex, handleLike, navigation, isFocused, tabBarHeight],
  );

  if (loading && reels.length === 0) {
    return (
      <View style={styles.container}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.skeleton,
              { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
            ]}
          />
        ))}
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateReel')}
        >
          <MaterialIcons name="add-circle" size={28} color="#0B5FFF" />
        </Pressable>
        <View style={styles.empty}>
          <MaterialIcons name="videocam-off" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {t('community.reels.empty') as string}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreateReel')}
      >
        <MaterialIcons name="add-circle" size={28} color="#0B5FFF" />
      </Pressable>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0B5FFF"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  createBtn: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
  },
  skeleton: {
    backgroundColor: '#2a2a2a',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
});
