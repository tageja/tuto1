'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, AlertTriangle } from 'lucide-react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@tuto/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useSchool } from '../../contexts/SchoolContext';
import { schoolLink } from '../../lib/routeBuilder';
import { useI18n } from '../../contexts/I18nContext';

type ApiResponse = { success: boolean; data: Notification[] };

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load notifications');
  }
  return res.json();
};

type NotificationBellProps = {
  role?: 'admin' | 'parent';
  schoolIdOverride?: string;
};

/**
 * Get navigation path for a notification based on its type and targetType
 */
function getNotificationPath(notification: Notification, role: 'admin' | 'parent'): string {
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
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ role: roleProp, schoolIdOverride }) => {
  const { user, supabaseUser } = useAuth();
  const { schoolIdFromUrl, selectedSchool } = useSchool();
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const schoolId = schoolIdOverride || schoolIdFromUrl || selectedSchool?.id;
  const userAuthId = supabaseUser?.id;
  const role =
    roleProp ||
    (pathname?.includes('/admin') || user?.role === 'admin' || user?.role === 'school_admin'
      ? 'admin'
      : 'parent');

  // Build URLs with userAuthId
  const urgentKey = schoolId && userAuthId
    ? `/api/notifications?schoolId=${encodeURIComponent(schoolId)}&userAuthId=${encodeURIComponent(userAuthId)}&role=${role}&priority=urgent&onlyUnread=true`
    : null;
  const normalKey = schoolId && userAuthId
    ? `/api/notifications?schoolId=${encodeURIComponent(schoolId)}&userAuthId=${encodeURIComponent(userAuthId)}&role=${role}&priority=normal&onlyUnread=true`
    : null;

  const { data: urgentData, mutate: refetchUrgent } = useSWR<ApiResponse>(urgentKey, fetcher, { refreshInterval: 30000 });
  const { data: normalData, mutate: refetchNormal } = useSWR<ApiResponse>(normalKey, fetcher, { refreshInterval: 30000 });

  const unreadUrgentCount = urgentData?.data?.length || 0;
  const unreadNormalCount = normalData?.data?.length || 0;

  const urgentNotifications = (urgentData?.data || []).slice(0, 3);
  const normalNotifications = (normalData?.data || []).slice(0, 3);

  const viewAllHref = useMemo(
    () =>
      role === 'admin'
        ? schoolLink('/admin/notifications', schoolId || undefined)
        : schoolLink('/parent/notifications', schoolId || undefined),
    [role, schoolId],
  );

  const handleViewAll = () => {
    if (viewAllHref) {
      router.push(viewAllHref);
      setOpen(false);
    }
  };

  // Mark notification as read
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

  // Handle notification click - mark as read and navigate
  const handleNotificationClick = async (item: Notification) => {
    if (!item.isRead) {
      await markRead(item.id);
    }
    const path = getNotificationPath(item, role);
    router.push(schoolLink(path, schoolId || ''));
    setOpen(false);
  };

  // Don't render if we don't have schoolId or userAuthId
  if (!schoolId || !userAuthId) {
    return null;
  }

  const renderItem = (item: Notification) => (
    <button
      key={item.id}
      onClick={() => handleNotificationClick(item)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface flex items-start gap-2 cursor-pointer transition-colors"
    >
      <div className="mt-1">
        {item.priority === 'urgent' ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <Bell className="w-4 h-4 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text line-clamp-1">{item.title}</p>
        <p className="text-xs text-text-muted line-clamp-1">{item.body}</p>
        <p className="text-[11px] text-text-muted mt-1">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!item.isRead && (
        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
      )}
    </button>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-surface rounded-lg relative focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Notifications"
      >
        <Bell
          className={`w-5 h-5 ${unreadUrgentCount > 0 ? 'text-destructive' : 'text-text'}`}
        />
        {unreadUrgentCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-destructive text-white text-xs font-semibold flex items-center justify-center">
            {unreadUrgentCount}
          </span>
        )}
        {unreadUrgentCount === 0 && unreadNormalCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-xl rounded-lg z-50">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">{t('notifications.title')}</p>
              <p className="text-xs text-text-muted">
                {unreadUrgentCount + unreadNormalCount} {t('notifications.badge.new')}
              </p>
            </div>
            <button
              onClick={handleViewAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {t('notifications.viewAll')}
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-text-muted mb-1">
                {t('notifications.tabs.important')}
              </p>
              {urgentNotifications.length === 0 && (
                <p className="text-xs text-text-muted py-2">
                  {t('notifications.empty.urgent')}
                </p>
              )}
              {urgentNotifications.map(renderItem)}
            </div>

            <div className="px-3 py-2 border-t border-border">
              <p className="text-xs font-semibold text-text-muted mb-1">
                {t('notifications.tabs.other')}
              </p>
              {normalNotifications.length === 0 && (
                <p className="text-xs text-text-muted py-2">
                  {t('notifications.empty.normal')}
                </p>
              )}
              {normalNotifications.map(renderItem)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
