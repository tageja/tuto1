'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  formatDistanceToNow,
  isToday,
  differenceInCalendarDays,
  startOfDay,
} from 'date-fns';
import {
  Bell,
  MessageSquare,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Image,
  Stethoscope,
  BookOpen,
} from 'lucide-react';
import { Notification } from '@tuto/shared';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { schoolLink } from '../../lib/routeBuilder';

type ApiResponse = { success: boolean; data: Notification[] };

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
};

type NotificationCenterProps = {
  role: 'parent' | 'admin';
  schoolId: string;
  subtitle: string;
};

type GroupedNotifications = {
  today: Notification[];
  thisWeek: Notification[];
  earlier: Notification[];
};

const iconForType: Record<string, JSX.Element> = {
  attendance_marked: <ClipboardList className="w-5 h-5 text-primary" />,
  attendance_monthly: <ClipboardList className="w-5 h-5 text-primary" />,
  homework: <BookOpen className="w-5 h-5 text-accent" />,
  progress_report: <FileText className="w-5 h-5 text-primary" />,
  message: <MessageSquare className="w-5 h-5 text-accent" />,
  feedback: <MessageSquare className="w-5 h-5 text-accent" />,
  event: <Calendar className="w-5 h-5 text-primary" />,
  payment: <CreditCard className="w-5 h-5 text-primary" />,
  photo_album: <Image className="w-5 h-5 text-accent" />,
  medicine: <Stethoscope className="w-5 h-5 text-destructive" />,
  daily_activity: <ClipboardList className="w-5 h-5 text-primary" />,
  announcement: <Bell className="w-5 h-5 text-primary" />,
  default: <Bell className="w-5 h-5 text-text-muted" />,
};

const categoryKeyForType: Record<string, string> = {
  attendance_marked: 'notifications.category.attendance',
  attendance_monthly: 'notifications.category.attendance',
  homework: 'notifications.category.homework',
  progress_report: 'notifications.category.report',
  message: 'notifications.category.message',
  feedback: 'notifications.category.feedback',
  event: 'notifications.category.event',
  payment: 'notifications.category.payment',
  photo_album: 'notifications.category.photo_album',
  medicine: 'notifications.category.medicine',
  daily_activity: 'notifications.category.activity',
  announcement: 'notifications.category.announcement',
  default: 'notifications.category.other',
};

