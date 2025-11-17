'use client';

import { useEffect, useRef } from 'react';
import { X, Edit2, Trash2, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { DailyActivity } from './types';

interface ActivityDetailsDrawerProps {
  isOpen: boolean;
  activity: DailyActivity | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isParentView?: boolean;
}

export function ActivityDetailsDrawer({
  isOpen,
  activity,
  onClose,
  onEdit,
  onDelete,
  isParentView = false,
}: ActivityDetailsDrawerProps) {
  const { t } = useI18n();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !activity) return null;

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
  };

  const attachments = activity.attachments || [];

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-xl transform transition-transform">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.activities.drawer.title') || 'Activity Details'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Title & Status */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{activity.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-gray-600 mt-2">{activity.description}</p>
                )}
              </div>

              {/* Time & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.date') || 'Date'}</p>
                  <p className="font-medium text-gray-900">
                    {new Date(activity.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.time') || 'Time'}</p>
                  <p className="font-medium text-gray-900">{formatTime(activity.time)}</p>
                </div>
              </div>

              {/* Class & Teacher */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.class') || 'Class'}</p>
                  <p className="font-medium text-gray-900">{activity.class_name || activity.grade}</p>
                </div>
                {activity.teacher_name && (
                  <div>
                    <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.teacher') || 'Teacher'}</p>
                    <p className="font-medium text-gray-900">{activity.teacher_name}</p>
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.type') || 'Type'}</p>
                <p className="font-medium text-gray-900">{activity.type}</p>
              </div>

              {/* Menu Details (if Meal) */}
              {activity.menu_details && (
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.menuDetails') || 'Menu Details'}</p>
                  <p className="font-medium text-gray-900">{activity.menu_details}</p>
                </div>
              )}

              {/* Outdoor Detail */}
              {activity.outdoor_detail && (
                <div>
                  <p className="text-sm text-gray-500">{t('dashboard.activities.drawer.outdoorDetail') || 'Outdoor Details'}</p>
                  <p className="font-medium text-gray-900">{activity.outdoor_detail}</p>
                </div>
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-3">{t('dashboard.activities.drawer.attachments') || 'Attachments'}</p>
                  <div className="space-y-2">
                    {attachments.map((file: any, index: number) => {
                      const isImage = isImageFile(file.name);
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          {isImage ? (
                            <div className="space-y-2">
                              <img 
                                src={file.url} 
                                alt={file.name}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{file.name}</span>
                                <a
                                  href={file.url}
                                  download={file.name}
                                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                                >
                                  <Download className="w-4 h-4" />
                                  Download
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span className="text-sm text-gray-600">{file.name}</span>
                              </div>
                              <a
                                href={file.url}
                                download={file.name}
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {!isParentView && onEdit && onDelete && (
                <>
                  <Button variant="outline" onClick={onEdit} className="flex items-center gap-2">
                    <Edit2 className="w-4 h-4" />
                    {t('dashboard.activities.drawer.edit') || 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm(t('dashboard.activities.confirmDelete') || 'Are you sure you want to delete this activity?')) {
                        onDelete();
                      }
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('dashboard.activities.drawer.delete') || 'Delete'}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={onClose} className={isParentView ? '' : 'ml-auto'}>
                {t('dashboard.activities.drawer.close') || 'Close'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
