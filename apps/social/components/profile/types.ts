export interface SocialProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  role: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  schoolName?: string;
  schoolId?: string;
  shieldCount: number;
  subjects?: string[];
}
