import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation, CommonActions } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { getGroupParticipants, leaveConversation } from '../../services/social/conversations.service';
import { socialSupabase } from '../../services/social/api.client';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type RouteProps = RouteProp<SocialStackParamList, 'GroupChatInfo'>;
type NavProp = StackNavigationProp<SocialStackParamList, 'GroupChatInfo'>;

interface Participant {
  id: string;
  displayName: string;
  avatarUrl?: string;
  username: string;
  role: string;
}

export default function GroupChatInfoScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavProp>();
  const { conversationId } = route.params ?? {};

  const [groupTitle, setGroupTitle] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!conversationId) return;
    const p = await ensureSocialProfile();
    setMyProfileId(p?.id ?? null);
    try {
      const [parts, conv] = await Promise.all([
        getGroupParticipants(conversationId),
        socialSupabase
          .from('social_conversations')
          .select('title')
          .eq('id', conversationId)
          .single(),
      ]);
      setParticipants(parts);
      setGroupTitle((conv.data?.title as string) ?? 'Nhóm');
    } catch (err) {
      console.error('Group info load error', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLeave = useCallback(() => {
    if (!myProfileId || !conversationId) return;
    Alert.alert(
      'Rời nhóm',
      'Bạn có chắc muốn rời nhóm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Rời nhóm',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveConversation(conversationId, myProfileId);
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'SocialTabs' }],
                }),
              );
            } catch (err) {
              console.error('Leave error', err);
            }
          },
        },
      ],
    );
  }, [conversationId, myProfileId, navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{groupTitle}</Text>
        <Text style={styles.subtitle}>{participants.length} thành viên</Text>
      </View>
      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Image
              source={{ uri: item.avatarUrl ?? 'https://picsum.photos/48' }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.displayName}>{item.displayName}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            {item.role === 'admin' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Admin</Text>
              </View>
            )}
          </View>
        )}
      />
      <Pressable style={styles.leaveBtn} onPress={handleLeave}>
        <MaterialIcons name="exit-to-app" size={20} color="#EF4444" />
        <Text style={styles.leaveBtnText}>Rời nhóm</Text>
      </Pressable>
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
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0B5FFF',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  leaveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});
