/**
 * useNotifications Hook
 * 
 * React Query hook for managing notifications state
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
  type FetchNotificationsParams,
} from '../services/notifications';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';

// School ID mapping from Airtable to Supabase (same as SchoolContext)
const SCHOOL_ID_MAPPING: Record<string, string> = {
  'rec6oStnXAgY4VCrC': 'bed99290-1b7c-4e90-ac55-0ec7f496491b', // Tuto Demo School
  // Add more mappings as needed
};

/**
 * Resolve school ID from Airtable format to Supabase UUID
 */
function resolveSchoolId(schoolId: string): string {
  const resolved = SCHOOL_ID_MAPPING[schoolId] || schoolId;
  // Only log if mapping was used
  if (SCHOOL_ID_MAPPING[schoolId]) {
    console.log('🔔 Notifications: Resolved school ID:', { input: schoolId, output: resolved });
  }
  return resolved;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  urgentNotifications: Notification[];
  normalNotifications: Notification[];
  unreadCount: number;
  urgentUnreadCount: number;
  normalUnreadCount: number;
  hasUrgentUnread: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

/**
 * Hook to fetch and manage notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const { userData } = useUser();
  const { currentSchool } = useSchool();
  const queryClient = useQueryClient();

  const userId = userData?.id;
  const rawSchoolId = currentSchool?.id;
  // Resolve school ID from Airtable format to Supabase UUID
  const resolvedSchoolId = rawSchoolId ? resolveSchoolId(rawSchoolId) : undefined;
  const role = userData?.type === 'parent' ? 'parent' : userData?.type === 'admin' ? 'admin' : undefined;

  // Query key for notifications (use resolved school ID for consistent caching)
  const queryKey = ['notifications', userId, resolvedSchoolId, role];

  // Fetch all notifications
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!userId || !resolvedSchoolId) {
        return [];
      }

      const params: FetchNotificationsParams = {
        userId,
        schoolId: resolvedSchoolId,
        role,
      };

      return fetchNotifications(params);
    },
    enabled: !!userId && !!resolvedSchoolId,
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes before garbage collection
    refetchInterval: 30000, // 30 seconds
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when app comes to foreground
  });

  // Compute derived state
  const urgentNotifications = notifications.filter((n) => n.priority === 'urgent');
  const normalNotifications = notifications.filter((n) => n.priority === 'normal');

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const urgentUnreadCount = urgentNotifications.filter((n) => !n.isRead).length;
  const normalUnreadCount = normalNotifications.filter((n) => !n.isRead).length;

  const hasUrgentUnread = urgentUnreadCount > 0;

  // Mutation to mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      await markNotificationRead(notificationId, userId);
    },
    onSuccess: () => {
      // Force refetch (not just invalidate)
      refetch();
    },
  });

  // Mutation to mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !resolvedSchoolId) {
        throw new Error('User ID and School ID are required');
      }
      await markAllNotificationsRead(userId, resolvedSchoolId, role);
    },
    onSuccess: () => {
      // Force refetch (not just invalidate)
      refetch();
    },
  });

  return {
    notifications,
    urgentNotifications,
    normalNotifications,
    unreadCount,
    urgentUnreadCount,
    normalUnreadCount,
    hasUrgentUnread,
    isLoading,
    error: error as Error | null,
    refetch,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
  };
}

