# tuto.social — Complete Product Architecture

**Document Version:** 1.0  
**Created:** January 22, 2026  
**Status:** Planning Phase  
**Owner:** Product Team

---

## Executive Summary

**tuto.social** is a vertical social network designed exclusively for the education ecosystem. Unlike horizontal platforms (Facebook, Instagram, TikTok), tuto.social is purpose-built for parents, teachers, students, and schools to share educational content, celebrate achievements, and build community around learning.

**Vision:** Become the "LinkedIn for K-12 Education" — a platform where education stakeholders connect, share knowledge, and celebrate learning milestones in a safe, parent-approved environment.

**Unique Value Proposition:**
- Education-first content moderation
- Role-based content discovery (teachers see teacher content, parents see parent content)
- School-scoped privacy options
- Achievement & milestone system tied to actual academic progress
- Safe harbor for educational reels/shorts

---

## Platform & Domain Structure

### Three Entry Points, One Experience

| Platform | Domain | Purpose |
|----------|--------|---------|
| **Mobile App** | App Store / Play Store | Full Tuto experience with integrated social |
| **Main Website** | tuto.asia / tutoglobal.com | Landing, school dashboard, teacher discovery |
| **Social Website** | tuto.social | Dedicated social platform (full experience) |

### User Flow Between Platforms

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   MOBILE APP (Tuto)                                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Home │ School │ SOCIAL │ Search │ Profile              │   │
│   └─────────────────────────────────────────────────────────┘   │
│                      │                                          │
│                      ▼                                          │
│              Full social features                               │
│              (feed, reels, stories, DMs)                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   MAIN WEBSITE (tuto.asia)                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Hero  │  Features  │  COMMUNITY FEED  │  CTA           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│                     ┌─────────────────┐                         │
│                     │ Feed Preview    │                         │
│                     │ (3-5 top posts) │                         │
│                     │                 │                         │
│                     │ [Join tuto.social →]                      │
│                     └────────┬────────┘                         │
│                              │                                  │
│                              ▼                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SOCIAL WEBSITE (tuto.social)                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Feed  │  Explore  │  Reels  │  Messages  │  Profile    │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Full social experience:                                       │
│   • Infinite feed                                               │
│   • Stories bar                                                 │
│   • Reels                                                       │
│   • Direct messages                                             │
│   • Creator tools                                               │
│   • Settings                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Community Feed Preview (Main Website)

The main website (tuto.asia) includes a "Community Feed" section that:

1. **Shows preview content:**
   - 3-5 trending posts
   - Top educators this week
   - Recent achievements

2. **Drives traffic to tuto.social:**
   - "See more on tuto.social" CTA
   - Clicking any post → Opens tuto.social
   - "Join the community" signup CTA

3. **Design:**
   ```
   ┌─────────────────────────────────────────┐
   │  🌟 Community Feed                      │
   │  See what educators are sharing         │
   ├─────────────────────────────────────────┤
   │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
   │  │ Post 1  │ │ Post 2  │ │ Post 3  │   │
   │  │ preview │ │ preview │ │ preview │   │
   │  └─────────┘ └─────────┘ └─────────┘   │
   │                                         │
   │  [Join tuto.social →]                   │
   └─────────────────────────────────────────┘
   ```

### Cross-Domain Authentication

All three platforms share authentication via Supabase:

```
User logs in on tuto.asia
        │
        ▼
  Supabase Auth session created
        │
        ├──► tuto.asia (logged in)
        │
        ├──► tuto.social (auto logged in via shared session)
        │
        └──► Mobile app (same Supabase project)
```

**Implementation:**
- Supabase Auth configured with multiple domains
- JWT tokens work across all domains
- "Login with Tuto" button on tuto.social

---

## 1. User Types & Personas

### 1.1 Primary User Types

| Role | Description | Key Motivations |
|------|-------------|-----------------|
| **Parent/Guardian** | Primary decision-maker, paying customer | Track child progress, celebrate achievements, find resources, connect with teachers |
| **Teacher** | Content creator, tutor, school staff | Build reputation, share knowledge, attract students, showcase teaching methods |
| **Student** | K-12 learners | Share achievements, learn from peers, engage with educational content |
| **School** | Institutional accounts | Broadcast announcements, showcase school life, recruit students |
| **Admin** | Platform moderators | Content moderation, safety enforcement |

### 1.2 Account Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    tuto.social Account Types                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Personal Account (Parent/Student/Teacher)                   │
│     └── Can link to existing Tuto account                       │
│     └── Can link to School Dashboard account                    │
│     └── Standalone registration available                       │
│                                                                 │
│  2. Creator Account (Upgraded Personal)                         │
│     └── Analytics dashboard                                     │
│     └── Monetization features                                   │
│     └── Verification badge eligible                             │
│                                                                 │
│  3. School Account (Business)                                   │
│     └── Multiple admin managers                                 │
│     └── School branding                                         │
│     └── Event promotion                                         │
│     └── Staff spotlights                                        │
│                                                                 │
│  4. Brand Account (Advertisers)                                 │
│     └── Educational brands/publishers                           │
│     └── Promoted content capabilities                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Feature Set

### 2.1 Core Feed Features

#### Feed Types
1. **For You Feed** — Algorithm-curated content based on role, interests, engagement
2. **Following Feed** — Content from followed accounts
3. **School Feed** — Content from your school community (if linked)
4. **Discover Feed** — Trending educational content
5. **Saved Feed** — Bookmarked content

