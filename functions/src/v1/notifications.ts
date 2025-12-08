import { onRequest } from 'firebase-functions/v2/https';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

type NotificationType =
  | 'daily_activity'
  | 'announcement'
  | 'message'
  | 'feedback'
  | 'attendance_marked'
  | 'attendance_monthly'
  | 'progress_report'
  | 'homework'
  | 'event'
  | 'photo_album'
  | 'medicine'
  | 'payment';

type NotificationPriority = 'urgent' | 'normal';

type NotificationTargetType =
  | 'feedback'
  | 'attendance'
  | 'homework'
  | 'event'
  | 'student'
  | 'payment'
  | 'photo_album'
  | 'report'
  | 'other';

const defaultPriority = (type: NotificationType): NotificationPriority => {
  switch (type) {
    case 'attendance_marked':
    case 'payment':
    case 'medicine':
    case 'progress_report':
    case 'message':
    case 'feedback':
      return 'urgent';
    default:
      return 'normal';
  }
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing for notifications function');
}

const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const getUserFromToken = async (token?: string) => {
  if (!token || !supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
};

const getUserProfile = async (supabase: SupabaseClient, authUserId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', authUserId)
    .single();
  if (error || !data) return null;
  return data;
};

export const getNotifications = onRequest({ cors: true, region: 'asia-southeast1' }, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({ success: false, error: 'supabase_not_configured' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const authUser = await getUserFromToken(token);
    if (!authUser) {
      res.status(401).json({ success: false, error: 'unauthorized' });
      return;
    }

    const { role, schoolId, onlyUnread, priority } = req.query;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'schoolId_required' });
      return;
    }

    const profile = await getUserProfile(supabaseAdmin, authUser.id);
    if (!profile) {
      res.status(404).json({ success: false, error: 'profile_not_found' });
      return;
    }

    if (role && profile.role && role !== profile.role) {
      res.status(403).json({ success: false, error: 'forbidden' });
      return;
    }

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', profile.id)
      .eq('school_id', schoolId as string)
      .order('created_at', { ascending: false });

    if (priority) {
      query = query.eq('priority', priority as NotificationPriority);
    }

    if (String(onlyUnread) === 'true') {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('getNotifications error', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

export const markNotificationsRead = onRequest({ cors: true, region: 'asia-southeast1' }, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({ success: false, error: 'supabase_not_configured' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const authUser = await getUserFromToken(token);
    if (!authUser) {
      res.status(401).json({ success: false, error: 'unauthorized' });
      return;
    }

    const body = req.body || {};
    const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
    if (ids.length === 0) {
      res.status(400).json({ success: false, error: 'ids_required' });
      return;
    }

    const profile = await getUserProfile(supabaseAdmin, authUser.id);
    if (!profile) {
      res.status(404).json({ success: false, error: 'profile_not_found' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', ids)
      .eq('recipient_user_id', profile.id)
      .select('id');

    if (error) throw error;
    res.json({ success: true, updatedCount: data?.length || 0 });
  } catch (error: any) {
    console.error('markNotificationsRead error', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

export const markAllNotificationsRead = onRequest({ cors: true, region: 'asia-southeast1' }, async (req, res) => {
  try {
    if (!supabaseAdmin) {
      res.status(500).json({ success: false, error: 'supabase_not_configured' });
      return;
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const authUser = await getUserFromToken(token);
    if (!authUser) {
      res.status(401).json({ success: false, error: 'unauthorized' });
      return;
    }

    const profile = await getUserProfile(supabaseAdmin, authUser.id);
    if (!profile) {
      res.status(404).json({ success: false, error: 'profile_not_found' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_user_id', profile.id)
      .select('id');

    if (error) throw error;
    res.json({ success: true, updatedCount: data?.length || 0 });
  } catch (error: any) {
    console.error('markAllNotificationsRead error', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

export const createNotification = async (params: {
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
}) => {
  if (!supabaseAdmin) {
    throw new Error('supabase_not_configured');
  }

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert({
      school_id: params.schoolId,
      recipient_user_id: params.recipientUserId,
      recipient_role: params.recipientRole,
      type: params.type,
      priority: params.priority || defaultPriority(params.type),
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

  return data;
};




