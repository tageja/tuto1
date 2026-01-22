# tuto.social — Implementation Plan

**Document Version:** 1.0  
**Created:** January 22, 2026  
**Parent Document:** TUTO_SOCIAL_PRD.md  
**Purpose:** Break down the project into 10 development parts for efficient chat-based development

---

## Development Strategy

### Context Window Optimization
- Each part is designed to fit within a **200k token context window**
- Each part: ~15-25 new files + related existing files
- Each part can be developed in **1-3 chat sessions**
- Parts are **sequential** — each builds on the previous
- Each part is **testable standalone** before moving to next

### Development Flow
```
Part 1 → Test → Part 2 → Test → Part 3 → ... → Part 10 → Final Integration
```

---

## Part Overview

| Part | Name | Est. Files | Dependencies | Priority |
|------|------|------------|--------------|----------|
| 1 | Database & Auth Foundation | 20-25 | None | P0 |
| 2 | Core Feed & Posts | 25-30 | Part 1 | P0 |
| 3 | Profiles & Social Graph | 20-25 | Part 1, 2 | P0 |
| 4 | Stories Feature | 15-20 | Part 1, 2, 3 | P1 |
| 5 | Reels/Shorts | 15-20 | Part 1, 2, 3 | P1 |
| 6 | Messaging (DMs) | 20-25 | Part 1, 3 | P1 |
| 7 | Notifications & Engagement | 15-20 | Part 1, 2, 3 | P1 |
| 8 | Creator Tools & Analytics | 15-20 | Part 1, 2, 3, 7 | P2 |
| 9 | Moderation & Safety | 15-20 | Part 1, 2, 6 | P2 |
| 10 | Premium & Monetization | 15-20 | All above | P2 |

---

## Platform Structure

### Three Platforms

| Platform | Location | Domain | Purpose |
|----------|----------|--------|---------|
| Mobile App | `src/` | App Store | Full Tuto app with Social tab |
| Main Website | `apps/dashboard/` | tuto.asia | Landing + School Dashboard + Feed Preview |
| Social Website | `apps/social/` | tuto.social | Full social platform |

### Cross-Platform Implementation

Each part must implement for **all three platforms**:

```
Part X Implementation
├── Mobile (src/)
│   ├── screens/social/
│   ├── components/social/
│   └── services/social/
│
├── Main Website (apps/dashboard/)
│   └── components/social/     # Feed preview only
│
├── Social Website (apps/social/)
│   ├── app/                   # Full pages
│   └── components/            # Full components
│
└── Backend (supabase/)
    ├── migrations/
    └── functions/
```

---

## PART 1: Database & Auth Foundation

### Objective
Set up the database schema, authentication integration, and create the `apps/social` Next.js app for tuto.social. This is the foundation everything else builds on.

### Scope
- Supabase migrations for all social tables
- RLS (Row Level Security) policies
- SSO integration with existing Tuto auth
- Create `apps/social/` Next.js app
- Basic API service layer
- Social profile creation flow
- Cross-domain auth configuration

### Files to Create

**Database (supabase/migrations/)**
```
035_social_profiles.sql          # Social profiles table
036_social_posts.sql             # Posts table with all fields
037_social_interactions.sql      # Likes, saves, shares
038_social_follows.sql           # Follow relationships
039_social_comments.sql          # Comments with threading
040_social_stories.sql           # Stories and views
041_social_messages.sql          # DMs and conversations
042_social_notifications.sql     # Notification system
043_social_moderation.sql        # Reports and blocks
044_social_creator.sql           # Creator earnings, analytics
045_social_rls_policies.sql      # All RLS policies
046_social_functions.sql         # Database functions/triggers
047_social_indexes.sql           # Performance indexes
```

**Social Website App (apps/social/) — NEW NEXT.JS APP**
```
apps/social/
├── app/
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage (redirect to feed or login)
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         # OAuth callback handler
│   └── globals.css              # Global styles
│
├── components/
│   ├── layout/
│   │   └── Header.tsx           # Basic header
│   └── ui/
│       ├── Button.tsx           # Button component
│       └── Avatar.tsx           # Avatar component
│
├── lib/
│   ├── supabase.ts              # Supabase client (browser)
│   ├── supabase-server.ts       # Supabase client (server)
│   └── utils.ts                 # Utilities
│
├── contexts/
│   └── AuthContext.tsx          # Auth provider
│
├── middleware.ts                # Auth middleware
├── next.config.js               # Next.js config
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind config
└── tsconfig.json                # TypeScript config
```