#### Post Types
| Type | Description | Max Duration/Size |
|------|-------------|-------------------|
| **Text Post** | Rich text with formatting | 2000 characters |
| **Image Post** | Single/carousel images | 10 images, 10MB each |
| **Video Post** | Standard video | 10 minutes, 500MB |
| **Reel/Short** | Vertical short-form video | 90 seconds, 100MB |
| **Poll** | Interactive polls | 4 options, 7-day expiry |
| **Achievement** | Auto-generated milestone posts | System-generated |
| **Resource Share** | Educational resources/links | Verified links only |
| **Event** | Event promotion | Linked to school calendar |
| **Live** | Live streaming (Creator+) | 4 hours max |

#### Interactions
- ❤️ **Like** (public count)
- 💬 **Comment** (threaded, nested)
- 🔄 **Share** (to feed, DM, external)
- 🔖 **Save** (private collections)
- 🚩 **Report** (moderation)
- 🎁 **Gift/Tip** (creator monetization)

### 2.2 Stories Feature
- 24-hour ephemeral content
- Photo/video with overlays
- Stickers (educational themed)
- Polls, Q&A, quizzes
- Music (licensed educational content)
- Mention/tag users

### 2.3 Reels/Shorts Feature
- 15-90 second vertical videos
- Educational filters & effects
- Duet/React feature
- Sound library (royalty-free)
- Trending challenges (education-themed)
- Subject hashtags (#MathHacks, #EnglishTips)

### 2.4 Messaging (DMs)
- 1:1 messaging
- Group chats (up to 50)
- Parent-teacher direct connect
- File sharing (PDFs, docs)
- Voice notes
- Video calls (optional upgrade)

### 2.5 Notifications
- Push notifications
- In-app notifications
- Email digests (configurable)
- Smart grouping
- Priority notifications (from schools)

### 2.6 Search & Discovery
- User search (by name, role, school)
- Content search (posts, hashtags)
- Subject-based discovery
- Location-based (nearby teachers)
- School directory

### 2.7 Profile Features
- Profile photo & cover image
- Bio (500 chars)
- Role badge (verified)
- School affiliation
- Subjects/interests
- Achievement showcase
- Stats (followers, posts, engagement)
- Linked accounts (Tuto app, School Dashboard)

### 2.8 Creator Tools
- Analytics dashboard
- Audience insights
- Content performance
- Best posting times
- Revenue tracking
- Brand collaboration inbox

### 2.9 School Features
- School page/profile
- Staff directory
- Event calendar
- Announcement broadcast
- Photo albums (field trips, events)
- Admissions info

### 2.10 Parental Controls
- Content filters by age
- Screen time limits
- Activity reports
- Follower approval
- DM restrictions
- Safe search enforcement

---

## 3. Detailed Page/Screen Map

### 3.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SPLASH SCREEN                                               │
│     └── Logo animation                                          │
│     └── Check existing session                                  │
│                                                                 │
│  2. WELCOME SCREEN                                              │
│     ├── [Sign In] ──────────────────────────────────┐           │
│     ├── [Create Account] ───────────────────────┐   │           │
│     └── [Continue as Guest] (limited features)  │   │           │
│                                                 │   │           │
│  3. SIGN IN OPTIONS                             │   │           │
│     ├── [Sign in with Tuto Account] ◄───────────┴───┤           │
│     │   └── SSO with existing Tuto/School login     │           │
│     ├── [Sign in with Google]                       │           │
│     ├── [Sign in with Apple]                        │           │
│     ├── [Sign in with Facebook]                     │           │
│     └── [Sign in with Email/Password]               │           │
│                                                     │           │
│  4. REGISTRATION FLOW                               │           │
│     ├── Step 1: Basic Info                          │           │
│     │   └── Name, Email, Password                   │           │
│     ├── Step 2: Role Selection                      │           │
│     │   └── Parent / Teacher / Student              │           │
│     ├── Step 3: Profile Setup                       │           │
│     │   └── Avatar, Bio, Subjects                   │           │
│     ├── Step 4: School Link (Optional)              │           │
│     │   └── Enter school code or skip               │           │
│     ├── Step 5: Interest Selection                  │           │
│     │   └── Choose subjects/topics                  │           │
│     ├── Step 6: Follow Suggestions                  │           │
│     │   └── Suggested accounts by role              │           │
│     └── Step 7: Notification Permissions            │           │
│         └── Enable push notifications               │           │
│                                                                 │
│  5. FORGOT PASSWORD                                             │
│     └── Email/Phone recovery flow                               │
│                                                                 │
│  6. AGE VERIFICATION (if Student)                               │
│     └── Birthday input                                          │
│     └── Parental consent flow (if under 13)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Main App Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│                    MAIN APP STRUCTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BOTTOM TAB BAR                                                 │
│  ┌──────┬──────┬──────┬──────┬──────┐                          │
│  │ Home │Search│Create│Notif │Profile│                          │
│  └──────┴──────┴──────┴──────┴──────┘                          │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  TAB 1: HOME                                                    │
│  ├── Header                                                     │
│  │   ├── Logo (tap = refresh)                                   │
│  │   ├── [For You | Following | School] tabs                    │
│  │   └── [DMs] icon (message count badge)                       │
│  │                                                              │
│  ├── Stories Bar (horizontal scroll)                            │
│  │   ├── [Your Story] (+)                                       │
│  │   └── [Following Stories...]                                 │
│  │                                                              │
│  └── Feed (infinite scroll)                                     │
│      ├── Post Card                                              │
│      │   ├── Author Header (avatar, name, role, time)           │
│      │   ├── Content (text, media, poll)                        │
│      │   ├── Subject Tags                                       │
│      │   └── Interaction Bar (like, comment, share, save)       │
│      └── [Sponsored] Post (clearly labeled)                     │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  TAB 2: SEARCH / DISCOVER                                       │
│  ├── Search Bar                                                 │
│  ├── Recent Searches                                            │
│  ├── Category Pills (People, Posts, Schools, Hashtags)          │
│  ├── Trending Section                                           │
│  │   ├── Trending Hashtags                                      │
│  │   └── Popular Posts                                          │
│  ├── Suggested Accounts                                         │
│  └── Subject Discovery Grid                                     │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  TAB 3: CREATE (+)                                              │
│  └── Opens Create Modal                                         │
│      ├── [Photo/Video] from gallery                             │
│      ├── [Camera] take new                                      │
│      ├── [Reel] short video                                     │
│      ├── [Story] 24hr content                                   │
│      ├── [Poll] create poll                                     │
│      ├── [Live] start streaming (Creator+)                      │
│      └── [Event] (School accounts)                              │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  TAB 4: NOTIFICATIONS                                           │
│  ├── Filter Tabs (All, Likes, Comments, Follows, Mentions)      │
│  ├── Notification List                                          │
│  │   ├── Like notification                                      │
│  │   ├── Comment notification                                   │
│  │   ├── Follow notification                                    │
│  │   ├── Mention notification                                   │
│  │   ├── Achievement unlocked                                   │
│  │   └── School announcement                                    │
│  └── [Mark All Read]                                            │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  TAB 5: PROFILE                                                 │
│  ├── Profile Header                                             │
│  │   ├── Cover Image                                            │
│  │   ├── Avatar                                                 │
│  │   ├── Name & Role Badge                                      │
│  │   ├── Bio                                                    │
│  │   ├── Stats (Posts, Followers, Following)                    │
│  │   ├── [Edit Profile] / [Follow] button                       │
│  │   └── School Affiliation                                     │
│  │                                                              │
│  ├── Achievement Showcase                                       │
│  │                                                              │
│  ├── Content Tabs                                               │
│  │   ├── [Posts] Grid                                           │
│  │   ├── [Reels] Grid                                           │
│  │   ├── [Saved] (own profile only)                             │
│  │   └── [Tagged] Posts                                         │
│  │                                                              │
│  └── [Settings] gear icon                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Secondary Screens

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECONDARY SCREENS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST DETAIL SCREEN                                             │
│  ├── Full post content                                          │
│  ├── Comments section                                           │
│  │   ├── Comment input                                          │
│  │   ├── Threaded replies                                       │
│  │   └── Load more comments                                     │
│  ├── Related posts                                              │
│  └── Share sheet                                                │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  REELS VIEWER                                                   │
│  ├── Full-screen vertical video                                 │
│  ├── Swipe up/down navigation                                   │
│  ├── Side action bar                                            │
│  │   ├── Like                                                   │
│  │   ├── Comment                                                │
│  │   ├── Share                                                  │
│  │   ├── Save                                                   │
│  │   └── Audio (go to sound)                                    │
│  └── Bottom info (author, caption, hashtags)                    │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  MESSAGES/DM SCREEN                                             │
│  ├── Conversation List                                          │
│  │   ├── Primary Inbox                                          │
│  │   ├── Message Requests                                       │
│  │   └── Archived                                               │
│  ├── Conversation Detail                                        │
│  │   ├── Message bubbles                                        │
│  │   ├── Media messages                                         │
│  │   └── Input bar (text, media, voice)                         │
│  └── New Message Composer                                       │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  STORY VIEWER                                                   │
│  ├── Full-screen story                                          │
│  ├── Progress bar (multiple stories)                            │
│  ├── Tap left/right navigation                                  │
│  ├── Reply input                                                │
│  └── Reactions                                                  │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  SCHOOL PAGE                                                    │
│  ├── School Header (logo, name, type)                           │
│  ├── School Info (address, contact, website)                    │
│  ├── Stats (students, teachers, followers)                      │
│  ├── Action Buttons                                             │
│  │   ├── [Follow]                                               │
│  │   ├── [Contact]                                              │
│  │   └── [Visit Website]                                        │
│  ├── Content Tabs                                               │
│  │   ├── [Updates] recent posts                                 │
│  │   ├── [Events] upcoming events                               │
│  │   ├── [Photos] albums                                        │
│  │   └── [Staff] teacher spotlights                             │
│  └── Related Schools                                            │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  LIVE STREAMING                                                 │
│  ├── Go Live Setup                                              │
│  │   ├── Title input                                            │
│  │   ├── Subject tags                                           │
│  │   └── Privacy settings                                       │
│  ├── Live Viewer                                                │
│  │   ├── Video stream                                           │
│  │   ├── Live chat                                              │
│  │   ├── Viewer count                                           │
│  │   └── Gift/tip button                                        │
│  └── Live Host Controls                                         │
│      ├── Camera flip                                            │
│      ├── Mute audio                                             │
│      ├── Invite co-host                                         │
│      └── End stream                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Settings & Account Management

```
┌─────────────────────────────────────────────────────────────────┐
│                   SETTINGS HIERARCHY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SETTINGS HOME                                                  │
│  ├── ACCOUNT                                                    │
│  │   ├── Profile Information                                    │
│  │   │   ├── Edit Name                                          │
│  │   │   ├── Edit Bio                                           │
│  │   │   ├── Edit Avatar                                        │
│  │   │   ├── Edit Cover Photo                                   │
│  │   │   └── Edit Subjects/Interests                            │
│  │   ├── Account Type                                           │
│  │   │   ├── Switch to Creator Account                          │
│  │   │   └── Upgrade to School Account                          │
│  │   ├── Linked Accounts                                        │
│  │   │   ├── Tuto Main App                                      │
│  │   │   ├── School Dashboard                                   │
│  │   │   └── Social Logins                                      │
│  │   ├── Email & Phone                                          │
│  │   ├── Password & Security                                    │
│  │   │   ├── Change Password                                    │
│  │   │   ├── Two-Factor Authentication                          │
│  │   │   └── Login Activity                                     │
│  │   └── Verification                                           │
│  │       └── Request Verification Badge                         │
│  │                                                              │
│  ├── PRIVACY                                                    │
│  │   ├── Account Privacy                                        │
│  │   │   ├── Public / Private Account                           │
│  │   │   └── Who Can See Posts                                  │
│  │   ├── Interactions                                           │
│  │   │   ├── Who Can Comment                                    │
│  │   │   ├── Who Can DM                                         │
│  │   │   ├── Who Can Tag                                        │
│  │   │   └── Who Can Mention                                    │
│  │   ├── Blocked Accounts                                       │
│  │   ├── Muted Accounts                                         │
│  │   ├── Hidden Words (filter)                                  │
│  │   └── Data Privacy                                           │
│  │       ├── Download Data                                      │
│  │       └── Data Usage Settings                                │
│  │                                                              │
│  ├── NOTIFICATIONS                                              │
│  │   ├── Push Notifications                                     │
│  │   │   ├── Likes                                              │
│  │   │   ├── Comments                                           │
│  │   │   ├── New Followers                                      │
│  │   │   ├── Mentions                                           │
│  │   │   ├── DMs                                                │
│  │   │   ├── Live Videos                                        │
│  │   │   └── School Announcements                               │
│  │   ├── Email Notifications                                    │
│  │   └── Notification Schedule (quiet hours)                    │
│  │                                                              │
│  ├── CONTENT PREFERENCES                                        │
│  │   ├── Language                                               │
│  │   ├── Content Filters                                        │
│  │   │   ├── Subject Filters                                    │
│  │   │   └── Role Filters                                       │
│  │   ├── Feed Algorithm Settings                                │
│  │   └── Autoplay Videos                                        │
│  │                                                              │
│  ├── PARENTAL CONTROLS (for student accounts)                   │
│  │   ├── Link Parent Account                                    │
│  │   ├── Screen Time Limits                                     │
│  │   ├── Content Restrictions                                   │
│  │   ├── DM Restrictions                                        │
│  │   └── Activity Reports                                       │
│  │                                                              │
│  ├── CREATOR TOOLS (for creator accounts)                       │
│  │   ├── Analytics Dashboard                                    │
│  │   ├── Monetization Settings                                  │
│  │   │   ├── Gift/Tip Settings                                  │
│  │   │   ├── Payout Settings                                    │
│  │   │   └── Brand Partnerships                                 │
│  │   └── Creator Features                                       │
│  │                                                              │
│  ├── HELP & SUPPORT                                             │
│  │   ├── Help Center                                            │
│  │   ├── Report a Problem                                       │
│  │   ├── Community Guidelines                                   │
│  │   └── Contact Support                                        │
│  │                                                              │
│  ├── ABOUT                                                      │
│  │   ├── Terms of Service                                       │
│  │   ├── Privacy Policy                                         │
│  │   ├── Content Policy                                         │
│  │   └── App Version                                            │
│  │                                                              │
│  └── ACCOUNT ACTIONS                                            │
│      ├── Switch Account                                         │
│      ├── Log Out                                                │
│      ├── Deactivate Account                                     │
│      └── DELETE ACCOUNT (permanent)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication Integration Strategy

### 4.1 Single Sign-On (SSO) with Existing Tuto Ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│              SSO INTEGRATION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Tuto Mobile  │    │ School       │    │ tuto.social  │      │
│  │ App          │    │ Dashboard    │    │ (Social)     │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                    │                   │              │
│         └────────────────────┼───────────────────┘              │
│                              │                                  │
│                    ┌─────────▼─────────┐                        │
│                    │  Supabase Auth    │                        │
│                    │  (Shared Auth)    │                        │
│                    └─────────┬─────────┘                        │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         │                    │                    │             │
│  ┌──────▼──────┐     ┌───────▼───────┐    ┌──────▼──────┐      │
│  │  users      │     │ user_profiles │    │ social_     │      │
│  │  (auth)     │     │ (main data)   │    │ profiles    │      │
│  └─────────────┘     └───────────────┘    └─────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Account Linking Flow

1. **New User (No Tuto Account)**
   - Standard registration on tuto.social
   - Optional: Link to Tuto later from settings

2. **Existing Tuto Mobile User**
   - "Sign in with Tuto" button
   - OAuth flow redirects to Tuto auth
   - Auto-imports profile data (name, avatar, role)
   - Links accounts in database

3. **Existing School Dashboard User**
   - "Sign in with School Account" button
   - School code + email verification
   - Imports school affiliation, role
   - Enables school-scoped content

### 4.3 Data Synchronization

| Data Point | Source | Sync Direction |
|------------|--------|----------------|
| Name | Tuto/School | ← (initial import) |
| Email | All | ← (shared auth) |
| Avatar | Social profile | → (can override) |
| Role | Tuto/School | ← (authoritative) |
| School | School Dashboard | ← (authoritative) |
| Followers | Social | ← (social only) |
| Posts | Social | ← (social only) |
| Achievements | Tuto Mobile | ← (import milestones) |

---

## 5. Data Architecture

### 5.1 New Database Tables (Supabase)

```sql
-- Social Profiles (extends existing users)
CREATE TABLE social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'teacher', 'student', 'school')),
  is_creator BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  follower_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  post_count INT DEFAULT 0,
  school_id UUID REFERENCES schools(id),
  linked_tuto_id VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES social_profiles(id) NOT NULL,
  post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('text', 'image', 'video', 'reel', 'poll', 'achievement', 'event')),
  content TEXT,
  media JSONB, -- [{type: 'image', url: '...', thumbnail: '...'}]
  subjects TEXT[], -- ['Math', 'Science']
  hashtags TEXT[],
  mentioned_users UUID[],
  location JSONB,
  privacy VARCHAR(20) DEFAULT 'public' CHECK (privacy IN ('public', 'followers', 'school', 'private')),
  school_id UUID REFERENCES schools(id), -- For school-scoped posts
  like_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  save_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) NOT NULL,
  author_id UUID REFERENCES social_profiles(id) NOT NULL,
  parent_comment_id UUID REFERENCES social_comments(id), -- For threaded replies
  content TEXT NOT NULL,
  like_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes (posts and comments)
