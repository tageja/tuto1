'use client';

import { useState } from 'react';
import { Calendar, Tag, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { Button } from '../ui/Button';
import { Announcement } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface ParentAnnouncementCardProps {
  announcement: Announcement;
  isRead?: boolean;
  isHighlighted?: boolean;
  onMarkAsRead?: (id: string) => void;
  onReadMore?: (announcement: Announcement) => void;
}

export function ParentAnnouncementCard({
  announcement,
  isRead = false,
  isHighlighted = false,
  onMarkAsRead,
  onReadMore,
}: ParentAnnouncementCardProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMarkedAsRead, setIsMarkedAsRead] = useState(isRead);

  const handleMarkAsRead = async () => {
    if (onMarkAsRead && !isMarkedAsRead) {
      setIsMarkedAsRead(true); // Optimistic UI
      try {
        await onMarkAsRead(announcement.id);
      } catch (error) {
        setIsMarkedAsRead(false); // Revert on error
      }
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const bodyPreview = announcement.body.length > 200
    ? `${announcement.body.substring(0, 200)}...`
    : announcement.body;

  return (
    <Card
      className={`p-6 transition-all ${
        isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'
      } ${isMarkedAsRead ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">
              {announcement.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                announcement.priority
              )}`}
            >
              {t(`dashboard.announcements.priority.${announcement.priority.toLowerCase()}`)}
            </span>
            {isMarkedAsRead && (
              <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 border border-green-200">
                {t('dashboard.announcements.card.readStatus')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
            {announcement.category && (
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {announcement.category}
              </span>
            )}
            {announcement.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('dashboard.announcements.card.postedOn')}{' '}
                {formatDate(announcement.published_at)}
              </span>
            )}
            {announcement.expires_at && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertCircle className="w-4 h-4" />
                {t('dashboard.announcements.card.expiresOn')}{' '}
                {formatDate(announcement.expires_at)}
              </span>
            )}
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">
            {isExpanded ? announcement.body : bodyPreview}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          {announcement.body.length > 200 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onReadMore) {
                  onReadMore(announcement);
                } else {
                  setIsExpanded(!isExpanded);
                }
              }}
            >
              {isExpanded
                ? t('common.cancel')
                : t('dashboard.announcements.actions.readMore')}
            </Button>
          )}
        </div>

        {!isMarkedAsRead && onMarkAsRead && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsRead}
            className="text-blue-600 hover:text-blue-800"
          >
            {t('dashboard.announcements.actions.markAsRead')}
          </Button>
        )}
      </div>
    </Card>
  );
}





