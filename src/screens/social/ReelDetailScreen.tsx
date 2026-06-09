import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import {
  getReelById,
  getReelsByAuthorId,
  toggleReelLike,
} from '../../services/social/reels.service';
import ReelItem from '../../components/social/ReelItem';
import type { Reel } from '../../services/social/reels.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'ReelDetail'>;
type NavProp = StackNavigationProp<SocialStackParamList, 'ReelDetail'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReelDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { reelId, authorId, initialIndex = 0 } = route.params ?? {};

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string } | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<Reel>>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  const load = useCallback(async () => {
    try {
      const p = await ensureSocialProfile();
      setProfile(p ?? null);

      if (authorId) {
        // Swipeable mode: load all reels from this author
        const list = await getReelsByAuthorId(authorId, 50, p?.id);
        setReels(list);
      } else {
        // Single-reel mode (tapped from main feed which already manages its own list)
        const r = await getReelById(reelId, p?.id);
        if (r) setReels([r]);
      }
    } catch (err) {
      console.error('ReelDetail load error', err);
    } finally {
      setLoading(false);
    }
  }, [reelId, authorId]);

  useEffect(() => {
    load();
  }, [load]);

  // Scroll to the initial reel after data loads
  useEffect(() => {
    if (!loading && reels.length > 0 && initialIndex > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      });
    }
  }, [loading]);

  const handleLike = useCallback(
    async (reel: Reel) => {
      if (!profile) return;
      setReels((prev) =>
        prev.map((r) =>
          r.id === reel.id
            ? { ...r, isLiked: !r.isLiked, likeCount: r.likeCount + (r.isLiked ? -1 : 1) }
            : r,
        ),
      );
      try {
        await toggleReelLike(reel.id, profile.id, reel.isLiked);
      } catch {
        setReels((prev) => prev.map((r) => (r.id === reel.id ? reel : r)));
      }
    },
    [profile?.id],
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const idx = viewableItems[0]?.index ?? 0;
      if (idx != null) setActiveIndex(idx);
    },
  ).current;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Reel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={28} color="#fff" />
      </Pressable>
      <FlatList
        ref={listRef}
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <ReelItem
            reel={item}
            isActive={index === activeIndex}
            onLike={() => handleLike(item)}
            onComment={() => {}}
            onAuthorPress={() =>
              navigation.navigate('SocialProfile', { userId: item.author.id })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
