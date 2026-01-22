# tuto.social — Cursor Agent Rules

**Document Version:** 1.2  
**Purpose:** Keep AI agents aligned with architecture and implementation standards  
**Usage:** Include this file in Cursor rules or reference at start of each session

---

## CRITICAL: Read This First

You are working on **tuto.social**, a social feed platform within the Tuto education ecosystem. This is a **MONOREPO** with:

1. **Mobile App** (`src/`) — React Native/Expo — Tuto main app with social features
2. **Main Website** (`apps/dashboard/`) — Next.js — tuto.asia / tutoglobal.com
3. **Social Website** (`apps/social/`) — Next.js — tuto.social (dedicated social platform)
4. **Supabase** — Database, Auth, Edge Functions, Realtime, Storage — BACKEND

**IMPORTANT: We use SUPABASE ONLY. No Firebase.**

---

## Domain & URL Structure

### Three Platforms, One Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                     TUTO ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MOBILE APP (React Native)                                      │
│  └── App Store / Play Store                                     │
│      └── Has Social tab with full tuto.social features          │
│                                                                 │
│  MAIN WEBSITE (tuto.asia / tutoglobal.com)                      │
│  └── apps/dashboard/                                            │
│      ├── Landing page                                           │
│      ├── School dashboard (/school/*)                           │
│      ├── Find teacher (/find-teacher)                           │
│      ├── Find school (/find-school)                             │
│      └── Community Feed PREVIEW (/feed or homepage section)     │
│          └── Clicking opens tuto.social                         │
│                                                                 │
│  SOCIAL WEBSITE (tuto.social)                                   │
│  └── apps/social/                                               │
│      ├── Full social feed (/)                                   │
│      ├── Explore (/explore)                                     │
│      ├── Reels (/reels)                                         │
│      ├── Messages (/messages)                                   │
│      ├── Profiles (/@username)                                  │
│      └── Settings (/settings)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### URL Mapping

| Domain | Purpose | App Location |
|--------|---------|--------------|
| `tuto.asia` | Main site (Vietnam) | `apps/dashboard/` |
| `tutoglobal.com` | Main site (Global) | `apps/dashboard/` |
| `tuto.social` | Social platform | `apps/social/` |

### Cross-Domain Flow

```
User on tuto.asia
       │
       ▼
┌─────────────────────────┐
│  Homepage               │
│  ┌───────────────────┐  │
│  │ Community Feed    │  │
│  │ (Preview Section) │──┼──► Click ──► tuto.social
│  │ "See more →"      │  │
│  └───────────────────┘  │
└─────────────────────────┘

Auth: Shared via Supabase Auth (cross-domain sessions)
```

---

## Architecture Rules (Non-Negotiable)

### 1. Data Flow Architecture

```
Mobile App (src/) ───────┐
                         │
Main Website (apps/      │
  dashboard/) ───────────┼──► Supabase ──► PostgreSQL
                         │      │
Social Website (apps/    │      ├──► Auth (shared across domains)
  social/) ──────────────┘      ├──► Storage (media)
                                └──► Realtime (live updates)
```

### 2. Tech Stack (Supabase Only)

| Service | Technology | NOT Using |
|---------|------------|-----------|
| Database | Supabase PostgreSQL | ~~Airtable for social~~ |
| Auth | Supabase Auth | ~~Firebase Auth~~ |
| Functions | Supabase Edge Functions | ~~Firebase Functions~~ |
| Realtime | Supabase Realtime | ~~Firebase Realtime~~ |
| Storage | Supabase Storage + Cloudinary | ~~Firebase Storage~~ |
| Push Notifications | Expo Push / OneSignal | ~~Firebase Cloud Messaging~~ |

### 3. File Location Rules

| What | Where | Example |
|------|-------|---------|
| **MOBILE** | | |
| Mobile screens | `src/screens/social/` | `SocialFeedScreen.tsx` |
| Mobile components | `src/components/social/` | `PostCard.tsx` |
| Mobile services | `src/services/social/` | `feed.service.ts` |
| Mobile types | `src/types/social/` | `post.types.ts` |
| **MAIN WEBSITE** | | |
| Main site pages | `apps/dashboard/app/` | `page.tsx` |
| Feed preview | `apps/dashboard/components/social/` | `FeedPreview.tsx` |
| **SOCIAL WEBSITE** | | |
| Social pages | `apps/social/app/` | `page.tsx` |
| Social components | `apps/social/components/` | `FeedPost.tsx` |
| Social lib | `apps/social/lib/` | `supabase.ts` |
| **SHARED BACKEND** | | |
| Edge Functions | `supabase/functions/` | `social-posts/index.ts` |
| Database migrations | `supabase/migrations/` | `035_social_profiles.sql` |

### 4. Complete File Structure

```
tuto1/
├── src/                                    # React Native Mobile App
│   ├── components/
│   │   ├── common/                         # Shared UI components
│   │   ├── school/                         # School dashboard components
│   │   └── social/                         # 🆕 Social components
│   │       ├── PostCard.tsx
│   │       ├── CreatePostModal.tsx
│   │       ├── StoryBar.tsx
│   │       ├── StoryViewer.tsx
│   │       ├── StoryRing.tsx
│   │       ├── ReelPlayer.tsx
│   │       ├── ReelActions.tsx
│   │       ├── ProfileHeader.tsx
│   │       ├── ProfileStats.tsx
│   │       ├── FollowButton.tsx
│   │       ├── UserListItem.tsx
│   │       ├── ConversationListItem.tsx
│   │       ├── MessageBubble.tsx
│   │       ├── NotificationItem.tsx
│   │       ├── AchievementBadge.tsx
│   │       └── ...
│   │
│   ├── screens/
│   │   ├── school/                         # School screens
│   │   └── social/                         # 🆕 Social screens
│   │       ├── SocialFeedScreen.tsx
│   │       ├── SocialProfileScreen.tsx
│   │       ├── SocialSearchScreen.tsx
│   │       ├── ReelsScreen.tsx
│   │       ├── StoryViewerScreen.tsx
│   │       ├── CreateStoryScreen.tsx
│   │       ├── CreateReelScreen.tsx
│   │       ├── ConversationsScreen.tsx
│   │       ├── ChatScreen.tsx
│   │       ├── NotificationsScreen.tsx
│   │       ├── FollowersScreen.tsx
│   │       ├── FollowingScreen.tsx
│   │       ├── AchievementsScreen.tsx
│   │       ├── CreatorDashboardScreen.tsx
│   │       └── SocialSettingsScreen.tsx
│   │
│   ├── services/
│   │   ├── school/                         # School services
│   │   └── social/                         # 🆕 Social services
│   │       ├── feed.service.ts
│   │       ├── posts.service.ts
│   │       ├── profiles.service.ts
│   │       ├── follows.service.ts
│   │       ├── stories.service.ts
│   │       ├── reels.service.ts
│   │       ├── messages.service.ts
│   │       ├── notifications.service.ts
│   │       ├── search.service.ts
│   │       ├── analytics.service.ts
│   │       └── moderation.service.ts
│   │
│   ├── types/
│   │   ├── school/
│   │   └── social/                         # 🆕 Social types
│   │       ├── index.ts
│   │       ├── post.types.ts
│   │       ├── profile.types.ts
│   │       ├── story.types.ts
│   │       ├── reel.types.ts
│   │       ├── message.types.ts
│   │       └── notification.types.ts
│   │
│   └── navigation/
│       ├── AppNavigator.tsx
│       ├── ParentTabs.tsx                  # Add Social tab
│       ├── TeacherTabs.tsx                 # Add Social tab
│       └── SocialStack.tsx                 # 🆕 Social navigation stack
│
├── apps/
│   ├── dashboard/                          # Main Website (tuto.asia)
│   │   ├── app/
│   │   │   ├── page.tsx                    # Homepage with feed preview
│   │   │   ├── school/                     # School dashboard
│   │   │   └── ...
│   │   └── components/
│   │       └── social/                     # 🆕 Feed preview components
│   │           ├── FeedPreview.tsx         # Shows top posts
│   │           ├── FeedPreviewCard.tsx     # Preview post card
│   │           └── SocialCTA.tsx           # "Join tuto.social" CTA
│   │
│   └── social/                             # 🆕 Social Website (tuto.social)
│       ├── app/
│       │   ├── layout.tsx                  # Root layout
│       │   ├── page.tsx                    # Feed (/)
│       │   ├── explore/
│       │   │   └── page.tsx                # Discover (/explore)
│       │   ├── reels/
│       │   │   └── page.tsx                # Reels (/reels)
│       │   ├── messages/
│       │   │   ├── page.tsx                # DM list (/messages)
│       │   │   └── [id]/
│       │   │       └── page.tsx            # Conversation (/messages/123)
│       │   ├── notifications/
│       │   │   └── page.tsx                # Notifications (/notifications)
│       │   ├── [username]/
│       │   │   └── page.tsx                # Profile (/@username)
│       │   ├── post/
│       │   │   └── [id]/
│       │   │       └── page.tsx            # Single post (/post/123)
│       │   ├── reel/
│       │   │   └── [id]/
│       │   │       └── page.tsx            # Single reel (/reel/123)
│       │   ├── settings/
│       │   │   └── page.tsx                # Settings (/settings)
│       │   ├── create/
│       │   │   └── page.tsx                # Create post (/create)
│       │   ├── login/
│       │   │   └── page.tsx                # Login (/login)
│       │   └── auth/
│       │       └── callback/
│       │           └── route.ts            # OAuth callback
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── MobileNav.tsx
│       │   │   └── BottomBar.tsx
│       │   ├── feed/
│       │   │   ├── FeedPost.tsx
│       │   │   ├── FeedFilters.tsx
│       │   │   └── CreatePostModal.tsx
│       │   ├── stories/
│       │   │   ├── StoryBar.tsx
│       │   │   └── StoryViewer.tsx
│       │   ├── reels/
│       │   │   ├── ReelPlayer.tsx
│       │   │   └── ReelGrid.tsx
│       │   ├── profile/
│       │   │   ├── ProfileHeader.tsx
│       │   │   ├── ProfileTabs.tsx
│       │   │   └── ProfileGrid.tsx
│       │   ├── messages/
│       │   │   ├── ConversationList.tsx
│       │   │   ├── ChatWindow.tsx
│       │   │   └── MessageInput.tsx
│       │   └── ui/
│       │       ├── Button.tsx
│       │       ├── Avatar.tsx
│       │       ├── Modal.tsx
│       │       └── ...
│       │
│       ├── lib/
│       │   ├── supabase.ts                 # Supabase client
│       │   ├── auth.ts                     # Auth helpers
│       │   └── utils.ts                    # Utilities
│       │
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useFeed.ts
│       │   └── useProfile.ts
│       │
│       ├── types/
│       │   └── index.ts                    # Share with mobile via copy
│       │
│       ├── next.config.js
│       ├── package.json
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 001-034_*.sql                   # Existing migrations
│   │   ├── 035_social_profiles.sql         # 🆕
│   │   ├── 036_social_posts.sql            # 🆕
│   │   ├── 037_social_interactions.sql     # 🆕
│   │   ├── 038_social_follows.sql          # 🆕
│   │   ├── 039_social_comments.sql         # 🆕
│   │   ├── 040_social_stories.sql          # 🆕
│   │   ├── 041_social_messages.sql         # 🆕
│   │   ├── 042_social_notifications.sql    # 🆕
│   │   ├── 043_social_moderation.sql       # 🆕
│   │   ├── 044_social_creator.sql          # 🆕
│   │   ├── 045_social_rls_policies.sql     # 🆕
│   │   ├── 046_social_functions.sql        # 🆕
│   │   └── 047_social_indexes.sql          # 🆕
│   │
│   └── functions/
│       ├── social-posts/
│       │   └── index.ts
│       ├── social-feed/
│       │   └── index.ts
│       ├── social-profiles/
│       │   └── index.ts
│       ├── social-follows/
│       │   └── index.ts
│       ├── social-stories/
│       │   └── index.ts
│       ├── social-reels/
│       │   └── index.ts
│       ├── social-messages/
│       │   └── index.ts
│       ├── social-notifications/
│       │   └── index.ts
│       └── social-moderation/
│           └── index.ts
│
└── packages/                               # Optional: Shared code
    └── social-types/                       # If you want to share types
        ├── index.ts
        └── package.json
```

### 5. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Screen files | PascalCase + Screen | `SocialFeedScreen.tsx` |
| Component files | PascalCase | `PostCard.tsx` |
| Service files | camelCase + .service | `feed.service.ts` |
| Type files | camelCase + .types | `post.types.ts` |
| Edge Functions | kebab-case folder | `social-posts/index.ts` |
| Database tables | snake_case with `social_` prefix | `social_posts` |
| API routes | kebab-case | `/social-posts` |

### 5. Database Table Naming

All new social tables MUST be prefixed with `social_`:

```sql
-- Correct
social_profiles
social_posts
social_comments
social_likes
social_follows

-- WRONG (don't do this)
profiles
tuto_social_posts
SocialPosts
```

---

## Design Philosophy: Addictive & Social-First

### Core Principle
**Make users want to stay.** Every interaction should feel rewarding, every scroll should reveal something interesting, every action should provide immediate feedback.

### Visual Design Standards

#### 1. Dopamine-Driven Interactions

```typescript
// EVERY interaction needs instant feedback
// ❌ Wrong - no feedback
onPress={() => likePost(id)}

// ✅ Correct - immediate visual + haptic feedback
onPress={() => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  setIsLiked(true); // Optimistic update
  animateLikeButton(); // Visual pop
  likePost(id); // Background API call
}}
```

#### 2. Smooth Animations Everywhere

Use `react-native-reanimated` for buttery animations:

```typescript
// Heart like animation (Instagram-style)
const likeAnimation = useSharedValue(1);

const animateLike = () => {
  likeAnimation.value = withSequence(
    withSpring(1.3, { damping: 2 }),
    withSpring(1, { damping: 4 })
  );
};

// Double-tap to like
const doubleTapGesture = Gesture.Tap()
  .numberOfTaps(2)
  .onEnd(() => {
    if (!isLiked) {
      runOnJS(handleLike)();
      // Show floating heart animation
    }
  });
```

#### 3. Scroll Behavior That Hooks

```typescript
// Infinite scroll with prefetching
const onEndReached = () => {
  if (!loading && hasMore) {
    prefetchNextPage(); // Load before user reaches end
  }
};

// Pull to refresh with satisfying animation
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor={colors.primary}
      progressViewOffset={20}
    />
  }
/>
```

#### 4. Social Color Psychology

Extend the base theme with social-optimized colors:

```typescript
// Social-specific colors (add to theme)
const socialColors = {
  // Engagement colors - designed to draw attention
  like: '#FF3B5C',           // Warm red - triggers emotion
  likeBackground: '#FFE8EC', // Soft pink glow
  
  comment: '#5B8DEF',        // Calm blue - invites conversation
  commentBackground: '#E8F0FF',
  
  share: '#00C853',          // Green - positive action
  shareBackground: '#E8F8EE',
  
  save: '#FFB800',           // Gold - valuable content
  saveBackground: '#FFF8E6',
  
  // Story ring gradients (Instagram-style)
  storyGradient: ['#F58529', '#DD2A7B', '#8134AF', '#515BD4'],
  storyViewed: '#DBDBDB',
  
  // Live indicator
  live: '#FF0000',
  liveGlow: 'rgba(255, 0, 0, 0.3)',
  
  // Notification badge
  badge: '#FF3B30',
  
  // Verified badge
  verified: '#1DA1F2',
  
  // Creator badge
  creator: '#FFD700',
};
```

#### 5. Typography for Social

```typescript
// Social typography - optimized for scanning
const socialTypography = {
  // Username - bold, memorable
  username: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.2,
  },
  
  // Display name - slightly lighter
  displayName: {
    fontSize: 15,
    fontFamily: typography.fontFamily.semiBold,
  },
  
  // Post content - readable, comfortable
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
  
  // Engagement counts - compact, scannable
  count: {
    fontSize: 13,
    fontFamily: typography.fontFamily.semiBold,
    letterSpacing: -0.3,
  },
  
  // Timestamp - subtle, non-distracting
  timestamp: {
    fontSize: 12,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.light,
  },
};
```

### Addictive UI Patterns

#### 1. Variable Reward System
```
User scrolls → New content appears (unpredictable)
User pulls to refresh → Maybe something new!
User checks notifications → Surprise likes/comments
```

#### 2. Social Proof Everywhere
```typescript
// Show engagement prominently
<View style={styles.engagementRow}>
  <Text style={styles.count}>{formatCount(likes)} likes</Text>
  <Text style={styles.separator}>·</Text>
  <Text style={styles.count}>{formatCount(comments)} comments</Text>
</View>

// Show "X and Y liked this"
<Text>
  <Text style={styles.bold}>{firstLiker}</Text>
  {otherLikersCount > 0 && (
    <> and <Text style={styles.bold}>{otherLikersCount} others</Text></>
  )} liked this
</Text>
```

#### 3. Progress & Status Indicators
```typescript
// Profile completion prompt
<View style={styles.completionBanner}>
  <Progress value={profileCompletion} />
  <Text>Complete your profile to get more followers!</Text>
</View>

// Streak counter
<View style={styles.streakBadge}>
  <Text style={styles.streakEmoji}>🔥</Text>
  <Text style={styles.streakCount}>{streak} day streak!</Text>
</View>
```

#### 4. FOMO Triggers
```typescript
// Story ring with unseen indicator
<View style={[
  styles.storyRing,
  hasUnseenStory && styles.storyRingGradient,
  !hasUnseenStory && styles.storyRingViewed,
]}>
  <Image source={{ uri: avatar }} style={styles.storyAvatar} />
</View>

// "Live now" indicator
{isLive && (
  <View style={styles.liveBadge}>
    <View style={styles.liveDot} />
    <Text style={styles.liveText}>LIVE</Text>
  </View>
)}

// Typing indicator in DMs
{isTyping && (
  <View style={styles.typingIndicator}>
    <TypingDots />
  </View>
)}
```

#### 5. Micro-interactions

Every touch should feel alive:

```typescript
// Button press scale
const scaleAnim = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scaleAnim.value }],
}));

const onPressIn = () => {
  scaleAnim.value = withSpring(0.95);
};

const onPressOut = () => {
  scaleAnim.value = withSpring(1);
};
```

### Component Patterns for Engagement

#### Post Card (Instagram-style)
```typescript
<View style={styles.postCard}>
  {/* Header - tappable to profile */}
  <Pressable style={styles.header} onPress={goToProfile}>
    <StoryRing hasUnseenStory={hasStory}>
      <Avatar uri={author.avatar} size={32} />
    </StoryRing>
    <View style={styles.authorInfo}>
      <Text style={styles.username}>{author.username}</Text>
      <Text style={styles.location}>{location}</Text>
    </View>
    <MoreButton onPress={showOptions} />
  </Pressable>
  
  {/* Media - double tap to like */}
  <DoubleTapLike onDoubleTap={handleLike}>
    <MediaCarousel media={post.media} />
    {showHeartAnimation && <FloatingHeart />}
  </DoubleTapLike>
  
  {/* Actions - satisfying feedback */}
  <View style={styles.actions}>
    <LikeButton isLiked={isLiked} onPress={handleLike} />
    <CommentButton count={comments} onPress={openComments} />
    <ShareButton onPress={handleShare} />
    <View style={{ flex: 1 }} />
    <SaveButton isSaved={isSaved} onPress={handleSave} />
  </View>
  
  {/* Engagement - social proof */}
  <LikesRow likes={likes} />
  
  {/* Caption - expandable */}
  <Caption 
    username={author.username}
    text={post.caption}
    maxLines={2}
  />
  
  {/* Comments preview */}
  <CommentsPreview comments={topComments} total={commentCount} />
  
  {/* Timestamp */}
  <Text style={styles.timestamp}>{timeAgo(post.createdAt)}</Text>
