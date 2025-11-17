'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react';
import { StatusChip, getNextStatus } from '../ui/StatusChip';
import { useI18n } from '../../contexts/I18nContext';
import { DailyActivity } from './types';

interface ActivitiesTimelineProps {
  activities: DailyActivity[];
  loading: boolean;
  currentDate: string;
  onActivityClick?: (activity: DailyActivity) => void;
  onEdit?: (activity: DailyActivity) => void;
  onDelete?: (activityId: string) => void;
  onDuplicate?: (activity: DailyActivity) => void;
  onStatusChange?: (activityId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  schoolId?: string;
  isParentView?: boolean;
}

// Helper: Get current time in Asia/Ho_Chi_Minh timezone (minutes since midnight)
function getCurrentTimeInMinutes(): number {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  return vnTime.getHours() * 60 + vnTime.getMinutes();
}

// Helper: Convert time string (HH:MM) to minutes since midnight
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Format time for display
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
  return `${hour12}:${minutes} ${ampm}`;
}

// Helper: Get today's date in Asia/Ho_Chi_Minh timezone
function getTodayDate(): string {
  const now = new Date();
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const year = vnTime.getFullYear();
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const day = String(vnTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Check if date is today (timezone-aware)
function isToday(date: string): boolean {
  const todayStr = getTodayDate();
  return date === todayStr;
}

export function ActivitiesTimeline({
  activities,
  loading,
  currentDate,
  onActivityClick,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  schoolId,
  isParentView = false,
}: ActivitiesTimelineProps) {
  const { t } = useI18n();
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const nowBarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const isTodayView = isToday(currentDate);
  const [currentTime, setCurrentTime] = useState(getCurrentTimeInMinutes());

  // Update current time every 60 seconds
  useEffect(() => {
    if (!isTodayView) return;

    const interval = setInterval(() => {
      setCurrentTime(getCurrentTimeInMinutes());
    }, 60000);

    return () => clearInterval(interval);
  }, [isTodayView]);

  // Auto-scroll to "now" bar on mount for today (only once)
  useEffect(() => {
    if (isTodayView && nowBarRef.current && !hasAutoScrolled.current && activities.length > 0) {
      const timer = setTimeout(() => {
        nowBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hasAutoScrolled.current = true;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTodayView, activities]);

  // Find position for "now" bar (index of activity it should appear before)
  const findNowBarIndex = () => {
    if (!isTodayView || activities.length === 0) return -1;
    
    for (let i = 0; i < activities.length; i++) {
      const activityTime = timeToMinutes(activities[i].time);
      if (currentTime <= activityTime) {
        return i;
      }
    }
    // Current time is after all activities
    return activities.length;
  };

  const nowBarIndex = findNowBarIndex();

  const handleStatusClick = (activity: DailyActivity) => {
    if (onStatusChange && !isParentView) {
      const nextStatus = getNextStatus(activity.status);
      onStatusChange(activity.id, nextStatus);
    }
  };

  const handleMenuClick = (activityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenuId(showMenuId === activityId ? null : activityId);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">
            {t('dashboard.activities.empty.noActivities') || 'No activities scheduled'}
          </p>
          <p className="text-gray-400 text-sm">
            {t('dashboard.activities.empty.tryDifferentFilters') || 'Try selecting a different date or adjusting your filters'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-6">
        {isTodayView
          ? t('dashboard.activities.timeline.todaysTimeline') || "Today's Timeline"
          : new Date(currentDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
      </h3>

      <div className="relative" ref={timelineRef}>
        {/* Timeline with activities */}
        <div className="space-y-6">
          {activities.map((activity, index) => {
            // Show "now" bar before this activity if it's at the nowBarIndex
            const showNowBarBefore = isTodayView && nowBarIndex === index;

            return (
              <div key={activity.id} className="relative">
                {/* "Now" bar before this activity if needed */}
                {showNowBarBefore && (
                  <div
                    ref={nowBarRef}
                    className="relative left-0 right-0 mb-4 pb-2 border-t-2 border-red-500 z-10"
                  >
                    <div className="absolute right-0 -top-6 flex items-center gap-2 bg-white px-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-600 font-medium">
                        {new Date().toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'Asia/Ho_Chi_Minh'
                        })} - Now
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`flex items-start gap-4 ${onActivityClick ? 'cursor-pointer hover:bg-gray-50' : ''} p-3 rounded-lg transition-colors`}
                  onClick={() => onActivityClick?.(activity)}
                >
                  {/* Time */}
                  <div className="flex-shrink-0 w-24 text-sm text-gray-600 font-medium">
                    {formatTime(activity.time)}
                  </div>

                  {/* Timeline dot */}
                  <div className="flex-shrink-0 relative mt-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    {index < activities.length - 1 && (
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-gray-200"></div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                        {activity.description && (
                          <p className="text-sm text-gray-600 line-clamp-2" title={activity.description}>
                            {activity.description.length > 100 
                              ? `${activity.description.substring(0, 100)}...` 
                              : activity.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span>
                            {t('dashboard.activities.timeline.class') || 'Class'}: {activity.class_name || activity.grade}
                          </span>
                          {activity.teacher_name && (
                            <span>
                              {t('dashboard.activities.timeline.teacher') || 'Teacher'}: {activity.teacher_name}
                            </span>
                          )}
                          {activity.type && (
                            <span className="text-blue-600">{activity.type}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusChip
                          status={activity.status}
                          onClick={isParentView ? undefined : () => handleStatusClick(activity)}
                          disabled={isParentView}
                        />
                        {!isParentView && onEdit && onDelete && onDuplicate && (
                          <div className="relative">
                            <button
                              onClick={(e) => handleMenuClick(activity.id, e)}
                              className="p-1 hover:bg-gray-100 rounded"
                              aria-label="Actions"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-400" />
                            </button>
                            {showMenuId === activity.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(activity);
                                    setShowMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  {t('dashboard.activities.actions.edit') || 'Edit'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate(activity);
                                    setShowMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Copy className="w-4 h-4" />
                                  {t('dashboard.activities.actions.duplicate') || 'Duplicate'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(t('dashboard.activities.confirmDelete') || 'Are you sure you want to delete this activity?')) {
                                      onDelete(activity.id);
                                    }
                                    setShowMenuId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {t('dashboard.activities.actions.delete') || 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* "Now" bar at the end if current time is after all activities */}
          {isTodayView && nowBarIndex === activities.length && activities.length > 0 && (
            <div
              ref={nowBarRef}
              className="relative left-0 right-0 mt-4 pt-2 border-t-2 border-red-500 z-10"
            >
              <div className="absolute right-0 -top-6 flex items-center gap-2 bg-white px-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Ho_Chi_Minh'
                  })} - Now
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Close menu when clicking outside */}
        {showMenuId && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenuId(null)}
          />
        )}
      </div>
    </div>
  );
}
