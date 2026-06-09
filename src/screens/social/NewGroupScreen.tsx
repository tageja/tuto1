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
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { createGroupConversation } from '../../services/social/conversations.service';
import { socialSupabase } from '../../services/social/api.client';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'NewGroup'>;

interface ProfileResult {
  id: string;
  display_name: string;
  avatar_url?: string;
  username: string;
}

export default function NewGroupScreen() {
  const navigation = useNavigation<NavProp>();
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [selected, setSelected] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
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
      setResults(((data ?? []) as ProfileResult[]).filter((p) => p.id !== myProfileId));
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

  const toggleSelect = useCallback((profile: ProfileResult) => {
    setSelected((prev) => {
      const exists = prev.some((p) => p.id === profile.id);
      if (exists) return prev.filter((p) => p.id !== profile.id);
      return [...prev, profile];
    });
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleCreate = useCallback(async () => {
    if (!myProfileId || !title.trim() || selected.length < 2 || submitting) return;
    setSubmitting(true);
    try {
      const convId = await createGroupConversation(
        myProfileId,
        selected.map((s) => s.id),
        title.trim(),
      );
      navigation.replace('Chat', { conversationId: convId });
    } catch (err) {
      console.error('Create group error', err);
    } finally {
      setSubmitting(false);
    }
  }, [myProfileId, title, selected, submitting, navigation]);

  const canCreate =
    title.trim().length > 0 && selected.length >= 1 && !submitting;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Tên nhóm"
          placeholderTextColor="#888"
        />
        {selected.length === 0 && title.trim().length > 0 && (
          <Text style={styles.hint}>Chọn ít nhất 1 thành viên</Text>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.selectedScroll}
        contentContainerStyle={styles.selectedContent}
      >
        {selected.map((p) => (
          <View key={p.id} style={styles.selectedChip}>
            <Image
              source={{ uri: p.avatar_url ?? 'https://picsum.photos/48' }}
              style={styles.selectedAvatar}
            />
            <Pressable
              style={styles.removeChip}
              onPress={() => removeSelected(p.id)}
            >
              <MaterialIcons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
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
        renderItem={({ item }) => {
          const isSelected = selected.some((s) => s.id === item.id);
          return (
            <Pressable
              style={styles.row}
              onPress={() => toggleSelect(item)}
            >
              <Image
                source={{ uri: item.avatar_url ?? 'https://picsum.photos/48' }}
                style={styles.avatar}
              />
              <View style={styles.info}>
                <Text style={styles.displayName}>{item.display_name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              {isSelected && (
                <MaterialIcons name="check-circle" size={24} color="#0B5FFF" />
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          query.trim() && !searching ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
            </View>
          ) : null
        }
      />
      <Pressable
        style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
        onPress={handleCreate}
        disabled={!canCreate}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.createBtnText}>Tạo</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleRow: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleInput: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  selectedScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedContent: {
    padding: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChip: {
    position: 'relative',
  },
  selectedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  removeChip: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
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
  createBtn: {
    margin: 16,
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