</View>
```

#### Reel/Short (TikTok-style)
```typescript
<View style={styles.reelContainer}>
  {/* Full screen video */}
  <Video
    source={{ uri: reel.videoUrl }}
    style={StyleSheet.absoluteFill}
    resizeMode="cover"
    shouldPlay={isActive}
    isLooping
  />
  
  {/* Right action bar */}
  <View style={styles.rightActions}>
    <ActionButton
      icon={<Avatar uri={author.avatar} size={40} />}
      onPress={goToProfile}
      badge={!isFollowing && <PlusIcon />}
    />
    <ActionButton
      icon={<HeartIcon filled={isLiked} />}
      count={likes}
      onPress={handleLike}
    />
    <ActionButton
      icon={<CommentIcon />}
      count={comments}
      onPress={openComments}
    />
    <ActionButton
      icon={<ShareIcon />}
      count={shares}
      onPress={handleShare}
    />
    <SpinningDisc albumArt={reel.sound?.artwork} />
  </View>
  
  {/* Bottom info */}
  <View style={styles.bottomInfo}>
    <Text style={styles.reelUsername}>@{author.username}</Text>
    <ExpandableText text={reel.caption} maxLines={2} />
    <SoundBar sound={reel.sound} />
  </View>
  
  {/* Progress bar */}
  <VideoProgress current={currentTime} total={duration} />
