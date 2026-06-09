// tuto.social — Service layer exports

export { socialSupabase, SOCIAL_TABLES } from './api.client';
export type { SocialTableName } from './api.client';

export {
  getSocialSession,
  getSocialAuthUser,
  signOutSocial,
  ensureSocialProfile,
  mapDbProfileToType,
  registerPushToken,
} from './auth.service';

export {
  getProfileByUserId,
  getProfileById,
  getProfileByUsername,
  getSchoolProfiles,
  createProfile,
  updateProfile,
  uploadAvatar,
  uploadCoverPhoto,
  followProfile,
  unfollowProfile,
  isFollowing,
  getFollowers,
  getFollowing,
} from './profile.service';

export {
  followUser,
  unfollowUser,
  getFollowersProfiles,
  getFollowingProfiles,
  getFollowStatus,
} from './follows.service';

export { searchUsers, searchPosts } from './search.service';

export { getFeedPosts, getPinnedPosts, getPostsByAuthorId, mapDbPostToType } from './feed.service';
export type { FeedTab, FeedOptions, FeedResult } from './feed.service';

export { createPost, getPostById, deletePost } from './posts.service';

export {
  reactToPost,
  removeReaction,
  getUserReaction,
  savePost,
  unsavePost,
  addComment,
  getComments,
  likeComment,
} from './interactions.service';

export {
  reportContent,
  reportUser,
  getBlockedUsers,
  blockUser,
  unblockUser,
  isBlocked,
  getMutedUsers,
  muteUser,
  unmuteUser,
} from './moderation.service';
export type { ReportTargetType, ReportReason, CreateReportInput } from './moderation.service';

export { pickImages, uploadToStorage, getMediaUrl, uploadImages } from './media.service';
export type { PickedImage } from './media.service';

export {
  incrementViewCount,
  getCreatorStats,
  getTeacherLeaderboard,
} from './analytics.service';
export type { CreatorStats, PostSummary, ReelSummary, LeaderboardEntry } from './analytics.service';

export {
  getReelsFeed,
  getReelById,
  getReelsByAuthorId,
  toggleReelLike,
} from './reels.service';
export type { Reel } from './reels.service';

export {
  getConversations,
  getMessages,
  sendMessage,
  markConversationRead,
  startConversation,
  mapMessage,
  fetchSenderProfile,
} from './conversations.service';
export type { ConversationPreview, Message } from './conversations.service';

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from './notifications.service';
