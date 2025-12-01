'use client';

import { X, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { StatusBadge } from '../school/shared/StatusBadge';
import type { EventDetailDrawerProps } from './types';

export function EventDetailDrawer({
  event,
  isOpen,
  onClose,
  role,
  onRegister,
  onUnregister,
  registrationStatus,
  studentId,
}: EventDetailDrawerProps) {
  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
      <div className="bg-white w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-t-lg md:rounded-lg shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge
                  status={event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  variant={categoryColor as any}
                />
                <StatusBadge status={event.status} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="text-gray-900">{formatDate(event.starts_at)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-gray-900">
                  {formatTime(event.starts_at)} - {formatTime(event.ends_at)}
                </p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            {event.capacity && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Capacity</p>
                  <p className="text-gray-900">
                    {event.registered_count || 0} / {event.capacity} registered
                    {event.waitlisted_count ? ` (${event.waitlisted_count} waitlisted)` : ''}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Parent Note */}
          {event.parent_note && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Note for Parents</h3>
              <p className="text-sm text-blue-800">{event.parent_note}</p>
            </div>
          )}

          {/* Attachments Placeholder */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Attachments feature coming soon</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {role === 'admin' && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onClose}>
                  Manage Registrations
                </Button>
              </>
            )}

            {role === 'parent' && isUpcoming && event.status === 'published' && (
              <>
                {registrationStatus === 'registered' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (onUnregister && studentId) {
                        onUnregister(event.id, studentId);
                      }
                    }}
                  >
                    Unregister
                  </Button>
                ) : registrationStatus === 'waitlisted' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (onUnregister && studentId) {
                        onUnregister(event.id, studentId);
                      }
                    }}
                  >
                    Cancel Waitlist
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (onRegister && studentId) {
                        onRegister(event.id, studentId);
                      }
                    }}
                    disabled={isFull}
                    title={isFull ? 'Event is full' : ''}
                  >
                    {isFull ? 'Event Full' : 'Register'}
                  </Button>
                )}
              </>
            )}

            {role === 'parent' && !isUpcoming && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