</View>
```

---

## Code Standards

### TypeScript Requirements

1. **Always** define types for all data structures
2. **Never** use `any` type — use `unknown` and type guards if needed
3. **Export** types from dedicated `.types.ts` files
4. **Import** types using type-only imports when possible

```typescript
// Correct
import type { Post, PostType } from '../types/social/post.types';
```

### React Native Component Rules

1. **Functional components** only — no class components
2. **Use hooks** for state and effects
3. **Use theme** from `useTheme()` — never hardcode colors
4. **Use translations** from `useLanguage()` — never hardcode strings
5. **Keep components under 200 lines** — split if larger
6. **Add haptic feedback** for all interactive elements
7. **Add animations** for state changes

```typescript
// Correct pattern
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  
  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // ... rest of logic
  };
};
```

### Service Layer Rules (Supabase)

1. **All API calls** go through service files
2. **Use Supabase client** directly for simple queries
3. **Use Edge Functions** for complex business logic
4. **Handle errors** gracefully with try/catch
5. **Return typed** responses
6. **Log errors** using the logger service

```typescript
// Correct service pattern - Direct Supabase query
import { supabase } from '../../config/supabase';
import { logError } from '../logger';
import type { Post } from '../../types/social/post.types';

export async function getPosts(limit = 20, cursor?: string): Promise<Post[]> {
  try {
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        author:social_profiles(*),
        likes:social_likes(count),
        comments:social_comments(count)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (cursor) {
      query = query.lt('created_at', cursor);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as Post[];
  } catch (error) {
    logError('getPosts failed:', error);
    throw error;
  }
}
```

```typescript
// For complex operations - Use Edge Function
import { supabase } from '../../config/supabase';

export async function createPostWithMedia(input: CreatePostInput): Promise<Post> {
  const { data, error } = await supabase.functions.invoke('social-create-post', {
    body: input,
  });
  
  if (error) throw error;
  return data as Post;
}
```

### Supabase Edge Function Rules

1. **Use Deno** runtime
2. **Validate inputs** before processing
3. **Use RLS** — don't trust client data
4. **Return consistent** response format
5. **Handle errors** with proper status codes

```typescript
// supabase/functions/social-create-post/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get auth user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse input
    const { content, media, subjects } = await req.json();

    // Validate
    if (!content && !media) {
      return new Response(
        JSON.stringify({ success: false, error: 'Content or media required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create post
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        author_id: user.id,
        content,
        media,
        subjects,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Realtime Subscriptions (Supabase Realtime)

```typescript
// Subscribe to new posts in feed
import { supabase } from '../../config/supabase';

export function subscribeToFeed(onNewPost: (post: Post) => void) {
  const subscription = supabase
    .channel('social_posts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'social_posts',
      },
      (payload) => {
        onNewPost(payload.new as Post);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Subscribe to typing indicator in DMs
export function subscribeToTyping(conversationId: string, onTyping: (userId: string) => void) {
  const subscription = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
      onTyping(payload.userId);
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}

// Broadcast typing status
export async function broadcastTyping(conversationId: string, userId: string) {
  await supabase.channel(`typing:${conversationId}`).send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId },
  });
}
```

---

## Database Schema Rules

### Required Columns

Every social table MUST have:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### RLS Policy Pattern

Every table needs RLS enabled with these policies:

```sql
-- Enable RLS
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

-- Read policy (authenticated users)
CREATE POLICY "Users can read posts"
ON social_posts FOR SELECT
TO authenticated
USING (
  status = 'active' AND (
    privacy = 'public' OR
    author_id = auth.uid() OR
    author_id IN (SELECT following_id FROM social_follows WHERE follower_id = auth.uid())
  )
);

-- Insert policy (own content only)
CREATE POLICY "Users can create own posts"
ON social_posts FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Update policy (own content only)
CREATE POLICY "Users can update own posts"
ON social_posts FOR UPDATE
TO authenticated
USING (author_id = auth.uid());

-- Delete policy (own content only)
CREATE POLICY "Users can delete own posts"
ON social_posts FOR DELETE
TO authenticated
USING (author_id = auth.uid());
```

### Indexing Requirements

Add indexes for:
- Foreign keys
- Frequently filtered columns
- Frequently sorted columns

```sql
CREATE INDEX idx_social_posts_author ON social_posts(author_id);
CREATE INDEX idx_social_posts_created ON social_posts(created_at DESC);
CREATE INDEX idx_social_posts_school ON social_posts(school_id) WHERE school_id IS NOT NULL;
```

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth |
| `FORBIDDEN` | 403 | No permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Testing Requirements

### Before Marking Complete

Every feature MUST pass:

1. **Happy path** — Feature works as expected
2. **Error handling** — Graceful failure on errors
3. **Loading states** — UI shows loading indicators
4. **Empty states** — UI handles no data
5. **Offline behavior** — Graceful degradation
6. **Both platforms** — Mobile AND web work
7. **Animations** — Smooth, no jank
8. **Haptics** — Feedback on interactions (mobile)

---

## Performance Guidelines

### Mobile Performance

1. **FlatList** for long lists, never ScrollView with many items
2. **Memoize** expensive components with `React.memo`
3. **Lazy load** images with progressive placeholders
4. **Pagination** — max 20-50 items per page
5. **Debounce** search inputs (300ms)
6. **Prefetch** next page before user reaches end
7. **Cache** images aggressively

### Video/Media Performance

1. **Preload** next video in reels feed
2. **Pause** off-screen videos
3. **Use thumbnails** before video loads
4. **Progressive loading** for images (blur → full)

```typescript
// Video preloading for reels
const preloadVideo = async (url: string) => {
  await Video.prefetch(url);
};

// When current video is at 50%, preload next
useEffect(() => {
  if (progress > 0.5 && nextVideoUrl) {
    preloadVideo(nextVideoUrl);
  }
}, [progress]);
```

---

## Security Rules

### Never Do This

- ❌ Store API keys in client code
- ❌ Trust client-provided user IDs
- ❌ Skip input validation
- ❌ Log sensitive data
- ❌ Disable RLS policies
- ❌ Use `any` type for API responses

### Always Do This

- ✅ Validate all inputs server-side
- ✅ Use RLS for all database access
- ✅ Authenticate before operations
- ✅ Sanitize user-generated content
- ✅ Rate limit sensitive endpoints
- ✅ Log security events

---

## Quick Reference

### Creating a New Screen (Mobile)

```typescript
// src/screens/social/NewScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface NewScreenProps {
  navigation: any;
  route: any;
}

export const NewScreen: React.FC<NewScreenProps> = ({ navigation, route }) => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Content */}
    </SafeAreaView>
  );
};
```

### Creating a New Edge Function

```typescript
// supabase/functions/social-new-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Your logic here
    const { data, error } = await supabase
      .from('social_table')
      .select('*');

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Creating a New Migration

```sql
-- supabase/migrations/0XX_new_feature.sql

-- Create table
CREATE TABLE social_new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_new_table ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own"
ON social_new_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own"
ON social_new_table FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_social_new_table_user ON social_new_table(user_id);
CREATE INDEX idx_social_new_table_created ON social_new_table(created_at DESC);

-- Update trigger
CREATE TRIGGER update_social_new_table_updated_at
BEFORE UPDATE ON social_new_table
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Checklist Before Submitting Code

- [ ] Types defined for all data structures
- [ ] Theme colors used (no hardcoded colors)
- [ ] Translations used (no hardcoded strings)
- [ ] Error handling in place
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] RLS policies added (for DB changes)
- [ ] Indexes added (for DB changes)
- [ ] Both mobile and web work
- [ ] Animations are smooth
- [ ] Haptic feedback added (mobile)
- [ ] Tested manually

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 22, 2026 | Initial rules created |
| 1.1 | Jan 22, 2026 | Removed Firebase, added Supabase-only. Added social-first design guidelines |
