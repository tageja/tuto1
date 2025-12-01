'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Archive, RotateCcw, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { Announcement, ClassOption } from './types';
import { useI18n } from '../../contexts/I18nContext';

interface AdminAnnouncementsTableProps {
  announcements: Announcement[];
  classes: ClassOption[];
  onEdit?: (announcement: Announcement) => void;
  onPublish?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AdminAnnouncementsTable({
  announcements,
  classes,
  onEdit,
  onPublish,
  onArchive,
  onRestore,
  onDelete,
}: AdminAnnouncementsTableProps) {
  const { t } = useI18n();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const formatDate = (date: string | null) => {
    if (!date) return t('dashboard.announcements.table.noExpiration');
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTargetAudienceDisplay = (announcement: Announcement) => {
    if (announcement.target_scope === 'School') {
      return t('dashboard.announcements.table.schoolWide');
    }
    
    const count = announcement.class_ids?.length || 0;
    if (count === 1) {
      return t('dashboard.announcements.table.class', { count });
    }
    return t('dashboard.announcements.table.classes', { count });
  };

  const handleAction = (action: () => void) => {
    setOpenMenuId(null);
    action();
  };

  if (announcements.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">{t('dashboard.announcements.empty.noAnnouncements')}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.category')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.targetAudience')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.priority')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.dates')}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('dashboard.announcements.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {announcements.map((announcement) => (
              <tr
                key={announcement.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onEdit && onEdit(announcement)}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {announcement.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {announcement.category || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {getTargetAudienceDisplay(announcement)}
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={announcement.priority} />
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge
                    status={announcement.status}
                    variant={
                      announcement.status === 'Published'
                        ? 'success'
                        : announcement.status === 'Archived'
                        ? 'default'
                        : 'warning'
                    }
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="space-y-1">
                    {announcement.published_at && (
                      <div>
                        <span className="font-medium">
                          {t('dashboard.announcements.table.published')}:
                        </span>{' '}
                        {formatDate(announcement.published_at)}
                      </div>
                    )}
                    {announcement.expires_at && (
                      <div className="text-orange-600">
                        <span className="font-medium">
                          {t('dashboard.announcements.table.expires')}:
                        </span>{' '}
                        {formatDate(announcement.expires_at)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === announcement.id ? null : announcement.id
                        )
                      }
                      className="gap-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {openMenuId === announcement.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <div className="py-1">
                            <button
                              onClick={() =>
                                handleAction(() => onEdit && onEdit(announcement))
                              }
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4" />
                              {t('dashboard.announcements.actions.edit')}
                            </button>

                            {announcement.status === 'Draft' && onPublish && (
                              <button
                                onClick={() =>
                                  handleAction(() => onPublish(announcement.id))
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {t('dashboard.announcements.actions.publish')}
                              </button>
                            )}

                            {announcement.status === 'Published' && onArchive && (
                              <button
                                onClick={() =>
                                  handleAction(() => onArchive(announcement.id))
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-gray-100"
                              >
                                <Archive className="w-4 h-4" />
                                {t('dashboard.announcements.actions.archive')}
                              </button>
                            )}

                            {announcement.status === 'Archived' && onRestore && (
                              <button
                                onClick={() =>
                                  handleAction(() => onRestore(announcement.id))
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {t('dashboard.announcements.actions.restore')}
                              </button>
                            )}

                            {onDelete && (
                              <button
                                onClick={() =>
                                  handleAction(() => onDelete(announcement.id))
                                }
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('dashboard.announcements.actions.delete')}
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}






