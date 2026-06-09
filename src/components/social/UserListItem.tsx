import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import RoleBadge from './RoleBadge';
import FollowButton from './FollowButton';
import type { SocialProfile } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';

const ROW_HEIGHT = 72;

interface Props {
  profile: SocialProfile;
  isOwnProfile?: boolean;
  currentUserId?: string;
}

export default function UserListItem({
  profile,
  isOwnProfile = false,
  currentUserId,
}: Props) {
  const navigation = useNavigation<StackNavigationProp<SocialStackParamList, 'SocialProfile'>>();

  const handlePress = () => {
    navigation.navigate('SocialProfile', { userId: profile.id });
  };

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      {profile.avatarUrl ? (
        <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>
            {profile.displayName?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {profile.displayName}
        </Text>
        <View style={styles.meta}>
          <RoleBadge role={profile.role} isVerified={profile.isVerified} compact />
          {profile.schoolName ? (
            <Text style={styles.school} numberOfLines={1}>
              {profile.schoolName}
            </Text>
          ) : null}
        </View>
      </View>
      {!isOwnProfile && currentUserId !== profile.id ? (
        <FollowButton
          targetProfileId={profile.id}
          size="small"
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: ROW_HEIGHT,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width:        48,
    height:       48,
    borderRadius: 24,
    marginRight:  12,
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   18,
    fontWeight:  '600',
    color:       '#6B7280',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize:   16,
    fontWeight:  '600',
    color:       '#111827',
  },
  meta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     4,
  },
  school: {
    fontSize:   12,
    color:       '#6B7280',
    flex: 1,
  },
});