**Mobile Services (src/services/social/)**
```
index.ts                         # Service exports
auth.service.ts                  # SSO integration
profile.service.ts               # Profile CRUD
api.client.ts                    # API client setup
```

**Mobile Types (src/types/social/)**
```
index.ts                         # Type exports
profile.types.ts                 # Profile interfaces
post.types.ts                    # Post interfaces
common.types.ts                  # Shared types
```

**Supabase Edge Functions (supabase/functions/)**
```
social-profiles/index.ts         # Profile endpoints
social-auth/index.ts             # Auth/SSO endpoints
```

### Acceptance Criteria
- [ ] All migrations run without errors
- [ ] RLS policies prevent unauthorized access
- [ ] `apps/social` Next.js app created and runs
- [ ] tuto.social domain configured (or localhost for dev)
- [ ] SSO works with existing Tuto accounts
- [ ] Cross-domain auth works (login on tuto.asia → logged in on tuto.social)
- [ ] New users can create social profiles
- [ ] TypeScript types generated from schema
- [ ] Basic API calls work (create profile, get profile)

### Test Checklist
- [ ] Run `npm run dev` in apps/social — app starts
- [ ] Visit tuto.social (or localhost:3001) — see login page
- [ ] Login with existing Tuto account
- [ ] Create social profile for new user
- [ ] Verify RLS blocks cross-user access
- [ ] Verify profile data syncs correctly
- [ ] API endpoints return expected data
- [ ] Logout → login flow works

---

## PART 2: Core Feed & Posts

### Objective
Implement the main feed functionality — creating posts, displaying feed, and basic interactions (like, comment, save, share). Also create the feed preview for the main website.

### Prerequisites
- Part 1 completed and tested

### Scope
- Post creation (text, image, video)
- Feed display with algorithm
- Like/Unlike functionality
- Save/Unsave functionality
- Share functionality
- Basic comment system
- Subject tagging
- **Feed Preview component for main website (tuto.asia)**

### Files to Create/Modify

**Mobile Components (src/components/social/)**
```
PostCard.tsx                     # Enhanced post card (modify existing)
PostCardSkeleton.tsx            # Loading skeleton
CreatePostModal.tsx             # Enhanced creation (modify existing)
MediaPicker.tsx                 # Image/video selection
SubjectTagPicker.tsx            # Subject selection
FeedHeader.tsx                  # Feed header with tabs
FeedFilters.tsx                 # Filter chips
PostOptionsMenu.tsx             # Three-dot menu
ShareSheet.tsx                  # Share options
LikeButton.tsx                  # Animated like button
```

**Mobile Screens (src/screens/social/)**
```
SocialFeedScreen.tsx            # Main feed screen
PostDetailScreen.tsx            # Single post view
CreatePostScreen.tsx            # Full-screen creation
```

**Mobile Services (src/services/social/)**
```
feed.service.ts                 # Feed fetching, algorithm
posts.service.ts                # Post CRUD
interactions.service.ts         # Like, save, share
media.service.ts                # Media upload
```

**Social Website (apps/social/) — FULL FEED**
```
apps/social/
├── app/
│   ├── page.tsx                 # Feed page (/)
│   ├── post/
│   │   └── [id]/
│   │       └── page.tsx         # Single post (/post/123)
│   └── create/
│       └── page.tsx             # Create post (/create)
│
└── components/
    └── feed/
        ├── FeedPost.tsx         # Full post card
        ├── FeedContainer.tsx    # Feed wrapper
        ├── FeedSkeleton.tsx     # Loading state
        ├── FeedFilters.tsx      # For You / Following tabs
        ├── CreatePostModal.tsx  # Post creation modal
        ├── PostInteractions.tsx # Like/comment/share bar
        ├── CommentSection.tsx   # Comments
        └── ShareModal.tsx       # Share options
```

**Main Website Feed Preview (apps/dashboard/) — PREVIEW ONLY**
```
apps/dashboard/
├── app/
│   └── page.tsx                 # Homepage (add FeedPreview section)
│
└── components/
    └── social/
        ├── FeedPreview.tsx      # Shows 3-5 trending posts
        ├── FeedPreviewCard.tsx  # Compact post card
        ├── SocialCTA.tsx        # "Join tuto.social" button
        └── TrendingEducators.tsx # Top educators widget
```