CREATE TABLE social_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES social_profiles(id) NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Follows
CREATE TABLE social_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES social_profiles(id) NOT NULL,
  following_id UUID REFERENCES social_profiles(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Saves/Bookmarks
CREATE TABLE social_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES social_profiles(id) NOT NULL,
  post_id UUID REFERENCES social_posts(id) NOT NULL,
  collection_name VARCHAR(100) DEFAULT 'Saved',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Stories
CREATE TABLE social_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES social_profiles(id) NOT NULL,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INT, -- seconds for video
  overlays JSONB, -- stickers, text, etc.
  view_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Views
CREATE TABLE social_story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES social_stories(id) NOT NULL,
  viewer_id UUID REFERENCES social_profiles(id) NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Direct Messages
CREATE TABLE social_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  name VARCHAR(100), -- For group chats
  participants UUID[] NOT NULL,
  last_message_id UUID,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE social_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES social_conversations(id) NOT NULL,
  sender_id UUID REFERENCES social_profiles(id) NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'voice', 'file', 'post_share')),
  content TEXT,
  media_url TEXT,
  reply_to_id UUID REFERENCES social_messages(id),
  read_by UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES social_profiles(id) NOT NULL,
  actor_id UUID REFERENCES social_profiles(id),
  type VARCHAR(50) NOT NULL,
  target_type VARCHAR(20),
  target_id UUID,
  content JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports (Moderation)
