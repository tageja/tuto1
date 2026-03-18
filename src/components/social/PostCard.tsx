import React, { useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import RoleBadge from './RoleBadge';
import ModerationBadge from './ModerationBadge';
import SubjectChip from './SubjectChip';
import ReactionBar from './ReactionBar';
import AchievementCard from './AchievementCard';
import PostOptionsMenu from './PostOptionsMenu';
import type { SocialPost, ReactionType } from '../../types/social';

interface Props {
  post:           SocialPost;
  currentUserId?: string;
  onPress?:       () => void;
  onReact:        (type: ReactionType) => void;
  onComment?:     () => void;
  onShare?:       () => void;
  onSave?:        () => void;
  onDeletePost?:  () => void;
  onEditPost?:    () => void;
}

// --------------------------------------------------------------------------
// Media grid (1-4 photos)
// --------------------------------------------------------------------------

function MediaGrid({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  const isSingle = urls.length === 1;

  return (
    <View style={[styles.mediaGrid, isSingle && styles.mediaSingle]}>
      {urls.slice(0, 4).map((url, i) => (
        <Image
          key={url + i}
          source={{ uri: url }}
          style={[
            styles.mediaItem,
            isSingle && styles.mediaItemFull,
            urls.length === 2 && styles.mediaItemHalf,
          ]}
          resizeMode="cover"
        />
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Event block
// --------------------------------------------------------------------------

function EventBlock({ event, onJoin }: { event: NonNullable<SocialPost['event']>; onJoin?: () => void }) {
  const { t } = useLanguage();
  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{event.title}</Text>
      {event.date && (
        <View style={styles.eventRow}>
          <MaterialIcons name="event" size={14} color="#0B5FFF" />
          <Text style={styles.eventMeta}>{new Date(event.date).toLocaleDateString('vi-VN')}</Text>
        </View>
      )}
      {event.location && (
        <View style={styles.eventRow}>
          <MaterialIcons name="place" size={14} color="#0B5FFF" />
          <Text style={styles.eventMeta}>{event.location}</Text>
        </View>
      )}
      {event.rsvpCount !== undefined && (
        <View style={styles.eventRow}>
          <MaterialIcons name="people" size={14} color="#0B5FFF" />
          <Text style={styles.eventMeta}>{event.rsvpCount} interested</Text>
        </View>
      )}
      <Pressable style={styles.eventJoin} onPress={onJoin}>
        <Text style={styles.eventJoinText}>{t('community.event.join') as string}</Text>
      </Pressable>
    </View>
  );
}

// --------------------------------------------------------------------------
// Assignment block
// --------------------------------------------------------------------------

function AssignmentBlock({ assignment }: { assignment: NonNullable<SocialPost['assignment']> }) {
  return (
    <View style={styles.assignCard}>
      <View style={styles.assignHeader}>
        <MaterialIcons name="assignment" size={16} color="#D97706" />
        <Text style={styles.assignSubject}>{assignment.subject}</Text>
      </View>
      {assignment.dueDate && (
        <Text style={styles.assignDue}>
          Due: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
        </Text>
      )}
    </View>
  );
}

// --------------------------------------------------------------------------
// Poll block
// --------------------------------------------------------------------------

function PollBlock({ poll }: { poll: NonNullable<SocialPost['poll']> }) {
  const total = poll.options.reduce((s, o) => s + (o.votes ?? 0), 0);

  return (
    <View style={styles.pollBlock}>
      {poll.options.map((opt) => {
        const pct = total > 0 ? Math.round(((opt.votes ?? 0) / total) * 100) : 0;
        return (
          <View key={opt.id} style={styles.pollOption}>
            <View style={[styles.pollBar, { width: `${pct}%` }]} />
            <Text style={styles.pollText}>{opt.text}</Text>
            <Text style={styles.pollPct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}

// --------------------------------------------------------------------------
// Main PostCard
// --------------------------------------------------------------------------

export default function PostCard({
  post,
  currentUserId,
  onPress,
  onReact,
  onComment,
  onShare,
  onSave,
  onDeletePost,
  onEditPost,
}: Props) {
  const { t } = useLanguage();

  const isOwn = !!currentUserId && post.author.id === currentUserId;

  // Delegate achievement posts to specialised card
  if (post.postType === 'achievement') {
    return (
      <AchievementCard
        post={post}
        onReact={onReact}
        onComment={onComment}
        onShare={onShare}
        onSave={onSave}
        onPress={onPress}
      />
    );
  }

  const timeAgo = formatRelativeTime(post.createdAt);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* ── Header ── */}
      <View style={styles.header}>
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
            <View style={styles.nameRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.author.displayName}
              </Text>
              <RoleBadge role={post.author.role} isVerified={post.author.verified} compact />
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.timestamp}>{timeAgo}</Text>
              {post.audienceLabel && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.audienceLabel}>{post.audienceLabel}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <ModerationBadge status={post.moderationStatus} />
          <PostOptionsMenu
            postId={post.id}
            isOwnPost={isOwn}
            onEdit={onEditPost}
            onDelete={onDeletePost}
          />
        </View>
      </View>

      {/* ── Content ── */}
      {post.content ? (
        <Text style={styles.content} numberOfLines={onPress ? 5 : undefined}>
          {post.content}
        </Text>
      ) : null}

      {/* ── Subject chips ── */}
      {post.subjects.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {post.subjects.map((s) => (
            <SubjectChip key={s} label={s} />
          ))}
        </ScrollView>
      )}

      {/* ── Location ── */}
      {post.location && (
        <View style={styles.locationRow}>
          <MaterialIcons name="place" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{post.location}</Text>
        </View>
      )}

      {/* ── Media ── */}
      <MediaGrid urls={post.mediaUrls} />

      {/* ── Type-specific blocks ── */}
      {post.postType === 'event'      && post.event      && <EventBlock      event={post.event} />}
      {post.postType === 'assignment' && post.assignment  && <AssignmentBlock assignment={post.assignment} />}
      {post.postType === 'poll'       && post.poll        && <PollBlock       poll={post.poll} />}

      {/* ── Reaction bar ── */}
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
    </Pressable>
  );
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)  return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    8,
    elevation:       1,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    3,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    marginBottom:   10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems:    'center',
    flex:          1,
    gap:           10,
  },
  avatar: {
    width:        44,
    height:       44,
    borderRadius: 22,
  },
  avatarFallback: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarInitial: {
    fontSize:   18,
    fontWeight: '700',
    color:      '#6B7280',
  },
  authorInfo: {
    flex: 1,
    gap:  4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    flexWrap:      'wrap',
  },
  authorName: {
    fontSize:   15,
    fontWeight: '700',
    color:      '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  timestamp: {
    fontSize: 12,
    color:    '#9CA3AF',
  },
  dot: {
    color:    '#9CA3AF',
    fontSize: 12,
  },
  audienceLabel: {
    fontSize: 12,
    color:    '#9CA3AF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    paddingLeft:   8,
  },
  content: {
    fontSize:     15,
    color:        '#374151',
    lineHeight:   22,
    marginBottom: 10,
  },
  chips: {
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginBottom:  10,
  },
  locationText: {
    fontSize: 13,
    color:    '#6B7280',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           4,
    marginBottom:  10,
    borderRadius:  12,
    overflow:      'hidden',
  },
  mediaSingle: {
    flexDirection: 'column',
  },
  mediaItem: {
    width:        '48%',
    aspectRatio:  1,
    borderRadius: 8,
  },
  mediaItemFull: {
    width:       '100%',
    aspectRatio: 16 / 9,
  },
  mediaItemHalf: {
    width: '48%',
  },
  // Event card
  eventCard: {
    backgroundColor: '#EFF6FF',
    borderRadius:    12,
    padding:         14,
    marginBottom:    10,
    borderLeftWidth: 3,
    borderLeftColor: '#0B5FFF',
  },
  eventTitle: {
    fontSize:     15,
    fontWeight:   '700',
    color:        '#1D4ED8',
    marginBottom: 6,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  4,
  },
  eventMeta: {
    fontSize: 13,
    color:    '#374151',
  },
  eventJoin: {
    backgroundColor: '#0B5FFF',
    borderRadius:    8,
    paddingVertical: 8,
    alignItems:      'center',
    marginTop:       8,
  },
  eventJoinText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   14,
  },
  // Assignment card
  assignCard: {
    backgroundColor: '#FFFBEB',
    borderRadius:    12,
    padding:         14,
    marginBottom:    10,
    borderLeftWidth: 3,
    borderLeftColor: '#D97706',
  },
  assignHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  6,
  },
  assignSubject: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#92400E',
  },
  assignDue: {
    fontSize: 13,
    color:    '#78350F',
  },
  // Poll
  pollBlock: {
    gap:          8,
    marginBottom: 10,
  },
  pollOption: {
    position:      'relative',
    height:        36,
    borderRadius:  8,
    backgroundColor: '#F3F4F6',
    overflow:      'hidden',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pollBar: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DBEAFE',
  },
  pollText: {
    fontSize:   14,
    color:      '#111827',
    fontWeight: '500',
  },
  pollPct: {
    position: 'absolute',
    right:    10,
    fontSize: 13,
    color:    '#6B7280',
  },
});