**Supabase Edge Functions (supabase/functions/)**
```
social-posts/index.ts           # Post CRUD endpoints
social-feed/index.ts            # Feed endpoints
social-interactions/index.ts    # Like/save endpoints
```

### Feed Preview Component Spec

The feed preview on tuto.asia should:

```tsx
// apps/dashboard/components/social/FeedPreview.tsx
// Shows on homepage, links to tuto.social

<section className="py-16 bg-gray-50">
  <div className="max-w-6xl mx-auto px-6">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-3xl font-bold">Community Feed</h2>
        <p className="text-gray-600">See what educators are sharing</p>
      </div>
      <a href="https://tuto.social" className="btn-primary">
        Join tuto.social →
      </a>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6">
      {trendingPosts.map(post => (
        <FeedPreviewCard 
          key={post.id} 
          post={post}
          onClick={() => window.open(`https://tuto.social/post/${post.id}`)}
        />
      ))}
    </div>
  </div>
</section>
```

### Acceptance Criteria

**Mobile App:**
- [ ] Users can create text posts
- [ ] Users can create posts with images
- [ ] Users can create posts with videos
- [ ] Feed displays posts from followed users
- [ ] Feed displays "For You" algorithmic content
- [ ] Like/unlike works with optimistic updates + animation
- [ ] Save/unsave works
- [ ] Share opens native share sheet
- [ ] Subject tags display and filter correctly
- [ ] Comments can be added to posts
- [ ] Haptic feedback on interactions

**Social Website (tuto.social):**
- [ ] Feed page loads at tuto.social/
- [ ] Posts display correctly
- [ ] Like/comment/share works
- [ ] Create post modal works
- [ ] Post detail page works
- [ ] Comments section works

**Main Website (tuto.asia) Feed Preview:**
- [ ] Feed preview section shows on homepage
- [ ] Shows 3-5 trending posts
- [ ] Clicking post opens tuto.social
- [ ] "Join tuto.social" CTA works
- [ ] Responsive design

### Test Checklist

**Mobile:**
- [ ] Create text-only post
- [ ] Create post with single image
- [ ] Create post with multiple images
- [ ] Create post with video
- [ ] Like a post (verify count updates + animation)
- [ ] Unlike a post (verify count updates)
- [ ] Double-tap to like
- [ ] Save a post
- [ ] Share a post externally
- [ ] Add comment to post
- [ ] Filter feed by subject
- [ ] Switch between For You/Following feeds

**Social Website:**
- [ ] Visit tuto.social — feed loads
- [ ] Like a post
- [ ] Comment on a post
- [ ] Share a post
- [ ] Create a new post
- [ ] View post detail page

**Main Website Preview:**
- [ ] Visit tuto.asia — see feed preview section
- [ ] Click post — opens tuto.social/post/[id]
- [ ] Click "Join tuto.social" — opens tuto.social

---

## PART 3: Profiles & Social Graph

### Objective
Implement user profiles, follow/following system, and user discovery.

### Prerequisites
- Part 1 and Part 2 completed

### Scope
- Profile page (own and others)
- Edit profile functionality
- Follow/Unfollow
- Followers/Following lists
- User search and discovery
- Profile stats

### Files to Create/Modify

**Mobile Components (src/components/social/)**
```
ProfileHeader.tsx               # Profile header section
ProfileStats.tsx                # Posts/Followers/Following
ProfileTabs.tsx                 # Posts/Reels/Saved tabs
ProfilePostGrid.tsx             # Grid view of posts
EditProfileModal.tsx            # Edit profile form
FollowButton.tsx                # Follow/Unfollow button
UserListItem.tsx                # User in list
UserSearchResult.tsx            # Search result item
```

**Mobile Screens (src/screens/social/)**
```
SocialProfileScreen.tsx         # Profile page
EditProfileScreen.tsx           # Edit profile
FollowersScreen.tsx             # Followers list
FollowingScreen.tsx             # Following list
SocialSearchScreen.tsx          # User/content search
```

**Services (src/services/social/)**
```
profile.service.ts              # (extend) Profile operations
follows.service.ts              # Follow/unfollow
search.service.ts               # User and content search
```

**Web Components (apps/dashboard/components/social/)**
```
ProfileCard.tsx                 # Profile display
ProfileHeader.tsx               # Web profile header
UserGrid.tsx                    # Grid of users
SearchResults.tsx               # Search results
```

**Web Pages (apps/dashboard/app/social/)**
```
profile/[username]/page.tsx     # Profile page
profile/edit/page.tsx           # Edit profile
followers/page.tsx              # Followers
following/page.tsx              # Following
search/page.tsx                 # Search page
```

**Supabase Edge Functions (supabase/functions/)**
```
social-profiles/index.ts        # (extend) Profile endpoints
social-follows/index.ts         # Follow endpoints
social-search/index.ts          # Search endpoints
```

### Acceptance Criteria
- [ ] Profile page shows all user info
- [ ] Profile shows post grid
- [ ] Edit profile updates all fields
- [ ] Avatar upload works
- [ ] Cover photo upload works
- [ ] Follow button follows user
- [ ] Unfollow button unfollows user
- [ ] Followers list shows all followers
- [ ] Following list shows all following
- [ ] Search finds users by name
- [ ] Search finds users by username
- [ ] Profile stats update in real-time

### Test Checklist
- [ ] View own profile
- [ ] View other user's profile
- [ ] Edit display name
- [ ] Edit bio
- [ ] Upload new avatar
- [ ] Upload cover photo
- [ ] Follow a user
- [ ] Unfollow a user
- [ ] View followers list
- [ ] View following list
- [ ] Search for user by name
- [ ] Search for user by username
- [ ] Verify follower counts update

---

## PART 4: Stories Feature

### Objective
Implement 24-hour ephemeral stories similar to Instagram/Facebook stories.

### Prerequisites
- Parts 1, 2, 3 completed

### Scope
- Story creation (photo/video)
- Story viewer
- Story bar on feed
- Story reactions
- Story replies
- Story expiration (24hr)
- View tracking

### Files to Create

**Mobile Components (src/components/social/)**
```
StoryBar.tsx                    # Horizontal story bar
StoryRing.tsx                   # Story avatar ring
StoryViewer.tsx                 # Full-screen viewer
StoryProgress.tsx               # Progress bar
StoryReplyInput.tsx             # Reply input
StoryReactions.tsx              # Reaction buttons
CreateStoryModal.tsx            # Story creation
StoryMediaEditor.tsx            # Add text/stickers
```

**Mobile Screens (src/screens/social/)**
```
StoryViewerScreen.tsx           # Story viewer screen
CreateStoryScreen.tsx           # Create story
StoryViewersScreen.tsx          # Who viewed story
```

**Services (src/services/social/)**
```
stories.service.ts              # Story CRUD
storyViews.service.ts           # View tracking
```

**Web Components (apps/dashboard/components/social/)**
```
StoryBar.tsx                    # Web story bar
StoryViewer.tsx                 # Web story viewer
StoryCard.tsx                   # Story preview
```

**Web Pages (apps/dashboard/app/social/)**
```
stories/page.tsx                # Stories page
stories/create/page.tsx         # Create story
```

**Supabase Edge Functions (supabase/functions/)**
```
social-stories/index.ts         # Story endpoints
```

**Background Jobs (Supabase pg_cron or Edge Function with cron)**
```
supabase/functions/
  social-expire-stories/index.ts  # Expire old stories (triggered by cron)
