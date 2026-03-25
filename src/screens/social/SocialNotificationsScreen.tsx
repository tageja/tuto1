import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../../services/social/notifications.service';
import NotificationItem from '../../components/social/NotificationItem';
import type { SocialNotification } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import { useLanguage } from '../../contexts/LanguageContext';

type NavProp = StackNavigationProp<SocialStackParamList, 'SocialNotifications'>;

export default function SocialNotificationsScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (append = false) => {
    const limit = 30;
    const cursor = append && notifications.length > 0
      ? notifications[notifications.length - 1]?.createdAt
      : undefined;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const { notifications: items, hasMore: more } = await getNotifications(limit, cursor);
      setNotifications(append ? (prev) => [...prev, ...items] : items);
      setHasMore(more);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [notifications.length]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const run = async () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/233de770-f886-4fc3-bb3a-6a4bde299f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b00b1'},body:JSON.stringify({sessionId:'0b00b1',location:'SocialNotificationsScreen.tsx:run-start',message:'useFocusEffect run started',data:{loadingState:true},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
          const { notifications: items, hasMore: more } = await getNotifications(30);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/233de770-f886-4fc3-bb3a-6a4bde299f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b00b1'},body:JSON.stringify({sessionId:'0b00b1',location:'SocialNotificationsScreen.tsx:run-after-fetch',message:'getNotifications returned',data:{itemCount:items.length,more,cancelled},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
          if (!cancelled) {
            setNotifications(items);
            setHasMore(more);
          }
          markAllAsRead().catch(() => {});
        } catch (err) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/233de770-f886-4fc3-bb3a-6a4bde299f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b00b1'},body:JSON.stringify({sessionId:'0b00b1',location:'SocialNotificationsScreen.tsx:run-error',message:'getNotifications threw',data:{err:String(err)},hypothesisId:'B',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        } finally {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/233de770-f886-4fc3-bb3a-6a4bde299f3d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b00b1'},body:JSON.stringify({sessionId:'0b00b1',location:'SocialNotificationsScreen.tsx:run-finally',message:'run finished — loading NOT set false here (hypothesis A)',data:{cancelled},hypothesisId:'A',timestamp:Date.now()})}).catch(()=>{});
          // #endregion
        }
      };
      run();
      return () => { cancelled = true; };
    }, [])
  );

  const handleNotificationPress = useCallback(
    (n: SocialNotification) => {
      if (n.type === 'reel_like' && n.reelId) {
        navigation.navigate('ReelDetail', { reelId: n.reelId });
      } else if (n.type === 'follow' && n.actor?.id) {
        navigation.navigate('SocialProfile', { userId: n.actor.id });
      } else if ((n.type === 'like' || n.type === 'applaud' || n.type === 'curious' || n.type === 'comment' || n.type === 'achievement' || n.type === 'level_up') && n.postId) {
        navigation.navigate('PostDetail', { postId: n.postId });
      }
    },
    [navigation]
  );

  const handleMarkRead = useCallback(async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const renderItem = ({ item }: { item: SocialNotification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onMarkRead={() => handleMarkRead(item.id)}
    />
  );

  const renderEmpty = () =>
    !loading ? (
      <View style={styles.empty}>
        <MaterialIcons name="notifications-none" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>
          {t('community.notifications.emptyTitle') as string}
        </Text>
        <Text style={styles.emptySubtitle}>
          {t('community.notifications.emptySubtitle') as string}
        </Text>
      </View>
    ) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t('community.notifications.title') as string}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0B5FFF" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0B5FFF"
            />
          }
          onEndReached={() => {
            if (hasMore && !loadingMore) load(true);
          }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerRight: {
    width: 32,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
