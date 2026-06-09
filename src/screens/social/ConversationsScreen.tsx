import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import {
  getConversations,
  type ConversationPreview,
} from '../../services/social/conversations.service';
import { ConversationListItem } from '../../components/social';
import { socialSupabase } from '../../services/social/api.client';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList>;

export default function ConversationsScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = await ensureSocialProfile();
    if (!p) {
      setLoading(false);
      return;
    }
    setProfileId(p.id);
    try {
      const data = await getConversations(p.id);
      setConversations(data);
    } catch (err) {
      console.error('Conversations load error', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!profileId || conversations.length === 0) return;

    const channel = socialSupabase.channel('conversations-list');
    conversations.forEach((conv) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_conversations',
          filter: `id=eq.${conv.id}`,
        },
        () => load(),
      );
    });
    channel.subscribe();

    return () => {
      socialSupabase.removeChannel(channel);
    };
  }, [profileId, conversations, load]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleConversationPress = (conversationId: string) => {
    navigation.navigate('Chat', { conversationId });
  };

  const handleNewMessagePress = () => {
    Alert.alert('Tin nhắn mới', 'Chọn loại:', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Tin nhắn', onPress: () => navigation.navigate('NewMessage') },
      { text: 'Tạo nhóm', onPress: () => navigation.navigate('NewGroup') },
    ]);
  };

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>{t('common.loading') as string}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>
          {t('community.messages.tab') as string}
        </Text>
        <Pressable style={styles.newBtn} onPress={handleNewMessagePress}>
          <MaterialIcons name="create" size={24} color="#0B5FFF" />
        </Pressable>
      </View>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="chat-bubble-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            {t('community.messages.empty') as string}
          </Text>
          <Pressable style={styles.emptyBtn} onPress={handleNewMessagePress}>
            <Text style={styles.emptyBtnText}>
              {t('community.messages.tab') as string}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationListItem
              conversation={item}
              onPress={() => handleConversationPress(item.id)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0B5FFF"
            />
          }
        />
      )}
    </View>
  );
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
  loadingText: {
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  newBtn: {
    padding: 8,
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
    textAlign: 'center',
    marginTop: 16,
  },
  emptyBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