```

### Acceptance Criteria
- [ ] Story bar shows on feed
- [ ] Own story ring shows "+" when no story
- [ ] Can create photo story
- [ ] Can create video story
- [ ] Can add text overlay
- [ ] Story viewer shows progress
- [ ] Tap advances to next story
- [ ] Tap and hold pauses
- [ ] Stories expire after 24 hours
- [ ] View count updates
- [ ] Can reply to stories
- [ ] Can react to stories

### Test Checklist
- [ ] Create photo story
- [ ] Create video story
- [ ] Add text to story
- [ ] View own story
- [ ] View other's story
- [ ] Verify progress bar works
- [ ] Verify tap navigation works
- [ ] Reply to a story
- [ ] Check view count
- [ ] Verify 24hr expiration

---

## PART 5: Reels/Shorts

### Objective
Implement TikTok-style vertical short-form video feature.

### Prerequisites
- Parts 1, 2, 3 completed

### Scope
- Reel creation (record/upload)
- Reel viewer (swipe navigation)
- Reel interactions
- Sound/music (basic)
- Reel discovery
- Duet/React (future-ready)

### Files to Create

**Mobile Components (src/components/social/)**
```
ReelPlayer.tsx                  # Full-screen video player
ReelCard.tsx                    # Reel in grid
ReelActions.tsx                 # Side action bar
ReelInfo.tsx                    # Author/caption/music
ReelProgress.tsx                # Video progress
SoundInfo.tsx                   # Sound attribution
CreateReelModal.tsx             # Reel creation
ReelEditor.tsx                  # Trim, filters
```

**Mobile Screens (src/screens/social/)**
```
ReelsScreen.tsx                 # Full-screen reel feed
CreateReelScreen.tsx            # Record/upload reel
ReelDetailScreen.tsx            # Single reel
SoundReelsScreen.tsx            # Reels with same sound
```

**Services (src/services/social/)**
```
reels.service.ts                # Reel CRUD
reelFeed.service.ts             # Reel algorithm
sounds.service.ts               # Sound/music
```

**Web Components (apps/dashboard/components/social/)**
```
ReelViewer.tsx                  # Web reel viewer
ReelGrid.tsx                    # Grid of reels
ReelPlayer.tsx                  # Video player
```

**Web Pages (apps/dashboard/app/social/)**
```
reels/page.tsx                  # Reels page
reels/[id]/page.tsx            # Single reel
reels/create/page.tsx          # Create reel
```

**Supabase Edge Functions (supabase/functions/)**
```
social-reels/index.ts           # Reel endpoints
social-sounds/index.ts          # Sound endpoints
```

### Acceptance Criteria
- [ ] Reels tab shows vertical feed
- [ ] Swipe up/down navigates reels
- [ ] Video auto-plays
- [ ] Video loops
- [ ] Like/comment/share works
- [ ] Can create reel from camera
- [ ] Can upload existing video
- [ ] Basic trim functionality
- [ ] Sound displays correctly
- [ ] Reel appears in profile grid

### Test Checklist
- [ ] View reel feed
- [ ] Swipe between reels
- [ ] Like a reel
- [ ] Comment on reel
- [ ] Share a reel
- [ ] Record new reel
- [ ] Upload video as reel
- [ ] Trim video length
- [ ] Verify reel in profile

---

## PART 6: Messaging (DMs)

### Objective
Implement direct messaging between users.

### Prerequisites
- Parts 1, 3 completed

### Scope
- Conversation list
- 1:1 messaging
- Group chats
- Media sharing
- Message requests
- Read receipts
- Real-time updates

### Files to Create

**Mobile Components (src/components/social/)**
```
ConversationListItem.tsx        # Conversation preview
MessageBubble.tsx               # Chat bubble
MessageInput.tsx                # Input with media
MessageMediaPreview.tsx         # Media in message
ChatHeader.tsx                  # Chat header
MessageRequestBanner.tsx        # Request notification
TypingIndicator.tsx             # Typing status
GroupChatHeader.tsx             # Group info
```

**Mobile Screens (src/screens/social/)**
```
ConversationsScreen.tsx         # DM list
ChatScreen.tsx                  # Chat view
NewMessageScreen.tsx            # Start new chat
MessageRequestsScreen.tsx       # Pending requests
GroupChatInfoScreen.tsx         # Group details
```

**Services (src/services/social/)**
```
conversations.service.ts        # Conversation CRUD
messages.service.ts             # Message CRUD
realtime.service.ts             # WebSocket/realtime
```

**Web Components (apps/dashboard/components/social/)**
```
ConversationList.tsx            # Conversation sidebar
ChatWindow.tsx                  # Chat panel
MessageThread.tsx               # Message list
ChatInput.tsx                   # Input component
```

**Web Pages (apps/dashboard/app/social/)**
```
messages/page.tsx               # Messages page
messages/[id]/page.tsx         # Conversation
messages/new/page.tsx          # New message
```

**Supabase Edge Functions (supabase/functions/)**
```
social-conversations/index.ts   # Conversation endpoints
social-messages/index.ts        # Message endpoints
```

**Supabase Realtime**
```
- Real-time message delivery via Supabase Realtime channels
- Typing indicators via broadcast
- Presence for online status
```

### Acceptance Criteria
- [ ] Conversation list shows all chats
- [ ] Can start new 1:1 chat
- [ ] Messages send instantly
- [ ] Messages receive in real-time
- [ ] Can send images
- [ ] Can send videos
- [ ] Read receipts show
- [ ] Message requests work
- [ ] Can create group chat
- [ ] Group messaging works

### Test Checklist
- [ ] View conversation list
- [ ] Start new conversation
- [ ] Send text message
- [ ] Receive text message
- [ ] Send image
- [ ] Send video
- [ ] Verify read receipts
- [ ] Accept message request
- [ ] Create group chat
- [ ] Send group message

---

## PART 7: Notifications & Engagement

### Objective
Implement push notifications, in-app notifications, and gamification system.

### Prerequisites
- Parts 1, 2, 3 completed

### Scope
- Push notifications
- In-app notification center
- Notification preferences
- Achievement system
- XP and levels
- Streaks
- Leaderboards (basic)

### Files to Create

**Mobile Components (src/components/social/)**
```
NotificationItem.tsx            # Notification row
NotificationBadge.tsx           # Unread badge
AchievementCard.tsx             # Achievement display
AchievementUnlock.tsx           # Unlock animation
XPProgress.tsx                  # Level progress
StreakCounter.tsx               # Streak display
LeaderboardItem.tsx             # Leaderboard row
```

**Mobile Screens (src/screens/social/)**
```
NotificationsScreen.tsx         # Notification center
AchievementsScreen.tsx          # All achievements
LeaderboardScreen.tsx           # Leaderboards
```

**Services (src/services/social/)**
```
notifications.service.ts        # Notification CRUD
push.service.ts                 # Push notification
achievements.service.ts         # Achievement tracking
gamification.service.ts         # XP, levels, streaks
```

**Web Components (apps/dashboard/components/social/)**
```
NotificationPanel.tsx           # Notification dropdown
NotificationList.tsx            # Notification list
AchievementBadge.tsx           # Badge display
```

**Web Pages (apps/dashboard/app/social/)**
```
notifications/page.tsx          # Notifications
achievements/page.tsx           # Achievements
```

**Supabase Edge Functions (supabase/functions/)**
```
social-notifications/index.ts   # Notification endpoints
social-achievements/index.ts    # Achievement endpoints
social-gamification/index.ts    # XP/level endpoints
```

**Supabase Database Triggers (supabase/migrations/)**
```
-- Triggers call Edge Functions via pg_net or handle in-database
048_social_notification_triggers.sql  # Like, comment, follow triggers
049_social_achievement_triggers.sql   # Achievement unlock triggers
```

**Push Notifications**
```
- Expo Push Notifications for mobile
- Web Push API for web
- OneSignal as optional provider
```

### Acceptance Criteria
- [ ] Push notifications receive
- [ ] Notification center shows all
- [ ] Filter by notification type
- [ ] Mark as read works
- [ ] Achievements unlock
- [ ] Achievement animation plays
- [ ] XP accumulates
- [ ] Level up works
- [ ] Streak tracks daily activity
- [ ] Notification settings work

### Test Checklist
- [ ] Receive like notification
- [ ] Receive comment notification
- [ ] Receive follow notification
- [ ] View notification center
- [ ] Mark notification read
- [ ] Mark all read
- [ ] Unlock achievement
- [ ] Verify XP gain
- [ ] Check streak counter
- [ ] Change notification settings

---

## PART 8: Creator Tools & Analytics

### Objective
Implement creator dashboard with analytics and monetization settings.

### Prerequisites
- Parts 1, 2, 3, 7 completed

### Scope
- Creator dashboard
- Post analytics
- Audience insights
- Revenue tracking
- Tipping/gifts (basic)
- Payout settings

### Files to Create

**Mobile Components (src/components/social/)**
```
CreatorDashboard.tsx            # Dashboard overview
AnalyticsChart.tsx              # Charts
PostPerformance.tsx             # Post stats
AudienceInsights.tsx            # Audience data
RevenueCard.tsx                 # Earnings display
GiftModal.tsx                   # Send gift
PayoutSettings.tsx              # Payout config
```

**Mobile Screens (src/screens/social/)**
```
CreatorDashboardScreen.tsx      # Full dashboard
PostAnalyticsScreen.tsx         # Single post stats
AudienceScreen.tsx              # Audience details
EarningsScreen.tsx              # Revenue details
PayoutScreen.tsx                # Payout setup
```

**Services (src/services/social/)**
```
analytics.service.ts            # Analytics data
revenue.service.ts              # Revenue tracking
payouts.service.ts              # Payout management
gifts.service.ts                # Tipping system
```

**Web Components (apps/dashboard/components/social/)**
```
CreatorOverview.tsx             # Dashboard widgets
AnalyticsDashboard.tsx          # Full analytics
RevenueChart.tsx                # Revenue graph
TopPosts.tsx                    # Best performing
```

**Web Pages (apps/dashboard/app/social/)**
```
creator/page.tsx                # Creator dashboard
creator/analytics/page.tsx      # Full analytics
creator/earnings/page.tsx       # Earnings
creator/payouts/page.tsx        # Payout setup
```

**Supabase Edge Functions (supabase/functions/)**
```
social-analytics/index.ts       # Analytics endpoints
social-revenue/index.ts         # Revenue endpoints
social-payouts/index.ts         # Payout endpoints
social-gifts/index.ts           # Gift endpoints
```

### Acceptance Criteria
- [ ] Creator dashboard shows overview
- [ ] Post analytics show views/likes
- [ ] Audience demographics display
- [ ] Revenue tracking works
- [ ] Users can send gifts/tips
- [ ] Creators receive gifts
- [ ] Payout settings save
- [ ] Revenue history shows

### Test Checklist
- [ ] View creator dashboard
- [ ] Check post performance
- [ ] View audience insights
- [ ] Send a gift
- [ ] Receive a gift
- [ ] View earnings
- [ ] Set up payout
- [ ] Request payout

---

## PART 9: Moderation & Safety

### Objective
Implement content moderation, reporting system, and parental controls.

### Prerequisites
- Parts 1, 2, 6 completed

### Scope
- Report content/users
- Block users
- Mute users
- Admin moderation queue
- AI content screening (basic)
- Parental controls
- Activity reports

### Files to Create

**Mobile Components (src/components/social/)**
```
ReportModal.tsx                 # Report form
BlockUserModal.tsx              # Block confirmation
MuteUserModal.tsx               # Mute options
ContentWarning.tsx              # Warning overlay
ParentalControls.tsx            # Control settings
ScreenTimeDisplay.tsx           # Time tracking
ActivityReport.tsx              # Activity summary
```

**Mobile Screens (src/screens/social/)**
```
ReportScreen.tsx                # Full report form
BlockedUsersScreen.tsx          # Blocked list
MutedUsersScreen.tsx            # Muted list
ParentalControlsScreen.tsx      # Parent settings
ActivityReportScreen.tsx        # Child activity
```

**Services (src/services/social/)**
```
moderation.service.ts           # Report/block
safety.service.ts               # Content filtering
parental.service.ts             # Parental controls
screenTime.service.ts           # Time tracking
```

**Web Components (apps/dashboard/components/social/)**
```
ModerationQueue.tsx             # Admin queue
ReportCard.tsx                  # Report item
ModerationActions.tsx           # Approve/reject
ContentFilter.tsx               # Filter settings
```

**Web Pages (apps/dashboard/app/social/)**
```
moderation/page.tsx             # Mod dashboard
moderation/reports/page.tsx     # Report queue
moderation/users/page.tsx       # User management
settings/parental/page.tsx      # Parental controls
```

**Supabase Edge Functions (supabase/functions/)**
```
social-moderation/index.ts      # Moderation endpoints
social-reports/index.ts         # Report endpoints
social-parental/index.ts        # Parental endpoints
```

### Acceptance Criteria
- [ ] Users can report content
- [ ] Users can report users
- [ ] Block prevents interaction
- [ ] Mute hides content
- [ ] Admins see moderation queue
- [ ] Admins can take action
- [ ] Parental controls limit features
- [ ] Screen time tracks usage
- [ ] Activity reports send to parents

### Test Checklist
- [ ] Report a post
- [ ] Report a user
- [ ] Block a user
- [ ] Verify blocked user hidden
- [ ] Mute a user
- [ ] Admin review report
- [ ] Admin approve/reject
- [ ] Set parental controls
- [ ] Check screen time
- [ ] Generate activity report

---

## PART 10: Premium & Monetization

### Objective
Implement subscription tiers, advertising, and full monetization stack.

### Prerequisites
- All previous parts completed

### Scope
- Premium subscriptions (Plus/Pro)
- Ad-free experience
- Advertising system
- School subscriptions
- Full payout system
- Creator subscriptions

### Files to Create

**Mobile Components (src/components/social/)**
```
SubscriptionCard.tsx            # Plan display
UpgradeModal.tsx                # Upgrade prompt
AdBanner.tsx                    # Ad display
NativeAd.tsx                    # In-feed ad
PremiumBadge.tsx                # Premium indicator
CreatorSubscribe.tsx            # Subscribe to creator
```

**Mobile Screens (src/screens/social/)**
```
SubscriptionScreen.tsx          # Choose plan
PaymentScreen.tsx               # Payment flow
PremiumFeaturesScreen.tsx       # Premium perks
CreatorSubscriptionsScreen.tsx  # Manage subs
```

**Services (src/services/social/)**
```
subscriptions.service.ts        # Subscription management
ads.service.ts                  # Ad serving
billing.service.ts              # Payment processing
creatorSubs.service.ts          # Creator subscriptions
```

**Web Components (apps/dashboard/components/social/)**
```
PricingTable.tsx                # Pricing display
AdManager.tsx                   # Ad campaign manager
SubscriptionManager.tsx         # Manage subscriptions
```

**Web Pages (apps/dashboard/app/social/)**
```
premium/page.tsx                # Premium plans
premium/checkout/page.tsx       # Payment
ads/page.tsx                    # Ad manager
ads/create/page.tsx            # Create ad
school/subscription/page.tsx    # School plans
```

**Supabase Edge Functions (supabase/functions/)**
```
social-subscriptions/index.ts   # Subscription endpoints
social-billing/index.ts         # Billing/Stripe webhooks
social-ads/index.ts             # Ad endpoints
```

### Acceptance Criteria
- [ ] Users can view plans
- [ ] Users can subscribe (Plus)
- [ ] Premium removes ads
- [ ] Ads display for free users
- [ ] Schools can subscribe
- [ ] Creator subscriptions work
- [ ] Payouts process correctly
- [ ] Revenue reports accurate

### Test Checklist
- [ ] View subscription plans
- [ ] Purchase subscription
- [ ] Verify ad-free experience
- [ ] Verify ads show for free
- [ ] Cancel subscription
- [ ] School subscription flow
- [ ] Subscribe to creator
- [ ] Creator receives payment

---

## Progress Tracking

### Overall Status
| Part | Status | Progress | Sessions | Last Updated |
|------|--------|----------|----------|--------------|
| 1 | Not Started | 0% | 0 | - |
| 2 | Not Started | 0% | 0 | - |
| 3 | Not Started | 0% | 0 | - |
| 4 | Not Started | 0% | 0 | - |
| 5 | Not Started | 0% | 0 | - |
| 6 | Not Started | 0% | 0 | - |
| 7 | Not Started | 0% | 0 | - |
| 8 | Not Started | 0% | 0 | - |
| 9 | Not Started | 0% | 0 | - |
| 10 | Not Started | 0% | 0 | - |

### Session Log
| Date | Part | Session # | What Was Done | Files Created |
|------|------|-----------|---------------|---------------|
| - | - | - | - | - |

---

## How to Use This Document

### Starting a New Session

1. **Check current progress** in this document
2. **Tell the agent** which part you're working on
3. **Reference** `TUTO_SOCIAL_CURSOR_RULES.md` for architecture rules
4. **Complete** the acceptance criteria for the part
5. **Test** using the test checklist
6. **Update** progress in this document

### Session Prompt Template

```
I'm working on tuto.social Part [X]: [Name].

Please read:
- docs/prd-specs/TUTO_SOCIAL_PRD.md (full spec)
- docs/prd-specs/TUTO_SOCIAL_IMPLEMENTATION_PLAN.md (this plan)
- docs/prd-specs/TUTO_SOCIAL_CURSOR_RULES.md (architecture rules)

Current progress: [describe what's done]

Next task: [specific task from acceptance criteria]
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 22, 2026 | Initial plan created |
