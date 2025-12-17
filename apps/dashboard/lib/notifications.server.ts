import { NextRequest } from 'next/server';
import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from './supabase';
import { Notification, NotificationPriority, NotificationTargetType, NotificationType } from '@tuto/shared';
import { defaultPriority } from './notifications';

type UserProfile = {
  id: string;
  role?: string | null;
};

export async function getUserContext(request: NextRequest) {
  const supabaseAuth = await createAuthenticatedSupabaseClient(request as unknown as Request);
  const { data: authData, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !authData?.user) {
    return { error: 'unauthorized' as const };
  }

  const supabase = createServerSupabaseClient();
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', authData.user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'profile_not_found' as const };
  }

  return {
    supabase,
    authUser: authData.user,
    profile: profile as UserProfile,
  };
}

export function mapNotificationRow(row: any): Notification {
  return {
    id: row.id,
    schoolId: row.school_id,
    recipientUserId: row.recipient_user_id,
    recipientRole: row.recipient_role,
    type: row.type,
    priority: row.priority,
    title: row.title,
    body: row.body,
    targetType: row.target_type,
    targetId: row.target_id,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    meta: row.meta,
  };
}

export async function createNotification(params: {
  supabase?: ReturnType<typeof createServerSupabaseClient>;
  schoolId: string;
  recipientUserId: string;
  recipientRole: 'parent' | 'admin';
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  body: string;
  targetType?: NotificationTargetType | null;
  targetId?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  const supabaseClient = params.supabase || createServerSupabaseClient();
  const notificationPriority = params.priority || defaultPriority(params.type);

  const { data, error } = await supabaseClient
    .from('notifications')
    .insert({
      school_id: params.schoolId,
      recipient_user_id: params.recipientUserId,
      recipient_role: params.recipientRole,
      type: params.type,
      priority: notificationPriority,
      title: params.title,
      body: params.body,
      target_type: params.targetType || null,
      target_id: params.targetId || null,
      meta: params.meta || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapNotificationRow(data);
}









