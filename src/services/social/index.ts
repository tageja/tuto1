// tuto.social — Service layer exports

export { socialSupabase, SOCIAL_TABLES } from './api.client';
export type { SocialTableName } from './api.client';

export {
  getSocialSession,
  getSocialAuthUser,
  signOutSocial,
  ensureSocialProfile,
  mapDbProfileToType,
} from './auth.service';

export {
  getProfileByUserId,
  getProfileById,
  getProfileByUsername,
  getSchoolProfiles,
  createProfile,
  updateProfile,
  followProfile,
  unfollowProfile,
  isFollowing,
  getFollowers,
  getFollowing,
} from './profile.service';

export { getFeedPosts, getPinnedPosts, mapDbPostToType } from './feed.service';
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

export { pickImages, uploadToStorage, getMediaUrl, uploadImages } from './media.service';
export type { PickedImage } from './media.service';