CREATE TABLE social_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES social_profiles(id) NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'post', 'comment', 'message')),
  target_id UUID NOT NULL,
  reason VARCHAR(50) NOT NULL,
  description TEXT,
  evidence JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creator Earnings
CREATE TABLE social_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES social_profiles(id) NOT NULL,
  source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('gift', 'tip', 'ad_revenue', 'sponsorship')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  source_user_id UUID REFERENCES social_profiles(id),
  source_post_id UUID REFERENCES social_posts(id),
  status VARCHAR(20) DEFAULT 'pending',
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hashtags
CREATE TABLE social_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  post_count INT DEFAULT 0,
  is_trending BOOLEAN DEFAULT FALSE,
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Monetization Strategy

### 6.1 Revenue Streams

```
┌─────────────────────────────────────────────────────────────────┐
│                  MONETIZATION MATRIX                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. ADVERTISING (Primary - 60% of revenue)                      │
│     ├── Native In-Feed Ads                                      │
│     │   ├── Educational product ads                             │
│     │   ├── School enrollment ads                               │
│     │   ├── Tutoring service ads                                │
│     │   └── Book/course promotions                              │
│     │                                                           │
│     ├── Story/Reel Ads                                          │
│     │   └── 15-second skippable video ads                       │
│     │                                                           │
│     ├── Search Ads                                              │
│     │   └── Promoted teachers/schools in search                 │
│     │                                                           │
│     └── Pricing Model                                           │
│         ├── CPM (Cost per 1000 impressions): $3-8               │
│         ├── CPC (Cost per click): $0.30-1.50                    │
│         └── CPV (Cost per video view): $0.02-0.10               │
│                                                                 │
│  2. CREATOR MONETIZATION (20% of revenue)                       │
│     ├── Gifts/Tips (Platform takes 30%)                         │
│     │   ├── Star gifts ($1-50 value)                            │
│     │   └── Super thanks on videos                              │
│     │                                                           │
│     ├── Subscriptions (Like Patreon)                            │
│     │   ├── Creator sets price ($1-50/month)                    │
│     │   ├── Exclusive content                                   │
│     │   └── Platform takes 20%                                  │
│     │                                                           │
│     └── Live Streaming Gifts                                    │
│         └── During live broadcasts                              │
│                                                                 │
│  3. PREMIUM FEATURES (15% of revenue)                           │
│     ├── tuto.social PLUS ($4.99/month)                          │
│     │   ├── Ad-free experience                                  │
│     │   ├── Extended video uploads (30 min)                     │
│     │   ├── Analytics for all users                             │
│     │   ├── Exclusive stickers/filters                          │
│     │   └── Priority customer support                           │
│     │                                                           │
│     └── tuto.social CREATOR PRO ($9.99/month)                   │
│         ├── All PLUS features                                   │
│         ├── Live streaming                                      │
│         ├── Advanced analytics                                  │
│         ├── Scheduling tools                                    │
│         └── Lower platform fees (15%)                           │
│                                                                 │
│  4. SCHOOL SUBSCRIPTIONS (5% of revenue)                        │
│     ├── School Page Pro ($99/month)                             │
│     │   ├── Branded school page                                 │
│     │   ├── Event promotion                                     │
│     │   ├── Lead generation tools                               │
│     │   ├── Admission funnel integration                        │
│     │   └── Analytics dashboard                                 │
│     │                                                           │
│     └── School Network ($499/month)                             │
│         ├── Multi-campus management                             │
│         ├── API access                                          │
│         └── White-label options                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Revenue Projections (Year 1-3)

| Revenue Stream | Year 1 | Year 2 | Year 3 |
|----------------|--------|--------|--------|
| Advertising | $50K | $500K | $3M |
| Creator Monetization | $10K | $150K | $1M |
| Premium Subscriptions | $20K | $200K | $800K |
| School Subscriptions | $5K | $100K | $400K |
| **Total** | **$85K** | **$950K** | **$5.2M** |

### 6.3 Comparison to Competitors

| Platform | Primary Revenue | ARPU (avg) | Our Opportunity |
|----------|-----------------|------------|-----------------|
| Facebook | Ads | $41.41/year | Education-focused ads = higher CPM |
| Instagram | Ads + Creator | $44.21/year | Niche = premium pricing |
| TikTok | Ads + Gifts | $16/year | Less competition in edu vertical |
| LinkedIn | Premium + Ads | $22/year | K-12 is underserved |

**Our Advantage:** Education vertical commands **2-3x higher CPMs** than general social media because advertisers (schools, EdTech, publishers) have higher customer lifetime values.

---

## 7. Engagement & Retention Mechanics

### 7.1 Addiction (Ethical Engagement) Framework

**Note:** All engagement mechanics are designed to be **parent-friendly** and **educationally beneficial**. We avoid dark patterns while maximizing healthy engagement.

```
┌─────────────────────────────────────────────────────────────────┐
│              ENGAGEMENT PSYCHOLOGY FRAMEWORK                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. VARIABLE REWARD SCHEDULE                                    │
│     ├── New content on every pull-to-refresh                    │
│     ├── Notification timing optimization                        │
│     ├── Achievement unlocks at unpredictable intervals          │
│     └── "Surprise" content recommendations                      │
│                                                                 │
│  2. SOCIAL PROOF & STATUS                                       │
│     ├── Follower counts (public)                                │
│     ├── Verification badges (aspirational)                      │
│     ├── Achievement showcases                                   │
│     ├── "Top Teacher" leaderboards                              │
│     └── School ranking features                                 │
│                                                                 │
│  3. FOMO (Fear of Missing Out)                                  │
│     ├── 24-hour stories                                         │
│     ├── Limited-time challenges                                 │
│     ├── Live video notifications                                │
│     └── "Trending now" urgency signals                          │
│                                                                 │
│  4. COMPLETION MECHANICS                                        │
│     ├── Profile completion percentage                           │
│     ├── "Finish your first post" prompts                        │
│     ├── Daily streak counters                                   │
│     └── Challenge completion badges                             │
│                                                                 │
│  5. PERSONALIZATION                                             │
│     ├── Algorithm learns preferences                            │
│     ├── Subject-based content curation                          │
│     ├── Role-based feed optimization                            │
│     └── "Made for you" sections                                 │
│                                                                 │
│  6. COMMUNITY BELONGING                                         │
│     ├── School communities                                      │
│     ├── Subject interest groups                                 │
│     ├── Parent support networks                                 │
│     └── Teacher professional circles                            │
│                                                                 │
│  7. PROGRESS & GROWTH                                           │
│     ├── Learning milestones from Tuto app                       │
│     ├── "Your child improved" notifications                     │
│     ├── Weekly engagement summaries                             │
│     └── Year-in-review features                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Daily Active User (DAU) Hooks