function groupByDate(notifications: Notification[]): GroupedNotifications {
  const today = startOfDay(new Date());
  return notifications.reduce<GroupedNotifications>(
    (acc, item) => {
      const created = new Date(item.createdAt);
      if (isToday(created)) {
        acc.today.push(item);
      } else if (differenceInCalendarDays(today, startOfDay(created)) <= 7) {
        acc.thisWeek.push(item);
      } else {
        acc.earlier.push(item);
      }
      return acc;
    },
    { today: [], thisWeek: [], earlier: [] },
  );
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  role,
  schoolId,
  subtitle,
}) => {
  const { t } = useI18n();
  const { supabaseUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'urgent' | 'normal'>('urgent');

  const userAuthId = supabaseUser?.id;

  // Build URLs with userAuthId
  const urgentKey = userAuthId
    ? `/api/notifications?schoolId=${encodeURIComponent(schoolId)}&userAuthId=${encodeURIComponent(userAuthId)}&role=${role}&priority=urgent`
    : null;
  const normalKey = userAuthId
    ? `/api/notifications?schoolId=${encodeURIComponent(schoolId)}&userAuthId=${encodeURIComponent(userAuthId)}&role=${role}&priority=normal`
    : null;

  const {
    data: urgentData,
    mutate: refetchUrgent,
  } = useSWR<ApiResponse>(urgentKey, fetcher, { refreshInterval: 45000 });
  const {
    data: normalData,
    mutate: refetchNormal,
  } = useSWR<ApiResponse>(normalKey, fetcher, { refreshInterval: 45000 });

  const activeData = tab === 'urgent' ? urgentData : normalData;
  const grouped = useMemo(
    () => groupByDate(activeData?.data || []),
    [activeData?.data],
  );

  const markRead = async (id: string) => {
    if (!userAuthId) return;
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id], userAuthId }),
    });
    refetchUrgent();
    refetchNormal();
  };

  const markAllRead = async () => {
    if (!userAuthId) return;
    await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, role, userAuthId }),
    });
    refetchUrgent();
    refetchNormal();
  };

  /**
   * Get navigation path for a notification based on its type and targetType
   */
  const getNotificationPath = (notification: Notification): string => {
    const admin = role === 'admin';
    const { type, targetType, targetId } = notification;

    // First, try to route based on notification type (more specific)
    switch (type) {
      case 'message':
        return admin ? '/admin/messages' : '/parent/messages';
      case 'feedback':
        return admin ? '/admin/feedback' : '/parent/feedback';
      case 'attendance_marked':
      case 'attendance_monthly':
        return admin ? '/admin/attendance' : '/parent/attendance';
      case 'homework':
        return admin ? '/admin/homework' : '/parent/homework';
      case 'event':
        return admin ? '/admin/events' : '/parent/events';
      case 'payment':
        return admin ? '/admin/payments' : '/parent/payments';
      case 'photo_album':
        return admin ? '/admin/photo-albums' : '/parent/photo-albums';
      case 'progress_report':
        return admin ? '/admin/progress' : '/parent/progress';
      case 'medicine':
        return admin ? '/admin/medicine' : '/parent/medicine';
      case 'daily_activity':
        return admin ? '/admin/daily-activities' : '/parent/daily-activities';
      case 'announcement':
        return admin ? '/admin/announcements' : '/parent/announcements';
    }

    // Fallback: use targetType if type didn't match
    switch (targetType) {
      case 'feedback':
        return admin ? '/admin/feedback' : '/parent/feedback';
      case 'attendance':
        return admin ? '/admin/attendance' : '/parent/attendance';
      case 'homework':
        return admin ? '/admin/homework' : '/parent/homework';
      case 'event':
        return admin ? '/admin/events' : '/parent/events';
      case 'payment':
        return admin ? '/admin/payments' : '/parent/payments';
      case 'photo_album':
        return admin ? '/admin/photo-albums' : '/parent/photo-albums';
      case 'report':
        return admin ? '/admin/progress' : '/parent/progress';
      case 'student':
        return admin && targetId ? `/admin/students/${targetId}` : (admin ? '/admin/dashboard' : '/parent/dashboard');
      default:
        return admin ? '/admin/dashboard' : '/parent/dashboard';
    }
  };

  const navigateForTarget = (notification: Notification) => {
    const path = getNotificationPath(notification);
    router.push(schoolLink(path, schoolId));
  };

  const renderCard = (item: Notification) => {
    const icon = iconForType[item.type] || iconForType.default;
    const categoryKey = categoryKeyForType[item.type] || categoryKeyForType.default;
    return (
      <button
        key={item.id}
        onClick={async () => {
          if (!item.isRead) await markRead(item.id);
          navigateForTarget(item);
        }}
        className={`w-full text-left border border-border rounded-xl p-3 flex gap-3 hover:border-primary/60 transition-colors ${
          item.isRead ? 'bg-card' : 'bg-surface'
        }`}
      >
        <div className="mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-text line-clamp-1">{item.title}</p>
            {!item.isRead && <span className="w-2 h-2 rounded-full bg-primary" aria-label={t('notifications.badge.new')} />}
          </div>
          <p className="text-sm text-text-muted line-clamp-2">{item.body}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
            <span className="px-2 py-1 rounded-full bg-surface text-text border border-border">
              {t(categoryKey)}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </button>
    );
  };

  const renderGroup = (label: string, items: Notification[]) => (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-text-muted">{label}</p>
      {items.length === 0 && (
        <p className="text-sm text-text-muted">{tab === 'urgent' ? t('notifications.empty.urgent') : t('notifications.empty.normal')}</p>
      )}
      <div className="space-y-3">
        {items.map(renderCard)}
      </div>
    </div>
  );

  const unreadCount = (activeData?.data || []).filter((n) => !n.isRead).length;

  // Show loading state if userAuthId not yet available
  if (!userAuthId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text">{t('notifications.title')}</h1>
            <p className="text-sm text-text-muted mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="text-center py-10 border border-dashed border-border rounded-xl bg-surface">
          <p className="text-sm text-text-muted">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{t('notifications.title')}</h1>
          <p className="text-sm text-text-muted mt-1">{subtitle}</p>
        </div>
        <button
          onClick={markAllRead}
          className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('notifications.markAllRead')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-2 flex gap-2">
        <button
          onClick={() => setTab('urgent')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === 'urgent' ? 'bg-primary text-white' : 'text-text'
          }`}
        >
          {t('notifications.tabs.important')} ({urgentData?.data?.length || 0})
        </button>
        <button
          onClick={() => setTab('normal')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
            tab === 'normal' ? 'bg-primary text-white' : 'text-text'
          }`}
        >
          {t('notifications.tabs.other')} ({normalData?.data?.length || 0})
        </button>
      </div>

      <div className="space-y-6">
        {unreadCount === 0 && (activeData?.data || []).length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl bg-surface">
            <p className="text-sm text-text-muted">
              {tab === 'urgent' ? t('notifications.empty.urgent') : t('notifications.empty.normal')}
            </p>
          </div>
        ) : (
          <>
            {renderGroup(t('notifications.group.today'), grouped.today)}
            {renderGroup(t('notifications.group.thisWeek'), grouped.thisWeek)}
            {renderGroup(t('notifications.group.earlier'), grouped.earlier)}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
