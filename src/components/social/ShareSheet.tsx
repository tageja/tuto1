import { Share } from 'react-native';

const SOCIAL_BASE_URL = 'https://tuto.social';

/**
 * sharePost — invokes the native share sheet for a tuto.social post.
 *
 * @param postId         Supabase UUID of the social_posts row
 * @param contentPreview Short preview of the post text (truncated to ~80 chars)
 */
export async function sharePost(postId: string, contentPreview: string): Promise<void> {
  const url = `${SOCIAL_BASE_URL}/post/${postId}`;
  const preview = contentPreview.length > 80 ? `${contentPreview.slice(0, 80)}…` : contentPreview;
  const message = `${preview}\n\nĐược chia sẻ từ Tuto Community\n${url}`;

  await Share.share({ message, url });
}