| Time of Day | Hook | Target User |
|-------------|------|-------------|
| 7:00 AM | Morning motivation post | Students |
| 8:00 AM | School announcement | Parents |
| 12:00 PM | Teaching tip | Teachers |
| 3:30 PM | After-school activities | Students |
| 6:00 PM | Homework help trending | Parents |
| 8:00 PM | Evening study tips | Students |
| 9:00 PM | Tomorrow's schedule | Parents |

### 7.3 Weekly/Monthly Hooks

| Frequency | Feature | Purpose |
|-----------|---------|---------|
| Weekly | "Week in Review" summary | Retention |
| Weekly | New trending challenge | Engagement |
| Monthly | Achievement showcase | Status/Pride |
| Monthly | "This month's top posts" | FOMO |
| Quarterly | Platform milestones | Community |
| Yearly | Year-in-review | Shareability |

### 7.4 Gamification System

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAMIFICATION ELEMENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ACHIEVEMENTS (Unlock badges)                                   │
│  ├── First Post 📝                                              │
│  ├── First Reel 🎬                                              │
│  ├── 10 Followers 👥                                            │
│  ├── 100 Likes Received ❤️                                      │
│  ├── 7-Day Streak 🔥                                            │
│  ├── Subject Expert (100 posts in category) 🧮                  │
│  ├── Community Helper (50 helpful comments) 🤝                  │
│  ├── Viral Post (1000+ likes) ⭐                                │
│  └── Verified Creator ✓                                         │
│                                                                 │
│  LEVELS (Experience points)                                     │
│  ├── Level 1: Newcomer (0-100 XP)                               │
│  ├── Level 2: Explorer (100-500 XP)                             │
│  ├── Level 3: Contributor (500-1000 XP)                         │
│  ├── Level 4: Influencer (1000-5000 XP)                         │
│  └── Level 5: Leader (5000+ XP)                                 │
│                                                                 │
│  XP SOURCES                                                     │
│  ├── Post: +10 XP                                               │
│  ├── Comment: +2 XP                                             │
│  ├── Receive Like: +1 XP                                        │
│  ├── Receive Comment: +3 XP                                     │
│  ├── Daily Login: +5 XP                                         │
│  └── Helpful Answer: +15 XP                                     │
│                                                                 │
│  LEADERBOARDS                                                   │
│  ├── Top Teachers (by subject)                                  │
│  ├── Most Helpful Parents                                       │
│  ├── Rising Student Creators                                    │
│  └── School Engagement Rankings                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Safety & Moderation

