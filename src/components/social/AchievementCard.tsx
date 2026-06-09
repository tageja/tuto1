import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../contexts/LanguageContext';
import RoleBadge from './RoleBadge';
import ReactionBar from './ReactionBar';
import type { SocialPost, ReactionType } from '../../types/social';

type AchievementType = 'academic' | 'streak' | 'score' | 'first' | 'certificate';

const GRADIENT_MAP: Record<AchievementType, [string, string]> = {
  academic:    ['#F59E0B', '#F97316'],
  streak:      ['#3B82F6', '#14B8A6'],
  score:       ['#8B5CF6', '#6366F1'],
  first:       ['#10B981', '#059669'],
  certificate: ['#F59E0B', '#EAB308'],
};

const EMOJI_MAP: Record<AchievementType, string> = {
  academic:    '🏆',
  streak:      '🔥',
  score:       '⭐',
  first:       '🎀',
  certificate: '📜',
};

type Variant = 'feed' | 'share' | 'compact';

interface Props {
  post:       SocialPost;
  variant?:   Variant;
  onReact?:   (type: ReactionType) => void;
  onComment?: () => void;
  onShare?:   () => void;
  onSave?:    () => void;
  onPress?:   () => void;
}

export default function AchievementCard({
  post,
  variant = 'feed',
  onReact,
  onComment,
  onShare,
  onSave,
  onPress,
}: Props) {
  const { t } = useLanguage();
  const achievementType: AchievementType =
    (post.achievement?.type as AchievementType) ?? 'academic';
  const gradient = GRADIENT_MAP[achievementType] ?? GRADIENT_MAP.academic;
  const emoji    = EMOJI_MAP[achievementType] ?? '🏆';
  const isCompact = variant === 'compact';

  return (
    <Pressable
      style={[styles.card, isCompact && styles.compact]}
      onPress={onPress}
      disabled={!onPress}
    >
      {/* Gradient header */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, isCompact && styles.headerCompact]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.achievementTitle} numberOfLines={1}>
            {post.achievement?.title ?? (t('community.achievement.academic') as string)}
          </Text>
          {!isCompact && post.achievement?.description && (
            <Text style={styles.achievementDesc} numberOfLines={2}>
              {post.achievement.description}
            </Text>
          )}
        </View>
        <Image
          source={require('../../../assets/images/tuto-logo.png')}
          style={styles.logo}
          tintColor="#ffffff55"
        />
      </LinearGradient>

      {/* Body */}
      {!isCompact && (
        <View style={styles.body}>
          {/* Author row */}
          <View style={styles.authorRow}>
            {post.author.avatarUrl ? (
              <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {post.author.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.displayName}</Text>
              <RoleBadge role={post.author.role} isVerified={post.author.verified} compact />
            </View>
          </View>

          {/* Post content (optional extra text) */}
          {post.content ? (
            <Text style={styles.content}>{post.content}</Text>
          ) : null}

          {/* Subject / grade chips */}
          {post.subjects.length > 0 && (
            <View style={styles.chips}>
              {post.subjects.map((s) => (
                <View key={s} style={styles.chip}>
                  <Text style={styles.chipText}>#{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          {onShare && (
            <Pressable style={styles.cta} onPress={onShare}>
              <Text style={styles.ctaText}>
                {t('community.achievement.shareAchievement') as string}
              </Text>
            </Pressable>
          )}

          {/* Reaction bar */}
          {onReact && (
            <ReactionBar
              reactions={post.reactions}
              userReaction={post.userReaction}
              commentsCount={post.commentsCount}
              saved={post.saved}
              onReact={onReact}
              onComment={onComment}
              onShare={onShare}
              onSave={onSave}
              compact
            />
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    overflow:        'hidden',
    marginBottom:    8,
    elevation:       2,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.08,
    shadowRadius:    4,
  },
  compact: {
    marginBottom: 0,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        16,
    gap:            12,
  },
  headerCompact: {
    padding: 10,
  },
  emoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  achievementTitle: {
    color:      '#fff',
    fontSize:   17,
    fontWeight: '700',
  },
  achievementDesc: {
    color:      '#ffffffCC',
    fontSize:   13,
    marginTop:  2,
  },
  logo: {
    width:  24,
    height: 24,
    opacity: 0.4,
  },
  body: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  12,
    gap:           10,
  },
  avatar: {
    width:        40,
    height:       40,
    borderRadius: 20,
  },
  avatarFallback: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarInitial: {
    fontSize:   16,
    fontWeight: '700',
    color:      '#6B7280',
  },
  authorInfo: {
    gap: 4,
  },
  authorName: {
    fontSize:   15,
    fontWeight: '600',
    color:      '#111827',
  },
  content: {
    fontSize:     15,
    color:        '#374151',
    lineHeight:   22,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  12,
  },
  chip: {
    backgroundColor: '#EFF6FF',
    borderRadius:    999,
    paddingHorizontal: 10,
    paddingVertical:   3,
  },
  chipText: {
    fontSize:   12,
    fontWeight: '500',
    color:      '#0B5FFF',
  },
  cta: {
    backgroundColor: '#0B5FFF',
    borderRadius:    12,
    paddingVertical: 10,
    alignItems:      'center',
    marginBottom:    8,
  },
  ctaText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   14,
  },
});
