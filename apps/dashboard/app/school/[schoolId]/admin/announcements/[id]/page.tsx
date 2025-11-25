'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { Card } from '../../../../../../components/ui/Card';
import { Toast } from '../../../../../../components/ui/Toast';
import { LoadingState } from '../../../../../../components/shared/LoadingState';
import { useI18n } from '../../../../../../contexts/I18nContext';
import { useSchool } from '../../../../../../contexts/SchoolContext';
import {
  Announcement,
  AnnouncementPriority,
  AnnouncementTargetScope,
  ClassOption,
  UpdateAnnouncementData,
} from '../../../../../../components/announcements/types';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;
  const announcementId = params.id as string;

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateAnnouncementData>({
    title: '',
    body: '',
    category: '',
    priority: 'Normal',
    target_scope: 'School',
    class_ids: [],
    expires_at: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementRes, classesRes] = await Promise.all([
          fetch(`/api/school/announcements?schoolId=${schoolId}&id=${announcementId}`),
          fetch(`/api/school/classes?schoolId=${schoolId}`),
        ]);

        if (announcementRes.ok) {
          const announcementData = await announcementRes.json();
          const ann = announcementData.data[0];
          if (ann) {
            setAnnouncement(ann);
            setFormData({
              title: ann.title,
              body: ann.body,
              category: ann.category || '',
              priority: ann.priority,
              target_scope: ann.target_scope,
              class_ids: ann.class_ids || [],
              expires_at: ann.expires_at,
            });
          }
        }

        if (classesRes.ok) {
          const classesData = await classesRes.json();
          // API returns { success: true, data: { records: [...] } }
          setClasses(classesData.data?.records || []);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (schoolId && announcementId) {
      fetchData();
    }
  }, [schoolId, announcementId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submitData = {
        ...formData,
        class_ids: formData.target_scope === 'Classes' ? formData.class_ids : [],
      };

      const response = await fetch(`/api/school/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to update announcement');
      }

      setToast({
        message: t('dashboard.announcements.messages.updateSuccess'),
        type: 'success',
      });

      setTimeout(() => {
        router.push(`/school/${schoolId}/admin/announcements`);
      }, 1000);
    } catch (error) {
      console.error('Error updating announcement:', error);
      setToast({
        message: t('dashboard.announcements.messages.createError'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof UpdateAnnouncementData,
    value: string | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!announcement) {
    return (
      <div className="p-6">
        <p>Announcement not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('common.cancel')}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.announcements.actions.edit')}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.titleLabel')} *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('dashboard.announcements.form.titlePlaceholder')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Body */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.bodyLabel')} *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => handleChange('body', e.target.value)}
              placeholder={t('dashboard.announcements.form.bodyPlaceholder')}
              rows={6}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.categoryLabel')}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder={t('dashboard.announcements.form.categoryPlaceholder')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.priorityLabel')} *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value as AnnouncementPriority)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">{t('dashboard.announcements.priority.low')}</option>
              <option value="Normal">{t('dashboard.announcements.priority.normal')}</option>
              <option value="High">{t('dashboard.announcements.priority.high')}</option>
              <option value="Urgent">{t('dashboard.announcements.priority.urgent')}</option>
            </select>
          </div>

          {/* Target Scope */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.targetScopeLabel')} *
            </label>
            <select
              value={formData.target_scope}
              onChange={(e) =>
                handleChange('target_scope', e.target.value as AnnouncementTargetScope)
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="School">{t('dashboard.announcements.targetScope.school')}</option>
              <option value="Classes">{t('dashboard.announcements.targetScope.classes')}</option>
            </select>
          </div>

          {/* Classes (if target_scope = Classes) */}
          {formData.target_scope === 'Classes' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dashboard.announcements.form.classesLabel')} *
              </label>
              <select
                multiple
                value={formData.class_ids}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  handleChange('class_ids', selected);
                }}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.grade_level ? `(${cls.grade_level})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          )}

          {/* Expiration Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('dashboard.announcements.form.expiresAtLabel')}
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at ? formData.expires_at.slice(0, 16) : ''}
              onChange={(e) =>
                handleChange(
                  'expires_at',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('dashboard.announcements.form.expiresAtHint')}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !formData.title || !formData.body}
            >
              {isSaving ? t('common.loading') : t('dashboard.announcements.actions.save')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