### 8.1 Content Moderation Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                  MODERATION ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAYER 1: AUTOMATED SCREENING (Pre-publish)                     │
│  ├── AI Image Analysis                                          │
│  │   ├── NSFW detection                                         │
│  │   ├── Violence detection                                     │
│  │   └── Child safety checks                                    │
│  │                                                              │
│  ├── AI Text Analysis                                           │
│  │   ├── Profanity filter                                       │
│  │   ├── Bullying detection                                     │
│  │   ├── Spam detection                                         │
│  │   └── Self-harm keywords                                     │
│  │                                                              │
│  └── Video Analysis                                             │
│      ├── Audio transcription + filtering                        │
│      └── Frame sampling for visual content                      │
│                                                                 │
│  LAYER 2: COMMUNITY REPORTING (Post-publish)                    │
│  ├── Report categories                                          │
│  │   ├── Spam                                                   │
│  │   ├── Inappropriate for education                            │
│  │   ├── Harassment/Bullying                                    │
│  │   ├── Misinformation                                         │
│  │   ├── Impersonation                                          │
│  │   └── Child safety concern                                   │
│  │                                                              │
│  └── Priority queue based on:                                   │
│      ├── Report volume                                          │
│      ├── Reporter trust score                                   │
│      └── Content visibility                                     │
│                                                                 │
│  LAYER 3: HUMAN REVIEW                                          │
│  ├── Moderation team (24/7 coverage)                            │
│  ├── Escalation paths                                           │
│  │   ├── Standard: 24h review                                   │
│  │   ├── High-priority: 1h review                               │
│  │   └── Emergency: Immediate takedown                          │
│  │                                                              │
│  └── Appeal process                                             │
│      └── Secondary review by senior moderator                   │
│                                                                 │
│  LAYER 4: PROACTIVE MONITORING                                  │
│  ├── Trending content sampling                                  │
│  ├── High-follower account audits                               │
│  └── School-reported content priority                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Child Safety Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| Age Gating | Users under 13 need parental consent | Registration flow |
| DM Restrictions | Students can only receive DMs from approved contacts | Settings default |
| Content Filters | Age-appropriate content filtering | Algorithm + settings |
| Activity Reports | Parents receive weekly activity summaries | Email + in-app |
| Screen Time | Configurable daily limits | Parental controls |
| Location Hiding | Student location never shown | System-wide |
| Anonymous Mode | Hide student identity in search | Privacy option |

