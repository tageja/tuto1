import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { searchUsers, searchPosts } from '../../services/social/search.service';
import UserListItem from '../../components/social/UserListItem';
import PostCard from '../../components/social/PostCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import type { SocialProfile, SocialPost } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList>;

type SearchTab = 'users' | 'posts';

const TRENDING_SUBJECTS = ['Toán', 'Tiếng Anh', 'Vật lý', 'IELTS', 'STEM'];

export default function SocialSearchScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('users');
  const [users, setUsers] = useState<SocialProfile[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | undefined>();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    ensureSocialProfile().then((p) => setCurrentProfileId(p?.id)).catch(console.warn);
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const search = useCallback(async () => {
    if (!debouncedQuery) {
      setUsers([]);
      setPosts([]);
      return;
    }
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        searchUsers(debouncedQuery),
        searchPosts(debouncedQuery),
      ]);
      setUsers(u);
      setPosts(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  React.useEffect(() => {
    search();
  }, [search]);

  const hasQuery = debouncedQuery.length > 0;
  const showEmpty = !loading && hasQuery && users.length === 0 && posts.length === 0;
  const showHint = !hasQuery;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={24} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('community.search.placeholder') as string}
          placeholderTextColor="#9CA3AF"
          autoFocus
          returnKeyType="search"
        />
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            {t('community.search.tab_users') as string}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
            {t('community.search.tab_posts') as string}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B5FFF" />
        </View>
      ) : showHint ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>
            {t('community.search.empty_hint') as string}
          </Text>
          <View style={styles.trending}>
            {TRENDING_SUBJECTS.map((s) => (
              <Pressable
                key={s}
                style={styles.trendChip}
                onPress={() => setQuery(s)}
              >
                <Text style={styles.trendText}>#{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : showEmpty ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('community.feed.emptyTitle') as string}</Text>
        </View>
      ) : activeTab === 'users' ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              profile={item}
              isOwnProfile={item.id === currentProfileId}
              currentUserId={currentProfileId}
            />
          )}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.postList}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={currentProfileId}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onReact={() => {}}
              onComment={() => navigation.navigate('PostDetail', { postId: item.id })}
            />
          )}
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0B5FFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0B5FFF',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintWrap: {
    padding: 24,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  trending: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  trendText: {
    fontSize: 14,
    color: '#0B5FFF',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  postList: {
    paddingBottom: 24,
  },
});
