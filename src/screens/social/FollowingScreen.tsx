import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { getFollowingProfiles } from '../../services/social/follows.service';
import { ensureSocialProfile } from '../../services/social/auth.service';
import UserListItem from '../../components/social/UserListItem';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SocialProfile } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'Following'>;

export default function FollowingScreen() {
  const route = useRoute<RouteProps>();
  const { userId, displayName } = route.params;
  const { t } = useLanguage();

  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | undefined>();

  useEffect(() => {
    ensureSocialProfile().then((p) => setCurrentProfileId(p?.id)).catch(console.warn);
  }, []);

  useEffect(() => {
    setLoading(true);
    getFollowingProfiles(userId, 0)
      .then(setProfiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const filtered = profiles.filter(
    (p) =>
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  const title = `${t('community.following.title') as string} ${profiles.length}`;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('community.search.placeholder') as string}
          placeholderTextColor="#9CA3AF"
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            profile={item}
            isOwnProfile={item.id === currentProfileId}
            currentUserId={currentProfileId}
          />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.count}>{title}</Text>
          </View>
        }
      />
    </View>
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
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});
