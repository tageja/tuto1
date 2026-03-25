// tuto.social — Safety service (content filtering, block/mute checks)

import { getBlockedUsers, isBlocked } from './moderation.service';

export { isBlocked, getBlockedUsers };

/**
 * Get set of blocked profile IDs for use in feed filtering.
 */
export async function getBlockedProfileIds(profileId: string): Promise<Set<string>> {
  const blocked = await getBlockedUsers(profileId);
  return new Set(blocked.map((b) => b.id));
}