### 8.3 Anti-Bullying System

1. **Detection:** AI monitors for bullying patterns
2. **Intervention:** Warning sent to perpetrator
3. **Protection:** Victim notified of support resources
4. **Escalation:** School admins notified if on same school
5. **Enforcement:** Account suspension for repeat offenders

---

## 9. Technical Implementation Recommendations

### 9.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  CLIENTS                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ React Native │  │   Next.js    │  │ Future:      │          │
│  │ (iOS/Android)│  │   (Web)      │  │ Desktop App  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘          │
│         │                 │                                     │
│         └────────┬────────┘                                     │
│                  │                                              │
│  ┌───────────────▼───────────────┐                              │
│  │         API GATEWAY           │                              │
│  │    (Supabase Edge Functions   │                              │
│  │     + Direct Supabase Client) │                              │
│  └───────────────┬───────────────┘                              │
│                  │                                              │
│  ┌───────────────┼───────────────┐                              │
│  │               │               │                              │
│  │  ┌────────────▼─────────────┐ │                              │
│  │  │      SERVICES            │ │                              │
│  │  ├─────────────────────────┤ │                              │
│  │  │ • Auth Service          │ │                              │
│  │  │ • Feed Service          │ │                              │
│  │  │ • Media Service         │ │                              │
│  │  │ • Notification Service  │ │                              │
│  │  │ • Moderation Service    │ │                              │
│  │  │ • Analytics Service     │ │                              │
│  │  │ • Payment Service       │ │                              │
│  │  └─────────────────────────┘ │                              │
│  │                              │                              │
│  └──────────────────────────────┘                              │
│                                                                 │
│  DATA LAYER                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Supabase    │  │  Redis       │  │  Cloudinary  │          │
│  │  (PostgreSQL)│  │  (Cache)     │  │  (Media CDN) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  AI/ML                                                          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  OpenAI      │  │  Google      │                             │
│  │  (Moderation)│  │  Vision API  │                             │
│  └──────────────┘  └──────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 New Components to Build

