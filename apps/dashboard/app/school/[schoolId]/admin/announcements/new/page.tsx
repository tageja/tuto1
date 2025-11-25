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
import { supabase } from '../../../../../../lib/supabase';
import {
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementTargetScope,
  ClassOption,
  CreateAnnouncementData,
} from '../../../../../../components/announcements/types';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolIdFromUrlParam = decodeURIComponent(params.schoolId as string);
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || schoolIdFromUrlParam;

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAnnouncementData>({
    school_id: schoolId,
    title: '',
    body: '',
    category: '',
    priority: 'Normal',
    status: 'Draft',
    target_scope: 'School',
    class_ids: [],
    expires_at: undefined,
  });

  // Get current user ID on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Get the users table ID from auth_user_id
          const { data: userProfile } = await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();
          
          if (userProfile) {
            setCurrentUserId(userProfile.id);
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(`/api/school/classes?schoolId=${schoolId}`);
        if (response.ok) {
          const result = await response.json();
          // API returns { success: true, data: { records: [...] } }
          setClasses(result.data?.records || []);
        } else {
          setClasses([]);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  const handleSubmit = async (e: React.FormEvent, status: AnnouncementStatus) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const submitData = {
        ...formData,
        status,
        class_ids: formData.target_scope === 'Classes' ? formData.class_ids : [],
        created_by: currentUserId,
      };

      const response = await fetch('/api/school/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to create announcement');
      }

      setToast({
        message:
          status === 'Published'
            ? t('dashboard.announcements.messages.publishSuccess')
            : t('dashboard.announcements.messages.createSuccess'),
        type: 'success',
      });

      // Navigate back after short delay
      setTimeout(() => {
        router.push(`/school/${schoolId}/admin/announcements`);
      }, 1000);
    } catch (error) {
      console.error('Error creating announcement:', error);
      setToast({
        message: t('dashboard.announcements.messages.createError'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof CreateAnnouncementData,
    value: string | string[] | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <LoadingState />;
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
          {t('dashboard.announcements.actions.create')}
        </h1>
      </div>

      <Card className="p-6">
        <form>
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
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={isSaving || !formData.title || !formData.body}
            >
              {isSaving ? t('common.loading') : t('dashboard.announcements.actions.saveDraft')}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'Published')}
              disabled={isSaving || !formData.title || !formData.body}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? t('common.loading') : t('dashboard.announcements.actions.publish')}
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
