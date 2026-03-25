import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import RoleBadge from './RoleBadge';
import SubjectChip from './SubjectChip';
import FollowButton from './FollowButton';
import type { SocialProfile } from '../../types/social';
import type { UserRole } from '../../types/social';

const COVER_HEIGHT = 140;
const AVATAR_SIZE = 88;

const SHIELD_RANK_COLORS: Record<string, string> = {
  beginner: '#9CA3AF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  elite: '#FF6B35',
};

const ROLE_GRADIENTS: Record<string, [string, string]> = {
  student:    ['#0B5FFF', '#6366F1'],
  teacher:    ['#6366F1', '#8B5CF6'],
  parent:     ['#10B981', '#0B5FFF'],
  schoolAdmin: ['#F59E0B', '#F97316'],
  coach:      ['#06B6D4', '#0B5FFF'],
  institute:  ['#EC4899', '#8B5CF6'],
  guest:      ['#9CA3AF', '#6B7280'],
};

interface Props {
  profile: SocialProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onCreatorDashboardPress?: () => void;
  onLeaderboardPress?: () => void;
  onMessagePress?: () => void;
  onNotificationPress?: () => void;
  onSchoolPagePress?: () => void;
  unreadNotificationCount?: number;
  followStatus?: 'following' | 'not_following';
  onFollowStatusChange?: (status: 'following' | 'not_following') => void;
  /** Status-bar height — pass useSafeAreaInsets().top so cover bleeds behind it */
  insetTop?: number;
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  onEdit,
  onCreatorDashboardPress,
  onLeaderboardPress,
  onMessagePress,
  onNotificationPress,
  onSchoolPagePress,
  unreadNotificationCount = 0,
  followStatus = 'not_following',
  onFollowStatusChange,
  insetTop = 0,
}: Props) {
  const { t } = useLanguage();
  const [bioExpanded, setBioExpanded] = useState(false);

  const gradient = ROLE_GRADIENTS[profile.role] ?? ROLE_GRADIENTS.guest;
  const schoolDisplay = profile.schoolName ?? '';
  const coverHeight = COVER_HEIGHT + insetTop;

  return (
    <View style={styles.container}>
      {/* Cover — taller by insetTop so it bleeds behind the transparent status bar */}
      <View style={[styles.coverWrap, { height: coverHeight }]}>
        {profile.coverUrl ? (
          <Image source={{ uri: profile.coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cover}
          />
        )}
        {/* Bell icon — rendered AFTER cover so it paints on top (Instagram-style) */}
        {isOwnProfile && onNotificationPress && (
          <Pressable
            style={[styles.bellBtn, { top: insetTop + 8 }]}
            onPress={onNotificationPress}
          >
            <MaterialIcons name="notifications-none" size={24} color="#fff" />
            {unreadNotificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>

      {/* Avatar — offset down by insetTop so it sits at the visual cover edge */}
      <View style={[styles.avatarWrap, { bottom: -AVATAR_SIZE / 2 }]}>
        {profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarText}>
              {profile.displayName?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
      </View>

      {/* Info — padding-top reserves space for the overlapping avatar */}
      <View style={[styles.info, { paddingTop: AVATAR_SIZE / 2 + 16 }]}>
        <View style={styles.nameRow}>
          <Text style={styles.displayName} numberOfLines={1}>
            {profile.displayName}
          </Text>
          <RoleBadge role={profile.role} isVerified={profile.isVerified} />
        </View>

        {schoolDisplay ? (
          <Text style={styles.school} numberOfLines={1}>
            {schoolDisplay}
          </Text>
        ) : null}

        {profile.bio ? (
          <View style={styles.bioWrap}>
            <Text
              style={styles.bio}
              numberOfLines={bioExpanded ? undefined : 3}
              onPress={() => setBioExpanded(!bioExpanded)}
            >
              {profile.bio}
            </Text>
            {profile.bio.length > 80 && !bioExpanded && (
              <Pressable onPress={() => setBioExpanded(true)}>
                <Text style={styles.seeMore}>
                  {t('community.profile.see_more') as string}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {/* Subject chips */}
        {profile.subjects && profile.subjects.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {profile.subjects.map((s) => (
              <SubjectChip key={s} label={s} />
            ))}
          </ScrollView>
        ) : null}

        {/* Teacher shield pill — icon + count + rank + leaderboard link */}
        {profile.role === 'teacher' ? (
          <View style={styles.shieldBlock}>
            <View style={styles.shieldRow}>
              <MaterialIcons
                name="shield"
                size={20}
                color={SHIELD_RANK_COLORS[profile.shieldRank ?? 'beginner']}
              />
              <Text style={styles.shieldText}>
                {(t('community.profile.shield_count') as string).replace('{count}', String(profile.shieldCount))}
              </Text>
              <View
                style={[
                  styles.rankPill,
                  { backgroundColor: SHIELD_RANK_COLORS[profile.shieldRank ?? 'beginner'] },
                ]}
              >
                <Text style={styles.rankPillText}>{profile.shieldRank ?? 'beginner'}</Text>
              </View>
            </View>
            {onLeaderboardPress && (
              <Pressable onPress={onLeaderboardPress} style={styles.leaderboardLink}>
                <Text style={styles.leaderboardLinkText}>
                  {t('community.leaderboard.cta') as string}
                </Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {/* Action row */}
        <View style={styles.actions}>
          {profile.role === 'school_admin' && profile.schoolId && onSchoolPagePress ? (
            <Pressable style={styles.schoolPageBtn} onPress={onSchoolPagePress}>
              <Text style={styles.schoolPageBtnText}>
                {t('community.school.viewSchoolPage') as string}
              </Text>
            </Pressable>
          ) : null}
          {isOwnProfile ? (
            <>
              <Pressable style={styles.editBtn} onPress={onEdit}>
                <Text style={styles.editBtnText}>
                  {t('community.profile.edit_button') as string}
                </Text>
              </Pressable>
              {onCreatorDashboardPress && (
                <Pressable style={styles.creatorBtn} onPress={onCreatorDashboardPress}>
                  <MaterialIcons name="analytics" size={18} color="#F59E0B" />
                  <Text style={styles.creatorBtnText}>
                    {t('community.creator.button') as string}
                  </Text>
                </Pressable>
              )}
            </>
          ) : (
            <>
              <FollowButton
                targetProfileId={profile.id}
                initialStatus={followStatus}
                onStatusChange={onFollowStatusChange}
              />
              <Pressable
                style={styles.messageBtn}
                onPress={onMessagePress}
                disabled={!onMessagePress}
              >
                <MaterialIcons
                  name="chat-bubble-outline"
                  size={18}
                  color={onMessagePress ? '#0B5FFF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.messageBtnText,
                    onMessagePress && styles.messageBtnTextActive,
                  ]}
                >
                  {t('community.profile.message_button') as string}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  coverWrap: {
    overflow: 'hidden',
  },
  cover: {
    width:  '100%',
    height: '100%',
  },
  avatarWrap: {
    position: 'absolute',
    left:    16,
  },
  avatar: {
    width:         AVATAR_SIZE,
    height:        AVATAR_SIZE,
    borderRadius:  AVATAR_SIZE / 2,
    borderWidth:   4,
    borderColor:   '#fff',
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    fontSize:   32,
    fontWeight:  '600',
    color:       '#6B7280',
  },
  info: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  4,
  },
  displayName: {
    fontSize:   20,
    fontWeight:  '700',
    color:       '#111827',
  },
  school: {
    fontSize:   14,
    color:       '#6B7280',
    marginBottom: 8,
  },
  bioWrap: {
    marginBottom: 8,
  },
  bio: {
    fontSize:   14,
    color:       '#374151',
    lineHeight:  20,
  },
  seeMore: {
    fontSize:   14,
    color:       '#0B5FFF',
    fontWeight:  '500',
    marginTop:   4,
  },
  chipsScroll: {
    marginBottom: 8,
    marginHorizontal: -16,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  shieldBlock: {
    marginBottom: 12,
  },
  shieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderboardLink: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  leaderboardLinkText: {
    fontSize: 13,
    color: '#0B5FFF',
    fontWeight: '500',
  },
  shieldText: {
    color:      '#374151',
    fontSize:   13,
    fontWeight: '600',
  },
  rankPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rankPillText: {
    color:      '#fff',
    fontSize:   12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0B5FFF',
  },
  editBtnText: {
    color:      '#0B5FFF',
    fontSize:   14,
    fontWeight: '600',
  },
  creatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  creatorBtnText: {
    color:      '#F59E0B',
    fontSize:   14,
    fontWeight: '600',
  },
  schoolPageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  schoolPageBtnText: {
    color:      '#F97316',
    fontSize:   14,
    fontWeight: '600',
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageBtnText: {
    color:      '#6B7280',
    fontSize:   14,
    fontWeight:  '500',
  },
  messageBtnTextActive: {
    color: '#0B5FFF',
  },
  bellBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
