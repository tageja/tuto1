# Feed (posts, comments, likes) - Protected Backend Integration

**CSV Row:** 10  
**Branch:** `feat/core-ui/feed-posts-comments-likes`  
**Priority:** P1  

## Summary

Implemented protected backend endpoints for feed functionality with optimistic UI, server truth reconciliation, and abuse/report hooks. Wired the existing feed UI to use authenticated endpoints with proper error handling and rollback mechanisms.

## Key Changes

### Backend Endpoints (functions/src/index.ts)
- **GET /api/feed/posts** - Protected endpoint for fetching posts with pagination
- **POST /api/feed/posts** - Create new posts with content sanitization (2000 char limit)
- **POST /api/feed/posts/:postId/like** - Like/unlike with one-like-per-user server rule
- **POST /api/feed/posts/:postId/comments** - Add comments with content sanitization (1000 char limit)
- **GET /api/feed/posts/:postId/comments** - Fetch comments with pagination
- **POST /api/feed/posts/:postId/report** - Report posts with reason categorization

### Client Integration (src/services/backend.ts)
- Added `getFeedPosts()`, `createFeedPost()`, `likeFeedPost()`, `addFeedComment()`, `getFeedComments()`, `reportFeedPost()` methods
- All methods use Firebase Auth ID tokens for authentication

### Optimistic UI Implementation (src/screens/FeedScreen.tsx)
- **Like functionality**: Immediate UI update with server reconciliation
- **Error handling**: Automatic rollback on API failures
- **Report system**: Alert-based reason selection with backend submission
- **Content sanitization**: Text length limits enforced on both client and server

### Comments Integration (src/screens/CommentsScreen.tsx)
- Updated to use protected backend endpoints
- Proper error handling and user feedback

### UI Components (src/components/feed/PostCard.tsx)
- Added optional report button with flag icon
- Maintains existing interaction patterns

### Internationalization (src/translations/index.ts)
- Added report-related translations in English and Vietnamese
- Includes reason categories: spam, inappropriate, harassment, other

## Security Features

- **Authentication**: All endpoints require Firebase ID token
- **Content sanitization**: Text length limits (posts: 2000 chars, comments: 1000 chars)
- **One-like-per-user**: Server-side enforcement prevents duplicate likes
- **Rate limiting**: Inherits from existing middleware
- **Audit logging**: All write operations logged via existing audit middleware

## Testing

- ✅ TypeScript compilation passes
- ✅ Optimistic UI updates work correctly
- ✅ Server reconciliation handles failures gracefully
- ✅ Report functionality with reason selection
- ✅ Bilingual support for all new features

## Files Modified

- `functions/src/index.ts` - Added 6 new protected feed endpoints
- `src/services/backend.ts` - Added feed API methods
- `src/screens/FeedScreen.tsx` - Updated to use protected endpoints with optimistic UI
- `src/screens/CommentsScreen.tsx` - Updated to use protected endpoints
- `src/components/feed/PostCard.tsx` - Added report functionality
- `src/translations/index.ts` - Added report translations

## Local Patch

`patches/feat-core-ui-feed-posts-comments-likes.patch`






