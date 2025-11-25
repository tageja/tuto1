'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { useI18n } from '../../contexts/I18nContext';
import { CreateAnnouncementData, AnnouncementPriority } from './types';

interface QuickAddAnnouncementModalProps {
  isOpen: boolean;
  schoolId: string;
  onClose: () => void;
  onSubmit: (data: CreateAnnouncementData) => Promise<void>;
  fullFormRoute: string;
}

export function QuickAddAnnouncementModal({
  isOpen,
  schoolId,
  onClose,
  onSubmit,
  fullFormRoute,
}: QuickAddAnnouncementModalProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Controlled form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Normal');

  if (!isOpen) return null;

  const handleSubmit = async (shouldPublish: boolean) => {
    if (!title.trim() || !body.trim()) {
      return; // Validation
    }

    setIsSubmitting(true);

    const data: CreateAnnouncementData = {
      school_id: schoolId,
      title: title.trim(),
      body: body.trim(),
      priority,
      status: shouldPublish ? 'Published' : 'Draft',
      target_scope: 'School', // Default to school-wide
    };

    try {
      await onSubmit(data);
      // Reset form
      setTitle('');
      setBody('');
      setPriority('Normal');
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoreOptions = () => {
    onClose();
    router.push(fullFormRoute);
  };

  const handleClose = () => {
    setTitle('');
    setBody('');
    setPriority('Normal');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t('dashboard.announcements.actions.quickAdd')}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.announcements.form.titleLabel')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t('dashboard.announcements.form.titlePlaceholder')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.announcements.form.priorityLabel')} *
              </label>
              <select
                id="priority"
                name="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as AnnouncementPriority)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="Low">{t('dashboard.announcements.priority.low')}</option>
                <option value="Normal">{t('dashboard.announcements.priority.normal')}</option>
                <option value="High">{t('dashboard.announcements.priority.high')}</option>
                <option value="Urgent">{t('dashboard.announcements.priority.urgent')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.announcements.form.bodyLabel')} *
              </label>
              <textarea
                id="body"
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder={t('dashboard.announcements.form.bodyPlaceholder')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>

            <p className="text-xs text-gray-500">
              Click "More Options" for advanced settings (category, target audience, schedule, etc.)
            </p>
          </div>
        </div>

        {/* Footer with custom buttons */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button type="button" variant="outline" onClick={handleMoreOptions} disabled={isSubmitting}>
            {t('dashboard.announcements.actions.moreOptions')}
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('common.loading') : t('dashboard.announcements.actions.saveDraft')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !title.trim() || !body.trim()}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('common.loading') : t('dashboard.announcements.actions.publish')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
