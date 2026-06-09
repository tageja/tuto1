// tuto.social — Moderation service (reports, blocks, mutes)

import { socialSupabase } from './api.client';

export type ReportTargetType = 'user' | 'post' | 'comment' | 'reel';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'impersonation'
  | 'child_safety'
  | 'other';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

export async function reportContent(input: CreateReportInput): Promise<string> {
  const { data, error } = await socialSupabase.functions.invoke('social-reports', {
    method: 'POST',
    body: input,
  });

  if (error) throw error;
  const body = data as { error?: string; data?: { id: string } };
  if (body.error) throw new Error(body.error);
  if (!body.data?.id) throw new Error('Report failed');
  return body.data.id;
}

export async function reportUser(userId: string, reason: ReportReason, description?: string): Promise<string> {
  return reportContent({ targetType: 'user', targetId: userId, reason, description });
}

export async function getBlockedUsers(profileId: string): Promise<Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>> {
  const { data: blocks } = await socialSupabase
    .from('social_blocks')
    .select('blocked_id')
    .eq('blocker_id', profileId);

  const ids = (blocks ?? []).map((b) => b.blocked_id);
  if (ids.length === 0) return [];

  const { data: profiles } = await socialSupabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', ids);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username ?? '',
    display_name: p.display_name ?? p.username ?? '',
    avatar_url: p.avatar_url ?? null,
  }));
}

export async function blockUser(blockerProfileId: string, blockedProfileId: string): Promise<void> {
  const { error } = await socialSupabase.from('social_blocks').insert({
    blocker_id: blockerProfileId,
    blocked_id: blockedProfileId,
  });
  if (error) throw error;
}

export async function unblockUser(blockerProfileId: string, blockedProfileId: string): Promise<void> {
  const { error } = await socialSupabase
    .from('social_blocks')
    .delete()
    .eq('blocker_id', blockerProfileId)
    .eq('blocked_id', blockedProfileId);
  if (error) throw error;
}

export async function isBlocked(blockerProfileId: string, blockedProfileId: string): Promise<boolean> {
  const { data } = await socialSupabase
    .from('social_blocks')
    .select('id')
    .eq('blocker_id', blockerProfileId)
    .eq('blocked_id', blockedProfileId)
    .maybeSingle();
  return !!data;
}

export async function getMutedUsers(profileId: string): Promise<Array<{ id: string; username: string; display_name: string; avatar_url: string | null }>> {
  const { data: mutes } = await socialSupabase
    .from('social_mutes')
    .select('muted_id')
    .eq('muter_id', profileId);

  const ids = (mutes ?? []).map((m) => m.muted_id);
  if (ids.length === 0) return [];

  const { data: profiles } = await socialSupabase
    .from('social_profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', ids);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    username: p.username ?? '',
    display_name: p.display_name ?? p.username ?? '',
    avatar_url: p.avatar_url ?? null,
  }));
}

export async function muteUser(muterProfileId: string, mutedProfileId: string): Promise<void> {
  const { error } = await socialSupabase.from('social_mutes').insert({
    muter_id: muterProfileId,
    muted_id: mutedProfileId,
  });
  if (error) throw error;
}

export async function unmuteUser(muterProfileId: string, mutedProfileId: string): Promise<void> {
  const { error } = await socialSupabase
    .from('social_mutes')
    .delete()
    .eq('muter_id', muterProfileId)
    .eq('muted_id', mutedProfileId);
  if (error) throw error;
}
