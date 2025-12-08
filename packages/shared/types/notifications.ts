export type NotificationType =
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

export type NotificationPriority = 'urgent' | 'normal';

export type NotificationTargetType =
  | 'feedback'
  | 'attendance'
  | 'homework'
  | 'event'
  | 'student'
  | 'payment'
  | 'photo_album'
  | 'report'
  | 'other';

export interface Notification {
  id: string;
  schoolId: string;
  recipientUserId: string;
  recipientRole: 'parent' | 'admin';
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  body: string;
  targetType?: NotificationTargetType | null;
  targetId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  meta?: Record<string, unknown> | null;
}




