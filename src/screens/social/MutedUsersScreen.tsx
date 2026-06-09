import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { getMutedUsers, unmuteUser } from '../../services/social/moderation.service';

export default function MutedUsersScreen() {
  const { t } = useLanguage();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const profile = await ensureSocialProfile();
      if (!profile) return;
      setProfileId(profile.id);
      const list = await getMutedUsers(profile.id);
      setUsers(list);
    } catch (err) {
      console.error('Failed to load muted users', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleUnmute = useCallback(
    async (mutedId: string) => {
      if (!profileId) return;
      try {
        await unmuteUser(profileId, mutedId);
        setUsers((prev) => prev.filter((u) => u.id !== mutedId));
      } catch (err) {
        console.error('Failed to unmute', err);
      }
    },
    [profileId]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="volume-off" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>{t('community.muted.empty')}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0B5FFF" />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {(item.display_name || item.username || '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.display_name || item.username || 'Unknown'}</Text>
              {item.username && <Text style={styles.username}>@{item.username}</Text>}
            </View>
            <Pressable
              style={styles.unmuteBtn}
              onPress={() => handleUnmute(item.id)}
            >
              <Text style={styles.unmuteText}>{t('community.muted.unmute')}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  avatar: { marginRight: 12 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#6B7280' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  username: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  unmuteBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  unmuteText: { fontSize: 14, color: '#0B5FFF', fontWeight: '500' },
});
