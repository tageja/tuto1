import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { startConversation } from '../../services/social/conversations.service';
import { socialSupabase } from '../../services/social/api.client';

import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'NewMessage'>;

interface ProfileResult {
  id: string;
  display_name: string;
  avatar_url?: string;
  username: string;
}

export default function NewMessageScreen() {
  const navigation = useNavigation<NavProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    ensureSocialProfile().then((p) => setMyProfileId(p?.id ?? null));
  }, []);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data, error } = await socialSupabase
        .from('social_profiles')
        .select('id, display_name, avatar_url, username')
        .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(20);

      if (error) throw error;
      setResults((data ?? []) as ProfileResult[]);
    } catch (err) {
      console.error('Search error', err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const handleSelect = useCallback(
    async (profile: ProfileResult) => {
      if (!myProfileId) return;
      try {
        const convId = await startConversation(myProfileId, profile.id);
        navigation.navigate('Chat', { conversationId: convId });
      } catch (err) {
        console.error('Start conversation error', err);
      }
    },
    [myProfileId, navigation],
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm theo tên hoặc @username"
          placeholderTextColor="#888"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searching && (
          <ActivityIndicator size="small" color="#0B5FFF" style={styles.spinner} />
        )}
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => handleSelect(item)}
          >
            <Image
              source={{ uri: item.avatar_url ?? 'https://picsum.photos/48' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          query.trim() && !searching ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            </View>
          ) : null
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  spinner: {
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
