'use client';

import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../school/shared/StatusBadge';
import type { EventCardProps } from './types';

export function EventCard({
  event,
  role,
  onViewDetails,
  onManage,
  onRegister,
  onUnregister,
  registrationStatus,
  studentId,
}: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      school: 'blue',
      class: 'purple',
      competition: 'green',
      workshop: 'yellow',
      outing: 'orange',
      practice: 'indigo',
      celebration: 'pink',
    };
    return colors[category] || 'default';
  };

  const categoryColor = getCategoryColor(event.category);
  const isUpcoming = new Date(event.starts_at) >= new Date();
  const isFull = event.is_full || false;
  const availableSpots = event.available_spots;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <StatusBadge
          status={event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          variant={categoryColor as any}
        />
        {event.capacity && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Users className="w-4 h-4" />
            {event.registered_count || 0}/{event.capacity}
            {event.waitlisted_count ? ` (+${event.waitlisted_count} waitlisted)` : ''}
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.starts_at)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {formatTime(event.starts_at)} - {formatTime(event.ends_at)}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {event.parent_note && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-1">Note for Parents:</p>
          <p className="text-sm text-blue-800">{event.parent_note}</p>
        </div>
      )}

      {role === 'admin' && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewDetails(event)}>
            View Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onManage ? onManage(event) : onViewDetails(event)}
            disabled={event.status === 'draft'}
            title={event.status === 'draft' ? 'Cannot manage draft events' : ''}
          >
            Manage
          </Button>
        </div>
      )}

      {role === 'parent' && isUpcoming && event.status === 'published' && (
        <div className="pt-4 border-t border-gray-100">
          {registrationStatus === 'registered' ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm font-medium text-green-800">Registered</span>
              {onUnregister && studentId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onUnregister(event.id, studentId)}
                >
                  Unregister
                </Button>
              )}
            </div>
          ) : registrationStatus === 'waitlisted' ? (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-5 h-5 rounded-full bg-yellow-600 flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <span className="text-sm font-medium text-yellow-800">Waitlisted</span>
              {onUnregister && studentId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onUnregister(event.id, studentId)}
                >
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={() => {
                if (onRegister && studentId) {
                  onRegister(event.id, studentId);
                } else {
                  onViewDetails(event);
                }
              }}
              disabled={isFull}
              title={isFull ? 'Event is full' : ''}
            >
              {isFull ? 'Full' : 'Register'}
            </Button>
          )}
        </div>
      )}

      {role === 'parent' && !isUpcoming && (
        <div className="pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(event)}>
            View Details
          </Button>
        </div>
      )}
    </Card>
  );
}