**Mobile App (src/)**
```
src/
├── screens/
│   └── social/
│       ├── SocialFeedScreen.tsx      # Enhanced feed
│       ├── SocialProfileScreen.tsx   # User profiles
│       ├── SocialSearchScreen.tsx    # Discovery
│       ├── SocialReelsScreen.tsx     # Reels viewer
│       ├── SocialStoryScreen.tsx     # Story viewer
│       ├── SocialCreateScreen.tsx    # Post creation
│       ├── SocialDMScreen.tsx        # Messages
│       ├── SocialLiveScreen.tsx      # Live streaming
│       └── SocialSettingsScreen.tsx  # Social settings
│
├── components/
│   └── social/
│       ├── PostCard.tsx              # (Enhance existing)
│       ├── ReelPlayer.tsx            # Vertical video
│       ├── StoryViewer.tsx           # Story component
│       ├── StoryRing.tsx             # Story avatars
│       ├── ProfileHeader.tsx         # Profile header
│       ├── CreatorStats.tsx          # Analytics
│       ├── AchievementBadge.tsx      # Gamification
│       └── GiftModal.tsx             # Tipping
│
└── services/
    └── social/
        ├── feed.service.ts           # Feed API
        ├── profile.service.ts        # Profiles
        ├── media.service.ts          # Upload
        ├── analytics.service.ts      # Creator analytics
        └── monetization.service.ts   # Payments
```

**Web App (apps/dashboard/)**
```
apps/dashboard/
├── app/
│   └── social/
│       ├── page.tsx                  # Feed
│       ├── explore/page.tsx          # Discover
│       ├── reels/page.tsx            # Reels
│       ├── stories/page.tsx          # Stories
│       ├── messages/page.tsx         # DMs
│       ├── [username]/page.tsx       # Profiles
│       ├── create/page.tsx           # Post creation
│       └── settings/page.tsx         # Settings
│
└── components/
    └── social/
        ├── FeedPost.tsx
        ├── ReelCard.tsx
        ├── StoryBar.tsx
        └── ProfileCard.tsx
```

### 9.3 Integration with Existing System

| Existing Feature | Integration Point |
|------------------|-------------------|
| `UserContext` | Extend with social profile data |
| `FeedScreen` | Upgrade to full social feed |
| `PostCard` | Add reel/story support |
| `CreatePostModal` | Add media types |
| Supabase Auth | SSO integration |
| Supabase Edge Functions | Add social endpoints |
| Moderation Service | Extend for social content |
| Payment Service | Add creator monetization |

---

## 10. Implementation Roadmap

### Phase 1: Foundation (MVP)
- [ ] Enhanced feed with algorithm
- [ ] Story feature
- [ ] Profile pages
- [ ] Follow/following system
- [ ] Basic analytics

### Phase 2: Engagement
- [ ] Reels/Shorts
- [ ] Live streaming
- [ ] Advanced notifications
- [ ] Gamification system
- [ ] Creator tools

### Phase 3: Monetization
- [ ] Advertising system
- [ ] Creator tipping
- [ ] Premium subscriptions
- [ ] School pages

### Phase 4: Scale
- [ ] Advanced moderation AI
- [ ] International expansion
- [ ] Desktop apps
- [ ] API for partners

---

## 11. Progress Tracking

### Current Status
| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | Not Started | 0% |
| Phase 2: Engagement | Not Started | 0% |
| Phase 3: Monetization | Not Started | 0% |
| Phase 4: Scale | Not Started | 0% |

### Completed Items
- [x] PRD Document created (January 22, 2026)
- [ ] ...

### Next Steps
1. Review PRD with stakeholders
2. Prioritize Phase 1 features
3. Create detailed technical specs
4. Design UI/UX mockups
5. Begin database schema implementation

---

## Summary

**tuto.social** is designed to be a **safe, educational, and engaging** social platform that:

1. **Integrates seamlessly** with existing Tuto ecosystem (mobile app + school dashboard)
2. **Monetizes through multiple streams** (ads, creator economy, subscriptions)
3. **Keeps users engaged** through gamification, social proof, and personalization
4. **Prioritizes safety** with multi-layer moderation and parental controls
5. **Serves all stakeholders** (parents, teachers, students, schools) with role-specific features

The platform combines the best engagement mechanics from Facebook, Instagram, and TikTok while maintaining an **education-first focus** that makes it parent-approved and school-friendly.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 22, 2026 | Product Team | Initial PRD creation |
